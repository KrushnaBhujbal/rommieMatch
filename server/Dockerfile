# Use Node 20 slim — smaller image size
FROM node:20-slim
 
# Set working directory inside the container
WORKDIR /app
 
# Copy package files first — Docker caches this layer
# Only re-runs npm install if package.json changes
COPY package*.json ./
 
# Install production dependencies only
RUN npm install --omit=dev
 
# Copy the rest of the server code
COPY . .
 
# Expose the port Express runs on
EXPOSE 5000
 
# Start the server
CMD ["node", "app.js"]
 