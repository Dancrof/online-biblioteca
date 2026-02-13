#!/bin/bash

# ===================================================
# Script de Verificación de Salud - Online Biblioteca
# ===================================================
# Verifica que todos los servicios estén funcionando correctamente

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏥 Verificación de Salud - Online Biblioteca${NC}"
echo "=================================================="
echo ""

# Determinar el comando de docker compose
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# 1. Verificar Docker
echo -n "🐳 Docker instalado... "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Docker no está instalado${NC}"
    exit 1
fi

# 2. Verificar Docker Compose
echo -n "📦 Docker Compose instalado... "
if command -v docker compose &> /dev/null || command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Docker Compose no está instalado${NC}"
    exit 1
fi

# 3. Verificar archivo .env
echo -n "⚙️  Archivo .env existe... "
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠  No se encuentra .env${NC}"
    echo "   Crea uno con: cp .env.example .env"
fi

# 4. Verificar contenedores
echo ""
echo "📊 Estado de los contenedores:"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps

echo ""

# 5. Verificar API
echo -n "🔌 API responde (puerto 4000)... "
if curl -sf http://localhost:4000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    API_STATUS="OK"
else
    echo -e "${RED}✗ No responde${NC}"
    API_STATUS="FAIL"
fi

# 6. Verificar Frontend
echo -n "🌐 Frontend responde (puerto 8080)... "
if curl -sf http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    WEB_STATUS="OK"
else
    echo -e "${RED}✗ No responde${NC}"
    WEB_STATUS="FAIL"
fi

# 7. Verificar base de datos
echo -n "💾 Base de datos existe... "
if [ -f database/db.json ]; then
    echo -e "${GREEN}✓${NC}"
    DB_SIZE=$(du -h database/db.json | cut -f1)
    echo "   Tamaño: $DB_SIZE"
else
    echo -e "${RED}✗ No se encuentra database/db.json${NC}"
fi

# 8. Verificar puertos abiertos
echo ""
echo "🔓 Puertos en uso:"
if command -v ss &> /dev/null; then
    ss -tlnp | grep -E ':(4000|8080)' || echo "   No se detectaron puertos 4000 o 8080"
else
    netstat -tlnp 2>/dev/null | grep -E ':(4000|8080)' || echo "   No se detectaron puertos 4000 o 8080"
fi

# 9. Verificar espacio en disco
echo ""
echo "💿 Espacio en disco:"
df -h / | tail -n 1 | awk '{print "   Disponible: "$4" de "$2" ("$5" usado)"}'

# 10. Verificar memoria
echo ""
echo "🧠 Memoria:"
free -h | grep Mem | awk '{print "   Disponible: "$7" de "$2}'

# 11. Verificar logs recientes (últimas 5 líneas)
echo ""
echo "📝 Últimos logs de la API:"
$DOCKER_COMPOSE -f docker-compose.prod.yml logs --tail=5 api 2>/dev/null || echo "   No hay logs disponibles"

# Resumen
echo ""
echo "=================================================="
echo -e "${BLUE}📋 RESUMEN${NC}"
echo "=================================================="

if [ "$API_STATUS" = "OK" ] && [ "$WEB_STATUS" = "OK" ]; then
    echo -e "${GREEN}✅ Todos los servicios están funcionando correctamente${NC}"
    echo ""
    echo "🌐 Accede a tu aplicación:"
    echo "   Frontend: http://localhost:8080"
    echo "   API:      http://localhost:4000"
else
    echo -e "${RED}❌ Algunos servicios no están funcionando${NC}"
    echo ""
    echo "🔍 Revisa los logs con:"
    echo "   $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
    echo ""
    echo "🔄 Intenta reiniciar:"
    echo "   $DOCKER_COMPOSE -f docker-compose.prod.yml restart"
fi

echo ""
