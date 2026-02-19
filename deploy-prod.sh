#!/bin/bash
# ==============================================
# Script de Deploy - PRODUCCIÓN
# ==============================================

set -e

echo "================================================"
echo "  Deploy Online Biblioteca - PRODUCCIÓN"
echo "================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: archivo .env no encontrado${NC}"
    echo -e "${YELLOW}   Crea un archivo .env con las siguientes variables:${NC}"
    echo "   JWT_SECRET=tu_secret_key"
    echo "   VITE_URL_API=https://tu-dominio.com/api"
    exit 1
fi

# Verificar que VITE_URL_API no sea localhost en producción
if grep -q "VITE_URL_API=http://localhost" .env; then
    echo -e "${RED}❌ ERROR: .env contiene VITE_URL_API con localhost${NC}"
    echo -e "${YELLOW}   En producción debe ser tu dominio público, ejemplo:${NC}"
    echo "   VITE_URL_API=https://biblioteca.plataformaescolar.org/api"
    echo ""
    read -p "¿Quieres que lo actualice? Ingresa tu dominio (o 'n' para cancelar): " DOMAIN
    if [[ $DOMAIN == "n" ]] || [[ -z $DOMAIN ]]; then
        echo -e "${RED}Deploy cancelado. Actualiza .env manualmente.${NC}"
        exit 1
    else
        sed -i "s|VITE_URL_API=http://localhost.*|VITE_URL_API=https://$DOMAIN/api|g" .env
        echo -e "${GREEN}✓ .env actualizado${NC}"
    fi
fi

# Verificar JWT_SECRET
if grep -q "JWT_SECRET=dev_secret_key" .env || grep -q "JWT_SECRET=super_secret" .env; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: JWT_SECRET parece ser una clave de desarrollo${NC}"
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelado. Actualiza JWT_SECRET en .env"
        exit 0
    fi
fi

echo -e "${BLUE}Configuración actual:${NC}"
echo -e "${GREEN}$(grep "VITE_URL_API" .env)${NC}"
echo ""

# Confirmar deployment
read -p "¿Continuar con el deploy a producción? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy cancelado"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/6] Deteniendo contenedores existentes...${NC}"
sudo docker compose -f docker-compose.prod.yml down 2>/dev/null || true

echo -e "${YELLOW}[2/6] Limpiando imágenes antiguas...${NC}"
sudo docker system prune -f

echo -e "${YELLOW}[3/6] Creando directorios necesarios...${NC}"
mkdir -p logs database

echo -e "${YELLOW}[4/6] Construyendo contenedores (puede tardar varios minutos)...${NC}"
sudo docker compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}[5/6] Levantando contenedores...${NC}"
sudo docker compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}[6/6] Verificando estado...${NC}"
sleep 5

# Verificar estado
echo ""
echo -e "${GREEN}======================================"
echo "  Estado de los contenedores"
echo "======================================${NC}"
sudo docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}======================================"
echo "  ✓ Deploy completado exitosamente"
echo "======================================${NC}"
echo ""
echo -e "${BLUE}Servicios corriendo:${NC}"
echo "  • API Backend: http://127.0.0.1:4000"
echo "  • Frontend Web: http://127.0.0.1:8080"
echo ""
echo -e "${BLUE}Comandos útiles:${NC}"
echo "  Ver logs:     sudo docker compose -f docker-compose.prod.yml logs -f"
echo "  Detener:      sudo docker compose -f docker-compose.prod.yml down"
echo "  Reiniciar:    sudo docker compose -f docker-compose.prod.yml restart"
echo ""
