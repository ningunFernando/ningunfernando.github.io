export const lenguajes = ["es", "en"];

export const ui = {
  es: {
    "nav.label": "Principal",
    "nav.home": "ningunfernando, inicio",
    "section.shading": "shading",
    "section.tools": "tools",
    "section.otros": "otros",
    "menu.button": "menú",
    "lang.label": "Idioma",
  },
  en: {
    "nav.label": "Main",
    "nav.home": "ningunfernando, home",
    "section.shading": "shading",
    "section.tools": "tools",
    "section.otros": "other",
    "menu.button": "menu",
    "lang.label": "Language",
  },
};


export function getLangPaths() {
  return lenguajes.map((lang) => ({ params: { lang } }));
}

export function useTranslations(lang) {
   return (key) => ui[lang]?.[key] ?? ui.es[key] ?? key;
}
