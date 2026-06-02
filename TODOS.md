# TODOS — Marking Studio

Actions prioritaires avant lancement en production.

---
✅ Dossier prêt : c:\Users\King\Documents\Projet_Site_Marking_Studio\deploy-ovh\ (882 Ko). Tout ce qui est dedans doit aller dans le www d'OVH — rien d'autre.

## Étape 1 — Envoyer le site avec FileZilla
Installe FileZilla Client (gratuit) : filezilla-project.org
En haut de FileZilla, remplis la barre de connexion rapide :
Hôte : ftp.cluster129.hosting.ovh.net
Identifiant : markinn
Mot de passe : (le tien)
Port : 22
Clique Connexion rapide
(S'il propose un certificat TLS, accepte / « OK ».)
Une fois connecté :
Panneau de droite = le serveur OVH. Double-clique sur le dossier www pour entrer dedans.
Panneau de gauche = ton ordinateur. Va dans Documents\Projet_Site_Marking_Studio\deploy-ovh
Dans le panneau de gauche, sélectionne tout (Ctrl+A) → clic droit → Envoyer (ou glisse-dépose vers la droite).
Attends que tout soit transféré (quelques secondes, 882 Ko).
➡️ Vérifie qu'à droite, dans www, tu as bien : index.html, les 2 autres .html, robots.txt, sitemap.xml, et les dossiers css, js, images, assets.

## Étape 2 — Basculer le domaine vers OVH (DNS)
Domaine chez OVH, donc c'est automatique :

Espace client OVH → Hébergements → ton hébergement → onglet Multisite
Ajouter un domaine → markingstudio.fr, dossier racine : www → valider
DNS vers ton hébergement (51.91.236.255 / 2001:41d0:301::29). Accepte.
La propagation DNS prend de quelques minutes à quelques heures. Pendant ce temps, OVH te donne une URL de test temporaire (du type markinn.cluster129.hosting.ovh.net) pour vérifier le site tout de suite.


### 2. Créer les pages légales (LCEN)
**Quoi :** Créer `mentions-legales.html` et `confidentialite.html` maintenant. `cgv.html` est **bloqué** jusqu'à réception du SIRET + adresse postale du fondateur (une CGV sans SIRET publiée n'est pas juridiquement valide).
**Pourquoi :** Obligatoire en France pour tout site de services payants (LCEN art. 6). Liens actuels pointent vers `#`.
**Contenu minimum :**
- Mentions légales : raison sociale, adresse, SIRET, hébergeur
- Politique de confidentialité : données collectées, durée conservation 3 ans, droits RGPD, Formspree comme sous-traitant
- CGV : **débloquer quand le fondateur fournit SIRET + adresse**. Utiliser un template freelance français validé (pas rédiger from scratch).

**Fichiers à lier :**
- `index.html` footer : lien Mentions légales → `mentions-legales.html`, Confidentialité → `confidentialite.html`, CGV reste `href="#"` en attendant
- `index.html` formulaire : lien "politique de confidentialité" dans la checkbox RGPD → `confidentialite.html`

---

---

## 🟠 POST-LANCEMENT — À surveiller après mise en ligne

### 6. Surveillance spam Formspree + upgrade si besoin
**Quoi :** Vérifier le dashboard Formspree chaque semaine après lancement. Si du spam bot est détecté (quota 50 soumissions/mois atteint prématurément), upgrader vers le plan payant (~10€/mois) qui inclut un CAPTCHA.
**Pourquoi :** Formspree gratuit a uniquement une protection honeypot basique. Un bot peut vider le quota mensuel en minutes, bloquant les vrais leads pour le mois.
**Comment :** Dashboard Formspree → onglet "Submissions" → vérifier les soumissions suspectes (pas de nom réel, contenu générique). Si >5 spams/semaine, upgrader.
**Priorité :** P2 — surveiller, pas bloquant. Risque faible au lancement avec peu de trafic.
**Dépend de :** Formspree activé (TODO #1)

---

### 7. Liens sociaux footer — rétablir quand profils confirmés
**Quoi :** La colonne "Suivre" (Instagram, LinkedIn, Behance) a été retirée du footer car tous les liens pointaient vers `#` (liens morts en production). La rétablir quand le fondateur confirme les URLs réelles.
**Pourquoi :** Liens morts sur un site vitrine professionnel = signal de qualité négatif pour un studio qui vend la qualité.
**Comment :** Ajouter dans `index.html` footer la colonne `footer__col` avec les `<li>` des 3 plateformes, URLs réelles.
**Priorité :** P3 — à faire quand les profils existent.

---

## 🟡 AMÉLIORATIONS — Sprint suivant

### 3. Redesign complet section Pricing
**Quoi :** Remplacer le grid 3 colonnes symétriques par un layout éditorial (ex: présentation horizontale des 3 Séries comme éditions numérotées).
**Pourquoi :** Le pattern 3 cartes = signal AI slop classique, en contradiction directe avec le message "sur mesure" du studio.
**Effort estimé :** ~2h (human) / ~15min (Claude Code)

### 4. Portfolio réel (section Réalisations)
**Quoi :** Remplacer les mock-browsers CSS par de vraies captures de projets livrés.
**Pourquoi :** C'est l'étape du tunnel où la confiance doit être gagnée. Les mocks CSS ne prouvent rien.
**Note :** À faire au fur et à mesure des premiers projets livrés.

### 5. Configurer une clé OpenAI pour les mockups visuels gstack
**Quoi :** `~/.claude/skills/gstack/design/dist/design setup` puis ajouter la clé dans `~/.gstack/openai.json`
**Pourquoi :** Permettra de générer des maquettes visuelles via `/design-html` et `/design-shotgun`
