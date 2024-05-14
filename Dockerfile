FROM node:18-alpine AS build

RUN apk add --no-cache libc6-compat git python3 py3-pip make g++ libusb-dev eudev-dev linux-headers
WORKDIR /app
COPY . .

# Fix arm64 timeouts
RUN yarn config set network-timeout 300000 && yarn global add node-gyp

# install deps
RUN yarn install --frozen-lockfile
RUN yarn after-install

ENV NODE_ENV production

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

FROM alpine

RUN apk add busybox-extras tini
WORKDIR /www
COPY --from=build /app/out /www

# Next.js automatically adds `.html` extensions to URLs, but static HTTP file
# servers don't generally do this. You can work around this by creating symbolic
# links from `my-page.html` to either `my-page/index.html` or `my-page`
# depending on whether or not a `my-page` directory exists.
RUN find /www -name '*.html' -exec sh -c 'f="{}"; b="${f%.*}"; [ -d "$b" ] && ln -s "$f" "$b/index.html" || ln -s "$f" "$b"' ';'

EXPOSE 3000

ENV PORT 3000

CMD ["tini", "--", "busybox-extras", "httpd", "-fvv", "-h", "/www", "-p", "0.0.0.0:3000"]
