// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
    // Notas y breakdowns en MDX: Markdown que admite componentes (visor, figuras de nodos).
    integrations: [mdx()],
    // Código resaltado en los posts. El fondo lo pone el CSS del post.
    markdown: {
        shikiConfig: {
            theme: "github-dark-default",
        },
    },
    // Fuentes recortadas a latín (español, inglés y los signos y flechas que usa el sitio) y en WOFF.
    // Los TTF completos están en el kit de marca; cómo se regeneran, en docs/portafolio-web.md.
    fonts: [
        {
            provider: fontProviders.local(),
            name: "Space Grotesk",
            cssVariable: "--font-space-grotesk",
            fallbacks: ["system-ui", "sans-serif"],
            options: {
                variants: [
                    {
                        src: ["./src/assets/fonts/SpaceGrotesk-VF.woff"],
                        weight: "300 700",
                        style: "normal",
                    },
                ],
            },
        },
        {
            provider: fontProviders.local(),
            name: "JetBrains Mono",
            cssVariable: "--font-jetbrains-mono",
            fallbacks: ["ui-monospace", "Menlo", "monospace"],
            options: {
                variants: [
                    {
                        src: ["./src/assets/fonts/JetBrainsMono-VF.woff"],
                        weight: "100 800",
                        style: "normal",
                    },
                ],
            },
        },
  ],
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: {
      prefixDefaultLocale: true,
    }
  },
});
