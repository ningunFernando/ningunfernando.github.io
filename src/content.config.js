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

// Notas y breakdowns en MDX: src/content/notas/<idioma>/<slug>.mdx. Con `piece`, la nota es el
// breakdown de esa pieza y vive en su ruta (/es/shading/cell-shader/breakdown); sin él, en /es/notas/<slug>.
const notas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notas' }),
  schema: z.object({
    title: z.string(),
    description: z.string(), // la entrada: qué se construye y qué se podrá hacer al final
    date: z.coerce.date(),
    section: z.enum(['shading', 'tools', 'otros']),
    piece: z.string().optional(), // slug de la pieza
    tags: z.array(z.string()).default([]),
    download: z.object({ label: z.string(), href: z.string() }).optional(), // paquete descargable
    repo: z.url().optional(),
    draft: z.boolean().default(false), // los borradores solo se ven en desarrollo
  }),
});

export const collections = { piezas, notas };
