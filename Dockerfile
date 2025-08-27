FROM node:22.16.0

WORKDIR /main

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm","start" ]