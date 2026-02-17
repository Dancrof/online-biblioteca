#!/bin/bash
# Script para configurar SSL con Let's Encrypt y desplegar la aplicación

set -e

echo "======================================"
echo "Configuración SSL y Deployment"
echo "======================================"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod-ssl.yml" ]; then
    echo -e "${RED}Error: docker-compose.prod-ssl.yml no encontrado${NC}"
    exit 1
fi

# Verificar dominio
DOMAIN="biblioteca.plataformaescolar.org"
EMAIL="tu-email@ejemplo.com"  # CAMBIAR ESTO

echo -e "${YELLOW}Dominio: $DOMAIN${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}"
echo ""

# Paso 1: Instalar Certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}[1/5] Instalando Certbot...${NC}"
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}[1/5] Certbot ya está instalado${NC}"
fi

# Paso 2: Obtener certificado SSL
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo -e "${YELLOW}[2/5] Obteniendo certificado SSL...${NC}"
    echo -e "${YELLOW}IMPORTANTE: Asegúrate de que el dominio $DOMAIN apunte a este servidor${NC}"
    read -p "¿Continuar? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo certbot certonly --standalone \
            --preferred-challenges http \
            -d $DOMAIN \
            --email $EMAIL \
            --agree-tos \
            --non-interactive
    else
        echo -e "${RED}Cancelado${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[2/5] Certificado SSL ya existe${NC}"
fi

# Paso 3: Detener contenedores existentes
echo -e "${YELLOW}[3/5] Deteniendo contenedores existentes...${NC}"
sudo docker compose -f docker-compose.prod.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.prod-ssl.yml down 2>/dev/null || true

# Paso 4: Crear directorios necesarios
echo -e "${YELLOW}[4/5] Creando directorios...${NC}"
mkdir -p logs/nginx

# Paso 5: Construir y levantar contenedores
echo -e "${YELLOW}[5/5] Construyendo y levantando contenedores...${NC}"
sudo docker compose -f docker-compose.prod-ssl.yml build --no-cache
sudo docker compose -f docker-compose.prod-ssl.yml up -d

echo ""
echo -e "${GREEN}======================================"
echo "✓ Deployment completado"
echo "======================================${NC}"
echo ""
echo "Tu aplicación está corriendo en:"
echo -e "${GREEN}https://$DOMAIN${NC}"
echo ""
echo "Verificar estado:"
echo "  sudo docker compose -f docker-compose.prod-ssl.yml ps"
echo ""
echo "Ver logs:"
echo "  sudo docker compose -f docker-compose.prod-ssl.yml logs -f"
echo ""
echo "Renovar certificados (automático):"
echo "  sudo certbot renew --dry-run"
echo ""
