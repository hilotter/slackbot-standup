# Build Stage 1
FROM node:12.14-alpine AS appbuild

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install

COPY . /app/

RUN yarn build

# Build Stage 2
FROM node:12.14-alpine

WORKDIR /app

COPY --from=appbuild /app/dist ./dist

CMD [ "yarn", "start" ]
