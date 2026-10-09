import { lenguajes } from "./ui.js";

// Secciones del sitio. La ruta puede cambiar por idioma ("otros" / "other")
// y el color sale de su token en tokens.css.
export const sections = [
  { id: "shading", slug: { es: "shading", en: "shading" }, token: "--shading" },
  { id: "tools", slug: { es: "tools", en: "tools" }, token: "--tools" },
  { id: "otros", slug: { es: "otros", en: "other" }, token: "--otros" },
];

// Para getStaticPaths de src/pages/[lang]/[section].astro:
// una página por idioma y sección, con la ruta de ese idioma.
export function getSectionPaths() {
  return lenguajes.flatMap((lang) =>
    sections.map((section) => ({
      params: { lang, section: section.slug[lang] },
      props: { id: section.id },
    })),
  );
}

// La sección de una ruta: "/en/other" → la sección "otros". En el hub no hay.
export function findSection(pathname) {
  const [, lang, slug] = pathname.split("/");
  return sections.find((section) => section.slug[lang] === slug);
}

// La misma página en otro idioma: cambia el idioma y, si es una sección,
// también su ruta ("/es/otros" → "/en/other").
export function translatePath(pathname, toLang) {
  const [, , slug = "", ...rest] = pathname.split("/");
  const section = findSection(pathname);
  return ["", toLang, section ? section.slug[toLang] : slug, ...rest].join("/");
}
