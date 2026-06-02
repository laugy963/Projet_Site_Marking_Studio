---
status: PROMOTED
source: ~/.gstack/projects/laugy963-Projet_Site_Marking_Studio/ceo-plans/2026-05-23-marking-studio-lancement.md
promoted: 2026-05-23
---
# CEO Plan : Marking Studio — Lancement v1
*Généré par /plan-ceo-review le 2026-05-23*
*Branche : main | Mode : SELECTIVE EXPANSION*
*Repo : laugy963-Projet_Site_Marking_Studio*

---

## Vision

### 10x Check
Marking Studio à horizon 12 mois : 6-8 projets livrés, portfolio réel avec captures et témoignages, positionnement "un seul projet à la fois" devenu la signature connue dans le réseau local. L'acquisition passe par 50% referral réseau + 30% SEO local + 20% LinkedIn. Le site lui-même est le meilleur argument de vente — chaque visiteur peut voir que "c'est comme ça que vos clients vous verront".

### Plateau idéal
Un visiteur PME atterrit sur le site et pense : "Ces gens font vraiment ce qu'ils disent — un seul projet à la fois, code propre qui dure." Il voit des exemples réels (pas des mocks), un prix transparent, et un bouton "Appel 20min" qui lui évite de remplir un formulaire. Il prend contact. L'appel confirme la qualité humaine. Il signe dans la semaine.

---

## Scope Decisions

| # | Proposition | Effort | Décision | Raison |
|---|-------------|--------|----------|--------|
| 1 | Formspree + activation formulaire | XS | ACCEPTÉE (Approche B) | Bloquant critique |
| 2 | Pages LCEN (3 fichiers HTML) | S | ACCEPTÉE (Approche B) | Obligation légale |
| 3 | CTA "Appel 20min" (tel:) | XS | ACCEPTÉE (Approche B) | Baisse friction prospects |
| 4 | Copy hero "Un seul projet à la fois" | S | ACCEPTÉE (cherry-pick 2) | Différenciation réelle |
| 5 | Monter Série A à €1,990 | XS | ACCEPTÉE (cherry-pick 1) | Ancre prix studio vs freelance |
| 6 | Définir 1 canal acquisition primaire | S | ACCEPTÉE (cherry-pick 3) — action fondateur | Inbound seul = vitrine morte |
| 7 | Redesign section Pricing (éditorial) | M | DÉFÉRÉE | Après premier contact, valider le pricing d'abord |
| 8 | Portfolio réel (captures projets livrés) | XL | DÉFÉRÉE | Dépend du premier projet livré (trigger : M3) |
| 9 | Blog/SEO contenu | L | DÉFÉRÉE | Pas avant validation canal inbound (trigger : M2) |

## Accepted Scope (tâches développeur)

### 1. Formspree — activation formulaire
- Créer compte sur formspree.io → créer un formulaire → copier l'identifiant (ex: `xrgjqpvb`)
- Dans `index.html` L.~944, remplacer `VOTRE_ID_FORMSPREE` par le vrai identifiant
- **Aucun changement JS requis** — `fetch(form.action, …)` est déjà implémenté et fonctionnel dans `js/main.js` (lignes 135-158). Seul l'attribut `action` dans le HTML doit changer.
- Tester : soumettre le formulaire et vérifier la réception email
- Note : Formspree gratuit = 50 soumissions/mois — suffisant au lancement

### 2. Pages LCEN — 2 fichiers maintenant, cgv.html bloqué
Créer `mentions-legales.html` et `confidentialite.html` avec header+footer complets (même navigation que index.html). Les lier depuis le footer et la checkbox RGPD du formulaire.

**`cgv.html` est bloqué** jusqu'à réception du SIRET et adresse postale du fondateur. Une CGV sans SIRET publiée en production est juridiquement vide et donne une fausse impression de conformité. Le lien CGV dans le footer reste `href="#"` en attendant.

Contenu minimum obligatoire par page :

**mentions-legales.html** (LCEN art. 6) :
- Raison sociale ou nom du responsable de publication
- Adresse postale complète
- SIRET (ou déclaration micro-entreprise)
- Adresse email de contact
- Hébergeur : nom, adresse, numéro de téléphone

**confidentialite.html** (RGPD) :
- Identité du responsable de traitement
- Données collectées (nom, email, message) et finalité
- Durée de conservation (recommandé : 3 ans)
- Droits des personnes (accès, rectification, suppression) + contact pour exercice
- Mention Formspree comme sous-traitant

