FROM node:6.9.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json /usr/src/app/
RUN npm install
RUN npm install knex -g

COPY . /usr/src/app
RUN npm run build

# Trigger migration script
RUN     chmod +x ./tools/run-migrations.sh
RUN     ./tools/run-migrations.sh

EXPOSE 4000

CMD [ "npm", "start" ]
