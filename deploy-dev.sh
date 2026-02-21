#!/bin/bash
# ==============================================
# Script de Deploy - DESARROLLO
# ==============================================

set -e

echo "🚀 Iniciando deploy de desarrollo..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detener contenedores existentes
echo -e "${YELLOW}[1/4] Deteniendo contenedores existentes...${NC}"
sudo docker compose -f docker-compose.dev.yml down 2>/dev/null || true

# Limpiar imágenes antiguas (opcional)
echo -e "${YELLOW}[2/4] Limpiando imágenes antiguas...${NC}"
sudo docker system prune -f

# Construir imágenes
echo -e "${YELLOW}[3/4] Construyendo imágenes...${NC}"
sudo docker compose -f docker-compose.dev.yml build --no-cache

# Levantar contenedores
echo -e "${YELLOW}[4/4] Levantando contenedores...${NC}"
sudo docker compose -f docker-compose.dev.yml up -d

# Esperar a que los servicios estén listos
echo ""
echo -e "${BLUE}Esperando a que los servicios estén listos...${NC}"
sleep 3

# Mostrar estado
echo ""
echo -e "${GREEN}======================================"
echo "  ✓ Deploy completado"
echo "======================================${NC}"
echo ""
echo -e "${BLUE}Servicios corriendo:${NC}"
echo "  • API Backend: http://localhost:4000/api"
echo "  • Frontend Web: http://localhost:8080"
echo ""
echo -e "${BLUE}Comandos útiles:${NC}"
echo "  Ver logs:     sudo docker compose -f docker-compose.dev.yml logs -f"
echo "  Detener:      sudo docker compose -f docker-compose.dev.yml down"
echo "  Reconstruir:  sudo docker compose -f docker-compose.dev.yml up -d --build"
echo ""
