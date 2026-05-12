# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# 배포 스크립트의 docker healthcheck 가 wget 사용
RUN apk add --no-cache wget
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile && yarn cache clean
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY drizzle.migrate.config.ts ./
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
