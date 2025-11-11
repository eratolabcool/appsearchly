/**
 * Create placeholder SVG icons for missing app icons
 */

const iconConfigs = [
  { name: 'notion', color: '#000000', symbol: '📝' },
  { name: 'procreate', color: '#FF4B4B', symbol: '🎨' },
  { name: 'spotify', color: '#1DB954', symbol: '🎵' },
  { name: 'figma', color: '#F24E1E', symbol: '🎯' },
  { name: 'vscode', color: '#007ACC', symbol: '💻' }
];

function createSVGIcon(config: typeof iconConfigs[0]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="${config.color}"/>
  <text x="64" y="75" font-family="Apple Color Emoji, Segoe UI Emoji" font-size="48" text-anchor="middle" fill="white">${config.symbol}</text>
</svg>`;
}

export function createPlaceholderIcons() {
  const fs = require('fs');
  const path = require('path');

  const iconsDir = path.join(process.cwd(), 'static/assets/icons');

  iconConfigs.forEach(config => {
    const svgContent = createSVGIcon(config);
    const filePath = path.join(iconsDir, `${config.name}.png`);

    // For now, create a simple placeholder file
    // In production, you'd convert SVG to PNG
    fs.writeFileSync(filePath.replace('.png', '.svg'), svgContent);
  });
}

if (typeof require !== 'undefined' && require.main === module) {
  createPlaceholderIcons();
}