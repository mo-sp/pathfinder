# syntax=docker/dockerfile:1

# --- Build stage -------------------------------------------------------------
# Debian-based (glibc) Node 24 to match the lockfile's linux-x64-gnu native
# bindings (rolldown/vite). Alpine (musl) would need different bindings.
FROM node:24-slim AS build
WORKDIR /app

# Install dependencies against the committed lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the static site (vue-tsc type-check + vite build -> /app/dist).
COPY . .
RUN npm run build

# --- Serve stage -------------------------------------------------------------
# nginx serves the static bundle; the custom config adds the SPA history
# fallback the Vue Router (createWebHistory) needs.
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
