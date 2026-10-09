export const lenguajes = ["es", "en"];

export const ui = {
  es: {
    "nav.label": "Principal",
    "nav.home": "ningunfernando, inicio",
    "section.arte": "arte",
    "section.software": "software",
    "section.foto": "foto",
    "menu.button": "menú",
  },
  en: {
    "nav.label": "Main",
    "nav.home": "ningunfernando, home",
    "section.arte": "art",
    "section.software": "software",
    "section.foto": "photo",
    "menu.button": "menu",
  },
};


export function getLangPaths() {
  return lenguajes.map((lang) => ({ params: { lang } }));
}

export function useTranslations(lang) {
   return (key) => ui[lang]?.[key] ?? ui.es[key] ?? key;
}
