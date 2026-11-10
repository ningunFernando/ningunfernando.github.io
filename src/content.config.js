import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Una pieza por idioma: src/content/piezas/<idioma>/<slug>.md. El idioma sale de la carpeta.
const piezas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/piezas' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      section: z.enum(['shading', 'tools', 'otros']),
      summary: z.string(), // una frase: qué es y por qué se hizo
      tags: z.array(z.string()).default([]),
      engine: z.string().optional(),
      year: z.number().int(),
      role: z.string(),
      // El resumen en tres líneas
      problem: z.string(),
      solution: z.string(),
      result: z.string(),
      metric: z.string().optional(), // la cifra, cuando exista
      cover: image().optional(), // miniatura de la lista
      media: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      viewer: z.string().optional(), // nombre de un visor de src/scripts/viewer-params.js
      links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
      order: z.number().default(0),
    }),
});

export const collections = { piezas };
