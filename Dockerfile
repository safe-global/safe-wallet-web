FROM node:16 as builder

WORKDIR /app

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

COPY . .
RUN yarn install

ENV NODE_ENV production
RUN yarn build && \
    yarn export



FROM node:16-alpine
#RUN apk add --no-cache libc6-compat git python3 py3-pip make g++
WORKDIR /app
COPY --from=builder /app/out /app/out
COPY package.json .

ENV NODE_ENV production
EXPOSE 8080
ENV NODE_PORT 8080

ENTRYPOINT [ "npx", "-y", "serve", "-p", ${NODE_PORT}, "out" ]
#ENTRYPOINT ["npm", "run", "serve" ]
