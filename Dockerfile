<<<<<<< HEAD
# Use a Node.js image as a base
FROM node:16

# Set the working directory
WORKDIR /app

# Copy the project files
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port 10000 (used by the server)
EXPOSE 10000

# Launch the add-on
CMD ["node", "server.js"]
=======
# Use a Node.js image as a base
FROM node:16

# Install dependencies
RUN apt-get update && apt-get install -y \
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

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 10000

# Start the application
CMD ["node", "server.js"]
>>>>>>> 97d00ae (Your commit message)
