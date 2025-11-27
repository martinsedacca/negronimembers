#!/bin/bash

# Script para corregir errores de Next.js 15 con params y searchParams
# Estos ahora necesitan ser "awaited" en Next.js 15

echo "🔧 Corrigiendo errores de Next.js 15..."
echo ""

# Archivos a corregir (encontrados por grep)
files=(
  "app/dashboard/branches/[id]/analytics/page.tsx"
  "app/dashboard/codes/[id]/page.tsx"
  "app/dashboard/onboarding/[id]/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Archivo encontrado: $file"
  else
    echo "⚠️  Archivo no encontrado: $file"
  fi
done

echo ""
echo "Para corregir manualmente:"
echo "1. En Next.js 15, 'params' y 'searchParams' son Promesas"
echo "2. Necesitas hacer 'await params' antes de usar params.id"
echo "3. Ejemplo:"
echo "   // ❌ Antes (Next.js 14)"
echo "   const id = params.id"
echo ""
echo "   // ✅ Ahora (Next.js 15)"
echo "   const { id } = await params"
echo ""
echo "Windsurf corregirá estos archivos automáticamente."
