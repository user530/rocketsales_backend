# Build stage
FROM node:current-alpine3.19 AS build

WORKDIR /build

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

# Clean install dependencies for optimization
RUN npm ci --omit=dev && npm cache clean --force

# Production stage
FROM node:current-alpine3.19 as production

WORKDIR /server

COPY --from=build /build/dist ./dist 
COPY --from=build /build/node_modules ./node_modules

EXPOSE 5005

CMD [ "node", "dist/main.js" ]

