# 📚 Online Biblioteca

Sistema de gestión de biblioteca online desarrollado con React + TypeScript + Vite en el frontend y json-server como API backend.

## ✨ Características

- 📖 Gestión de libros (CRUD completo)
- 👥 Gestión de usuarios y autenticación JWT
- 🔐 Sistema de roles (Admin/Usuario)
- 📋 Sistema de préstamos (rentas)
- 🖼️ Carga de imágenes con Cloudinary
- 🔍 Búsqueda y filtrado de libros
- 📱 Diseño responsive

## 🛠️ Tecnologías

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router
- Context API

**Backend:**
- json-server (API REST)
- JWT para autenticación

**DevOps:**
- Docker & Docker Compose
- Nginx (reverse proxy)

---

## 🚀 Inicio Rápido

### Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### Desarrollo Local

1. **Clonar el repositorio**
```bash
git clone <tu-repo-url> online-biblioteca
cd online-biblioteca
```

2. **Ejecutar con Docker**
```bash
./deploy-dev.sh
```

O manualmente:
```bash
docker compose -f docker-compose.dev.yml up -d
```

3. **Acceder a la aplicación**
- Frontend: http://localhost:8080
- API: http://localhost:4000/api

### Desarrollo sin Docker

```bash
# Instalar dependencias
npm install

# Terminal 1: Levantar el backend
npm run start:json-server

# Terminal 2: Levantar el frontend
npm run dev
```

Crea un archivo `.env`:
```env
VITE_URL_API=http://localhost:4000/api
```

---

## 🌐 Despliegue en Producción

### Opción 1: Despliegue Rápido con Docker

1. **Configurar variables de entorno**

Crea un archivo `.env`:
```env
# Seguridad
JWT_SECRET=tu_secret_super_seguro_aquí

# URL de la API (cambia por tu dominio o IP)
VITE_URL_API=https://tu-dominio.com/api

# Puerto del backend
PORT=4000
NODE_ENV=production
```

Genera un JWT secret seguro:
```bash
openssl rand -base64 32
```

2. **Ejecutar deploy**
```bash
chmod +x deploy-prod.sh
./deploy-prod.sh
```

Los servicios estarán disponibles en:
- Frontend: http://127.0.0.1:8080
- API: http://127.0.0.1:4000/api

### Opción 2: Despliegue con Nginx y SSL

Si tienes un dominio y quieres usar HTTPS:

1. **Instalar Nginx**
```bash
sudo apt update
sudo apt install nginx -y
```

2. **Configurar Nginx**
```bash
# Copiar la configuración
sudo cp nginx.conf /etc/nginx/sites-available/biblioteca

# Actualizar el dominio en el archivo
sudo nano /etc/nginx/sites-available/biblioteca
# Cambia "biblioteca.plataformaescolar.org" por tu dominio

# Crear symlink
sudo ln -s /etc/nginx/sites-available/biblioteca /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t
```

3. **Instalar certificados SSL con Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com
sudo systemctl restart nginx
```

4. **Desplegar la aplicación**
```bash
./deploy-prod.sh
```

Tu aplicación estará disponible en: https://tu-dominio.com

### Despliegue en Oracle Cloud (Free Tier)

1. **Crear instancia VM** (VM.Standard.E2.1.Micro es gratis)

2. **Abrir puertos en Security Lists:**
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
   - 4000 (API)
   - 8080 (Web)

3. **Conectar al VPS**
```bash
ssh ubuntu@<TU_IP_PUBLICA>
```

4. **Instalar Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

5. **Configurar Firewall**
```bash
sudo apt install ufw -y
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 4000/tcp
sudo ufw enable
```

6. **Clonar y desplegar**
```bash
git clone <TU_REPO_URL> online-biblioteca
cd online-biblioteca
cp .env.example .env
nano .env  # Configurar variables
./deploy-prod.sh
```

---

## 📝 Comandos Útiles

### Desarrollo
```bash
# Ver logs en tiempo real
docker compose -f docker-compose.dev.yml logs -f

# Detener servicios
docker compose -f docker-compose.dev.yml down

# Reconstruir imágenes
docker compose -f docker-compose.dev.yml up -d --build

# Ejecutar sin Docker
npm run dev              # Frontend
npm run start:json-server # Backend
```

### Producción
```bash
# Ver logs
sudo docker compose -f docker-compose.prod.yml logs -f

# Reiniciar servicios
sudo docker compose -f docker-compose.prod.yml restart

# Detener servicios
sudo docker compose -f docker-compose.prod.yml down

# Ver estado de contenedores
sudo docker compose -f docker-compose.prod.yml ps

# Backup de la base de datos
./backup.sh
```

### Nginx
```bash
# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/biblioteca_access.log
sudo tail -f /var/log/nginx/biblioteca_error.log
```

---

## 📁 Estructura del Proyecto

```
online-biblioteca/
├── api/                    # Backend (json-server)
│   └── server.js
├── database/              # Base de datos JSON
│   └── db.json
├── src/                   # Frontend React
│   ├── Config/           # Configuración (constantes, API)
│   ├── context/          # Context API (Auth, Cart)
│   ├── hooks/            # Custom hooks
│   ├── interfaces/       # TypeScript interfaces
│   ├── module/           # Componentes por módulo
│   │   ├── Admin/       # Panel de administración
│   │   ├── Auth/        # Login/Register
│   │   ├── Books/       # Gestión de libros
│   │   ├── Rents/       # Gestión de préstamos
│   │   └── User/        # Perfil de usuario
│   ├── Router/          # Rutas de la aplicación
│   └── Services/        # Servicios API
├── docker-compose.dev.yml  # Docker para desarrollo
├── docker-compose.prod.yml # Docker para producción
├── deploy-dev.sh          # Script deploy desarrollo
├── deploy-prod.sh         # Script deploy producción
├── nginx.conf             # Configuración Nginx
└── README.md              # Este archivo
```

---

## 🔧 Variables de Entorno

### Frontend (.env)
```env
VITE_URL_API=http://localhost:4000/api       # URL base del backend
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name     # Cloudinary (opcional)
VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset      # Cloudinary (opcional)
```

### Backend
```env
JWT_SECRET=tu_secret_super_seguro
PORT=4000
NODE_ENV=production
```

---

## 👥 Usuarios por Defecto

### Administrador
- Email: `admin@biblioteca.com`
- Password: `admin123`

### Usuario Regular
- Email: `user@biblioteca.com`
- Password: `user123`

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 📧 Contacto

Para soporte o consultas, abre un issue en el repositorio.
