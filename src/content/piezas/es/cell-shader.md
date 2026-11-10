---
title: Cell shader
section: shading
summary: Iluminación toon para URP en Unity 6, con Shader Graph y HLSL. Un solo Sub Graph de iluminación que comparten los materiales del personaje y del suelo.
tags: [unity, urp, shader graph, hlsl]
engine: Unity 6 · URP
year: 2026
role: Technical Artist · Team Igloo
problem: Con sombras en tiempo real, los texels del shadow map movían el corte de las bandas y dejaban bordes dentados. Con Forward+, un bucle normal no veía las luces adicionales.
solution: La rampa de la luz y la de la sombra se calculan por separado y se combinan con min, la auto-sombra se desvanece en el terminador y las luces adicionales usan el bucle de Forward+.
result: Bandas procedurales o por textura, especular, rim y un contorno de casco invertido con grosor constante en píxeles.
cover: ../cell-shader.png
viewer: toon
---
