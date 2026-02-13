# 🚀 Guía de Despliegue en Oracle Cloud VPS

Esta guía te ayudará a desplegar **Online Biblioteca** en un VPS de Oracle Cloud Infrastructure (OCI).

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Configuración del VPS en Oracle Cloud](#configuración-del-vps-en-oracle-cloud)
- [Instalación de Dependencias en el VPS](#instalación-de-dependencias-en-el-vps)
- [Configuración del Firewall](#configuración-del-firewall)
- [Transferir el Proyecto al VPS](#transferir-el-proyecto-al-vps)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Despliegue de la Aplicación](#despliegue-de-la-aplicación)
- [Configuración de Dominio (Opcional)](#configuración-de-dominio-opcional)
- [Configuración de HTTPS con Let's Encrypt (Recomendado)](#configuración-de-https-con-lets-encrypt-recomendado)
- [Mantenimiento y Operación](#mantenimiento-y-operación)
- [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Requisitos Previos

### En tu máquina local:
- Git instalado
- Acceso SSH al VPS
- Cuenta de Oracle Cloud creada

### En el VPS:
- Ubuntu 20.04 o superior (recomendado)
- Mínimo 1GB RAM (recomendado 2GB)
- 20GB de almacenamiento
- Acceso root o sudo

---

## 🔧 Configuración del VPS en Oracle Cloud

### 1. Crear una Instancia de Compute

1. Inicia sesión en [Oracle Cloud Console](https://cloud.oracle.com/)
2. Ve a **Compute** → **Instances** → **Create Instance**
3. Configura:
   - **Name**: `online-biblioteca-server` (o el nombre que prefieras)
   - **Image**: Ubuntu 22.04 (Always Free Eligible)
   - **Shape**: VM.Standard.E2.1.Micro (Always Free - 1GB RAM)
   - **Boot volume size**: 50GB (el máximo gratuito)
   - **SSH keys**: Agrega tu clave pública SSH o genera una nueva

4. Anota la **IP pública** de tu instancia

### 2. Configurar Reglas de Ingreso

En Oracle Cloud, necesitas abrir los puertos en dos lugares:

#### A. Security List (en OCI Console)

1. Ve a **Networking** → **Virtual Cloud Networks**
2. Selecciona tu VCN → **Security Lists** → **Default Security List**
3. Agrega las siguientes **Ingress Rules**:

| Source CIDR | Protocol | Source Port | Dest Port | Description |
|-------------|----------|-------------|-----------|-------------|
| 0.0.0.0/0   | TCP      | All         | 22        | SSH         |
| 0.0.0.0/0   | TCP      | All         | 80        | HTTP        |
| 0.0.0.0/0   | TCP      | All         | 443       | HTTPS       |
| 0.0.0.0/0   | TCP      | All         | 8080      | Web App     |
| 0.0.0.0/0   | TCP      | All         | 4000      | API         |

---

## 💻 Instalación de Dependencias en el VPS

### 1. Conectarse al VPS

```bash
ssh ubuntu@<TU_IP_PUBLICA>
```

Si usas una clave SSH específica:
```bash
ssh -i /ruta/a/tu/clave.pem ubuntu@<TU_IP_PUBLICA>
```

### 2. Actualizar el Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar tu usuario al grupo docker (evita usar sudo)
sudo usermod -aG docker $USER

# Aplicar cambios de grupo (o cierra sesión y vuelve a entrar)
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

### 4. Instalar Git

```bash
sudo apt install git -y
git --version
```

### 5. (Opcional) Instalar herramientas útiles

```bash
sudo apt install htop curl wget nano -y
```

---

## 🔥 Configuración del Firewall

Oracle Cloud usa `iptables` por defecto. Configura el firewall del sistema operativo:

```bash
# Ver reglas actuales
sudo iptables -L

# Permitir tráfico en los puertos necesarios
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 4000 -j ACCEPT

# Guardar reglas
sudo netfilter-persistent save

# Si no tienes netfilter-persistent, instálalo:
sudo apt install iptables-persistent -y
```

**Alternativa con UFW (más simple):**

```bash
# Instalar UFW si no está instalado
sudo apt install ufw -y

# Configurar reglas
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Web App
sudo ufw allow 4000/tcp  # API

# Habilitar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

---

## 📦 Transferir el Proyecto al VPS

### Opción 1: Usando Git (Recomendado)

Si tu proyecto está en GitHub/GitLab:

```bash
# En el VPS
cd ~
git clone https://github.com/TU_USUARIO/online-biblioteca.git
cd online-biblioteca
```

### Opción 2: Transferir con SCP

Desde tu máquina local:

```bash
# Comprimir el proyecto (excluir node_modules y archivos innecesarios)
cd /home/bryan/Documentos/proyect/online-biblioteca
tar -czf online-biblioteca.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='.env' \
  .

# Transferir al VPS
scp online-biblioteca.tar.gz ubuntu@<TU_IP_PUBLICA>:~/

# En el VPS, descomprimir
ssh ubuntu@<TU_IP_PUBLICA>
cd ~
tar -xzf online-biblioteca.tar.gz -C online-biblioteca
cd online-biblioteca
```

### Opción 3: Usando rsync (Sincronización)

```bash
# Desde tu máquina local
rsync -avz --exclude='node_modules' \
           --exclude='.git' \
           --exclude='dist' \
           --exclude='.env' \
  /home/bryan/Documentos/proyect/online-biblioteca/ \
  ubuntu@<TU_IP_PUBLICA>:~/online-biblioteca/
```

---

## ⚙️ Configuración de Variables de Entorno

### En el VPS:

```bash
cd ~/online-biblioteca

# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env
nano .env
```

### Configurar las siguientes variables:

```bash
# JWT Secret - GENERAR UNO SEGURO
JWT_SECRET=$(openssl rand -base64 32)

# URL de la API (usa la IP pública de tu VPS o dominio)
VITE_URL_API=http://<TU_IP_PUBLICA>:4000

# Puerto de la API
PORT=4000

# Ambiente
NODE_ENV=production

# Otros valores según necesites
VITE_ANIO_MIN=1900
VITE_ANIO_MAX=2026
VITE_ITEMS_PER_PAGE=4

# Cloudinary (si lo usas)
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

### Generar un JWT Secret seguro:

```bash
# Generar y agregar automáticamente al .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

**Guardar y salir** (en nano: `Ctrl+O`, `Enter`, `Ctrl+X`)

---

## 🚀 Despliegue de la Aplicación

### Usando el script de despliegue:

```bash
cd ~/online-biblioteca

# Ejecutar el script de despliegue
./deploy.sh
```

### O manualmente:

```bash
cd ~/online-biblioteca

# Construir e iniciar los contenedores
docker compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### Verificar que todo funciona:

```bash
# Verificar contenedores
docker compose -f docker-compose.prod.yml ps

# Probar la API
curl http://localhost:4000

# Probar el frontend
curl http://localhost:8080
```

### Acceder desde el navegador:

- **Frontend**: `http://<TU_IP_PUBLICA>:8080`
- **API**: `http://<TU_IP_PUBLICA>:4000`

---

## 🌐 Configuración de Dominio (Opcional)

Si tienes un dominio, puedes configurarlo:

### 1. Configurar DNS

En tu proveedor de dominios (GoDaddy, Namecheap, etc.), agrega estos registros:

```
Tipo    Nombre              Valor                    TTL
A       @                   <TU_IP_PUBLICA>         3600
A       www                 <TU_IP_PUBLICA>         3600
A       api                 <TU_IP_PUBLICA>         3600
```

### 2. Esperar propagación DNS (puede tardar hasta 24h)

Verificar:
```bash
nslookup tudominio.com
```

### 3. Actualizar variables de entorno

```bash
nano ~/online-biblioteca/.env
```

Cambiar:
```bash
VITE_URL_API=https://api.tudominio.com
```

---

## 🔒 Configuración de HTTPS con Let's Encrypt (Recomendado)

### Opción 1: Usar Nginx como Reverse Proxy

#### 1. Instalar Nginx

```bash
sudo apt install nginx -y
```

#### 2. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/online-biblioteca
```

Agregar:

```nginx
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API
server {
    listen 443 ssl http2;
    server_name api.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Instalar Certbot y obtener certificados

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados
sudo certbot --nginx -d tudominio.com -d www.tudominio.com -d api.tudominio.com

# Renovación automática (ya configurada por defecto)
sudo certbot renew --dry-run
```

#### 4. Habilitar la configuración

```bash
sudo ln -s /etc/nginx/sites-available/online-biblioteca /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Opción 2: HTTPS sin Dominio (usando IP)

Para HTTPS con solo IP, necesitas un certificado autofirmado (no recomendado para producción):

```bash
# Crear certificado autofirmado
sudo mkdir -p /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt
```

---

## 🛠️ Mantenimiento y Operación

### Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# Reiniciar servicios
docker compose -f docker-compose.prod.yml restart

# Detener servicios
docker compose -f docker-compose.prod.yml down

# Ver estado de servicios
docker compose -f docker-compose.prod.yml ps

# Ejecutar comando dentro del contenedor
docker compose -f docker-compose.prod.yml exec api sh
```

### Backup de la Base de Datos

```bash
# Crear backup manual
./backup.sh

# Los backups se guardan en: backups/db_backup_TIMESTAMP.json
```

### Configurar Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * cd ~/online-biblioteca && ./backup.sh >> ~/backup.log 2>&1
```

### Actualizar la Aplicación

```bash
# Si usas Git
cd ~/online-biblioteca
git pull
./update.sh

# O manualmente
./backup.sh
docker compose -f docker-compose.prod.yml up -d --build
```

### Monitoreo de Recursos

```bash
# Ver uso de recursos
docker stats

# Ver uso del sistema
htop

# Ver espacio en disco
df -h

# Ver logs del sistema
sudo journalctl -xe
```

---

## 🔍 Solución de Problemas

### Los contenedores no inician

```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs

# Verificar que los puertos no estén en uso
sudo lsof -i :4000
sudo lsof -i :8080

# Reconstruir desde cero
docker compose -f docker-compose.prod.yml down -v
docker system prune -a
docker compose -f docker-compose.prod.yml up -d --build
```

### No puedo acceder desde el navegador

1. Verificar firewall en OCI Console (Security Lists)
2. Verificar firewall en el VPS:
   ```bash
   sudo iptables -L
   # o
   sudo ufw status
   ```
3. Verificar que los contenedores estén corriendo:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
4. Verificar logs:
   ```bash
   docker compose -f docker-compose.prod.yml logs
   ```

### Error de conexión a la API desde el frontend

1. Verificar la variable `VITE_URL_API` en `.env`
2. Debe ser accesible desde el navegador del cliente
3. Reconstruir el frontend si cambias esta variable:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build web
   ```

### Error "Permission denied" con Docker

```bash
# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### La base de datos no persiste

Verificar que el volumen esté montado correctamente:
```bash
docker compose -f docker-compose.prod.yml down
docker volume ls
docker compose -f docker-compose.prod.yml up -d
```

### Problemas de memoria

Oracle Free Tier tiene solo 1GB de RAM. Si hay problemas:

```bash
# Verificar memoria
free -h

# Agregar swap si es necesario
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer persistente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Logs muy grandes

```bash
# Limpiar logs de Docker
docker system prune -a --volumes

# Configurar rotación de logs
sudo nano /etc/docker/daemon.json
```

Agregar:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Reiniciar Docker:
```bash
sudo systemctl restart docker
```

---

## 📚 Recursos Adicionales

- [Documentación de Oracle Cloud](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🎉 ¡Listo!

Tu aplicación **Online Biblioteca** ahora está desplegada en Oracle Cloud. 

### Acceso:
- **Frontend**: `http://<TU_IP_PUBLICA>:8080` o `https://tudominio.com`
- **API**: `http://<TU_IP_PUBLICA>:4000` o `https://api.tudominio.com`

### Próximos pasos recomendados:
1. ✅ Configurar un dominio
2. ✅ Habilitar HTTPS con Let's Encrypt
3. ✅ Configurar backups automáticos
4. ✅ Configurar monitoreo (Uptime Robot, etc.)
5. ✅ Documentar el proceso de actualización para tu equipo

---

**¿Necesitas ayuda?** Revisa la sección de [Solución de Problemas](#solución-de-problemas) o consulta la documentación adicional.
