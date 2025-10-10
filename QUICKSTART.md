# 🚀 Inicio Rápido - Membership Cards

## ⚡ Configuración en 3 pasos

### 1️⃣ Crear archivo de variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con este contenido:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 2️⃣ Iniciar Supabase Local

```bash
npx supabase start
```

**Importante:** Asegúrate de tener Docker Desktop corriendo antes de ejecutar este comando.

La primera vez descargará las imágenes de Docker (puede tardar 5-10 minutos).

### 3️⃣ Iniciar la aplicación

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## 📝 Primer Uso

1. **Registrarse**: Haz clic en "Registrarse" y crea una cuenta de administrador
2. **Iniciar Sesión**: Usa tus credenciales para acceder al dashboard
3. **Explorar**: El dashboard mostrará estadísticas (inicialmente en 0)

## 🎯 Acciones Principales

### Crear un Miembro

1. Ve a **Miembros** → **Nuevo Miembro**
2. Completa el formulario:
   - Nombre completo
   - Email
   - Teléfono (opcional)
   - Tipo de membresía (Basic, Silver, Gold, Platinum)
   - Estado (Activo/Inactivo/Suspendido)
3. Haz clic en **Crear Miembro**

El sistema generará automáticamente:
- Número de miembro único
- Fecha de expiración (según duración de la membresía)
- Puntos iniciales (0)

### Crear una Promoción

1. Ve a **Promociones** → **Nueva Promoción**
2. Define:
   - **Título**: Nombre de la promoción
   - **Descripción**: Detalles opcionales
   - **Tipo de descuento**:
     - Porcentaje (ej: 20%)
     - Monto fijo (ej: $50)
     - Puntos (ej: 100 puntos extra)
   - **Valor**: Cantidad del descuento
   - **Fechas**: Inicio y fin de vigencia
   - **Uso mínimo**: Cuántas veces debe haber usado su tarjeta
   - **Uso máximo**: Límite de aplicaciones (opcional)
   - **Tipos aplicables**: Selecciona a qué membresías aplica
3. Activa la promoción
4. Haz clic en **Crear Promoción**

### Registrar Uso de Tarjeta

Para registrar que un miembro usó su tarjeta, puedes hacerlo desde Supabase Studio:

1. Abre http://127.0.0.1:54323
2. Ve a **Table Editor** → **card_usage**
3. Haz clic en **Insert row**
4. Completa:
   - `member_id`: ID del miembro
   - `location`: Ubicación donde usó la tarjeta
   - `points_earned`: Puntos ganados
   - `notes`: Notas opcionales

## 🔍 Explorar la Base de Datos

Accede a Supabase Studio en http://127.0.0.1:54323

### Tablas disponibles:

- **members**: Todos los miembros registrados
- **membership_types**: Tipos de membresía (ya tiene 4 tipos pre-cargados)
- **promotions**: Promociones activas e inactivas
- **card_usage**: Historial de uso de tarjetas
- **applied_promotions**: Promociones aplicadas a miembros
- **wallet_passes**: Datos de passes de Apple/Google Wallet

## 🛠️ Comandos Útiles

```bash
# Ver estado de Supabase
npx supabase status

# Detener Supabase
npx supabase stop

# Reiniciar base de datos (borra todos los datos)
npx supabase db reset

# Ver logs de Supabase
npx supabase logs

# Generar tipos de TypeScript desde el schema
npx supabase gen types typescript --local > lib/types/database.ts
```

## 🎨 Tipos de Membresía Pre-cargados

El sistema viene con 4 tipos de membresía:

| Tipo | Color | Precio | Duración | Beneficios |
|------|-------|--------|----------|------------|
| **Basic** | Gris | Gratis | 12 meses | Acceso básico, 10% descuento, puntos |
| **Silver** | Plata | $49.99 | 12 meses | Acceso prioritario, 15% descuento, doble puntos |
| **Gold** | Oro | $99.99 | 12 meses | Acceso VIP, 20% descuento, triple puntos |
| **Platinum** | Platino | $199.99 | 12 meses | Acceso ilimitado, 30% descuento, cuádruple puntos |

## 🐛 Solución de Problemas

### Error: "Docker no está corriendo"

**Solución**: Inicia Docker Desktop y espera a que esté completamente cargado.

### Error: "Port already in use"

**Solución**: 
```bash
npx supabase stop
npx supabase start
```

### Error: "Cannot connect to Supabase"

**Solución**: Verifica que el archivo `.env.local` existe y tiene las variables correctas.

### La aplicación no carga

**Solución**:
1. Verifica que Supabase esté corriendo: `npx supabase status`
2. Verifica que Next.js esté corriendo: Deberías ver "Ready" en la consola
3. Limpia caché: `rm -rf .next` y luego `npm run dev`

## 📚 Próximos Pasos

1. ✅ Familiarízate con el dashboard
2. ✅ Crea algunos miembros de prueba
3. ✅ Crea promociones de ejemplo
4. ✅ Registra uso de tarjetas
5. ✅ Observa cómo se aplican las promociones automáticamente
6. 🔄 Lee `WALLET_INTEGRATION.md` para implementar Apple/Google Wallet

## 💡 Tips

- **Búsqueda rápida**: Usa los filtros en las páginas de Miembros y Promociones
- **Supabase Studio**: Es tu mejor amigo para ver y editar datos directamente
- **Hot Reload**: Los cambios en el código se reflejan automáticamente
- **TypeScript**: Los tipos están completamente definidos para autocompletado

## 🆘 ¿Necesitas Ayuda?

- Revisa el `README.md` para documentación completa
- Consulta `WALLET_INTEGRATION.md` para integración de wallets
- Revisa los logs de Supabase: `npx supabase logs`
- Revisa la consola del navegador para errores de frontend

---

**¡Listo para comenzar! 🎉**
