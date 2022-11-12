FROM node:18.11.0-alpine
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x init-entrypoint.sh
EXPOSE 4002
ENTRYPOINT ["sh", "./init-entrypoint.sh"]