### 3. CTA découverte — lien tel:
- Numéro déjà présent dans le HTML (`+33651390126`) — ajouter le **bouton** CTA avec ce numéro
- Dans la section pricing : ajouter `<a href="tel:+33651390126" class="btn btn--accent">Réserver un appel 20 min</a>` **après** le `pricing__note` (ligne ~663), pas à l'intérieur des cartes — elles ont déjà un CTA chacune
- Dans la section contact : ajouter le même bouton sous les coordonnées info (après l'info `Téléphone`) pour un accès rapide sans formulaire
- Approche par défaut : `tel:` (zéro dépendance, fonctionne immédiatement)
- Alternative future : remplacer par lien Calendly si le fondateur crée un compte

### 4. Copy hero — remplacement du claim
- Remplacer le `<h1>` hero actuel par la phrase directrice : **"Un seul projet à la fois."**
- Le sous-titre hero peut être affiné mais ce point est à valider par le fondateur avant implémentation
- **Structure HTML** : supprimer les 4 `<span class="hero__title-line">` actuels, les remplacer par exactement 2 :
  ```html
  <span class="hero__title-line">Un seul projet</span>
  <span class="hero__title-line"><span class="em-italic">à la fois.</span></span>
  ```
- L'ornement `.em-italic` (Lora italic, corail) s'applique à "à la fois." — partie mémorable de la promesse

### 5. Série A — mise à jour du prix
- Prix affiché passe de **€1,490** à **€1,990** (prix fixe, pas "à partir de")
- Modifier dans `index.html` : la carte Série A (texte affiché)
- Modifier dans le `<script type="application/ld+json">` dans `<head>` : champ `offers[0].price` → `"1990"`
- Les deux doivent être mis à jour simultanément (CLAUDE.md le rappelle)
- **Après modification** : valider le schéma complet via Google Rich Results Test pour s'assurer qu'il n'y a pas d'autres champs de prix dans le JSON-LD

### 6. alert() → message inline (js/main.js)
- **Dans `index.html`** : ajouter entre le bouton submit (ligne ~1005) et `#formSuccess` (ligne 1007) :
  ```html
  <div id="formSubmitError" class="form-error" role="alert" hidden></div>
  ```
- **Dans `js/main.js`** : remplacer `alert('Une erreur...')` (ligne 150) et `alert('Impossible...')` (ligne 156) par :
  ```js
  const errDiv = document.getElementById('formSubmitError');
  errDiv.textContent = 'MESSAGE';
  errDiv.hidden = false;
  ```
  Réinitialiser `errDiv.hidden = true` au début du prochain submit.
- Cohérent avec le pattern `#formSuccess` existant (div statique cachée dans le HTML) et les erreurs de champ

### 7. Correctif données contact (ajouté par /plan-eng-review)
- `index.html:172` (hero sig) : `marking.com` → `markingstudio.fr`
- `index.html:935` (section contact "En ligne") : `marking.com` → `markingstudio.fr`
- `index.html:931` (section contact) : transformer `<a href="mailto:contact@marking.com">contact@marking.com</a>` en texte simple `contact@marking.com` — le lien mailto: reste placeholder jusqu'à confirmation de l'email réel
- JSON-LD `"email"` field : laisser en l'état (Unresolved) jusqu'à confirmation

### 8. Retrait liens sociaux non confirmés (ajouté par /plan-eng-review)
- `index.html:1062-1065` : supprimer les 3 `<li>` Instagram/LinkedIn/Behance (tous `href="#"`) — liens morts en production
- La colonne "Suivre" du footer peut être supprimée entièrement ou conservée vide ; préférence : supprimer toute la colonne pour ne pas laisser des headers sans contenu

---

## Founder Actions (hors scope développeur)

- **Canal acquisition primaire** : choisir et activer l'un de : LinkedIn outreach direct / réseau experts-comptables / Google My Business.
- **Template CGV** : trouver un template freelance français validé avant que le développeur rédige `cgv.html`.
- **Surveillance Formspree** : vérifier le dashboard Formspree chaque semaine après lancement — upgrader vers un plan payé (~10€/mois) si du spam bot est détecté.

## Déploiement

À compléter par le fondateur — voir section Unresolved.

Checklist post-déploiement :
1. Visiter `https://markingstudio.fr/mentions-legales.html` — contenu visible
2. Visiter `https://markingstudio.fr/confidentialite.html` — contenu visible
3. ~~Visiter `https://markingstudio.fr/cgv.html`~~ — **bloqué, lien footer reste `#`**
4. Soumettre le formulaire de contact → vérifier réception email via Formspree
5. Cliquer le CTA `tel:` sur mobile → vérifier que le bon numéro s'ouvre (+33651390126)
6. Vérifier que la Série A affiche bien **1 990 €** sans "à partir de", que B et C gardent "à partir de"
7. Valider le JSON-LD via Google Rich Results Test
8. Vérifier que le hero affiche "Un seul projet" ligne 1 + "à la fois." en corail ligne 2
9. Vérifier que hero sig et contact affichent `markingstudio.fr` (pas `marking.com`)

---

## Deferred to TODOS.md

| Item | Trigger |
|------|---------|
| Redesign pricing section | Après premier contact PME réel |
| Portfolio réel | M3 — premier livrable client livré |
| Blog SEO | M2 — après ≥1 devis envoyé (canal inbound validé) |
| Copy complet redesign | Itérer sur les premiers retours terrain |

---

## NOT in scope (décisions explicites de report)

| Item | Raison |
|------|--------|
| `cgv.html` | Bloqué jusqu'à SIRET + adresse postale du fondateur — une CGV sans identification est juridiquement vide |
| Liens sociaux footer | Supprimés — pas de profils confirmés au lancement ; à rétablir quand les URLs sont disponibles |
| Redesign section Pricing | Après premier contact PME réel |
| Portfolio réel | M3 — premier livrable client livré |
| Blog SEO | M2 — après ≥1 devis envoyé |

## What already exists (code réutilisé par ce plan)

| Élément | Fichier | Notes |
|---------|---------|-------|
| `fetch(form.action, …)` complet | `js/main.js:135-158` | Opérationnel — seul l'attribut `action` HTML bloque |
| `.form-error` pattern (erreurs de champ) | `js/main.js:87-100` | Modèle pour la div `#formSubmitError` |
| `#formSuccess` div statique cachée | `index.html:1007` | Modèle architectural pour `#formSubmitError` |
| Numéro de téléphone `+33651390126` | `index.html:927, 1054` | Déjà en production ; le CTA ajoute le bouton `.btn--accent`, pas un nouveau numéro |

## Unresolved (à résoudre avant implémentation)

- **Texte final du `<h1>` hero** : "Un seul projet à la fois." est l'angle confirmé. Phrasing exact à valider par le fondateur.
- **Données légales LCEN** : SIRET, adresse postale, email de contact, coordonnées de l'hébergeur. Le SIRET débloque aussi `cgv.html`.
- **Email de contact** : `contact@marking.com` est affiché en texte simple après ce sprint. Quand l'adresse réelle est confirmée, mettre à jour : `index.html:931` (texte + restaurer le `<a href="mailto:...">`) et `index.html` JSON-LD `"email"` field.
- **Méthode de déploiement** : FTP, git push, Netlify drag-drop, panneau OVH/Infomaniak ?
- **Template CGV** : fournir un template freelance français validé avant la rédaction de `cgv.html` (débloqué quand SIRET disponible).

---

## Indicateurs de succès

| Semaine | Indicateur | Verdict |
|---------|-----------|---------|
| S1 | Formulaire fonctionnel + LCEN en ligne | ✅ Aucun lead perdu techniquement |
| M1 | ≥1 contact reçu | ✅ Canal inbound validé |
| M2 | ≥1 devis envoyé | ✅ Funnel complet fonctionnel |
| M3 | 1er projet livré | ✅ Portfolio réel disponible |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | issues_open* | 6 proposals, 6 accepted, 3 deferred |
| Outside Voice | `/plan-eng-review` | Independent 2nd opinion | 2 | issues_found† | 6 findings, 3 resolved, 3 non-actions |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 9 issues found, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score: 6/10 → 8/10, 5 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

\* CEO issues_open = 5 founder-action Unresolveds (SIRET, phone, email) — not developer blockers
† Outside voice: CGV blocking, email placeholder, social links — all resolved this session

- **UNRESOLVED:** 0 developer decisions open
- **VERDICT:** ENG CLEARED — ready to implement
