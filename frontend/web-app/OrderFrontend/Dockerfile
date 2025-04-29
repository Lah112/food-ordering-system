# Use official Node.js 20 image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean install (prefer npm ci for reproducibility)
RUN npm ci || npm install

# Copy rest of the code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
