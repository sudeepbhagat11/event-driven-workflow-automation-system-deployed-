# # Use official Node.js image
# FROM node:18

# # Set working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application files
# COPY . .

# # Make the wait-for-kafka script executable
# RUN chmod +x wait-for-kafka.sh

# # Expose the port (if your processor app needs one)
# EXPOSE 9092

# # Start the application, ensuring Kafka is ready first
# CMD ["sh", "-c", "./wait-for-kafka.sh && npm run dev"]




# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Make the wait-for-kafka script executable
RUN chmod +x wait-for-kafka.sh

# Expose the required port
EXPOSE 9092

# Start the application ensuring Kafka and topic creation
CMD ["sh", "-c", "./wait-for-kafka.sh && npm run dev"]

