FROM --platform=$BUILDPLATFORM node:18-alpine AS build
ARG BUILDPLATFORM

# install build dependencies
RUN apk add --no-cache libc6-compat git python3 py3-pip make g++ libusb-dev eudev-dev linux-headers
WORKDIR /app
COPY . .

# install NPM dependencies
RUN yarn install --frozen-lockfile
RUN yarn after-install

ENV NODE_ENV=production

# disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

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

ENV PORT=3000
RUN echo '#!/bin/sh' > /usr/local/bin/docker-entrypoint.sh &&\
    echo 'busybox-extras httpd -fvv -h /www -p 0.0.0.0:${PORT:-3000}' >> /usr/local/bin/docker-entrypoint.sh &&\
    chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["tini", "--", "docker-entrypoint.sh"]
