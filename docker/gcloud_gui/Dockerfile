FROM node:12.14-alpine

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install

COPY google-cloud-gui-db.json /root/.google-cloud-gui-db.json

CMD [ "yarn", "run", "google-cloud-gui", "--skip-browser" ]