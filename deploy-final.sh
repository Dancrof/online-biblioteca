#!/bin/bash
# Deployment final para VPS con Nginx existente

set -e

echo "================================================"
echo "  Deployment Online Biblioteca - VPS"
echo "================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod-nginx-host.yml" ]; then
    echo -e "${RED}Error: docker-compose.prod-nginx-host.yml no encontrado${NC}"
    exit 1
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: archivo .env no encontrado${NC}"
    exit 1
fi

# Verificar que VITE_URL_API esté configurado correctamente
if grep -q "VITE_URL_API=http://localhost:4000" .env; then
    echo -e "${RED}ERROR: .env tiene VITE_URL_API=http://localhost:4000${NC}"
    echo -e "${YELLOW}Debe ser: VITE_URL_API=https://biblioteca.plataformaescolar.org/api${NC}"
    echo ""
    read -p "¿Quieres que lo actualice automáticamente? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i 's|VITE_URL_API=http://localhost:4000|VITE_URL_API=https://biblioteca.plataformaescolar.org/api|g' .env
        echo -e "${GREEN}✓ .env actualizado${NC}"
    else
        echo -e "${RED}Por favor actualiza .env manualmente y vuelve a ejecutar el script${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}Configuración actual:${NC}"
grep "VITE_URL_API" .env
echo ""

# Confirmar deployment
read -p "¿Continuar con el deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelado"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/5] Deteniendo contenedores existentes...${NC}"
sudo docker compose down 2>/dev/null || true
sudo docker compose -f docker-compose.prod.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.prod-ssl.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.prod-nginx-host.yml down 2>/dev/null || true

echo -e "${YELLOW}[2/5] Limpiando imágenes antiguas...${NC}"
sudo docker system prune -f

echo -e "${YELLOW}[3/5] Creando directorios necesarios...${NC}"
mkdir -p logs database

echo -e "${YELLOW}[4/5] Construyendo contenedores (esto puede tardar varios minutos)...${NC}"
sudo docker compose -f docker-compose.prod-nginx-host.yml build --no-cache

echo -e "${YELLOW}[5/5] Levantando contenedores...${NC}"
sudo docker compose -f docker-compose.prod-nginx-host.yml up -d

# Esperar a que los contenedores estén listos
echo ""
echo -e "${BLUE}Esperando a que los servicios estén listos...${NC}"
sleep 5

# Verificar estado
echo ""
echo -e "${GREEN}======================================"
echo "  Estado de los contenedores"
echo "======================================${NC}"
sudo docker compose -f docker-compose.prod-nginx-host.yml ps

echo ""
echo -e "${GREEN}======================================"
echo "  ✓ Deployment completado"
echo "======================================${NC}"
echo ""
echo -e "${BLUE}Servicios corriendo:${NC}"
echo "  • API Backend: http://127.0.0.1:4000"
echo "  • Frontend Web: http://127.0.0.1:8080"
echo ""
echo -e "${BLUE}Tu aplicación está disponible en:${NC}"
echo -e "  ${GREEN}https://biblioteca.plataformaescolar.org${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo "1. Verificar logs:"
echo "   sudo docker compose -f docker-compose.prod-nginx-host.yml logs -f"
echo ""
echo "2. Probar el API:"
echo "   curl http://127.0.0.1:4000/libros"
echo ""
echo "3. Probar el frontend:"
echo "   curl http://127.0.0.1:8080"
echo ""
echo "4. Ver el sitio web:"
echo "   https://biblioteca.plataformaescolar.org"
echo ""
echo -e "${YELLOW}Comandos útiles:${NC}"
echo ""
echo "  # Ver logs en tiempo real"
echo "  sudo docker compose -f docker-compose.prod-nginx-host.yml logs -f"
echo ""
echo "  # Reiniciar servicios"
echo "  sudo docker compose -f docker-compose.prod-nginx-host.yml restart"
echo ""
echo "  # Detener todo"
echo "  sudo docker compose -f docker-compose.prod-nginx-host.yml down"
echo ""
echo "  # Ver uso de recursos"
echo "  sudo docker stats"
echo ""
echo -e "${GREEN}¡Listo! 🚀${NC}"
echo ""
