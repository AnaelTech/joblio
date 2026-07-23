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

RUN mkdir -p /app/dist/client/uploads && chown -R joblio:joblio /app

VOLUME /app/dist/client/uploads

USER joblio

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
ENV UPLOADS_DIR=/app/dist/client/uploads

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
