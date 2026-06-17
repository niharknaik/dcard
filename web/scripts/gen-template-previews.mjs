// One-off generator: builds a designed PNG preview per template (gradient +
// business icon + name + mini-card mockup) into web/public/templates/.
// Run: node scripts/gen-template-previews.mjs   (sharp installed with --no-save)
import sharp from 'sharp';
import {mkdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'templates');
mkdirSync(OUT, {recursive: true});

// [name, category, primary, accent] — mirrors backend TemplateSeeder.
const templates = [
  ['Modern Cafe', 'cafe-restaurant', '#6F4E37', '#E0B589'],
  ['Coffee Shop', 'cafe-restaurant', '#3E2723', '#A1887F'],
  ['Restaurant Premium', 'cafe-restaurant', '#1B1B1B', '#C9A227'],
  ['Executive Card', 'corporate', '#0F172A', '#3B82F6'],
  ['Startup Founder', 'corporate', '#111827', '#8B5CF6'],
  ['Consultant', 'corporate', '#1E293B', '#0EA5E9'],
  ['Developer', 'freelancer', '#0B1020', '#22D3EE'],
  ['Designer', 'freelancer', '#18181B', '#F472B6'],
  ['Digital Marketer', 'freelancer', '#312E81', '#F59E0B'],
  ['Doctor', 'medical', '#0E7490', '#34D399'],
  ['Clinic', 'medical', '#075985', '#38BDF8'],
  ['Teacher', 'education', '#7C2D12', '#FB923C'],
  ['Tutor', 'education', '#1E3A8A', '#60A5FA'],
  ['Store Owner', 'retail', '#9D174D', '#FB7185'],
  ['Fashion Shop', 'retail', '#171717', '#E879F9'],
  ['Property Consultant', 'real-estate', '#14532D', '#A3E635'],
  ['Personal Trainer', 'fitness', '#0B1020', '#F97316'],
  ['Salon Professional', 'beauty', '#581C87', '#F0ABFC'],
  ['Event Planner', 'events', '#4C1D95', '#C4B5FD'],
  ['Photographer', 'creative', '#0A0A0A', '#FBBF24'],
];

const labels = {
  'cafe-restaurant': 'Cafe & Restaurant', corporate: 'Corporate', freelancer: 'Freelancer',
  medical: 'Medical', education: 'Education', retail: 'Retail', 'real-estate': 'Real Estate',
  fitness: 'Fitness', beauty: 'Beauty', events: 'Events', creative: 'Creative',
};

// White, centred at (0,0). stroke-based unless noted. ~ -36..36.
const S = 'stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const icons = {
  'cafe-restaurant': `<g ${S}><path d="M-26 -16 H18 V2 a22 22 0 0 1 -44 0 Z"/><path d="M18 -10 h10 a10 10 0 0 1 0 20 h-10"/><line x1="-34" y1="22" x2="30" y2="22"/><path d="M-12 -30 q7 -8 0 -16"/><path d="M6 -30 q7 -8 0 -16"/></g>`,
  corporate: `<g ${S}><rect x="-30" y="-8" width="60" height="40" rx="6"/><path d="M-12 -8 v-8 a6 6 0 0 1 6 -6 h12 a6 6 0 0 1 6 6 v8"/><line x1="-30" y1="10" x2="30" y2="10"/></g>`,
  freelancer: `<g ${S}><rect x="-26" y="-24" width="52" height="34" rx="3"/><path d="M-32 18 L-26 10 H26 L32 18 Z"/></g>`,
  medical: `<g fill="#fff" stroke="none"><path d="M-9 -30 h18 v21 h21 v18 h-21 v21 h-18 v-21 h-21 v-18 h21 z"/></g>`,
  education: `<g ${S}><path d="M0 -28 L40 -10 L0 8 L-40 -10 Z"/><path d="M-22 -1 V18 a22 9 0 0 0 44 0 V-1"/><path d="M40 -10 V22"/></g>`,
  retail: `<g ${S}><path d="M-24 -4 H24 L20 32 H-20 Z"/><path d="M-12 -4 V-14 a12 12 0 0 1 24 0 V-4"/></g>`,
  'real-estate': `<g ${S}><path d="M-30 2 L0 -28 L30 2"/><path d="M-22 2 V32 H22 V2"/><rect x="-7" y="14" width="14" height="18"/></g>`,
  fitness: `<g ${S}><line x1="-22" y1="0" x2="22" y2="0"/><rect x="-36" y="-15" width="12" height="30" rx="3"/><rect x="24" y="-15" width="12" height="30" rx="3"/></g>`,
  beauty: `<g fill="#fff" stroke="none"><path d="M0 -32 C5 -9 9 -5 32 0 C9 5 5 9 0 32 C-5 9 -9 5 -32 0 C-9 -5 -5 -9 0 -32 Z"/></g>`,
  events: `<g ${S}><rect x="-28" y="-20" width="56" height="46" rx="6"/><line x1="-28" y1="-6" x2="28" y2="-6"/><line x1="-14" y1="-30" x2="-14" y2="-16"/><line x1="14" y1="-30" x2="14" y2="-16"/></g>`,
  creative: `<g ${S}><rect x="-30" y="-12" width="60" height="40" rx="6"/><path d="M-14 -12 l6 -10 h16 l6 10"/><circle cx="0" cy="10" r="13"/></g>`,
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function svgFor(name, cat, primary, accent) {
  return `<svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
    <radialGradient id="hl" cx="0.72" cy="0.12" r="0.9"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="600" height="400" fill="url(#g)"/>
  <rect width="600" height="400" fill="url(#hl)"/>
  <circle cx="300" cy="138" r="66" fill="#fff" fill-opacity="0.14"/>
  <g transform="translate(300,138)">${icons[cat] ?? ''}</g>
  <text x="300" y="252" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="700" fill="#fff">${esc(name)}</text>
  <text x="300" y="284" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="15" letter-spacing="3" fill="#fff" fill-opacity="0.82">${esc((labels[cat] ?? cat).toUpperCase())}</text>
  <g>
    <rect x="180" y="316" width="240" height="58" rx="14" fill="#fff" fill-opacity="0.16"/>
    <circle cx="212" cy="345" r="15" fill="#fff" fill-opacity="0.5"/>
    <rect x="240" y="335" width="140" height="9" rx="4.5" fill="#fff" fill-opacity="0.55"/>
    <rect x="240" y="352" width="92" height="8" rx="4" fill="#fff" fill-opacity="0.33"/>
  </g>
</svg>`;
}

let n = 0;
for (const [name, cat, primary, accent] of templates) {
  const svg = svgFor(name, cat, primary, accent);
  const file = join(OUT, `${slugify(name)}.png`);
  await sharp(Buffer.from(svg)).png().toFile(file);
  n++;
}
console.log(`Generated ${n} template previews into public/templates/`);
