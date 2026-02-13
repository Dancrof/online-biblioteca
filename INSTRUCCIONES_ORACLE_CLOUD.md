# 🔓 Instrucciones para Abrir Puertos en Oracle Cloud

**Para:** Propietario de la cuenta Oracle Cloud  
**Instancia:** 137.131.237.7  
**Tiempo estimado:** 5 minutos

## ⚠️ Problema Actual

La aplicación está corriendo correctamente en el servidor, pero no se puede acceder desde internet porque los puertos están bloqueados en Oracle Cloud.

## 🔧 Solución: Abrir Puertos en Security Lists

### Pasos a seguir:

1. **Ingresar a Oracle Cloud Console**
   - Ve a: https://cloud.oracle.com/
   - Inicia sesión con tu cuenta

2. **Ir a tu instancia**
   - Menú ☰ (arriba a la izquierda)
   - **Compute** → **Instances**
   - Clic en la instancia con IP **137.131.237.7**

3. **Navegar a Security Lists**
   - En la página de detalles de la instancia, busca la sección **"Primary VNIC"**
   - Clic en el nombre de la **Subnet** (normalmente dice "subnet-...")
   - En el menú lateral izquierdo, clic en **"Security Lists"**
   - Clic en **"Default Security List for vcn-..."** (el que aparezca)

4. **Agregar Reglas de Ingreso**
   - Clic en el botón **"Add Ingress Rules"**

### Reglas a Agregar (hacer 4 veces):

#### Regla 1 - Puerto 80 (HTTP):
```
Stateless: NO ☐
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 80
Description: HTTP
```
**Clic en "Add Ingress Rules"**

#### Regla 2 - Puerto 443 (HTTPS):
```
Stateless: NO ☐
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 443
Description: HTTPS
```
**Clic en "Add Ingress Rules"**

#### Regla 3 - Puerto 4000 (API):
```
Stateless: NO ☐
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 4000
Description: API Backend
```
**Clic en "Add Ingress Rules"**

#### Regla 4 - Puerto 8080 (Frontend):
```
Stateless: NO ☐
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 8080
Description: Frontend Web
```
**Clic en "Add Ingress Rules"**

---

## ✅ Verificar que funciona

Después de agregar las reglas (esperar 1-2 minutos), acceder desde el navegador a:

- **Frontend**: http://137.131.237.7:8080
- **API**: http://137.131.237.7:4000

Deberías ver la aplicación funcionando.

---

## 📸 Captura de Pantalla de Referencia

Las reglas deberían verse así en la lista:

```
Source CIDR    Protocol    Source Port    Dest Port    Description
0.0.0.0/0      TCP         All           22           SSH (ya existe)
0.0.0.0/0      TCP         All           80           HTTP
0.0.0.0.0/0    TCP         All           443          HTTPS
0.0.0.0/0      TCP         All           4000         API Backend
0.0.0.0/0      TCP         All           8080         Frontend Web
```

---

## ❓ ¿Problemas?

Si después de esto no funciona:
1. Verifica que las reglas estén guardadas correctamente
2. Espera 2-3 minutos para que los cambios se apliquen
3. Refresca el navegador e intenta de nuevo

**Contacto:** Avísame cuando hayas terminado para verificar que todo funcione.

---

## 🔒 Nota de Seguridad

**0.0.0.0/0** significa que la aplicación será accesible desde cualquier IP en internet, que es lo normal para una aplicación web pública. Si en el futuro quieres restringir el acceso solo a ciertas IPs, puedes cambiar este valor.
