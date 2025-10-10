#!/bin/bash

echo "🎫 Membership Cards - Setup Script"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

echo "✅ Docker está corriendo"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << 'EOF'
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF
    echo "✅ Archivo .env.local creado"
else
    echo "✅ Archivo .env.local ya existe"
fi

echo ""
echo "🚀 Iniciando Supabase local..."
echo "   (Esto puede tardar varios minutos la primera vez)"
echo ""

npx supabase start

echo ""
echo "✅ Supabase iniciado correctamente!"
echo ""
echo "📊 Accesos:"
echo "   - Supabase Studio: http://127.0.0.1:54323"
echo "   - API URL: http://127.0.0.1:54321"
echo ""
echo "🎯 Próximo paso:"
echo "   Ejecuta: npm run dev"
echo "   Luego abre: http://localhost:3000"
echo ""
