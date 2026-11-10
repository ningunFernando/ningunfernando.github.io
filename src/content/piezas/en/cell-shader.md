---
title: Cell shader
section: shading
summary: Toon lighting for URP in Unity 6, built with Shader Graph and HLSL. One lighting Sub Graph shared by the character and floor materials.
tags: [unity, urp, shader graph, hlsl]
engine: Unity 6 · URP
year: 2026
role: Technical Artist · Team Igloo
problem: With real-time shadows, shadow-map texels shifted the band threshold and left jagged edges. With Forward+, a regular loop couldn't see the additional lights.
solution: The light ramp and the shadow ramp are computed separately and combined with min, self-shadowing fades out at the terminator, and additional lights use the Forward+ loop.
result: Procedural or texture-based bands, specular, rim, and an inverted-hull outline with a constant pixel width.
cover: ../cell-shader.png
viewer: toon
---
