#!/bin/bash

# Script para crear imágenes placeholder para Apple Wallet Pass
# Estas son imágenes temporales. Reemplázalas con tus propios diseños.

TEMPLATE_DIR="wallet-templates/apple.pass"

echo "🎨 Creando imágenes placeholder para Apple Wallet Pass..."

# Crear imágenes usando ImageMagick (si está instalado) o placeholders simples
if command -v convert &> /dev/null; then
    echo "✓ ImageMagick detectado, creando imágenes..."
    
    # Icon (29x29, 58x58, 87x87)
    convert -size 29x29 xc:"#6366F1" -fill white -gravity center -pointsize 20 -annotate +0+0 "N" "$TEMPLATE_DIR/icon.png"
    convert -size 58x58 xc:"#6366F1" -fill white -gravity center -pointsize 40 -annotate +0+0 "N" "$TEMPLATE_DIR/icon@2x.png"
    convert -size 87x87 xc:"#6366F1" -fill white -gravity center -pointsize 60 -annotate +0+0 "N" "$TEMPLATE_DIR/icon@3x.png"
    
    # Logo (160x50, 320x100, 480x150)
    convert -size 160x50 xc:"#6366F1" -fill white -gravity center -pointsize 24 -annotate +0+0 "NEGRONI" "$TEMPLATE_DIR/logo.png"
    convert -size 320x100 xc:"#6366F1" -fill white -gravity center -pointsize 48 -annotate +0+0 "NEGRONI" "$TEMPLATE_DIR/logo@2x.png"
    convert -size 480x150 xc:"#6366F1" -fill white -gravity center -pointsize 72 -annotate +0+0 "NEGRONI" "$TEMPLATE_DIR/logo@3x.png"
    
    echo "✓ Imágenes creadas con ImageMagick"
else
    echo "⚠️  ImageMagick no está instalado."
    echo "   Puedes instalarlo con: brew install imagemagick"
    echo "   O crear las imágenes manualmente y colocarlas en: $TEMPLATE_DIR"
    echo ""
    echo "   Imágenes necesarias:"
    echo "   - icon.png (29x29)"
    echo "   - icon@2x.png (58x58)"
    echo "   - icon@3x.png (87x87)"
    echo "   - logo.png (160x50)"
    echo "   - logo@2x.png (320x100)"
    echo "   - logo@3x.png (480x150)"
fi

echo ""
echo "📝 Nota: Estas son imágenes placeholder."
echo "   Reemplázalas con tus propios diseños para mejor apariencia."
