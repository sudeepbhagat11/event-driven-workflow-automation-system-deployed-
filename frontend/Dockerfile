# Use official Node.js image
FROM node:18.19.1

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3001 (or the port your frontend runs on)
EXPOSE 3001

# Start the frontend
CMD ["npm", "run", "dev"]
