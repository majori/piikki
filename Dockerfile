FROM node:12-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN apk --no-cache add --virtual native-deps \
  git g++ gcc libgcc libstdc++ linux-headers make python

RUN npm install

COPY . .
RUN npm run build

RUN npm prune --production
RUN npm cache clean --force
RUN apk del native-deps

USER node

EXPOSE 4000
CMD [ "npm", "start" ]
