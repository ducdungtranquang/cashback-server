FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g nodemon ts-node typescript

EXPOSE 5002
CMD ["nodemon", "--watch", "src", "--ext", "ts,json", "--exec", "ts-node", "src/server.ts"]
