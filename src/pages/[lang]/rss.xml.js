import rss from '@astrojs/rss';
import { getLangPaths, useTranslations } from '../../i18n/ui.js';
import { getNotes, noteUrl } from '../../lib/notes.js';

// Un feed por idioma: /es/rss.xml y /en/rss.xml. RSS pide direcciones completas, así que
// solo se genera cuando astro.config.mjs tenga `site` (el dominio, que se decide en F7).
export function getStaticPaths() {
  return import.meta.env.SITE ? getLangPaths() : [];
}

export async function GET(context) {
  const { lang } = context.params;
  const t = useTranslations(lang);
  const notes = (await getNotes(lang)).filter((note) => !note.fallback);
  return rss({
    title: t('rss.title'),
    description: t('rss.description'),
    site: context.site,
    items: notes.map((note) => ({
      title: note.entry.data.title,
      description: note.entry.data.description,
      pubDate: note.entry.data.date,
      link: noteUrl(note, lang),
    })),
    customData: `<language>${lang}</language>`,
  });
}
