# Etapa 1: Build de la aplicación React
# Usamos Node 22 para ser compatibles con json-server y lowdb
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el resto del código
COPY . .

# Variable de entorno para la API (build-time en Vite)
ARG VITE_URL_API=http://localhost:4000/api
ENV VITE_URL_API=$VITE_URL_API

RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar build al directorio por defecto de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración para SPA (React Router)
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        return 200 "OK"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
