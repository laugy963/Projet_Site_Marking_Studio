# DESIGN.md — Marking Studio

Design system extrait de `css/base.css` et `css/style.css`. Ce fichier est la référence pour tout futur travail de design ou génération de maquettes.

## Concept

**Studio Noir (recto / verso)** — le site est **sombre en global**. Il garde le rythme d'une carte de visite recto/verso, mais en **deux nuances de noir** : le « recto » (défaut) est un charcoal, le « verso » (sections `data-section="verso"`) un noir plus profond. La signature couleur est un **orange** vif. Pas de thème clair global, pas d'attribut `data-theme`.

## Couleurs

### Recto (défaut page — `:root`)
| Token | Valeur | Usage |
|---|---|---|
| `--paper` | `#111316` | Fond principal (charcoal) |
| `--paper-soft` | `#191C20` | Surface surélevée (marquee, cartes, formulaire) |
| `--paper-deep` | `#21252B` | Surface plus profonde (dégradés, blocs wireframe) |
| `--paper-bright` | `#F5F3EC` | **Ivoire** — texte/élément clair sur photo, puces claires |
| `--ink` | `#F5F3EC` | Ivoire de contraste — boutons, carte tarif « featured », blocs |
| `--text` | `#F1EFE7` | Corps de texte (ivoire sur charcoal) |
| `--text-muted` | `#A6A196` | Texte secondaire (~7:1 sur charcoal) |
| `--text-faint` | `#837E72` | Texte discret (~4.8:1 — AA). Discrétion portée par taille + tracking, pas par un faible contraste |
| `--text-inverse` | `#111316` | Charcoal — texte sur ivoire / orange |
| `--accent` | `#FF6D14` | Orange signature — logo, `.em-italic`, ornements, CTA |
| `--accent-hover` | `#FF8A3D` | Orange survol |
| `--rule` | `#2B2F35` | Traits horizontaux sur charcoal |

### Verso (sections `data-section="verso"` — pain, contact)
| Token | Valeur |
|---|---|
| `--paper` | `#0A0B0D` (near-black) |
| `--paper-soft` | `#121417` |
| `--ink` | `#F5F3EC` (ivoire) |
| `--accent` | `#FF6D14` |
| `--rule` | `#24282E` |

### Orange foncé — contextes clairs
`#C2560E` est scopé localement sur les surfaces **claires** (carte tarif « featured » ivoire, maquettes de site) pour rester lisible (AA) là où l'orange vif serait trop clair sur du blanc.

**Règle absolue :** `--accent` est la seule couleur décorative. Texte posé sur orange = foncé (`--text-inverse`), jamais clair. Pas d'autres couleurs introduites sans décision explicite.

## Typographie

| Variable | Famille | Usage |
|---|---|---|
| `--font-display` | Bricolage Grotesque (auto-hébergé, woff2) | Titres, `.em-italic`, numéraux |
| `--font-italic` | Bricolage Grotesque | `.em-italic` et accents — italique = **oblique synthétisé** (pas de fonte italique dédiée) |
| `--font-body` | Inter (auto-hébergé, woff2) | Corps, UI, labels, navigation |

Polices **auto-hébergées** dans `assets/fonts/` (pas de CDN Google : RGPD + perf). `latin` préchargé dans `<head>`, `latin-ext` chargé à la demande.

### Échelle de texte (fluid via `clamp`)
| Token | Mobile → Desktop |
|---|---|
| `--text-hero` | 2.5rem → 8.5rem |
| `--text-3xl` | 2rem → 4.75rem |
| `--text-2xl` | 1.7rem → 3.25rem |
| `--text-xl` | 1.25rem → 2rem |
| `--text-lg` | 1.05rem → 1.35rem |
| `--text-base` | 0.95rem → 1.1rem |
| `--text-sm` | 0.78rem → 0.92rem |

