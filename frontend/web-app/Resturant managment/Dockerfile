# Use Node.js LTS
FROM node:18

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

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 3001

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "3001"]
