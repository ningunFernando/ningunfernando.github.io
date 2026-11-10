import { getCollection } from 'astro:content';
import { sections } from '../i18n/routes.js';

// El id de una pieza es "<idioma>/<slug>", por la carpeta en la que vive.
export function parseId(id) {
  const [lang, slug] = id.split('/');
  return { lang, slug };
}

// Las piezas de un idioma (y, si se pide, de una sección), en su orden.
export async function getPieces(lang, sectionId) {
  const pieces = await getCollection('piezas', ({ id, data }) =>
    parseId(id).lang === lang && (!sectionId || data.section === sectionId),
  );
  return pieces.sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year);
}

// La ruta de una pieza: /es/shading/cell-shader, con la ruta de la sección en su idioma.
export function pieceUrl(entry) {
  const { lang, slug } = parseId(entry.id);
  const section = sections.find((s) => s.id === entry.data.section);
  return `/${lang}/${section.slug[lang]}/${slug}`;
}

// Para getStaticPaths de src/pages/[lang]/[section]/[piece].astro.
export async function getPiecePaths() {
  const pieces = await getCollection('piezas');
  return pieces.map((entry) => {
    const { lang, slug } = parseId(entry.id);
    const section = sections.find((s) => s.id === entry.data.section);
    return {
      params: { lang, section: section.slug[lang], piece: slug },
      props: { entry, section },
    };
  });
}
