# Use official Node.js image
FROM node:18.19.1

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire application code
COPY . .

# Set environment variables (optional if using .env file)
ENV DATABASE_URL="postgresql://postgres:mysecretpassword@postgres:5432/postgres"

# Expose necessary ports (if required)
EXPOSE 3002

# Start the hooks service
CMD ["npm", "run", "dev"]
