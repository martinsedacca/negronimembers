# Configuración de Custom Fields en GoHighLevel

Esta guía te muestra cómo funciona la sincronización automática con GoHighLevel.

## ✨ Creación Automática de Custom Fields

**¡NUEVO!** El sistema ahora crea automáticamente los custom fields necesarios en tu Location de GoHighLevel durante la primera sincronización.

## 📋 Custom Fields Que Se Crean Automáticamente

Los siguientes custom fields se crearán automáticamente en tu subcuenta de GHL:

### 1. Membership Number
- **Field Name:** `Membership Number`
- **Type:** TEXT
- **Description:** Número único de membresía del cliente
- **Se actualiza:** Al crear/modificar miembro

### 2. Member Tier
- **Field Name:** `Member Tier`
- **Type:** TEXT
- **Values:** Basic, Silver, Gold, Platinum, VIP
- **Description:** Nivel de membresía del cliente
- **Se actualiza:** Al crear/modificar miembro, al cambiar de tier

### 3. Member Points
- **Field Name:** `Member Points`
- **Type:** NUMERICAL
- **Description:** Puntos acumulados por el cliente
- **Se actualiza:** Al crear/modificar miembro, en cada visita/compra

### 4. Member Status
- **Field Name:** `Member Status`
- **Type:** TEXT
- **Values:** active, inactive, suspended
- **Description:** Estado actual de la membresía
- **Se actualiza:** Al crear/modificar miembro

### 5. Member Visits ⭐ NUEVO
- **Field Name:** `Member Visits`
- **Type:** NUMERICAL
- **Description:** Número total de visitas del cliente
- **Se actualiza:** Automáticamente en cada visita registrada

### 6. Member Spent ⭐ NUEVO
- **Field Name:** `Member Spent`
- **Type:** NUMERICAL
- **Description:** Gasto total acumulado del cliente
- **Se actualiza:** Automáticamente en cada compra registrada

### 7. Member Last Visit ⭐ NUEVO
- **Field Name:** `Member Last Visit`
- **Type:** TEXT (formato: YYYY-MM-DD)
- **Description:** Fecha de la última visita del cliente
- **Se actualiza:** Automáticamente en cada visita registrada

### 8. Member Avg Purchase
- **Field Name:** `Member Avg Purchase`
- **Type:** NUMERICAL
- **Description:** Promedio de gasto por visita
- **Se actualiza:** Automáticamente en cada compra registrada

---

## 🤖 Creación Automática de Custom Fields

**¡Ya no necesitas crear custom fields manualmente!**

En la primera sincronización, el sistema:

1. **Verifica** si los custom fields existen en tu Location
2. **Crea automáticamente** los campos que falten
3. **Usa los existentes** si ya los creaste manualmente
4. **Cachea los IDs** para sincronizaciones futuras

### ¿Qué pasa si ya creé algunos campos manualmente?

No hay problema. El sistema detectará los campos existentes por nombre y los usará. Solo creará los que falten.

### ¿Puedo usar diferentes nombres?

Sí, pero es recomendable usar los nombres estándar listados arriba. El sistema busca por nombres normalizados (lowercase, sin espacios).

---

## 🏷️ Tags Automáticos

El sistema también creará/actualizará los siguientes tags automáticamente:

- `membership` - Tag general para todos los miembros
- `membership_active` - Membresía activa
- `membership_inactive` - Membresía inactiva
- `tier_basic` - Tier Basic
- `tier_silver` - Tier Silver
- `tier_gold` - Tier Gold
- `tier_platinum` - Tier Platinum
- `tier_vip` - Tier VIP

**No necesitas crear estos tags manualmente** - se crearán automáticamente cuando sincronices.

---

## 🔑 Configurar Private Integration Token (PIT)

1. **Ir a Settings → Private Integrations**

2. **Create New Integration**
   - Name: "Membership System Sync"
   - Description: "Sincronización de datos de membresías"

3. **Seleccionar Scopes (Permisos):**
   - ✅ **View Contacts**
   - ✅ **Edit Contacts**
   - ✅ **View Custom Fields**
   - ✅ **Edit Custom Fields** (si está disponible)

