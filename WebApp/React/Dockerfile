# frontend/Dockerfile
FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]