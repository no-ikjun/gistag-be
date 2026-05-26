import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { catchError, firstValueFrom } from 'rxjs';
import {
  AuthorizationCodeResponse,
  ClientAccessTokenResponse,
  IdpUserInfoRes,
  IdTokenPayload,
} from './types/idp.type';
import { UserInfo } from './types/user-info.type';

/**
 * Infoteam IdP OAuth2 / OpenID 연동 헬퍼
 */
@Injectable()
export class InfoteamIdpService implements OnModuleInit {
  private readonly logger = new Logger(InfoteamIdpService.name);
  private idpUrl: string;
  private openidPk!: crypto.KeyObject;
  private clientAccessToken: string | undefined;
  private clientAccessTokenExpireAt: Date;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.idpUrl = this.configService.getOrThrow<string>('IDP_URL');
    this.clientAccessTokenExpireAt = new Date(0);
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('InfoteamIdpService initialized');
    const openidResponse = await firstValueFrom(
      this.httpService
        .get<{ keys: crypto.JsonWebKey[] }>(this.idpUrl + '/oauth/certs')
        .pipe(
          catchError(() => {
            this.logger.error('Error fetching OpenID public key');
            throw new InternalServerErrorException();
          }),
        ),
    );
    if (!openidResponse.data.keys[0]) {
      this.logger.error('No OpenID public key found');
      throw new InternalServerErrorException('No OpenID public key found');
    }
    this.openidPk = crypto.createPublicKey({
      format: 'jwk',
      key: openidResponse.data.keys[0],
    });
  }

  async validateAccessToken(accessToken: string): Promise<UserInfo> {
    const userInfoResponse = await firstValueFrom(
      this.httpService
        .get<IdpUserInfoRes>(this.idpUrl + '/oauth/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((err) => {
            if (err instanceof AxiosError && err.response?.status === 401) {
              this.logger.debug('invalid access token for userinfo');
              throw new UnauthorizedException();
            }
            this.logger.error(err);
            throw new InternalServerErrorException();
          }),
        ),
    );
    const {
      sub: uuid,
      name,
      email,
      picture,
      profile,
      student_id: studentId,
    } = userInfoResponse.data;
    return { name, email, uuid, picture, profile, studentId };
  }

  async validateIdToken(idToken: string): Promise<UserInfo | null> {
    return this.jwtService
      .verifyAsync<IdTokenPayload>(idToken, {
        publicKey: this.openidPk.export({ format: 'pem', type: 'spki' }),
        issuer: this.idpUrl,
        algorithms: ['RS256'],
      })
      .then(
        ({
          sub: uuid,
          name,
          email,
          picture,
          profile,
          student_id: studentId,
        }) => ({
          uuid,
          name,
          email,
          picture,
          profile,
          studentId,
        }),
      )
      .catch(() => null);
  }

  async getUserInfo(userUuid: string): Promise<UserInfo | null> {
    await this.updateClientAccessToken();
    const userInfoResponse = await firstValueFrom(
      this.httpService
        .get<IdpUserInfoRes>(this.idpUrl + '/oauth/userinfo', {
          headers: {
            Authorization: `Bearer ${this.clientAccessToken}`,
          },
          params: {
            sub: userUuid,
          },
        })
        .pipe(
          catchError((err) => {
            if (err instanceof AxiosError && err.response?.status === 401) {
              this.logger.debug('client invalid access token for userinfo');
              throw new UnauthorizedException();
            }
            this.logger.error(err);
            throw new InternalServerErrorException();
          }),
        ),
    );
    const {
      sub: uuid,
      name,
      email,
      picture,
      profile,
      student_id: studentId,
    } = userInfoResponse.data;
    return { name, email, uuid, picture, profile, studentId };
  }

  private async updateClientAccessToken(): Promise<void> {
    if (this.clientAccessToken && this.clientAccessTokenExpireAt > new Date()) {
      return;
    }
    this.logger.log('Client access token expired or missing, fetching new one');
    const formData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.configService.getOrThrow<string>('IDP_CLIENT_ID'),
      client_secret: this.configService.getOrThrow<string>('IDP_CLIENT_SECRET'),
      scope: ['profile', 'email'].join(' '),
    }).toString();

    const clientTokenResponse = await firstValueFrom(
      this.httpService
        .post<ClientAccessTokenResponse>(
          this.idpUrl + '/oauth/token',
          formData,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error('Error fetching client access token', err);
            throw new InternalServerErrorException(
              'Failed to fetch client access token',
            );
          }),
        ),
    );
    this.clientAccessToken = clientTokenResponse.data.access_token;
    this.clientAccessTokenExpireAt = new Date(
      Date.now() + clientTokenResponse.data.expires_in * 1000,
    );
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    codeVerifier?: string,
  ): Promise<AuthorizationCodeResponse> {
    const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
    const clientSecret =
      this.configService.getOrThrow<string>('IDP_CLIENT_SECRET');

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const formBody: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    };

    if (codeVerifier) {
      formBody.code_verifier = codeVerifier;
    }

    const formData = new URLSearchParams(formBody).toString();

    const tokenResponse = await firstValueFrom(
      this.httpService
        .post<AuthorizationCodeResponse>(
          this.idpUrl + '/oauth/token',
          formData,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${basicAuth}`,
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            if (err.response?.status === 400) {
              const errorData = err.response?.data as {
                error?: string;
              };
              if (errorData?.error === 'invalid_grant') {
                this.logger.warn(
                  'invalid_grant: code reuse, PKCE mismatch, redirect mismatch, or expired code',
                );
              }
              throw new UnauthorizedException(
                `Invalid authorization code: ${errorData?.error ?? 'invalid_grant'}`,
              );
            }

            if (err.response?.status === 401) {
              throw new UnauthorizedException(
                'Invalid authorization code or redirect URI',
              );
            }

            this.logger.error('Unexpected token exchange error:', err.message);
            throw new InternalServerErrorException(
              'Failed to exchange authorization code',
            );
          }),
        ),
    );

    return tokenResponse.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthorizationCodeResponse> {
    const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
    const clientSecret =
      this.configService.getOrThrow<string>('IDP_CLIENT_SECRET');

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const formData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString();

    const tokenResponse = await firstValueFrom(
      this.httpService
        .post<AuthorizationCodeResponse>(
          this.idpUrl + '/oauth/token',
          formData,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${basicAuth}`,
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(
              'Error refreshing IdP token',
              err.response?.status,
            );
            if (err.response?.status === 400 || err.response?.status === 401) {
              throw new UnauthorizedException('Invalid refresh token');
            }
            throw new InternalServerErrorException('Failed to refresh token');
          }),
        ),
    );

    return tokenResponse.data;
  }

  async revokeToken(
    token: string,
    tokenTypeHint?: 'access_token' | 'refresh_token',
  ): Promise<void> {
    const formData = new URLSearchParams({
      token,
      ...(tokenTypeHint && { token_type_hint: tokenTypeHint }),
    }).toString();

    await firstValueFrom(
      this.httpService
        .post(this.idpUrl + '/oauth/revoke', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.warn('Token revocation failed', err.response?.data);
            return [];
          }),
        ),
    );
  }
}
