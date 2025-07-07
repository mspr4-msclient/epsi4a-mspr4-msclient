FROM node:24.0.1-slim AS build

WORKDIR /app

COPY package*.json .

RUN npm install --ignore-scripts

COPY . .

RUN npm run build

FROM node:24.0.1-slim AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production --ignore-scripts

COPY --from=build /app/dist ./dist

RUN apt-get update && apt-get install -y curl

EXPOSE 8080

CMD ["node", "dist/app.js"]