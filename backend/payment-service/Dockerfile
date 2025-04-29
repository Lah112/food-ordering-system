FROM node:20.12.1-alpine3.19

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 5003

# Command to run the application
CMD [ "node", "server.js" ]