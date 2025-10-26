FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN npm run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S adonisjs -u 1001

USER adonisjs

EXPOSE 3333

ENV TZ=UTC
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=localhost
ENV LOG_LEVEL=info
ENV APP_KEY=J3aKxPtmxQtRmZgi8AF1OAmOXTgVaoW9

CMD ["dumb-init", "node", "build/server.js"]
