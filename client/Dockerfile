# ── Stage 1: Build ──────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev — needed for Vite build)
RUN npm install

# Copy source code
COPY . .

# Build the React app into /app/dist
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────
FROM nginx:alpine

# Copy built files from Stage 1 into Nginx's serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx runs on port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]