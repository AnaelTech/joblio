FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

RUN addgroup --system --gid 1001 joblio && \
	adduser --system --uid 1001 joblio

COPY --from=build /app/dist dist/
COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/package.json ./
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/src/db/migrations src/db/migrations/
COPY --from=build /app/src/db/schema src/db/schema/

RUN mkdir -p /app/dist/client/uploads && chown -R joblio:joblio /app

COPY docker-entrypoint.sh /docker-entrypoint.sh

VOLUME /app/dist/client/uploads

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
ENV UPLOADS_DIR=/app/dist/client/uploads

EXPOSE 4321

ENTRYPOINT ["/docker-entrypoint.sh"]
