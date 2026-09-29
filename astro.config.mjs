// @ts-check
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
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
});
