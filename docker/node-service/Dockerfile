FROM node:18

WORKDIR /app

COPY ./package*.json ./

RUN npm install

RUN npm start

COPY . .

EXPOSE 5000

CMD ["nodemon", "src/server.ts"]
