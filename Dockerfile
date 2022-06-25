FROM node:14-alpine as installer

WORKDIR /app

COPY package.json .

RUN npm install

FROM node:14-alpine as runner

WORKDIR /app

COPY --from=installer /app .

COPY . .

ENV BOT_TOKEN=$BOT_TOKEN

CMD [ "node", "index.js" ]