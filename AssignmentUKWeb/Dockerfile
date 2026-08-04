# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (leverage layer caching)
COPY package*.json ./
RUN npm ci

# Build the production bundle
COPY . .
RUN npm run build -- --configuration production

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# SPA routing + gzip config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular build output (application builder emits to dist/<project>/browser)
COPY --from=build /app/dist/AssignmentUKWeb/browser /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
