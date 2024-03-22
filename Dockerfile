FROM --platform=linux/amd64 ubuntu:20.04

RUN apt-get update && apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

RUN npm i -g @nestjs/cli@7.6.0

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

CMD ["npm","run","start:prod"]
