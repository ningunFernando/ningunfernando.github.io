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
    "loader.skip": "saltar →",
    "intro.tagline": "Shading y tooling para juegos.",
    "intro.role": "Technical Artist en",
    "intro.hint": "mueve el cursor · pasa por un enlace",
    "link.newTab": "(se abre en otra pestaña)",
  },
  en: {
    "nav.label": "Main",
    "nav.home": "ningunfernando, home",
    "section.shading": "shading",
    "section.tools": "tools",
    "section.otros": "other",
    "menu.button": "menu",
    "lang.label": "Language",
    "loader.skip": "skip →",
    "intro.tagline": "Shading & tooling for games.",
    "intro.role": "Technical Artist at",
    "intro.hint": "move the cursor · hover a link",
    "link.newTab": "(opens in a new tab)",
  },
};


export function getLangPaths() {
  return lenguajes.map((lang) => ({ params: { lang } }));
}

export function useTranslations(lang) {
   return (key) => ui[lang]?.[key] ?? ui.es[key] ?? key;
}
