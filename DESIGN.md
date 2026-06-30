# DESIGN.md — Marking Studio

Design system extrait de `css/base.css` et `css/style.css`. Ce fichier est la référence pour tout futur travail de design ou génération de maquettes.

## Concept

**Recto / Verso** — inspiré d'une carte de visite imprimée sur papier crème. La page alterne entre sections claires (recto) et sections encre sombre (verso). Ce rythme est l'identité visuelle centrale du studio. Ne jamais appliquer un thème sombre global.

## Couleurs

### Recto (défaut page)
| Token | Valeur | Usage |
|---|---|---|
| `--paper` | `#F2EDE1` | Fond principal |
| `--paper-soft` | `#EBE5D6` | Fond secondaire |
| `--paper-deep` | `#E2DBC8` | Tranche de carte |
| `--ink` | `#0E0F12` | Texte principal / fond verso |
| `--text` | `#14151A` | Corps de texte |
| `--text-muted` | `#5B5A55` | Texte secondaire (5.92:1 sur crème) |
| `--text-faint` | `#66645C` | Texte discret (5.07:1 sur crème — AA). Discrétion portée par la taille + le tracking, pas par un faible contraste |
| `--accent` | `#C44A38` | Corail signature — logo, `.em-italic`, ornements |
| `--rule` | `#C9C1AC` | Traits horizontaux |

### Verso (sections `data-section="verso"`)
| Token | Valeur |
|---|---|
| `--paper` | `#0E0F12` |
| `--ink` | `#F2EDE1` |
| `--accent` | `#D8604F` |

**Règle absolue :** `--accent` est la seule couleur décorative. Pas d'autres couleurs introduites sans décision explicite.

## Typographie

| Variable | Famille | Usage |
|---|---|---|
| `--font-display` | Lora (Google Fonts) | Titres H1–H3, `.em-italic` |
| `--font-body` | Inter (Google Fonts) | Corps, UI, labels, navigation |

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
- Titres : Lora, `font-weight: 500`, `letter-spacing: -0.02em`, `line-height: 1.02–1.05`
- Corps : Inter, `font-weight: 400`, `line-height: 1.55`
- Labels : Inter, `font-weight: 500`, `letter-spacing: 0.16em`, `text-transform: uppercase`, `font-size: 0.72rem`
- Folio (N°01/Série A) : Inter italic, `font-size: 0.7rem`, `letter-spacing: 0.04em`
- `.em-italic` : Lora italic, `color: var(--accent)` — jamais utilisé pour du texte fonctionnel, seulement pour l'accentuation éditoriale

## Espacement

Échelle de 4px : `--space-1` (0.25rem) → `--space-40` (10rem).
Padding section : `clamp(5rem, 12vh, 8rem)` via `.section`.

## Composants clés

### `.pilcrow` + `.fleur`
Ornement fleur-de-lis SVG custom (`assets/fleur.svg`), `color: var(--accent)`. Utilisé comme séparateur de section et ponctuation dans les listes.

### `.reveal`
Animation d'entrée au scroll : `opacity: 0; transform: translateY(14px)` → `is-visible` via IntersectionObserver. Tous les blocs de contenu principaux portent cette classe.

### Boutons
| Classe | Usage |
|---|---|
| `.btn--primary` | Ink fond, paper texte → hover coral |
| `.btn--accent` | Coral fond — CTA principal |
| `.btn--ghost` | Transparent, bordure rule → hover ink |

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
- Gradients couleur (ni violet, ni bleu → gradient)
- Cartes avec `border-radius` uniform élevé + drop-shadow décoratif
- Grid 3 colonnes symétriques avec icônes dans des cercles colorés
- `background: white` (#fff) — utiliser `var(--paper)` uniquement
- Inter ou système comme police de display — Lora seulement pour les titres
- `color: #000` ou `color: black` — utiliser `var(--text)` ou `var(--ink)`

## Sections à concevoir en recto/verso

| Section | Mode |
|---|---|
| Hero, Answer, Journey, Examples, Pricing, About, FAQ | Recto (crème) |
| Pain (N°02), Contact (N°09) | Verso (encre sombre) |
| Footer | Recto avec `border-top: 1px solid var(--rule)` |
