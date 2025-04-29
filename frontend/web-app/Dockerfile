FROM node:20.12.1-alpine3.19 as build

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build the React app
RUN npm run build

# Production stage - use specific nginx version
FROM nginx:1.25.4-alpine3.18
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]