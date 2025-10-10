const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando certificados...\n');

const certDir = path.join(__dirname, '..', 'certificates');

const files = [
  'wwdr.pem',
  'signerCert.pem',
  'signerKey.pem'
];

files.forEach(file => {
  const filePath = path.join(certDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file} - NO EXISTE`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`✅ ${file}`);
  console.log(`   Primera línea: ${lines[0]}`);
  console.log(`   Tamaño: ${content.length} bytes`);
  console.log(`   Líneas: ${lines.length}`);
  
  // Check if it's properly formatted
  if (file.includes('Cert') || file === 'wwdr.pem') {
    if (content.includes('-----BEGIN CERTIFICATE-----') && content.includes('-----END CERTIFICATE-----')) {
      console.log(`   ✓ Formato PEM correcto (CERTIFICATE)`);
    } else {
      console.log(`   ✗ Formato PEM incorrecto`);
    }
  } else if (file.includes('Key')) {
    if (content.includes('-----BEGIN') && content.includes('PRIVATE KEY-----')) {
      console.log(`   ✓ Formato PEM correcto (PRIVATE KEY)`);
      if (content.includes('ENCRYPTED')) {
        console.log(`   ⚠️  Clave ENCRIPTADA - necesita passphrase`);
      } else {
        console.log(`   ✓ Clave NO encriptada`);
      }
    } else {
      console.log(`   ✗ Formato PEM incorrecto`);
    }
  }
  
  console.log('');
});

console.log('✅ Verificación completada');
