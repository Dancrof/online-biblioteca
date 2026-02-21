#!/usr/bin/env bash

# ==============================================
# Script para detener contenedores Docker
# ==============================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

TARGET="all"
REMOVE_VOLUMES=false
REMOVE_ORPHANS=true

for arg in "$@"; do
  case "$arg" in
    --dev)
      TARGET="dev"
      ;;
    --prod)
      TARGET="prod"
      ;;
    --all)
      TARGET="all"
      ;;
    --volumes)
      REMOVE_VOLUMES=true
      ;;
    --no-orphans)
      REMOVE_ORPHANS=false
      ;;
    -h|--help)
      echo "Uso: ./stop.sh [--dev|--prod|--all] [--volumes] [--no-orphans]"
      echo ""
      echo "Opciones:"
      echo "  --dev        Detiene solo docker-compose.dev.yml"
      echo "  --prod       Detiene solo docker-compose.prod.yml"
      echo "  --all        Detiene ambos entornos (por defecto)"
      echo "  --volumes    Elimina también volúmenes del compose"
      echo "  --no-orphans No elimina contenedores huérfanos"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Opción desconocida: $arg${NC}"
      echo "Usa --help para ver opciones disponibles."
      exit 1
      ;;
  esac
done

if command -v docker &> /dev/null && docker compose version &> /dev/null; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose &> /dev/null; then
  COMPOSE_CMD=(docker-compose)
else
  echo -e "${RED}❌ No se encontró Docker Compose (docker compose o docker-compose)${NC}"
  exit 1
fi

DOWN_ARGS=(down)
if [ "$REMOVE_ORPHANS" = true ]; then
  DOWN_ARGS+=(--remove-orphans)
fi
if [ "$REMOVE_VOLUMES" = true ]; then
  DOWN_ARGS+=(-v)
fi

stop_compose_file() {
  local compose_file="$1"

  if [ ! -f "$compose_file" ]; then
    echo -e "${YELLOW}⚠️  No existe $compose_file, se omite.${NC}"
    return 0
  fi

  echo -e "${YELLOW}Deteniendo $compose_file...${NC}"
  "${COMPOSE_CMD[@]}" -f "$compose_file" "${DOWN_ARGS[@]}"
  echo -e "${GREEN}✓ $compose_file detenido${NC}"
}

case "$TARGET" in
  dev)
    stop_compose_file "docker-compose.dev.yml"
    ;;
  prod)
    stop_compose_file "docker-compose.prod.yml"
    ;;
  all)
    stop_compose_file "docker-compose.dev.yml"
    stop_compose_file "docker-compose.prod.yml"
    ;;
esac

echo -e "${GREEN}✅ Proceso finalizado.${NC}"
