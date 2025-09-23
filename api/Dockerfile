FROM node:lts
   
   # Needed to compile native modules like sqlite3
   RUN apt-get update && apt-get install -y python3 make g++
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   
   EXPOSE 3000
   CMD ["npm", "run", "dev"]