#!/usr/bin/env bash

# ===================================================
# Script de Actualización - Online Biblioteca
# ===================================================
# Actualizar la aplicación con los últimos cambios

set -euo pipefail

echo "🔄 Actualizando Online Biblioteca..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

USE_NO_CACHE=true
SKIP_BACKUP=false

for arg in "$@"; do
    case "$arg" in
        --no-cache)
            USE_NO_CACHE=true
            ;;
        --use-cache)
            USE_NO_CACHE=false
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            ;;
        -h|--help)
            echo "Uso: ./update.sh [--no-cache|--use-cache] [--skip-backup]"
            echo "  --no-cache   Reconstruye imágenes sin caché (por defecto)."
            echo "  --use-cache  Reconstruye imágenes usando caché."
            echo "  --skip-backup  Omite la ejecución de backup.sh."
            exit 0
            ;;
        *)
            echo -e "${YELLOW}⚠️  Opción desconocida: $arg${NC}"
            echo "Usa --help para ver opciones disponibles."
            exit 1
            ;;
    esac
done

# Determinar el comando de docker compose
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD=(docker compose)
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD=(docker-compose)
else
    echo -e "${RED}❌ No se encontró Docker Compose (docker compose o docker-compose)${NC}"
    exit 1
fi

# Hacer backup antes de actualizar
if [ "$SKIP_BACKUP" = true ]; then
    echo -e "${YELLOW}⏭️  Omitiendo backup por opción --skip-backup${NC}"
else
    echo "📦 Creando backup..."
    if [ ! -f "./backup.sh" ]; then
        echo -e "${RED}❌ No se encontró ./backup.sh${NC}"
        exit 1
    fi
    bash ./backup.sh
fi

# Obtener últimos cambios (si usas git)
if [ -d .git ]; then
    echo "⬇️  Obteniendo últimos cambios..."

    # Guardar cambios locales si existen
    STASHED=false
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  Detectados cambios locales, guardando temporalmente..."
        git stash push -u -m "auto-stash antes de update $(date '+%Y-%m-%d %H:%M:%S')" > /dev/null
        STASHED=true
    fi

    git pull --rebase
    
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
if [ "$USE_NO_CACHE" = true ]; then
    "${DOCKER_COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" build --no-cache
else
    "${DOCKER_COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" build
fi
"${DOCKER_COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" up -d

echo ""
echo -e "${GREEN}✨ Actualización completada!${NC}"
echo ""
echo "Ver logs con: ${DOCKER_COMPOSE_CMD[*]} -f $COMPOSE_FILE logs -f"
