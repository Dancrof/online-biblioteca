#!/bin/bash

# ===================================================
# Script de Actualización - Online Biblioteca
# ===================================================
# Actualizar la aplicación con los últimos cambios

set -e

echo "🔄 Actualizando Online Biblioteca..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Determinar el comando de docker compose
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Hacer backup antes de actualizar
echo "📦 Creando backup..."
./backup.sh

# Obtener últimos cambios (si usas git)
if [ -d .git ]; then
    echo "⬇️  Obteniendo últimos cambios..."
    git pull
fi

# Reconstruir y reiniciar
echo "🔨 Reconstruyendo contenedores..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build

echo ""
echo -e "${GREEN}✨ Actualización completada!${NC}"
echo ""
echo "Ver logs con: $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
