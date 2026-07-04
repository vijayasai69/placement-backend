# Build Stage
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src

RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]