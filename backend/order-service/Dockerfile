# Use Node.js official image as base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose the port 
EXPOSE 5000

# Start the app with nodemon
CMD ["npm", "start"]
