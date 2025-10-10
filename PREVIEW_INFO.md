# 🖥️ Preview de la Aplicación

## 🚀 Servicios Iniciados

### Next.js Development Server
- **URL**: http://localhost:3000
- **Estado**: Iniciando...
- **Puerto**: 3000

### Supabase Local
- **API URL**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323
- **Estado**: Iniciando (puede tardar 2-5 minutos la primera vez)

## 📱 Cómo Acceder

### Opción 1: Desde el IDE
1. Busca el panel de "Ports" o "Terminal" en tu IDE
2. Deberías ver el puerto 3000 listado
3. Haz clic en el ícono de "Open in Browser" o similar

### Opción 2: Desde el Navegador
1. Abre tu navegador
2. Ve a: http://localhost:3000
3. Deberías ver la página de login

### Opción 3: Preview en el IDE (si está disponible)
Algunos IDEs como VS Code o Windsurf tienen preview integrado:
- Busca "Simple Browser" o "Preview"
- Abre http://localhost:3000

## 🔍 Verificar que Todo Funciona

### 1. Verificar Next.js
Deberías ver en la terminal:
```
✓ Starting...
✓ Ready in Xms
○ Compiling / ...
✓ Compiled / in Xms
```

### 2. Verificar Supabase
Ejecuta en la terminal:
```bash
npx supabase status
```

Deberías ver algo como:
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Primeros Pasos en la Aplicación

### 1. Página de Login (/)
- Verás un formulario de login elegante
- Botones para "Iniciar Sesión" y "Registrarse"
- Logo de tarjeta de crédito

### 2. Registrarse
1. Haz clic en "Registrarse"
2. Usa cualquier email (ej: admin@test.com)
3. Contraseña: mínimo 6 caracteres
4. Haz clic en "Registrarse"

### 3. Iniciar Sesión
1. Usa el email y contraseña que acabas de crear
2. Haz clic en "Iniciar Sesión"
3. Serás redirigido al Dashboard

### 4. Explorar el Dashboard
Verás:
- **Estadísticas**: Total miembros, activos, promociones (en 0 inicialmente)
- **Navegación**: Dashboard, Miembros, Promociones, Tarjetas
- **Miembros Recientes**: Lista vacía (normal, no hay datos aún)
- **Uso Reciente**: Lista vacía

### 5. Crear tu Primer Miembro
1. Haz clic en "Miembros" en el menú
2. Haz clic en "Nuevo Miembro"
3. Completa el formulario
4. Haz clic en "Crear Miembro"
5. Verás el nuevo miembro en la lista

### 6. Crear tu Primera Promoción
1. Haz clic en "Promociones" en el menú
2. Haz clic en "Nueva Promoción"
3. Completa el formulario
4. Haz clic en "Crear Promoción"
5. Verás la promoción en el grid

## 🎨 Lo que Verás

### Diseño
- **Colores**: Paleta azul/índigo profesional
- **Tipografía**: Geist Sans (moderna y limpia)
- **Iconos**: Lucide React (consistentes y elegantes)
- **Layout**: Responsive (funciona en móvil y desktop)

### Componentes
- **Navegación**: Barra superior con logo y menú
- **Tarjetas**: Cards con sombras y hover effects
- **Formularios**: Inputs con focus states
- **Tablas**: Tablas responsivas con búsqueda y filtros
- **Badges**: Indicadores de estado con colores

### Interacciones
- **Hover**: Efectos sutiles en botones y cards
- **Loading**: Spinners mientras se cargan datos
- **Transiciones**: Suaves entre páginas
- **Feedback**: Mensajes de error/éxito

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
**Solución**: Espera 2-3 minutos más. Supabase tarda en iniciar la primera vez.

### "Page not found"
**Solución**: Asegúrate de estar en http://localhost:3000 (no 3001 u otro puerto)

### "Error de compilación"
**Solución**: 
```bash
# Detén el servidor (Ctrl+C)
rm -rf .next
npm run dev
```

### Puerto 3000 ocupado
**Solución**:
```bash
# Mata el proceso en el puerto 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

## 📊 Monitoreo

### Ver logs de Next.js
Mira la terminal donde ejecutaste `npm run dev`

### Ver logs de Supabase
```bash
npx supabase logs
```

### Supabase Studio
Abre http://127.0.0.1:54323 para:
- Ver/editar tablas directamente
- Ejecutar queries SQL
- Ver logs de la base de datos
- Gestionar autenticación

## 🎬 Demo Flow Completo

1. **Registro** → Crea cuenta de admin
2. **Login** → Inicia sesión
3. **Dashboard** → Ve estadísticas en 0
4. **Miembros** → Crea 2-3 miembros de prueba
5. **Promociones** → Crea 1-2 promociones
6. **Supabase Studio** → Registra uso de tarjetas
7. **Dashboard** → Ve estadísticas actualizadas
8. **Explora** → Usa búsqueda y filtros

## 🔗 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Aplicación | http://localhost:3000 | Frontend principal |
| Supabase Studio | http://127.0.0.1:54323 | Admin de BD |
| Supabase API | http://127.0.0.1:54321 | API REST |
| Inbucket | http://127.0.0.1:54324 | Emails de prueba |

---

**¡Disfruta explorando la aplicación! 🎉**

Si tienes algún problema, revisa la sección de Troubleshooting o consulta los logs.
