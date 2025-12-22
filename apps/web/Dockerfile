# Web Dockerfile - Build stage
FROM oven/bun:1 AS build

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY . .

# Build arguments for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the web app
RUN bun run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
