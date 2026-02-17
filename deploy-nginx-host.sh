#!/bin/bash
# Script de deployment para usar con Nginx ya configurado en el host

set -e

echo "======================================"
echo "Deployment con Nginx del Host"
echo "======================================"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar archivo
if [ ! -f "docker-compose.prod-nginx-host.yml" ]; then
    echo -e "${RED}Error: docker-compose.prod-nginx-host.yml no encontrado${NC}"
    exit 1
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: archivo .env no encontrado${NC}"
    exit 1
fi

# Paso 1: Detener contenedores existentes
echo -e "${YELLOW}[1/4] Deteniendo contenedores existentes...${NC}"
sudo docker compose down 2>/dev/null || true
sudo docker compose -f docker-compose.prod.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.prod-ssl.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.prod-nginx-host.yml down 2>/dev/null || true

# Paso 2: Crear directorios necesarios
echo -e "${YELLOW}[2/4] Creando directorios...${NC}"
mkdir -p logs database

# Paso 3: Construir contenedores
echo -e "${YELLOW}[3/4] Construyendo contenedores...${NC}"
sudo docker compose -f docker-compose.prod-nginx-host.yml build --no-cache

# Paso 4: Levantar contenedores
echo -e "${YELLOW}[4/4] Levantando contenedores...${NC}"
sudo docker compose -f docker-compose.prod-nginx-host.yml up -d

echo ""
echo -e "${GREEN}======================================"
echo "✓ Deployment completado"
echo "======================================${NC}"
echo ""
echo "Servicios corriendo:"
echo "  - API: http://127.0.0.1:4000"
echo "  - Web: http://127.0.0.1:8080"
echo ""
echo "Tu Nginx hace proxy a estos puertos."
echo ""
echo "Verificar estado:"
echo "  sudo docker compose -f docker-compose.prod-nginx-host.yml ps"
echo ""
echo "Ver logs:"
echo "  sudo docker compose -f docker-compose.prod-nginx-host.yml logs -f"
echo ""
echo "Detener:"
echo "  sudo docker compose -f docker-compose.prod-nginx-host.yml down"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "1. Verifica que tu configuración de Nginx tenga:"
echo "   location /api/ { proxy_pass http://127.0.0.1:4000/; ..."
echo "   location / { proxy_pass http://127.0.0.1:8080/; ..."
echo ""
echo "2. Recarga Nginx:"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
