export const lenguajes = ["es", "en"];

export function getLangPaths() {
  return lenguajes.map((lang) => ({ params: { lang } }));
}
