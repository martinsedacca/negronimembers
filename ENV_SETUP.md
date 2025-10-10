# Configuración del Entorno Local

## Paso 1: Crear archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## Paso 2: Iniciar Supabase Local

```bash
npx supabase start
```

Este comando:
- Descargará e iniciará los contenedores Docker necesarios
- Aplicará las migraciones automáticamente
- Te dará las credenciales de acceso

## Paso 3: Iniciar el servidor de desarrollo

```bash
npm run dev
```

## Comandos Útiles

### Ver el estado de Supabase
```bash
npx supabase status
```

### Detener Supabase
```bash
npx supabase stop
```

### Resetear la base de datos
```bash
npx supabase db reset
```

### Acceder a Supabase Studio
Después de iniciar Supabase, accede a: http://127.0.0.1:54323

## Migración a Producción (Más Adelante)

Cuando estés listo para migrar a Supabase en la nube:

1. Crea un proyecto en https://supabase.com
2. Actualiza las variables de entorno en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
3. Aplica las migraciones:
   ```bash
   npx supabase link --project-ref tu-project-ref
   npx supabase db push
   ```
