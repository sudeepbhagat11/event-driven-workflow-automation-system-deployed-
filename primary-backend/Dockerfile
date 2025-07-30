# Use official Node.js image
FROM node:18.19.1

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the application
COPY . .

# Install Prisma CLI globally
RUN npm install -g prisma

# Expose the application port
EXPOSE 3000

# Ensure entrypoint script is executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["npm", "run", "dev"]

