FROM node:carbon

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build
RUN npm prune

EXPOSE 4000
CMD [ "npm", "start" ]
