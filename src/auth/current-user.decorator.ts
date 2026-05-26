import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * {@link JwtAuthGuard} 이후 `req.user.sub`(사용자 UUID)를 주입합니다.
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const sub = req.user?.sub;
    if (!sub) {
      throw new UnauthorizedException();
    }
    return sub;
  },
);
