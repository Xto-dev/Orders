FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm install --only=production

RUN npx prisma generate

COPY dist/ ./dist/

EXPOSE 3001

CMD ["node", "dist/src/main"]