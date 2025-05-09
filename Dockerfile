# Base image
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm install --omit=optional

# Build the app
FROM base AS builder
WORKDIR /app

# Copy node modules and package files
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Copy the rest of the application
COPY . .

# ARGs for build-time environment variables
ARG PUBG_OPEN_API_KEY
ARG PUBG_API_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_PLATFORM
ARG NEXT_PUBLIC_DEFAULT_SHARD
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG PUBG_API_CACHE_DURATION
ARG STEAM_OPEN_API_KEY
ARG SUPABASE_PASSWORD

# Set environment variables to use in build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV PUBG_OPEN_API_KEY=${PUBG_OPEN_API_KEY}
ENV PUBG_API_BASE_URL=${PUBG_API_BASE_URL}
ENV NEXT_PUBLIC_DEFAULT_PLATFORM=${NEXT_PUBLIC_DEFAULT_PLATFORM}
ENV NEXT_PUBLIC_DEFAULT_SHARD=${NEXT_PUBLIC_DEFAULT_SHARD}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV PUBG_API_CACHE_DURATION=${PUBG_API_CACHE_DURATION}
ENV STEAM_OPEN_API_KEY=${STEAM_OPEN_API_KEY}
ENV SUPABASE_PASSWORD=${SUPABASE_PASSWORD}

# Create .env.local file with the environment variables
RUN printenv > .env.local

# Install required packages for the build and runtime
RUN npm install -g npm@latest && \
    npm install -D autoprefixer postcss tailwindcss

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# ARGs for runtime environment variables
ARG PUBG_OPEN_API_KEY
ARG PUBG_API_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_PLATFORM
ARG NEXT_PUBLIC_DEFAULT_SHARD
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG PUBG_API_CACHE_DURATION
ARG STEAM_OPEN_API_KEY
ARG SUPABASE_PASSWORD

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PUBG_OPEN_API_KEY=${PUBG_OPEN_API_KEY}
ENV PUBG_API_BASE_URL=${PUBG_API_BASE_URL}
ENV NEXT_PUBLIC_DEFAULT_PLATFORM=${NEXT_PUBLIC_DEFAULT_PLATFORM}
ENV NEXT_PUBLIC_DEFAULT_SHARD=${NEXT_PUBLIC_DEFAULT_SHARD}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV PUBG_API_CACHE_DURATION=${PUBG_API_CACHE_DURATION}
ENV STEAM_OPEN_API_KEY=${STEAM_OPEN_API_KEY}
ENV SUPABASE_PASSWORD=${SUPABASE_PASSWORD}

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/.env.local ./.env.local

# Set proper permissions
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the app
CMD ["node", "server.js"]
