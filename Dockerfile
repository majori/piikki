FROM node:8.9.4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

ENV NODE_ENV production

COPY . /usr/src/app
RUN npm run build

EXPOSE 4000

CMD [ "npm", "start" ]
