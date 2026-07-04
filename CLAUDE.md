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

**Thème « Studio Noir » (recto / verso) :** Le site est **sombre en global**. La palette « recto » (fond charcoal `#111316`) est appliquée par défaut via `:root`. Les sections avec `data-section="verso"` (pain, contact) basculent vers un noir plus profond (`#0A0B0D`) via un bloc CSS dédié dans `base.css` — le rythme recto/verso de la carte de visite est donc deux nuances de noir. Il n'y a plus d'attribut `data-theme` sur `<html>` : ne pas le réintroduire. Sur fond sombre, `--ink` = ivoire (couleur de contraste : boutons, carte tarif « featured », blocs), `--paper-bright` = ivoire clair (texte/élément clair sur photo). Les maquettes qui représentent un site (`.mk--new`, `.journey__device`) re-scopent des tokens **clairs** localement pour ressembler à des captures d'écran.

**Tokens de couleur clés :**
- `--paper` (fond sombre) / `--ink` (ivoire de contraste) — inversés recto ↔ verso
- `--accent` — orange `#FF6D14` (recto + verso) ; variante foncée `#C2560E` scopée sur la carte tarif ivoire et les maquettes claires. Texte sur orange = foncé (`--text-inverse`). Le bouton de la carte tarif « featured » est forcé en pill sombre (orange sur ivoire ne passe pas AA)
- `--text-muted`, `--text-faint`, `--rule` — tons secondaires sur charcoal (calibrés AA)

**Typographie :** Bricolage Grotesque (grotesk caractériel, titres, `.em-italic` et numéraux — l'italique est un oblique synthétisé) + Inter (UI, labels, corps). Auto-hébergées en woff2 (`assets/fonts/`, pas de CDN Google, RGPD + perf). Le contraste repose sur l'alternance Bricolage Grotesque display / accents orange obliques vs Inter texte courant.

**Animations :** Système de reveal **bidirectionnel** (façon Wibify) piloté par IntersectionObserver dans `main.js` : les éléments `.reveal` gagnent `is-visible` à l'entrée du viewport et le perdent à la sortie (haut ou bas) pour rejouer au scroll inverse — l'état caché pointe vers le bord de sortie (`is-above` après une sortie haute, défaut = bas). Les grands titres portent `.reveal-words` : `main.js` les éclate en mots (spans `.rw`, index `--wi`, `aria-label` conservé sur le titre) qui montent du flou vers le net en cascade. Les délais d'entrée sont scopés sur `.is-visible` (la sortie repart sans délai, plus vite). Sous `prefers-reduced-motion` : pas de découpage et reveal one-shot ; sans JS, `html:not(.js) .reveal` s'affiche directement. La cascade du hero attend la fin de l'intro (événement `ms:intro-done`). Le contenu entier du hero (`.hero__inner` : strap, titre, CTA, stats) est en plus scrubbé au scroll (remontée + fondu réversibles, JS inline). Les reveals en toute fin de page (barre du footer) portent `data-reveal-edge` : observés sans le retrait bas de −60px, sans quoi ils ne se révéleraient jamais au scroll maximal.

**Trio interactif de la section pain (« Le constat ») :** Chaque `.pain-item` met en scène son propre message, piloté par un IntersectionObserver dédié dans `main.js` (threshold 0.4) : **i.** `pain-item--visitor` — le contenu (`.pain-item__body`) dérive 3 s vers la gauche (`is-drifting`) puis file hors du cadre (`is-gone`), comme le visiteur qui part ; **ii.** `pain-item--unindexed` — h3 + p restent fantômes, flous et quasi transparents (`is-ghost`), comme un site absent de l'index Google ; **iii.** `pain-item--cloned` — deux échos identiques du body (créés par `cloneNode`, `aria-hidden`, `inset: 0; padding: inherit` pour suivre le padding responsive) glissent derrière l'original (`is-cloned`), comme les sites template tous pareils. Chaque bloc porte un `<button class="pain-item__return">` plein-case (styles partagés, désactivé au repos) qui inverse la mise en scène au clic : retour du bloc i., mise au point du ii. (`is-ghost` retiré), dispersion des clones du iii. (`is-unique`). La sortie du viewport réarme tout (cohérent avec les reveals bidirectionnels). Les états sont posés **uniquement par JS** : sans JS ou sous `prefers-reduced-motion`, les trois blocs s'affichent normalement — ne pas déplacer ces états vers le CSS par défaut.

**SVG fleur :** L'ornement fleur-de-lis custom (chemin SVG inline dans chaque `.pilcrow`) est répété dans tout le HTML. Modifier le SVG nécessite un remplacement global.

## Performance

- `.htaccess` active gzip (mod_deflate) sur les ressources texte et le cache navigateur (mod_expires) : HTML 1 h, CSS/JS 1 mois, images 6 mois, fonts 1 an immutable. Le garder identique à la racine et dans `ovh-deploy/`.
- Les images WebP sont encodées avec `cwebp -q 78 -m 6` (max 1600 px de large). Recompresser toute nouvelle photo avec ces réglages avant de l'ajouter.
- `ovh-deploy/` ne contient que les fichiers réellement servis (pas les PNG logos sources non référencés dans `images/`).

## Schéma JSON-LD

Le `<script type="application/ld+json">` dans `<head>` contient les tarifs des 3 forfaits (Série A 990€, Série B 2490€, Série C 4990€). Mettre à jour les prix ici en même temps que dans le HTML.

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
