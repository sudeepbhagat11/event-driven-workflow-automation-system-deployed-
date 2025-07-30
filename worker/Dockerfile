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

# Ensure environment variables are loaded
ENV DATABASE_URL="postgresql://postgres:mysecretpassword@postgres:5432/postgres"
ENV SMTP_ENDPOINT="smtp.gmail.com"
ENV SMTP_AUTH_EMAIL="sudeepbhagat456@gmail.com"
ENV SMTP_AUTH_PASSWORD="fnuldmegloyteedi"
ENV STRIPE_SECRET_KEY="sk_test_REDACTED_REDACTED"

# Expose necessary ports (if required)
# EXPOSE 3002

# Start the worker process
CMD ["npm", "run", "dev"]


# # Use official Node.js image
# FROM node:18.19.1

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package.json package-lock.json ./

# # Install dependencies
# RUN npm install

# # Copy the entire application code
# COPY . .

# # Install wait-for-it to ensure dependencies are ready before startup
# RUN apt-get update && apt-get install -y netcat

# # Set environment variables from .env file (use docker-compose)
# ARG DATABASE_URL
# ARG SMTP_ENDPOINT
# ARG SMTP_AUTH_EMAIL
# ARG SMTP_AUTH_PASSWORD
# ARG STRIPE_SECRET_KEY

# # Expose necessary ports
# # EXPOSE 3002

# # Start the worker process after ensuring PostgreSQL is up
# CMD ["sh", "-c", "until nc -z postgres 5432; do sleep 2; done && npm run dev"]
