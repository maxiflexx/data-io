FROM node:18-alpine

RUN apk update && apk upgrade

RUN apk add curl vim iputils-ping

RUN npm install -g pm2
RUN pm2 install typescript
RUN pm2 install pm2-logrotate

WORKDIR /home/workspace

COPY . .

RUN npm install
RUN npm run build

ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js", "--only", "data-io"]