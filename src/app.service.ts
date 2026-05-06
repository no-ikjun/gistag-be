import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE, type AppDatabase } from './db';

@Injectable()
export class AppService {
  constructor(@Inject(DRIZZLE) private readonly db: AppDatabase) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkDatabase(): Promise<{ ok: true; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.db.execute(sql`SELECT 1`);
      return { ok: true, latencyMs: Date.now() - start };
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      throw new ServiceUnavailableException({
        ok: false,
        error: message,
      });
    }
  }
}
