FROM node:17.1.0-alpine3.12 as installer

WORKDIR /app

COPY package.json .

RUN npm install

FROM node:17.1.0-alpine3.12 as runner

WORKDIR /app

COPY --from=installer /app .

COPY . .

ENV BOT_TOKEN=$BOT_TOKEN

CMD [ "node", "index.js" ]