# Use a Node.js image as a base
FROM node:16

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

# Add Sury.org repository and Google Chrome signing key
RUN wget -q -O - https://packages.sury.org/apache2/apt.gpg | apt-key add - \
    && echo "deb https://packages.sury.org/apache2/ stretch main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# Create a non-root user
RUN useradd -m puppeteeruser

# Set the environment variable for Node
ENV NODE_ENV=production

# Set the environment variable for Puppeteer cache directory
ENV PUPPETEER_CACHE_DIR=/root/.cache/puppeteer

# Set the working directory
WORKDIR /app

# Copy the project files and install dependencies
COPY package.json package-lock.json ./
RUN npm install
RUN npx puppeteer browsers install chrome

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
