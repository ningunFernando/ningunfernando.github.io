---
title: Asset Organizer
section: tools
summary: Herramienta de editor para Unity que ordena el proyecto por nomenclatura. Lee el prefijo y la extensión de cada asset, lo manda a su carpeta y agrupa en subcarpetas los que comparten palabra clave.
tags: [unity, c#, editor tools]
engine: Unity 6 · Editor
year: 2025
role: Proyecto personal
problem: Los assets se acumulan sueltos en la raíz, en «New Folder» o en «Downloads». Ordenarlos a mano lleva tiempo y depende de que todo el equipo recuerde dónde va cada cosa.
solution: Una ventana con mapeos de prefijo, carpeta y extensiones. Con un clic mueve cada asset a su carpeta, agrupa en subcarpetas los que comparten prefijo y palabra clave, y aparta los prefabs con partículas. Una bienvenida crea las carpetas base y carga una plantilla de mapeos.
result: Un proyecto desordenado queda en carpetas por tipo con un clic, sin romper referencias. Mil texturas se ordenan en unos 0,7 s.
metric: 1000 archivos en ~0,7 s
cover: ../asset-organizer/portada.jpg
media:
  - src: ../asset-organizer/demo.gif
    still: ../asset-organizer/portada.jpg
    alt: La ventana Project de Unity con assets sueltos; encima aparece el Asset Organizer con sus mapeos y, al organizar, todo queda en carpetas por tipo, con las texturas de roca y de pasto en sus propias subcarpetas.
---
