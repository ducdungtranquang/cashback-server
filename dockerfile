# 1. Base image
FROM node:18

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install deps
COPY package*.json ./
RUN npm install

# 4. Copy rest of the app
COPY . .

# 5. Build TypeScript
RUN npm run build

# 6. Expose port and run app
EXPOSE 5002
CMD ["node", "dist/server.js"]
