# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY orval*.config.ts ./
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

ARG VITE_API_BASE_URL=https://api.example.com
ARG VITE_API_TIMEOUT=30000

RUN npm run build

# Production stage
FROM nginx:alpine AS production

RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
