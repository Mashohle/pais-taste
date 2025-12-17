import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const logoPath = join(projectRoot, 'public', 'logo.svg');
const publicDir = join(projectRoot, 'public');

console.log('Generating PWA icons from logo.svg...\n');

try {
  const svgBuffer = readFileSync(logoPath);

  for (const size of sizes) {
    const outputPath = join(publicDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  console.log('\n✨ All PWA icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run build');
  console.log('2. Run: npm start');
  console.log('3. Open http://localhost:3000 in your browser');
  console.log('4. Look for the install icon in the address bar or browser menu');

} catch (error) {
  console.error('Error generating icons:', error);
  process.exit(1);
}
