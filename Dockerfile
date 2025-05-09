# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies using npm
RUN npm ci --omit=dev || npm install --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data
ENV NEXT_TELEMETRY_DISABLED 1

# Build with environment variables from secrets
RUN --mount=type=secret,id=NEXT_PUBLIC_DEFAULT_PLATFORM \
    --mount=type=secret,id=NEXT_PUBLIC_DEFAULT_SHARD \
    --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_URL \
    --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_ANON_KEY \
    export NEXT_PUBLIC_DEFAULT_PLATFORM=$(cat /run/secrets/NEXT_PUBLIC_DEFAULT_PLATFORM) && \
    export NEXT_PUBLIC_DEFAULT_SHARD=$(cat /run/secrets/NEXT_PUBLIC_DEFAULT_SHARD) && \
    export NEXT_PUBLIC_SUPABASE_URL=$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_URL) && \
    export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_ANON_KEY) && \
    npm run build

# Production image, copy all the files and run next
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3005

ENV PORT 3005
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
