import fs from 'fs';
import path from 'path';
import pkg from 'glob';
const { globSync } = pkg;

const files = globSync('src/**/*.svelte');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Match a block comment at the very beginning of the file, followed by optional whitespace, then <script
  const match = content.match(/^\/\*\*[\s\S]*?\*\/\s*<script/);
  if (match) {
    // We want to move the comment inside the script tag, or just remove it.
    // Let's just remove it for clean HTML.
    content = content.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '');
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
}
