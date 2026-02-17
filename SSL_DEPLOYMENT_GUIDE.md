# Guía de Deployment con HTTPS

## Problema
El navegador bloquea peticiones HTTP desde páginas HTTPS (Mixed Content).

## Solución
Configurar Nginx como reverse proxy con SSL/TLS usando Let's Encrypt.

## Arquitectura
```
Internet (HTTPS) -> Nginx (puerto 443) 
                      ├─> Frontend (web:80)
                      └─> API (api:4000) en /api/*
```

## Pasos para Deployment

### 1. Actualizar configuración en el VPS

Edita el archivo `.env`:
```bash
# Cambiar esta línea:
VITE_URL_API=https://biblioteca.plataformaescolar.org/api
```

### 2. Actualizar email en deploy-ssl.sh

Edita `deploy-ssl.sh` y cambia:
```bash
EMAIL="tu-email@ejemplo.com"  # Pon tu email real
```

### 3. Ejecutar el script de deployment

```bash
./deploy-ssl.sh
```

Este script:
- Instala Certbot (si no está instalado)
- Obtiene certificados SSL de Let's Encrypt
- Construye los contenedores con la nueva configuración
- Inicia todo con Nginx como reverse proxy

### 4. Verificar

```bash
# Ver estado de contenedores
sudo docker compose -f docker-compose.prod-ssl.yml ps

# Ver logs
sudo docker compose -f docker-compose.prod-ssl.yml logs -f

# Probar la aplicación
curl https://biblioteca.plataformaescolar.org/health
```

## Renovación de Certificados

Los certificados de Let's Encrypt expiran cada 90 días. Configura renovación automática:

```bash
# Probar renovación
sudo certbot renew --dry-run

# Configurar cron job (opcional)
sudo crontab -e
# Añadir:
0 0 * * 0 certbot renew --quiet && docker compose -f /ruta/a/tu/proyecto/docker-compose.prod-ssl.yml restart nginx
```

## Troubleshooting

### Error: Certificado no se puede obtener
- Verifica que el dominio apunte a la IP del servidor
- Asegúrate que los puertos 80 y 443 estén abiertos en el firewall
- Detén cualquier servicio usando el puerto 80

```bash
# Ver qué usa el puerto 80
sudo netstat -tlnp | grep :80

# Detener Apache si está corriendo
sudo systemctl stop apache2
```

### Error: Mixed Content persiste
- Verifica que el `.env` tenga la URL correcta con HTTPS
- Reconstruye los contenedores con `--no-cache`
- Limpia la caché del navegador

### Ver logs de Nginx
```bash
# Logs de Nginx
tail -f logs/nginx/biblioteca_access.log
tail -f logs/nginx/biblioteca_error.log

# Logs de contenedores
sudo docker compose -f docker-compose.prod-ssl.yml logs nginx
sudo docker compose -f docker-compose.prod-ssl.yml logs api
sudo docker compose -f docker-compose.prod-ssl.yml logs web
```

## Comandos Útiles

```bash
# Detener todo
sudo docker compose -f docker-compose.prod-ssl.yml down

# Reiniciar un servicio específico
sudo docker compose -f docker-compose.prod-ssl.yml restart nginx

# Reconstruir y reiniciar
sudo docker compose -f docker-compose.prod-ssl.yml up -d --build --force-recreate

# Ver uso de recursos
sudo docker stats
```

## Configuración del Firewall (UFW)

```bash
# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar reglas
sudo ufw status
```

## Estructura de URLs

- **Frontend**: `https://biblioteca.plataformaescolar.org`
- **API**: `https://biblioteca.plataformaescolar.org/api/*`
- **Health Check**: `https://biblioteca.plataformaescolar.org/health`

## Notas Importantes

1. **Dominio**: El dominio debe apuntar a la IP del VPS antes de obtener el certificado
2. **Email**: Usa un email válido para notificaciones de Let's Encrypt
3. **Puertos**: Solo los puertos 80 y 443 estarán expuestos (más seguro)
4. **Cache**: Después de reconstruir, limpia la caché del navegador
5. **Logs**: Revisa los logs si algo falla

## Cambios realizados

1. **nginx.conf**: Configuración de Nginx con SSL y reverse proxy
2. **docker-compose.prod-ssl.yml**: Contenedores con Nginx incluido
3. **deploy-ssl.sh**: Script automatizado de deployment
4. **.env**: Actualizar `VITE_URL_API` a HTTPS con /api
