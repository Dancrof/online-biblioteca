# Guía de Deployment Final - VPS

## Cambios necesarios en tu Nginx del VPS

Edita tu archivo de configuración de Nginx en el VPS y haz estos 2 cambios:

### Archivo: `/etc/nginx/sites-available/biblioteca` (o similar)

```nginx
server {
    listen 127.0.0.1:8081;
    server_name biblioteca.plataformaescolar.org;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        # ⚠️ CAMBIO 1: Añade esta línea
        rewrite ^/api/(.*) /$1 break;

        # ⚠️ CAMBIO 2: Cambia proxy_pass de http://127.0.0.1:4000/ a:
        proxy_pass http://127.0.0.1:4000;
        
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cabeceras CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE, PUT, PATCH, OPTIONS' always;
        # ⚠️ CAMBIO 3: Añade Authorization a los headers permitidos
        add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization' always;
    }
}
```

**Después de editar, verifica y recarga Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Despliegue en el VPS

### 1. Desde tu máquina local, sube los archivos al VPS:

```bash
scp docker-compose.prod-nginx-host.yml \
    deploy-final.sh \
    .env \
    Dockerfile \
    Dockerfile.api \
    package.json \
    package-lock.json \
    usuario@137.131.237.7:/ruta/al/proyecto/
    
# Luego sube las carpetas src, api, public, etc.
scp -r src api public usuario@137.131.237.7:/ruta/al/proyecto/
```

### 2. En el VPS, edita el archivo `.env`:

```bash
nano .env
```

**Cambia esta línea:**
```bash
VITE_URL_API=https://biblioteca.plataformaescolar.org/api
```

### 3. Ejecuta el deployment:

```bash
./deploy-final.sh
```

El script hará:
- ✓ Detener contenedores anteriores
- ✓ Limpiar imágenes antiguas
- ✓ Construir nuevas imágenes con la URL correcta
- ✓ Levantar los contenedores

---

## Verificación

### 1. Ver logs en tiempo real:
```bash
sudo docker compose -f docker-compose.prod-nginx-host.yml logs -f
```

### 2. Probar el API directamente:
```bash
curl http://127.0.0.1:4000/libros
```

Deberías ver un JSON con los libros.

### 3. Probar a través de Nginx (con HTTPS):
```bash
curl https://biblioteca.plataformaescolar.org/api/libros
```

### 4. Abrir en el navegador:
```
https://biblioteca.plataformaescolar.org
```

---

## Troubleshooting

### Error: Mixed Content persiste
1. Verifica que `.env` tenga `VITE_URL_API=https://biblioteca.plataformaescolar.org/api`
2. Reconstruye los contenedores: `sudo docker compose -f docker-compose.prod-nginx-host.yml build --no-cache`
3. Levanta de nuevo: `sudo docker compose -f docker-compose.prod-nginx-host.yml up -d`
4. Limpia caché del navegador (Ctrl+Shift+R)

### Error: 502 Bad Gateway
```bash
# Verificar que los contenedores están corriendo
sudo docker ps

# Ver logs
sudo docker compose -f docker-compose.prod-nginx-host.yml logs

# Reiniciar servicios
sudo docker compose -f docker-compose.prod-nginx-host.yml restart
```

### Ver qué puerto está usando cada contenedor:
```bash
sudo docker ps
```

Deberías ver:
- `online-biblioteca-api` mapeado a `127.0.0.1:4000->4000/tcp`
- `online-biblioteca-web` mapeado a `127.0.0.1:8080->80/tcp`

### Verificar configuración de Nginx:
```bash
# Ver archivo de configuración
cat /etc/nginx/sites-available/biblioteca

# Verificar sintaxis
sudo nginx -t

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## Comandos útiles

```bash
# Ver estado de contenedores
sudo docker compose -f docker-compose.prod-nginx-host.yml ps

# Ver logs
sudo docker compose -f docker-compose.prod-nginx-host.yml logs -f

# Reiniciar un servicio específico
sudo docker compose -f docker-compose.prod-nginx-host.yml restart api
sudo docker compose -f docker-compose.prod-nginx-host.yml restart web

# Detener todo
sudo docker compose -f docker-compose.prod-nginx-host.yml down

# Ver uso de recursos
sudo docker stats

# Limpiar sistema Docker
sudo docker system prune -a
```

---

## Resumen de la solución

**Problema original:** 
- Mixed Content Error: HTTPS frontend intentando conectar a HTTP API

**Solución implementada:**
1. ✅ HTTPS frontend sirve desde el mismo dominio
2. ✅ API accesible vía `/api/*` en el mismo dominio HTTPS
3. ✅ Nginx hace reverse proxy a los contenedores locales
4. ✅ Sin problemas de CORS ni Mixed Content

**Arquitectura final:**
```
Internet (HTTPS)
    ↓
Nginx (tu VPS - puerto 443)
    ├─> /api/* → http://127.0.0.1:4000 (contenedor API)
    └─> /* → http://127.0.0.1:8080 (contenedor Web)
```

---

## Archivos de referencia

Revisa el archivo [nginx-vps.conf](nginx-vps.conf) para ver la configuración completa de Nginx que necesitas.
