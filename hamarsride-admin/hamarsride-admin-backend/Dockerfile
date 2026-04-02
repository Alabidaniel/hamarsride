FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p uploads
RUN npm run prisma:generate

EXPOSE 5501
CMD ["npm", "start"]
