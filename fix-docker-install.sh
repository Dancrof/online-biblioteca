#!/bin/bash

# ===================================================
# Script para Solucionar Instalación de Docker
# ===================================================

set -e

echo "🔧 Reparando instalación de Docker..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar arquitectura del sistema
echo "📊 Verificando arquitectura del sistema..."
uname -m
dpkg --print-architecture

# 2. Remover instalaciones anteriores conflictivas
echo "🧹 Limpiando instalaciones anteriores de Docker..."
sudo apt-get remove -y docker docker-engine docker.io containerd runc docker-compose 2>/dev/null || true

# 3. Actualizar repositorios
echo "🔄 Actualizando repositorios..."
sudo apt-get update

# 4. Instalar dependencias
echo "📦 Instalando dependencias necesarias..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 5. Agregar clave GPG oficial de Docker
echo "🔑 Agregando clave GPG de Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 6. Agregar repositorio de Docker
echo "📝 Agregando repositorio de Docker..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 7. Actualizar índice de paquetes
echo "🔄 Actualizando índice de paquetes..."
sudo apt-get update

# 8. Instalar Docker Engine
echo "🐳 Instalando Docker Engine..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 9. Verificar instalación
echo ""
echo "✅ Verificando instalación..."
sudo docker --version
sudo docker compose version

# 10. Agregar usuario al grupo docker
echo ""
echo "👤 Agregando usuario al grupo docker..."
sudo usermod -aG docker $USER

# 11. Iniciar servicio
echo "🚀 Iniciando servicio Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# 12. Probar Docker
echo ""
echo "🧪 Probando Docker con hello-world..."
sudo docker run --rm hello-world

echo ""
echo -e "${GREEN}✨ ¡Docker instalado correctamente!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   Para usar Docker sin sudo, cierra sesión y vuelve a conectarte:"
echo "   exit"
echo "   ssh ubuntu@<TU_IP>"
echo ""
echo "   O ejecuta: newgrp docker"
echo ""
echo "🚀 Después puedes ejecutar: ./deploy.sh"
