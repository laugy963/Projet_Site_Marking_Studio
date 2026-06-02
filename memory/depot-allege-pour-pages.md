---
name: depot-allege-pour-pages
description: Le dépôt a été nettoyé (720 Mo → ~1,4 Mo) ; ne pas y remettre de gros fichiers sources
metadata:
  type: project
---

Le 2026-06-02, le dépôt a été allégé de **720 Mo → ~1,4 Mo** (et `.git` 318 Mo → ~1 Mo) via une réécriture d'historique (commit orphelin unique + force-push).

Ce qui a été retiré et reste exclu via `.gitignore` : `Design/` (sources de design), `uploads/` (brouillons), `node_modules/`, `package-lock.json`, `.DS_Store`. Les images inutilisées ont été supprimées ; seules ~8 webp référencées restent dans `images/`. Le fond de la section « À propos » a été converti de PNG 7,8 Mo en `images/about-atelier.webp` (132 Ko, 2000px).

**Why:** Comme le site est servi tel quel par GitHub Pages ([[deploiement-github-pages]]), tout fichier lourd poussé alourdit le dépôt ET devient public sur markingstudio.fr.
**How to apply:** Ne pas committer de sources de design, brouillons, ou images non optimisées. Convertir les images en webp (via `npm install sharp --no-save` puis un petit script `sharp().resize().webp()`). Vérifier les images réellement référencées avant d'en supprimer.
