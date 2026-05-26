import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AppAccessTokenPayload } from './types/jwt-payload.type';
import type { AuthUser } from './types/auth-user.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    try {
      const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
      const payload = await this.jwtService.verifyAsync<AppAccessTokenPayload>(
        token,
        { secret },
      );
      if (payload.typ !== 'access' || !payload.sub) {
        throw new UnauthorizedException();
      }
      const user: AuthUser = {
        sub: payload.sub,
        providerType: payload.providerType,
      };
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
