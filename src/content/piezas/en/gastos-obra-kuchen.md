---
title: Kuchen construction expenses
section: otros
summary: A web app for Kuchen Construcciones that tracks what each construction job spends against its budget by line item. The warehouse logs every invoice from a phone and the office sees up-to-date figures.
tags: [nuxt, vue, supabase, drizzle]
engine: Nuxt 4 · Supabase
year: 2026
role: Epiciclo · Kuchen Construcciones
problem: Know how much each job has spent against its budget per line item, with every expense backed by the supplier's invoice and no reconciling numbers by hand.
solution: Every invoice is logged against a job, a line item and a payment item, with its VAT and withholdings. There are three roles (admin, viewer and warehouse), and a mistyped expense isn't deleted but voided with a reason. The dashboard flags line items over budget or at 90 % of it.
result: A single source of truth for each job's spending, with income by client, bank accounts, budget history and Excel export. The screenshots use a test company with made-up data.
cover: ../gastos-obra-kuchen/portada.jpg
media:
  - src: ../gastos-obra-kuchen/demo.gif
    still: ../gastos-obra-kuchen/tablero.jpg
    alt: A walkthrough of the app with test data. The dashboard shows spending against budget and the line items that need attention; then an invoice is logged, a job's detail shows progress per line item and a voided expense shows who voided it and why.
---
