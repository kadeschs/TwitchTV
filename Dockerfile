# Use a Node.js 20 image as a base
FROM node:20

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libxkbcommon0 \
    libgbm1 \
    libpango1.0-0 \
    libasound2 \
    libxshmfence1 \
    libglu1-mesa

# Create a non-root user
RUN useradd -m puppeteeruser

# Set the environment variable for Node
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy the project files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Update npm to the latest version
RUN npm install -g npm@latest

# Change the ownership of the working directory to the new user
RUN chown -R puppeteeruser:puppeteeruser /app

# Switch to the non-root user
USER puppeteeruser

# Copy the rest of the code
COPY . .

# Expose port 10000 (used by the server)
EXPOSE 10000

# Start the application
CMD ["node", "server.js"]
