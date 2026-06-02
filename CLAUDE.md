# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Site vitrine one-page pour **Marking Studio** — studio de création de sites internet sur mesure basé en France. Site statique sans framework ni bundler : HTML, CSS, et JS vanilla écrits à la main.

Production URL : `https://markingstudio.fr/`

## Previewing the site

Ouvrir `index.html` directement dans un navigateur, ou lancer un serveur local :

```bash
npx serve .
# ou
python3 -m http.server 8080
```

Il n'y a aucune étape de build — le dossier racine est le dossier de déploiement.

## Architecture

**Fichiers principaux :**
- `index.html` — page unique avec 9 sections dans l'ordre : hero, pain, answer, journey, examples, pricing, about/testimonials, faq, contact
- `css/base.css` — design tokens (CSS custom properties), reset, primitives typographiques et classes utilitaires partagées (`.reveal`, `.container`, `.section`, `.label`, `.em-italic`, `.pilcrow`, `.folio`)
- `css/style.css` — styles spécifiques à chaque composant et section
- `js/main.js` — IIFE vanilla ; gère : scroll header, menu mobile, IntersectionObserver pour `.reveal`, validation formulaire de contact (front-end only, pas de backend), smooth scroll ancres

**Recto / Verso :** Le site adopte le rythme visuel d'une carte de visite recto/verso. La palette « recto » (fond crème `#F2EDE1`) est appliquée globalement. Les sections avec `data-section="verso"` (pain, contact) basculent vers la palette encre sombre via un bloc CSS dédié dans `base.css`. Ne jamais appliquer `[data-theme='dark']` au niveau `<html>` — le thème sombre n'est pas global.

**Tokens de couleur clés :**
- `--paper` / `--ink` — s'inversent entre recto et verso
- `--accent` — rouge corail `#C44A38` (recto) / `#D8604F` (verso)
- `--text-muted`, `--rule` — tons secondaires sur crème

**Typographie :** Lora (serif italique, titres et `.em-italic`) + Inter (UI, labels, corps). Le contraste éditorial repose sur l'alternance Lora italic (accent coral) / Inter (texte courant).

**Animations :** Les éléments avec `.reveal` démarrent à `opacity:0; transform:translateY(14px)` et passent à `is-visible` via IntersectionObserver. Si JS est absent, `html:not(.js) .reveal` s'affiche directement.

**SVG fleur :** L'ornement fleur-de-lis custom (chemin SVG inline dans chaque `.pilcrow`) est répété dans tout le HTML. Modifier le SVG nécessite un remplacement global.

## Schéma JSON-LD

Le `<script type="application/ld+json">` dans `<head>` contient les tarifs des 3 forfaits (Série A 1490€, Série B 3490€, Série C 6990€). Mettre à jour les prix ici en même temps que dans le HTML.

## SEO

`sitemap.xml` et `robots.txt` sont présents à la racine. La balise `<link rel="canonical">` pointe vers `https://markingstudio.fr/`. Garder ces trois éléments cohérents lors d'un changement de domaine.

## Formulaire de contact

Le formulaire (`#contactForm`) est front-end only — la soumission simule un succès en cachant le form et affichant `#formSuccess`. Pour intégrer un vrai backend, remplacer le bloc `// Simulate success` dans `js/main.js`.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
