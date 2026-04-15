FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p uploads/menu uploads/payment-receipts uploads/profile-photos
RUN npm run prisma:generate

EXPOSE 5000
CMD ["npm", "start"]
