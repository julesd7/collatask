FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm i

COPY . .

EXPOSE 80

CMD [ "npm", "run", "dev" ]