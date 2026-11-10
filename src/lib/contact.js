import fs from 'node:fs';
import path from 'node:path';

// Contacto y redes públicos (los dio el usuario el 2026-11-10). Se usan en el pie, en sobre mí y en el hub.
export const email = 'fernando.ibarra.pf@gmail.com';

export const socials = [
  { label: 'GitHub', href: 'https://github.com/ningunFernando' },
  { label: 'itch.io', href: 'https://ningunfernando.itch.io/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fernando-fabian-pati%C3%B1o-ibarra-281431289/' },
  { label: 'Instagram', href: 'https://www.instagram.com/ningunfernando/' },
];

// El CV es un PDF en public/: cv-es.pdf y cv-en.pdf. Si falta el de un idioma se usa el otro;
// si no hay ninguno, devuelve null y el sitio no muestra el enlace.
const CV_FILES = { es: 'cv-es.pdf', en: 'cv-en.pdf' };

export function cvHref(lang) {
  const exists = (file) => fs.existsSync(path.join(process.cwd(), 'public', file));
  const order = [lang, ...Object.keys(CV_FILES).filter((l) => l !== lang)];
  const found = order.find((l) => exists(CV_FILES[l]));
  return found ? `/${CV_FILES[found]}` : null;
}
