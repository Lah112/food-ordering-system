# Use Node.js LTS
FROM node:20


# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Build the production React app
RUN npm run build

# Install a lightweight web server
RUN npm install -g serve

# Expose port where React app will be served
EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "3000"]
