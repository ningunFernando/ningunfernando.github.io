---
title: Asset Organizer
section: tools
summary: A Unity editor tool that tidies a project by naming convention. It reads each asset's prefix and extension, sends it to its folder and groups the ones that share a keyword into subfolders.
tags: [unity, c#, editor tools]
engine: Unity 6 · Editor
year: 2025
role: Personal project
problem: Assets pile up loose in the root, in "New Folder" or in "Downloads". Sorting them by hand takes time and relies on everyone remembering where each thing goes.
solution: A window of mappings made of a prefix, a folder and extensions. One click moves every asset to its folder, groups the ones that share a prefix and keyword into subfolders, and sets particle prefabs apart. A welcome window creates the base folders and loads a mapping template.
result: A messy project ends up in folders by type with one click, without breaking references. A thousand textures are sorted in about 0.7 s.
metric: 1000 files in ~0.7 s
cover: ../asset-organizer/portada.jpg
media:
  - src: ../asset-organizer/demo.gif
    still: ../asset-organizer/portada.jpg
    alt: Unity's Project window with loose assets; the Asset Organizer appears on top with its mappings and, once it runs, everything sits in folders by type, with the rock and grass textures in their own subfolders.
---
