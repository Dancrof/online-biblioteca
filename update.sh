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
    
    # Guardar cambios locales si existen
    if ! git diff-index --quiet HEAD --; then
        echo "⚠️  Detectados cambios locales, guardando temporalmente..."
        git stash
        STASHED=true
    else
        STASHED=false
    fi
    
    git pull
    
    # Restaurar cambios guardados
    if [ "$STASHED" = true ]; then
        echo "📥 Restaurando cambios locales..."
        git stash pop || echo "⚠️  Revisa conflictos manualmente"
    fi
fi

# Determinar qué archivo docker-compose usar
if [ -f "docker-compose.prod-nginx-host.yml" ]; then
    COMPOSE_FILE="docker-compose.prod-nginx-host.yml"
    echo "📝 Usando configuración: docker-compose.prod-nginx-host.yml"
elif [ -f "docker-compose.prod.yml" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "📝 Usando configuración: docker-compose.prod.yml"
else
    echo "❌ No se encontró archivo docker-compose para producción"
    exit 1
fi

# Reconstruir y reiniciar
echo "🔨 Reconstruyendo contenedores..."
$DOCKER_COMPOSE -f $COMPOSE_FILE build --no-cache
$DOCKER_COMPOSE -f $COMPOSE_FILE up -d

echo ""
echo -e "${GREEN}✨ Actualización completada!${NC}"
echo ""
echo "Ver logs con: $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f"
