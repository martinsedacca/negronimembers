const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const templateDir = path.join(__dirname, '..', 'wallet-templates', 'apple.pass');

// Ensure directory exists
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
}

// Function to create a simple colored PNG with text
const createImage = async (width, height, filename, text = '') => {
  try {
    // Create a simple image with a dark background and white text area
    const svgImage = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="#1a1a1a"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.4}" 
              fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">N</text>
      </svg>
    `;
    
    await sharp(Buffer.from(svgImage))
      .png()
      .toFile(path.join(templateDir, filename));
    
    console.log(`✓ Created ${filename} (${width}x${height})`);
  } catch (error) {
    console.error(`✗ Error creating ${filename}:`, error.message);
  }
};

// Function to create logo with text
const createLogo = async (width, height, filename) => {
  try {
    const svgImage = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="#1a1a1a"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${height * 0.6}" 
              fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">NEGRONI</text>
      </svg>
    `;
    
    await sharp(Buffer.from(svgImage))
      .png()
      .toFile(path.join(templateDir, filename));
    
    console.log(`✓ Created ${filename} (${width}x${height})`);
  } catch (error) {
    console.error(`✗ Error creating ${filename}:`, error.message);
  }
};

const generateImages = async () => {
  console.log('🎨 Generating real images for Apple Wallet Pass...\n');
  
  // Create icon images (square)
  await createImage(29, 29, 'icon.png', 'N');
  await createImage(58, 58, 'icon@2x.png', 'N');
  await createImage(87, 87, 'icon@3x.png', 'N');
  
  // Create logo images (wide)
  await createLogo(160, 50, 'logo.png');
  await createLogo(320, 100, 'logo@2x.png');
  await createLogo(480, 150, 'logo@3x.png');
  
  console.log('\n✅ All images created successfully!');
  console.log(`📁 Location: ${templateDir}`);
  console.log('\n💡 Tip: Replace these with your custom branded images for a professional look.');
};

generateImages().catch(console.error);
