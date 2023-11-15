# Step 1: Build the App
FROM node:19 as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Step 2: Set up the production environment
FROM node:19-alpine

WORKDIR /app

COPY --from=builder /usr/src/app/package*.json ./

RUN npm install 

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
