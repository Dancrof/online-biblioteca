#!/bin/bash

# ===================================================
# Script de Backup - Online Biblioteca
# ===================================================
# Crear backup de la base de datos

set -e

BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.json"

if [ -f database/db.json ]; then
    cp database/db.json $BACKUP_FILE
    echo "✓ Backup creado: $BACKUP_FILE"
    
    # Mantener solo los últimos 10 backups
    ls -t $BACKUP_DIR/db_backup_*.json | tail -n +11 | xargs -r rm
    echo "✓ Backups antiguos limpiados"
else
    echo "✗ Error: database/db.json no existe"
    exit 1
fi
