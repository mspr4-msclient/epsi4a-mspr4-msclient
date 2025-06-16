FROM node:24.0.1-slim AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:24.0.1-slim AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

RUN mkdir -p dist/auth/middleware

COPY --from=build /app/src/auth/middleware ./dist/auth/middleware

RUN apt-get update && apt-get install -y curl

EXPOSE 8080

CMD ["node", "dist/app.js"]