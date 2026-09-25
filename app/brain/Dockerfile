# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV NPM_CONFIG_CACHE=/tmp/.npm

RUN addgroup -S nest && adduser -S nest -G nest \
  && mkdir -p /tmp/.npm \
  && chown -R nest:nest /tmp/.npm

COPY package.json package-lock.json ./
RUN npm install --omit=dev && npm cache clean --force \
  && chown -R nest:nest /app

COPY --from=build --chown=nest:nest /app/dist ./dist
COPY --chown=nest:nest docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nest
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
