# 🚀 Inicio Rápido - Despliegue en Oracle Cloud

Esta es una guía rápida para desplegar Online Biblioteca en Oracle Cloud VPS. Para la guía completa, consulta [DEPLOYMENT.md](DEPLOYMENT.md).

## ⚡ Pasos Rápidos

### 1. En Oracle Cloud Console

1. Crea una instancia (VM.Standard.E2.1.Micro - Free Tier)
2. Abre los puertos en Security Lists:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
   - 4000 (API)
   - 8080 (Web)

### 2. En tu VPS

```bash
# Conectar
ssh ubuntu@<TU_IP_PUBLICA>

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Configurar Firewall
sudo apt install ufw -y
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp && sudo ufw allow 4000/tcp
sudo ufw enable

# Clonar proyecto
git clone <TU_REPO_URL> online-biblioteca
cd online-biblioteca

# Configurar variables de entorno
cp .env.example .env
nano .env  # Edita JWT_SECRET y VITE_URL_API

# Desplegar
./deploy.sh
```

### 3. Variables de entorno importantes

```bash
JWT_SECRET=tu_secret_super_seguro_aquí
VITE_URL_API=http://<TU_IP_PUBLICA>:4000
PORT=4000
NODE_ENV=production
```

Genera un JWT secret seguro:
```bash
openssl rand -base64 32
```

## 🌐 Acceder a tu aplicación

- **Frontend**: http://TU_IP_PUBLICA:8080
- **API**: http://TU_IP_PUBLICA:4000

## 📝 Comandos Útiles

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar
docker compose -f docker-compose.prod.yml restart

# Detener
docker compose -f docker-compose.prod.yml down

# Backup
./backup.sh

# Actualizar
./update.sh
```

## 🔒 HTTPS (Recomendado)

Si tienes un dominio:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Instalar Nginx
sudo apt install nginx -y

# Obtener certificados
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para configuración completa de HTTPS.

## 🆘 Problemas Comunes

### No puedo conectarme
- Verifica Security Lists en Oracle Cloud
- Verifica firewall: `sudo ufw status`
- Verifica contenedores: `docker compose -f docker-compose.prod.yml ps`

### Error de API en el frontend
- Verifica `VITE_URL_API` en `.env`
- Debe ser: `http://<IP_PUBLICA>:4000`
- Reconstruye el frontend: `docker compose -f docker-compose.prod.yml up -d --build web`

## 📚 Documentación Completa

Para instrucciones detalladas, configuración de dominios, HTTPS, monitoreo y más:

👉 **[Ver DEPLOYMENT.md](DEPLOYMENT.md)**

---

**¿Todo funcionando?** ¡Excelente! Considera:
- ✅ Configurar un dominio
- ✅ Habilitar HTTPS
- ✅ Configurar backups automáticos (cron)
