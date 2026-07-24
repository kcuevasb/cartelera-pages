// Genera dist/ para GitHub Pages: copia los estáticos tal cual y ofusca
// el <script> inline de src/index.html. src/ es el fuente que se edita;
// dist/ es lo único que se publica.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(root, 'dist');
const srcHtml = path.join(root, 'src', 'index.html');

const STATIC_FILES = [
  'manifest.webmanifest',
  'sw.js',
  'favicon.svg',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'offline.html',
];

const SCRIPT_RE = /<script>([\s\S]*?)<\/script>/;

function build() {
  const html = readFileSync(srcHtml, 'utf8');
  const match = html.match(SCRIPT_RE);
  if (!match) {
    throw new Error('No se encontró un <script> inline en src/index.html');
  }

  const obfuscated = JavaScriptObfuscator.obfuscate(match[1], {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    // selfDefending rompía los event listeners en pruebas reales — desactivado.
    selfDefending: false,
  }).getObfuscatedCode();

  const outHtml = html.replace(SCRIPT_RE, `<script>${obfuscated}</script>`);

  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });
  writeFileSync(path.join(distDir, 'index.html'), outHtml);

  for (const file of STATIC_FILES) {
    const from = path.join(root, file);
    if (existsSync(from)) {
      copyFileSync(from, path.join(distDir, file));
    }
  }

  console.log(`dist/ generado (${(outHtml.length / 1024).toFixed(0)} KB index.html)`);
}

build();
