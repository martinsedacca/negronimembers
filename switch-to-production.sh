#!/bin/bash

# Script para cambiar de Supabase Local a Producción
# Uso: bash switch-to-production.sh

echo "🔄 Cambiando a Supabase Cloud (Producción)..."
echo ""

# Backup del .env.local actual
cp .env.local .env.local.backup
echo "✅ Backup creado: .env.local.backup"

# Reemplazar URLs y keys
sed -i '' 's|NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321|NEXT_PUBLIC_SUPABASE_URL=https://hlfqsserfifjnarboqfj.supabase.co|g' .env.local

sed -i '' 's|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZnFzc2VyZmlmam5hcmJvcWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMDQzNzEsImV4cCI6MjA3Nzg4MDM3MX0.Bnd1WHgWp39ntHAK1MwfnKhNFyRQv0oAJ_ieLGlmDwk|g' .env.local

echo "✅ Variables actualizadas en .env.local"
echo ""

# Mostrar cambios
echo "📝 Configuración actual:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -E "(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY)" .env.local | head -2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⚠️  IMPORTANTE: Reinicia tu servidor de desarrollo"
echo "   1. Detén el servidor actual (Ctrl+C)"
echo "   2. Ejecuta: npm run dev"
echo ""

echo "🎯 PRÓXIMOS PASOS:"
echo "   1. Ejecuta la migración SQL en Supabase Dashboard"
echo "   2. Usa el enlace: https://supabase.com/dashboard/project/hlfqsserfifjnarboqfj/sql/new"
echo "   3. Copia y pega: FULL_PRODUCTION_MIGRATION.sql"
echo "   4. Click 'RUN'"
echo ""

echo "📄 Ver instrucciones completas:"
echo "   open EJECUTAR_MIGRACION_AHORA.md"
echo ""

echo "✅ Listo para producción!"
