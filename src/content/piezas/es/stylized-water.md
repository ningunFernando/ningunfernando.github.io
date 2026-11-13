---
title: Agua estilizada
section: shading
summary: Agua toon para URP en Unity 6, hecha en Shader Graph. Color por profundidad en bandas, refracción, espuma y olas en un solo shader, del que salen una laguna, una alberca toon, una tropical y un pantano.
tags: [unity, urp, shader graph, hlsl]
engine: Unity 6 · URP
year: 2025
role: Proyecto personal
problem: Que el agua muestre profundidad, orilla y movimiento sin texturas pintadas para el color ni geometría extra para la espuma.
solution: Todo sale de la profundidad de la escena. El color se mezcla en HSV, suave o en bandas; la espuma corta un ruido donde el agua toca algo; dos normales que se cruzan desplazan el Scene Color; y una onda senoidal mueve los vértices.
result: Un shader con cuatro presets que solo cambian valores del material. Se ve con capturas y GIFs, sin visor web.
cover: ../stylized-water/portada.jpg
media:
  - src: ../stylized-water/final.gif
    still: ../stylized-water/final.jpg
    alt: La laguna con el agua completa, con bandas de color, refracción, espuma en la orilla y olas suaves.
---
