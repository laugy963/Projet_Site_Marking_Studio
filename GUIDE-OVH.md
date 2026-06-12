# Mettre le site en ligne sur OVH (hébergement web / Cloud Web)

Le dossier **`ovh-deploy/`** contient tout ce qu'il faut, et **uniquement** ce qu'il faut,
pour le site en production. Il suffit de copier **son contenu** dans le dossier `www` de l'hébergement.

## Contenu du dossier
```
index.html
confidentialite.html
mentions-legales.html
robots.txt
sitemap.xml
.htaccess            ← force le HTTPS (fichier caché, à ne pas oublier !)
css/   (base.css, style.css)
js/    (main.js)
images/ (8 images .webp)
assets/ (favicon.svg, fleur.svg)
```

## Méthode 1 — FTP (FileZilla, recommandé)
1. Récupérer les identifiants FTP dans l'espace client OVH :
   **Hébergements → votre hébergement → FTP-SSH** (serveur, identifiant, mot de passe).
2. Dans FileZilla : Hôte `ftp.cluster0XX.hosting.ovh.net`, identifiant, mot de passe, port 21.
3. Côté serveur, entrer dans le dossier **`www`**.
4. **Important** : activer l'affichage des fichiers cachés
   (FileZilla → menu *Serveur* → *Forcer l'affichage des fichiers cachés*),
   sinon le `.htaccess` ne sera pas transféré.
5. Glisser **tout le contenu** de `ovh-deploy/` (pas le dossier lui‑même) dans `www`.
6. Si un ancien `index.html` est déjà présent, le remplacer.

## Méthode 2 — Gestionnaire de fichiers OVH
Espace client OVH → *Explorateur de fichiers* (ou via l'archive ci‑dessous) :
téléverser `ovh-deploy.zip`, puis l'extraire dans `www` et déplacer son contenu à la racine de `www`.

## Une fois en ligne — à vérifier
- [ ] Le domaine `markingstudio.fr` pointe bien vers l'hébergement OVH (zone DNS → enregistrement A / cible).
- [ ] Le **certificat SSL** est activé (OVH → onglet *Multisite* / *SSL*). Le `.htaccess` force déjà la redirection HTTP → HTTPS.
- [ ] Ouvrir `https://markingstudio.fr/` : page d'accueil, images, polices et formulaire OK.
- [ ] Tester `https://markingstudio.fr/mentions-legales.html` et `/confidentialite.html`.

## Notes
- Le fichier **`CNAME`** (présent à la racine du projet) sert uniquement à GitHub Pages :
  **ne pas** le copier sur OVH, il est inutile ici.
- Le formulaire de contact est **front‑end uniquement** (il simule un envoi).
  Pour recevoir réellement les messages, il faudra brancher un backend / service d'envoi d'e‑mail.