### Règles typographiques
- Titres : Bricolage Grotesque, `font-weight: 500`, `letter-spacing: -0.02em`, `line-height: 1.02–1.05`
- Corps : Inter, `font-weight: 400`, `line-height: 1.55`
- Labels : Inter, `font-weight: 500`, `letter-spacing: 0.16em`, `text-transform: uppercase`, `font-size: 0.72rem`
- Folio (N°01/Série A) : Inter italic, `font-size: 0.7rem`, `letter-spacing: 0.04em`
- `.em-italic` : Bricolage Grotesque oblique, `color: var(--accent)` — jamais pour du texte fonctionnel, seulement pour l'accentuation éditoriale

## Espacement

Échelle de 4px : `--space-1` (0.25rem) → `--space-40` (10rem).
Padding section : `clamp(5rem, 12vh, 8rem)` via `.section`.

## Composants clés

### `.pilcrow` + `.fleur`
Ornement fleur-de-lis SVG custom (inline), `color: var(--accent)`. Séparateur de section et ponctuation dans les listes.

### `.reveal` / `.reveal-words`
Reveal au scroll **bidirectionnel** (façon Wibify) : `.reveal` part de `opacity: 0; translateY(22px)` et gagne `is-visible` (800ms `--ease`) à l'entrée du viewport ; à la sortie il se range vers le bord de sortie (`is-above` = `translateY(-18px)` après une sortie haute) en 480ms sans délai, puis rejoue au scroll inverse. Les grands titres `.reveal-words` sont éclatés en mots par `main.js` (spans `.rw`, stagger `--wi` × 70ms, +80ms/mot sur le hero) qui montent de `0.45em` en passant de `blur(6px)` au net — le nom accessible reste la phrase entière (`aria-label`). Sous reduced-motion : pas de découpage, reveal one-shot. Sans JS, `html:not(.js) .reveal` s'affiche directement et les `.rw` n'existent pas.

### Maquettes « captures d'écran » claires
`.mk--new` (aperçu « après » du comparateur) et `.journey__device` (aperçu animé du processus) **re-scopent des tokens clairs** localement : ce sont des captures de sites, pas le chrome du site, donc elles restent claires sur la page sombre. `#C2560E` y sert d'accent.

### Boutons
| Classe | Usage |
|---|---|
| `.btn--primary` | Ink (ivoire) fond, texte foncé → hover orange |
| `.btn--accent` | Orange fond, texte foncé — CTA principal |
| `.btn--ghost` | Transparent, bordure rule → hover ink |

Sur la carte tarif « featured » (ivoire), le bouton est forcé en **pill sombre** (charcoal + texte ivoire) : orange sur ivoire ne passe pas AA en texte.

### Navigation
- Header fixé, fond `--paper`, `z-index: 100`
- Breakpoint mobile : 960px — le nav desktop disparaît, hamburger apparaît
- Touch target bouton hamburger : 44×44px (WCAG 2.5.5)
- Skip link présent pour navigation clavier

## Breakpoints
| Largeur | Comportement |
|---|---|
| > 960px | Desktop — nav horizontal, layouts multi-colonnes |
| ≤ 960px | Tablet/Mobile — hamburger menu |
| ≤ 768px | Sections passent en colonne unique |
| ≤ 480px | Réductions typographiques et de padding |

## Anti-patterns

Ne jamais introduire :
- Gradients couleur décoratifs (violet/bleu → gradient)
- Cartes avec `border-radius` uniform élevé + drop-shadow décoratif
- Grid 3 colonnes symétriques avec icônes dans des cercles colorés
- `background: white` (#fff) sur la page — utiliser les tokens `--paper*` (le blanc est réservé aux maquettes « captures » scopées)
- Une seule police pour tout — Bricolage Grotesque (display) + Inter (corps), jamais l'inverse
- `color: #000` / `color: #fff` en dur — utiliser `var(--text)`, `var(--ink)`, `var(--paper)`
- Texte clair posé sur `--accent` (orange) — toujours `--text-inverse`

## Sections en recto/verso

| Section | Mode |
|---|---|
| Hero, Answer, Refonte, Journey, Examples, Pricing, About, FAQ, Footer | Recto (charcoal) |
| Pain (N°02), Contact (N°09) | Verso (near-black) |

Hero, bandeau Journey et About posent du texte clair sur **photo assombrie** (overlay `rgba(10-14, .., .5–.74)`), indépendamment du recto/verso.
