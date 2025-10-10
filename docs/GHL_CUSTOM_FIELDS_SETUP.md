# Configuración de Custom Fields en GoHighLevel

Esta guía te muestra cómo crear los custom fields necesarios en GoHighLevel para sincronizar los datos de membresías.

## 📋 Custom Fields Requeridos

Debes crear los siguientes custom fields en tu Location de GoHighLevel:

### 1. Membership Number
- **Field Name:** `Membership Number`
- **Field Key:** `membership_number`
- **Type:** Text
- **Description:** Número único de membresía del cliente

### 2. Membership Tier
- **Field Name:** `Membership Tier`
- **Field Key:** `membership_tier`
- **Type:** Dropdown / Text
- **Options (si es dropdown):**
  - Basic
  - Silver
  - Gold
  - Platinum
  - VIP
- **Description:** Nivel de membresía del cliente

### 3. Membership Points
- **Field Name:** `Membership Points`
- **Field Key:** `membership_points`
- **Type:** Number
- **Description:** Puntos acumulados por el cliente

### 4. Membership Status
- **Field Name:** `Membership Status`
- **Field Key:** `membership_status`
- **Type:** Dropdown / Text
- **Options (si es dropdown):**
  - active
  - inactive
- **Description:** Estado actual de la membresía

### 5. Total Visits
- **Field Name:** `Total Visits`
- **Field Key:** `total_visits`
- **Type:** Number
- **Description:** Número total de visitas del cliente

### 6. Lifetime Spent
- **Field Name:** `Lifetime Spent`
- **Field Key:** `lifetime_spent`
- **Type:** Number (Currency)
- **Description:** Gasto total del cliente en dólares

### 7. Last Visit Date
- **Field Name:** `Last Visit Date`
- **Field Key:** `last_visit_date`
- **Type:** Date
- **Description:** Fecha de la última visita del cliente

### 8. Average Purchase
- **Field Name:** `Average Purchase Amount`
- **Field Key:** `average_purchase_amount`
- **Type:** Number (Currency)
- **Description:** Promedio de gasto por visita

---

## 🔧 Pasos para Crear Custom Fields

### Desde el Dashboard de GoHighLevel:

1. **Navega a Settings**
   - Click en Settings (⚙️) en el menú lateral

2. **Ve a Custom Fields**
   - Settings → Custom Fields
   - O busca "Custom Fields" en el buscador

3. **Crear Nuevo Custom Field**
   - Click en "Add Custom Field"
   - Completa los campos:
     - **Name:** Nombre descriptivo (ej: "Membership Number")
     - **Field Key:** Clave única (ej: "membership_number")
     - **Type:** Selecciona el tipo apropiado
     - **Options:** Si es dropdown, agrega las opciones
   - Click "Save"

4. **Repite para todos los campos**
   - Crea los 8 custom fields listados arriba

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

### Sincronización Automática

Los siguientes eventos sincronizarán automáticamente:
- Creación de nuevo miembro
- Actualización de tier/puntos
- Cambio de status (active/inactive)
- Nueva visita/compra registrada

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
- Verifica que los field keys coincidan EXACTAMENTE
- Revisa que los tipos de campo sean correctos (Number para números, Text para texto, etc.)

---

## 📞 Soporte

Si tienes problemas con la sincronización:
1. Verifica esta guía paso a paso
2. Revisa los logs de sincronización
3. Confirma que todos los custom fields están creados
4. Verifica los permisos del PIT token

---

**Última actualización:** 2025-01-10