4. **Copiar el Token**
   - Una vez creado, copia el token
   - ⚠️ **IMPORTANTE:** Guárdalo de forma segura, solo se muestra una vez

5. **Configurar en el Sistema de Membresías**
   - Ve a Configuración en tu sistema
   - Sección "Integración GoHighLevel"
   - Click "Desbloquear"
   - Pega el token en "GHL Private Integration Token (PIT)"
   - Verifica el Location ID (default: 8CuDDsReJB6uihox2LBw para Doral)
   - Click "Guardar Configuración"

---

## 🚀 Sincronización

### Primera Sincronización (Bulk)

1. Ve a **Configuración**
2. Baja a la sección **Integración GoHighLevel**
3. Click en **"Sincronizar Todos los Miembros Activos"**
4. Espera a que complete (puede tomar algunos minutos)
5. Verás un resumen:
   - Total de miembros
   - Sincronizados exitosamente
   - Creados nuevos
   - Actualizados
   - Fallidos

### Sincronización Individual

1. Ve a **Miembros**
2. Click en **"Ver detalles"** de cualquier miembro
3. Tab **"Estadísticas y Tarjeta"**
4. Click en **"Sincronizar con GoHighLevel"**

### Sincronización Automática ⭐ MEJORADO

**Los siguientes eventos sincronizan automáticamente en tiempo real:**

✅ **Crear nuevo miembro**
- Se crea contacto en GHL
- Se sincronizan todos los custom fields
- Se agregan tags de membresía y tier

✅ **Actualizar información de miembro**
- Nombre, email, teléfono
- Tier, status, puntos
- Se actualizan custom fields y tags

✅ **Registrar visita en el scanner** ⭐ NUEVO
- Se actualiza Member Visits
- Se actualiza Member Last Visit
- Se actualizan puntos acumulados

✅ **Registrar compra** ⭐ NUEVO
- Se actualiza Member Spent
- Se actualiza Member Avg Purchase
- Se actualizan Member Visits y Member Last Visit
- Se actualizan puntos y tier (si cambió)

**Todas estas sincronizaciones son automáticas, en segundo plano y no afectan el rendimiento del sistema.**

---

## 🧪 Verificar Sincronización

1. **En GoHighLevel:**
   - Ve a Contacts
   - Busca un contacto sincronizado
   - Verifica que tenga:
     - Tags de membresía
     - Custom fields poblados correctamente
     - Email y teléfono actualizados

2. **En el Sistema de Membresías:**
   - Ve a Configuración → Logs (si está disponible)
   - O revisa los mensajes de éxito/error al sincronizar

---

## 🐛 Troubleshooting

### Error: "GHL API token not configured"
- Verifica que hayas pegado el token correctamente
- Asegúrate de guardar la configuración
- El token debe tener los permisos correctos

### Error: "Failed to sync member to GHL"
- Verifica que el Location ID sea correcto
- Confirma que los custom fields existen con los field keys correctos
- Revisa que el token tenga permisos de View/Edit Contacts

### Contactos duplicados
- El sistema busca por email y teléfono antes de crear
- Si hay duplicados, actualiza el existente en lugar de crear nuevo

### Custom fields no se actualizan
- El sistema ahora crea automáticamente los campos con los tipos correctos
- Si creaste campos manualmente, verifica que los nombres coincidan
- Revisa los logs del navegador (consola) para ver detalles de la sincronización

---

## 📞 Soporte

Si tienes problemas con la sincronización:
1. Verifica esta guía paso a paso
2. Revisa los logs de sincronización
3. Confirma que todos los custom fields están creados
4. Verifica los permisos del PIT token

---

---

## 🎯 Resumen de Mejoras

✨ **Creación automática de custom fields** - Ya no necesitas configurarlos manualmente

🔄 **Sincronización en tiempo real** - Cada acción actualiza GHL inmediatamente

📊 **Campos de estadísticas** - Member Visits, Member Spent, Member Last Visit se actualizan automáticamente

⚡ **Sin impacto en rendimiento** - Todas las sincronizaciones son asíncronas

📝 **Logging detallado** - Verifica el progreso en la consola del navegador

---

**Última actualización:** 2025-01-10 (v2.0 - Auto-sync & Auto-fields)
