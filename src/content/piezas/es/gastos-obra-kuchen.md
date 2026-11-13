---
title: Gastos de obra Kuchen
section: otros
summary: App web para Kuchen Construcciones que controla el gasto de cada obra contra su presupuesto por concepto. El almacén captura cada factura desde el celular y la oficina ve las cifras al día.
tags: [nuxt, vue, supabase, drizzle]
engine: Nuxt 4 · Supabase
year: 2026
role: Epiciclo · Kuchen Construcciones
problem: Saber cuánto se lleva gastado en cada obra contra lo presupuestado por concepto, con cada gasto respaldado por la factura de su proveedor y sin reconciliar las cifras a mano.
solution: Cada factura se captura contra una obra, un concepto y un concepto de pago, con su IVA y sus retenciones. Hay tres roles (administrador, observador y almacén), y un gasto mal capturado no se borra, se anula con su motivo. El tablero avisa de los conceptos rebasados o al 90 % de su presupuesto.
result: Una sola fuente de verdad para el gasto de cada obra, con ingresos por cliente, cuentas bancarias, historial de presupuesto y exportación a Excel. Las capturas usan una empresa de prueba con datos inventados.
cover: ../gastos-obra-kuchen/portada.jpg
media:
  - src: ../gastos-obra-kuchen/demo.gif
    still: ../gastos-obra-kuchen/tablero.jpg
    alt: Recorrido por la app con datos de prueba. El tablero muestra lo ejercido contra el presupuesto y los conceptos que requieren atención; después se captura una factura, el detalle de una obra muestra el avance por concepto y un gasto anulado muestra quién lo anuló y por qué.
---
