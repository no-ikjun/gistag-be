import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../db/database.constants';
import { refreshTokens, schema, users } from '../db/schema';
import { InfoteamIdpService } from './infoteam-idp.service';
import type { InfoteamCallbackDto } from './dto/infoteam-callback.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { AppAccessTokenPayload } from './types/jwt-payload.type';
import type { UserInfo } from './types/user-info.type';

export type TokenPairResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
};

export type MeResponse = {
  userId: string;
  nickname: string;
  email: string | null;
  providerType: 'INFOTEAM' | 'LOCAL';
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly infoteamIdp: InfoteamIdpService,
  ) {}

  private accessExpiresSec(): number {
    const raw = this.configService.get<string>('JWT_ACCESS_EXPIRES_SEC');
    if (raw === undefined || raw === '') {
      return 900;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 900;
  }

  private refreshExpiresSec(): number {
    const raw = this.configService.get<string>('JWT_REFRESH_EXPIRES_SEC');
    if (raw === undefined || raw === '') {
      return 604800;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 604800;
  }

  async loginWithInfoteamCode(
    dto: InfoteamCallbackDto,
  ): Promise<TokenPairResponse> {
    const tokenRes = await this.infoteamIdp.exchangeCodeForToken(
      dto.code,
      dto.redirectUri,
      dto.codeVerifier,
    );

    const userInfo = await this.infoteamIdp.validateAccessToken(
      tokenRes.access_token,
    );

    const userId = await this.upsertInfoteamUser(userInfo);
    return this.issueSession(userId, 'INFOTEAM');
  }

  private async upsertInfoteamUser(info: UserInfo): Promise<string> {
    const providerUserId = info.uuid;
    const email = info.email?.trim() || null;
    const nickname = (info.name?.trim() || email || 'User').slice(0, 200);

    const [existing] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.providerType, 'INFOTEAM'),
          eq(users.providerUserId, providerUserId),
        ),
      )
      .limit(1);

    if (existing) {
      await this.db
        .update(users)
        .set({
          nickname,
          email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));
      return existing.id;
    }

    const [created] = await this.db
      .insert(users)
      .values({
        providerType: 'INFOTEAM',
        providerUserId,
        nickname,
        email,
      })
      .returning({ id: users.id });

    if (!created) {
      throw new ConflictException('Failed to create user');
    }

    return created.id;
  }

  async registerLocal(dto: RegisterDto): Promise<TokenPairResponse> {
    const email = dto.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const [created] = await this.db
        .insert(users)
        .values({
          providerType: 'LOCAL',
          providerUserId: email,
          nickname: dto.nickname.trim(),
          email,
          passwordHash,
        })
        .returning({ id: users.id });

      if (!created) {
        throw new ConflictException('Failed to create user');
      }

      return this.issueSession(created.id, 'LOCAL');
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
  }

  async loginLocal(dto: LoginDto): Promise<TokenPairResponse> {
    const email = dto.email.toLowerCase().trim();

    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(eq(users.providerType, 'LOCAL'), eq(users.providerUserId, email)),
      )
      .limit(1);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueSession(user.id, 'LOCAL');
  }

  async refreshSession(refreshTokenRaw: string): Promise<TokenPairResponse> {
    const tokenHash = createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');

    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (!row || row.expiresAt.getTime() <= Date.now()) {
      if (row) {
        await this.db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, row.userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueSession(user.id, user.providerType);
  }

  async getMe(userId: string): Promise<MeResponse> {
    const [user] = await this.db
      .select({
        id: users.id,
        nickname: users.nickname,
        email: users.email,
        providerType: users.providerType,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user.id,
      nickname: user.nickname,
      email: user.email,
      providerType: user.providerType,
    };
  }

  async logout(refreshTokenRaw: string): Promise<void> {
    const tokenHash = createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');

    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  private async issueSession(
    userId: string,
    providerType: 'INFOTEAM' | 'LOCAL',
  ): Promise<TokenPairResponse> {
    const accessExpiresSec = this.accessExpiresSec();
    const payload: AppAccessTokenPayload = {
      sub: userId,
      providerType,
      typ: 'access',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiresSec,
    });

    const refreshRaw = randomBytes(48).toString('base64url');
    const tokenHash = createHash('sha256').update(refreshRaw).digest('hex');
    const refreshExpiresSec = this.refreshExpiresSec();
    const expiresAt = new Date(Date.now() + refreshExpiresSec * 1000);

    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: refreshRaw,
      expiresIn: accessExpiresSec,
      tokenType: 'Bearer',
    };
  }
}
