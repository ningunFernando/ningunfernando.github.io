import { getCollection } from 'astro:content';
import { lenguajes } from '../i18n/ui.js';
import { sections, notesSlug } from '../i18n/routes.js';
import { parseId } from './pieces.js';

// Minutos de lectura: 200 palabras por minuto, contando también el código.
export function readingTime(body = '') {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Las notas que se ven en un idioma, de la más nueva a la más vieja. Si a una nota le falta
// la traducción, aparece en su otro idioma con `fallback: true` (la página lo avisa).
export async function getNotes(lang) {
  const entries = await getCollection('notas', ({ data }) => import.meta.env.DEV || !data.draft);
  const bySlug = new Map();
  for (const entry of entries) {
    const { lang: entryLang, slug } = parseId(entry.id);
    if (!bySlug.has(slug)) bySlug.set(slug, {});
    bySlug.get(slug)[entryLang] = entry;
  }

  return [...bySlug.entries()]
    .map(([slug, translations]) => {
      const entry = translations[lang] ?? translations[lenguajes.find((l) => translations[l])];
      return {
        slug,
        entry,
        lang: parseId(entry.id).lang, // el idioma en que está escrita la que se muestra
        fallback: !translations[lang],
        minutes: readingTime(entry.body),
      };
    })
    .sort((a, b) => b.entry.data.date - a.entry.data.date);
}

// La ruta de una nota en un idioma: el breakdown, bajo su pieza; la nota suelta, bajo /notas.
export function noteUrl(note, lang) {
  const { section: sectionId, piece } = note.entry.data;
  if (piece) {
    const section = sections.find((s) => s.id === sectionId);
    return `/${lang}/${section.slug[lang]}/${piece}/breakdown`;
  }
  return `/${lang}/${notesSlug[lang]}/${note.slug}`;
}

// Para getStaticPaths de las notas sueltas (src/pages/es/notas/[slug].astro y src/pages/en/notes/[slug].astro).
export async function getLooseNotePaths(lang) {
  const notes = await getNotes(lang);
  return notes
    .filter((note) => !note.entry.data.piece)
    .map((note) => ({ params: { slug: note.slug }, props: { note } }));
}

// El breakdown de una pieza en un idioma, si existe.
export async function getBreakdown(lang, pieceSlug) {
  const notes = await getNotes(lang);
  return notes.find((note) => note.entry.data.piece === pieceSlug);
}

// Fecha legible en el idioma de la página: "10 de noviembre de 2026" / "November 10, 2026";
// con month = 'short', "10 nov 2026" / "Nov 10, 2026" (para las filas de notas).
export function formatDate(date, lang, month = 'long') {
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month, year: 'numeric', timeZone: 'UTC' }).format(date);
}
