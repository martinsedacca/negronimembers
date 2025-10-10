const fs = require('fs');
const path = require('path');

const templateDir = path.join(__dirname, '..', 'wallet-templates', 'apple.pass');

// Crear imágenes PNG simples (1x1 pixel transparente)
// Estas son placeholders - reemplázalas con tus propios diseños
const createPlaceholderImage = (width, height, filename) => {
  // Crear un PNG simple de 1x1 pixel transparente
  const png = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
    0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(path.join(templateDir, filename), png);
  console.log(`✓ Created ${filename} (${width}x${height})`);
};

console.log('🎨 Generating placeholder images for Apple Wallet Pass...\n');

// Create all required images
createPlaceholderImage(29, 29, 'icon.png');
createPlaceholderImage(58, 58, 'icon@2x.png');
createPlaceholderImage(87, 87, 'icon@3x.png');
createPlaceholderImage(160, 50, 'logo.png');
createPlaceholderImage(320, 100, 'logo@2x.png');
createPlaceholderImage(480, 150, 'logo@3x.png');

console.log('\n✅ All placeholder images created!');
console.log('\n📝 Note: These are minimal placeholder images.');
console.log('   Replace them with your own designs for better appearance.');
console.log(`   Location: ${templateDir}`);
