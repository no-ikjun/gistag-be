import { defineConfig } from 'drizzle-kit';

/** 마이그레이션 적용 전용(drizzle-kit migrate). 소스 스키마 없이 SQL 마이그레이션만 실행. */
export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
