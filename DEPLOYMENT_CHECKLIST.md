# ✅ Checklist de Despliegue - Oracle Cloud VPS

## 📋 Preparación Local

- [ ] Proyecto funciona correctamente en desarrollo
- [ ] Todos los archivos están en el repositorio Git (opcional)
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Docker funciona correctamente en local
- [ ] `docker-compose.prod.yml` probado localmente

## 🔧 Configuración de Oracle Cloud

- [ ] Cuenta de Oracle Cloud creada
- [ ] Instancia de Compute creada (VM.Standard.E2.1.Micro)
- [ ] IP pública asignada y anotada: `___________________`
- [ ] Clave SSH configurada y guardada
- [ ] Security List configurada con los puertos:
  - [ ] Puerto 22 (SSH)
  - [ ] Puerto 80 (HTTP)
  - [ ] Puerto 443 (HTTPS)
  - [ ] Puerto 4000 (API)
  - [ ] Puerto 8080 (Web)

## 💻 Configuración del VPS

- [ ] Conexión SSH exitosa al VPS
- [ ] Sistema actualizado (`apt update && apt upgrade`)
- [ ] Docker instalado
- [ ] Usuario agregado al grupo docker
- [ ] Git instalado
- [ ] Firewall configurado (ufw o iptables)
- [ ] Swap configurado (si 1GB RAM o menos)

## 📦 Transferencia del Proyecto

- [ ] Proyecto transferido al VPS (Git/SCP/rsync)
- [ ] Directorio del proyecto: `___________________`
- [ ] Archivo `.env` creado y configurado
- [ ] JWT_SECRET generado con `openssl rand -base64 32`
- [ ] VITE_URL_API configurado con IP pública o dominio
- [ ] Scripts tienen permisos de ejecución (`chmod +x *.sh`)

## 🚀 Despliegue

- [ ] `./deploy.sh` ejecutado exitosamente
- [ ] Contenedores corriendo: `docker compose -f docker-compose.prod.yml ps`
- [ ] API responde: `http://<IP_PUBLICA>:4000`
- [ ] Frontend responde: `http://<IP_PUBLICA>:8080`
- [ ] Verificación de salud: `./health-check.sh`

## 🌐 Configuración de Dominio (Opcional)

- [ ] Dominio registrado: `___________________`
- [ ] Registros DNS configurados:
  - [ ] A record `@` → IP pública
  - [ ] A record `www` → IP pública
  - [ ] A record `api` → IP pública
- [ ] Propagación DNS verificada (`nslookup tudominio.com`)
- [ ] Variables de entorno actualizadas con dominio
- [ ] Contenedores reconstruidos con nuevo dominio

## 🔒 HTTPS con Let's Encrypt (Recomendado)

- [ ] Nginx instalado
- [ ] Configuración de Nginx creada
- [ ] Certbot instalado
- [ ] Certificados SSL obtenidos
- [ ] Renovación automática configurada
- [ ] Redirección HTTP → HTTPS funcionando
- [ ] Sitio accesible via HTTPS

## 🔄 Configuración de Backups

- [ ] Script de backup probado: `./backup.sh`
- [ ] Directorio `backups/` creado
- [ ] Cron job configurado para backups automáticos
- [ ] Backup manual restaurado exitosamente (prueba)

## 📊 Monitoreo y Mantenimiento

- [ ] Logs revisables sin errores
- [ ] Health checks funcionando
- [ ] Recursos del sistema (CPU/RAM/Disco) monitoreados
- [ ] Proceso de actualización documentado
- [ ] Contacto de soporte definido (si aplica)

## 🎯 Pruebas Finales

- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Listado de libros carga correctamente
- [ ] Crear/editar/eliminar libros funciona (admin)
- [ ] Sistema de alquileres funciona
- [ ] Subida de imágenes funciona (Cloudinary)
- [ ] Navegación entre páginas funciona
- [ ] Logout funciona
- [ ] Aplicación accesible desde diferentes navegadores
- [ ] Aplicación accesible desde diferentes dispositivos

## 📝 Documentación

- [ ] URL de acceso documentada
- [ ] Credenciales de administrador guardadas de forma segura
- [ ] Proceso de despliegue documentado para el equipo
- [ ] Comandos útiles accesibles para el equipo
- [ ] Proceso de rollback definido

## 🎉 Post-Despliegue

- [ ] Notificar al equipo que la aplicación está en línea
- [ ] Compartir URL y credenciales (de forma segura)
- [ ] Programar revisión de rendimiento
- [ ] Configurar alertas (opcional)
- [ ] Celebrar el éxito 🎊

---

## 📌 Información Importante

**IP Pública del VPS**: ___________________

**URLs de Acceso**:
- Frontend: ___________________
- API: ___________________

**Dominio** (si aplica): ___________________

**Ubicación del Proyecto**: ___________________

**Usuario SSH**: ___________________

**Fecha de Despliegue**: ___________________

---

## 🆘 Contactos de Emergencia

**Soporte Oracle Cloud**: https://www.oracle.com/corporate/contact/

**Documentación**: 
- [QUICKSTART.md](QUICKSTART.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Nota**: Guarda este checklist completado como referencia para futuros despliegues o mantenimiento.
