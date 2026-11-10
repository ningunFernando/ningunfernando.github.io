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
    fonts: [
        {
            provider: fontProviders.local(),
            name: "Space Grotesk",
            cssVariable: "--font-space-grotesk",
            fallbacks: ["system-ui", "sans-serif"],
            options: {
                variants: [
                    {
                        src: ["./src/assets/fonts/SpaceGrotesk-VF.ttf"],
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
                        src: ["./src/assets/fonts/JetBrainsMono-VF.ttf"],
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
