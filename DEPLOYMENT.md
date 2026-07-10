# Guide de déploiement — Ressources Telecom

Stack de production :

| Élément | Service |
|---------|---------|
| Code | GitHub |
| Application Next.js | Vercel |
| Base MySQL | TiDB Cloud Starter (gratuit) |
| Fichiers uploadés (optionnel) | Vercel Blob |

> **Note :** Railway a été écarté (plan gratuit saturé / payant). On utilise TiDB + Vercel.

---

## Prérequis

- Compte [GitHub](https://github.com)
- Compte [TiDB Cloud](https://tidbcloud.com)
- Compte [Vercel](https://vercel.com) (lié au même GitHub)
- Repo poussé : `samsopn/ressources_telecom`
- Ne **jamais** committer le fichier `.env`

---

## Étape 1 — Pousser le code sur GitHub

```powershell
cd "c:\Users\Admin\OneDrive\Desktop\ressources_telecom"
git status
git add .
git commit -m "Prepare for deployment"
git push origin main
```

Vérifier que `.env` est bien ignoré (présent dans `.gitignore`).

---

## Étape 2 — Créer la base MySQL (TiDB Cloud)

1. Aller sur [https://tidbcloud.com](https://tidbcloud.com) et se connecter.
2. **My TiDB** → **Create Resource**.
3. Choisir le plan **Starter** (`From $0/month`).
   - ⚠️ Ne pas choisir **Essential** (~480 $/mois).
4. Remplir :
   - **Instance / Cluster name** : `ressources-telecom`
   - **Region** : `Frankfurt (eu-central-1)` (ou une région Europe)
5. Créer et attendre le statut **Available / Active**.

### Récupérer les identifiants

1. Ouvrir le cluster → bouton **Connect**.
2. **Connect With** : `General`
3. **Generate Password** → **copier immédiatement** (il ne sera plus affiché).
4. Noter :

| Champ | Exemple |
|-------|---------|
| Host | `gateway01.eu-central-1.prod.aws.tidbcloud.com` |
| Port | `4000` |
| Username | `xxxxx.root` |
| Password | (celui généré) |
| Database affichée | `sys` → **ne pas l’utiliser** |

### Créer la base applicative

Dans le cluster → **SQL Editor** / Chat2Query :

```sql
CREATE DATABASE IF NOT EXISTS ressources_telecom;
SHOW DATABASES;
```

### Autoriser Vercel (IP Access)

1. Cluster → **Networking** / **Public Endpoint** / **Authorized Networks**.
2. Ajouter une règle :
   - **Name** : `Allow_all_public_connections`
   - **Start IP** : `0.0.0.0`
   - **End IP** : `255.255.255.255`
3. **Submit**.

Sans cette règle, Vercel ne pourra pas se connecter à TiDB.

---

## Étape 3 — Déployer sur Vercel

1. Aller sur [https://vercel.com/new](https://vercel.com/new).
2. Importer le repo **`samsopn/ressources_telecom`**.
3. **Avant** de cliquer Deploy, ouvrir **Environment Variables**.

### Variables d’environnement à ajouter

Remplacer les placeholders par tes vraies valeurs TiDB :

```text
DATABASE_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DATABASE_PORT=4000
DATABASE_USER=2ZrnkVaohNEEXUi.root
DATABASE_PASSWORD=MOT_DE_PASSE_TIDB
DATABASE_NAME=ressources_telecom
DATABASE_SSL=true
DATABASE_URL=mysql://2ZrnkVaohNEEXUi.root:MOT_DE_PASSE_TIDB@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/ressources_telecom?sslaccept=strict
AUTH_SECRET=SECRET_ALEATOIRE
AUTH_USERNAME=admin
AUTH_PASSWORD=MOT_DE_PASSE_APP
```

### Générer `AUTH_SECRET` (en local)

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Points critiques pour `DATABASE_URL`

- Base = `ressources_telecom` (**pas** `sys`)
- Ajouter `?sslaccept=strict` à la fin (obligatoire pour Prisma Migrate + TiDB)
- Si le mot de passe TiDB contient `@`, `#`, `%`, `/`, `+`, etc. → l’encoder dans l’URL

Encoder un mot de passe (PowerShell) :

```powershell
node -e "console.log(encodeURIComponent('TON_MOT_DE_PASSE'))"
```

Puis utiliser la version encodée **uniquement** dans `DATABASE_URL`.

4. Cliquer **Deploy**.

Le build exécute (via `vercel.json`) :

```text
prisma generate && prisma migrate deploy && next build
```

Les tables Prisma sont créées automatiquement au premier déploiement.

---

## Étape 4 — Première connexion

1. Ouvrir l’URL Vercel fournie après le deploy.
2. Page `/login`.
3. Se connecter avec :
   - **Identifiant** = valeur de `AUTH_USERNAME`
   - **Mot de passe** = valeur de `AUTH_PASSWORD`

### Ne pas confondre les mots de passe

| Variable | Mot de passe | Usage |
|----------|--------------|--------|
| `DATABASE_PASSWORD` | Généré par **TiDB** | Connexion à la base |
| `AUTH_PASSWORD` | **Choisi par toi** | Login de l’application |

---

## Étape 5 — Importer tes données locales (optionnel)

La base cloud est vide au départ (ce n’est pas ta base XAMPP).

1. En local : **Paramètres → Export** (fichier JSON).
2. En production : **Paramètres → Import** du même fichier.

---

## Étape 6 — Upload de fichiers (Vercel Blob Public)

Sur Vercel, le disque local est éphémère. Pour uploader des PDF depuis ton PC :

1. Projet Vercel → **Storage** → **Create** → **Blob**
2. Choisis **Public** (pas Private)
3. Relie au projet `ressources-telecom`
4. Dans **Environment Variables**, vérifie :
   - `BLOB_READ_WRITE_TOKEN` = token du store (onglet `.env.local`)
   - `BLOB_ACCESS` = `public`
5. **Deployments** → **Redeploy**
6. Teste un fichier **< 4,5 Mo**

Diagnostic : ouvre `/api/upload/health`  
Tu dois voir `"blobAccess":"public"` et `"hasReadWriteToken":true`.

Sans Blob, utilise type **LINK** + Google Drive.

---

## Checklist finale

- [ ] Repo GitHub à jour (`main`)
- [ ] Cluster TiDB **Starter** créé et Available
- [ ] Base `ressources_telecom` créée
- [ ] IP Access `0.0.0.0` → `255.255.255.255`
- [ ] Variables Vercel renseignées (surtout `DATABASE_URL` + `sslaccept=strict`)
- [ ] Build Vercel OK
- [ ] Login `/login` OK
- [ ] (Optionnel) Import JSON des données
- [ ] (Optionnel) Vercel Blob activé

---

## Dépannage

### Erreur `Schema engine error` / `prisma migrate deploy` échoue

Causes fréquentes :

1. `DATABASE_URL` sans `?sslaccept=strict`
2. Mauvaise base (`sys` au lieu de `ressources_telecom`)
3. Mot de passe TiDB incorrect ou caractères spéciaux non encodés
4. IP Access non ouvert (`0.0.0.0/0`)
5. Base `ressources_telecom` non créée

Corriger les variables dans **Vercel → Settings → Environment Variables**, puis **Redeploy**.

### Mot de passe TiDB perdu

TiDB → cluster → **Connect** → **Reset / Generate Password**, puis mettre à jour `DATABASE_PASSWORD` et `DATABASE_URL` sur Vercel.

### Identifiants de login oubliés

Vercel → **Settings → Environment Variables** → regarder `AUTH_USERNAME` et `AUTH_PASSWORD`.

---

## Identifiants locaux (dev uniquement)

Fichier `.env` local (XAMPP) — **ne pas utiliser en production** :

```text
AUTH_USERNAME=admin
AUTH_PASSWORD=admin
```

En production, utiliser uniquement les valeurs définies dans Vercel.
