FROM node:18-alpine AS base
ENV NEXT_TELEMETRY_DISABLED 1

FROM base AS builder

RUN apk add --no-cache libc6-compat git python3 py3-pip make g++ libusb-dev eudev-dev linux-headers
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile
COPY . .
RUN yarn run after-install

RUN yarn build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV REVERSE_PROXY_UI_PORT 8080

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/out ./out

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

USER nextjs

EXPOSE ${REVERSE_PROXY_UI_PORT}

CMD npx -y serve out -p ${REVERSE_PROXY_UI_PORT}
