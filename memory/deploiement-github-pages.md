---
name: deploiement-github-pages
description: Le site est déployé via GitHub Pages sur le domaine markingstudio.fr
metadata:
  type: project
---

Le site Marking Studio est hébergé sur **GitHub Pages**, déployé depuis la branche `main` (dossier racine `/`) du dépôt `github.com/laugy963/Projet_Site_Marking_Studio`.

Domaine personnalisé : **markingstudio.fr**, configuré via un fichier `CNAME` à la racine (contenu : `markingstudio.fr`). DNS chez le registrar : enregistrements A vers les IP GitHub Pages (185.199.108-111.153) + `www` vers la même IP.

État au 2026-06-02 : le site est servi correctement (HTTP 200, l'URL `laugy963.github.io` redirige 301 vers le domaine). Le certificat HTTPS Let's Encrypt était encore en cours de provisionnement. **Ne jamais activer/désactiver le Custom domain dans Settings → Pages** : chaque toggle réinitialise le provisionnement du certificat.

**Why:** Pas de framework ni de pipeline CI — le dossier racine EST le dossier déployé, donc tout fichier poussé sur `main` devient public sur markingstudio.fr.
**How to apply:** Garder le dépôt léger ([[depot-allege-pour-pages]]). Vérifier le déploiement avec `curl -sI https://laugy963.github.io/Projet_Site_Marking_Studio/` (301 = OK) et `curl -sIL http://markingstudio.fr/` (200 = servi).
