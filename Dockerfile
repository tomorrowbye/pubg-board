# BUILD FOR LOCAL DEVELOPMENT
FROM node:20-alpine AS development

WORKDIR /app

COPY --chown=node:node package*.json pnpm-lock.yaml ./

RUN yarn global add pnpm && pnpm install --frozen-lockfile

COPY --chown=node:node . .

USER node

# BUILD FOR PRODUCTION

FROM node:20-alpine AS build

WORKDIR /app

COPY --chown=node:node package*.json pnpm-lock.yaml ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

ENV NODE_ENV production

RUN --mount=type=secret,id=NEXT_PUBLIC_DEFAULT_PLATFORM \
    --mount=type=secret,id=NEXT_PUBLIC_DEFAULT_SHARD \
    --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_URL \
    --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_ANON_KEY \
    export NEXT_PUBLIC_DEFAULT_PLATFORM=$(cat /run/secrets/NEXT_PUBLIC_DEFAULT_PLATFORM) && \
    export NEXT_PUBLIC_DEFAULT_SHARD=$(cat /run/secrets/NEXT_PUBLIC_DEFAULT_SHARD) && \
    export NEXT_PUBLIC_SUPABASE_URL=$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_URL) && \
    export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_ANON_KEY) && \
    yarn global add pnpm && pnpm build && pnpm install --frozen-lockfile --prod

USER node

# PRODUCTION

FROM node:20-alpine AS production

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/.env.local ./.env.local

EXPOSE 3005

CMD ["node_modules/.bin/next", "start"]
