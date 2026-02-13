#!/bin/bash

# ===================================================
# Script de Despliegue - Online Biblioteca
# ===================================================
# Este script despliega la aplicación en producción

set -e  # Detener en caso de error

echo "🚀 Iniciando despliegue de Online Biblioteca..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo .env${NC}"
    echo -e "${YELLOW}   Copia .env.example a .env y configura las variables${NC}"
    echo "   cp .env.example .env"
    exit 1
fi

# Verificar que Docker esté instalado y corriendo
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker no está instalado${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose no está instalado${NC}"
    exit 1
fi

# Determinar el comando de docker compose
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${GREEN}✓${NC} Verificaciones completadas"

# Backup de la base de datos si existe
if [ -f database/db.json ]; then
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.json"
    cp database/db.json $BACKUP_FILE
    echo -e "${GREEN}✓${NC} Backup creado: $BACKUP_FILE"
fi

# Detener contenedores existentes
echo "📦 Deteniendo contenedores existentes..."
$DOCKER_COMPOSE -f docker-compose.prod.yml down || true

# Limpiar imágenes antiguas (opcional, comentar si se desea mantener)
# echo "🧹 Limpiando imágenes antiguas..."
# docker image prune -f

# Construir las imágenes
echo "🔨 Construyendo imágenes..."
$DOCKER_COMPOSE -f docker-compose.prod.yml build --no-cache

# Iniciar los contenedores
echo "🚀 Iniciando contenedores..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar el estado
echo "📊 Estado de los contenedores:"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps

# Verificar salud de los servicios
echo ""
echo "🏥 Verificando salud de los servicios..."
if curl -sf http://localhost:4000 > /dev/null; then
    echo -e "${GREEN}✓${NC} API funcionando en http://localhost:4000"
else
    echo -e "${YELLOW}⚠${NC}  API no responde, revisa los logs"
fi

if curl -sf http://localhost:8080 > /dev/null; then
    echo -e "${GREEN}✓${NC} Web funcionando en http://localhost:8080"
else
    echo -e "${YELLOW}⚠${NC}  Web no responde, revisa los logs"
fi

echo ""
echo -e "${GREEN}✨ Despliegue completado!${NC}"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs:          $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
echo "   Ver logs API:      $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f api"
echo "   Ver logs Web:      $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f web"
echo "   Detener:           $DOCKER_COMPOSE -f docker-compose.prod.yml down"
echo "   Reiniciar:         $DOCKER_COMPOSE -f docker-compose.prod.yml restart"
echo "   Estado:            $DOCKER_COMPOSE -f docker-compose.prod.yml ps"
echo ""
echo "🌐 Accede a tu aplicación:"
echo "   Frontend: http://localhost:8080"
echo "   API:      http://localhost:4000"
echo ""
