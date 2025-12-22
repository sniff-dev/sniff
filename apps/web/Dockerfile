# Web Dockerfile - Build stage
FROM oven/bun:1 AS build

WORKDIR /app

# Copy workspace configuration
COPY package.json bun.lock ./

# Copy package.json for web
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY tsconfig.json ./

# Build arguments for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the web app
RUN bun run --filter @sniff-dev/web build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
