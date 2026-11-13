---
title: Stylized water
section: shading
summary: Toon water for URP in Unity 6, built in Shader Graph. Banded depth color, refraction, foam and waves in a single shader that drives a lagoon, a toon pool, a tropical pool and a swamp.
tags: [unity, urp, shader graph, hlsl]
engine: Unity 6 · URP
year: 2025
role: Personal project
problem: Make the water show depth, shoreline and motion without painted color textures or extra geometry for the foam.
solution: Everything comes from scene depth. The color blends in HSV, smooth or banded; the foam cuts a noise wherever the water touches something; two crossing normals offset the Scene Color; and a sine wave moves the vertices.
result: One shader with four presets that only change material values. Shown with screenshots and GIFs, no web viewer.
cover: ../stylized-water/portada.jpg
media:
  - src: ../stylized-water/final.gif
    still: ../stylized-water/final.jpg
    alt: The lagoon with the full water effect, with color bands, refraction, shoreline foam and gentle waves.
---
