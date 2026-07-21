# Guide d’utilisation — Ressources Telecom

Hub personnel pour centraliser tes ressources **réseau & télécom** : liens web, PDF, configs, notes, tags et parcours d’étude.

**URL de production :** https://ressources-telecom-pearl.vercel.app

---

## 1. Connexion

1. Ouvre l’URL de l’application
2. Saisis ton **identifiant** et ton **mot de passe**
3. Clique **Se connecter**

Tu arrives sur le **Dashboard**.

Pour te déconnecter : icône **déconnexion** en haut à droite.

> Les identifiants sont ceux configurés dans Vercel (`AUTH_USERNAME` / `AUTH_PASSWORD`), pas ceux de TiDB ni de Google.

---

## 2. Vue d’ensemble des pages

| Page | À quoi ça sert |
|------|----------------|
| **Dashboard** | Stats (total, favoris, liens, fichiers) + ressources récentes |
| **Ressources** | Liste complète, recherche, filtres, pagination |
| **Favoris** | Ressources marquées d’une étoile |
| **Collections** | Parcours thématiques (ex. « Prépa CCNA ») |
| **Historique** | Dernières ressources ouvertes |
| **Catégories** | Créer / modifier / supprimer des catégories |
| **Paramètres** | Export / import JSON + rappels raccourcis |

La **sidebar** (à gauche) donne aussi accès aux catégories, collections et tags. Sur mobile : bouton menu (☰).

---

## 3. Ajouter une ressource

### Méthode rapide
- Bouton **Ajouter** (en haut)
- ou touche **`N`** (hors d’un champ de saisie)

### Type LINK (site web ou Google Drive)

1. Type → **LINK**
2. Colle l’**URL**
3. Remplis le **titre**
4. Choisis une **catégorie**
5. Ajoute des **tags** (séparés par des virgules), ex. `BGP, MPLS`
6. Description / notes (optionnel)
7. **Enregistrer**

**Pour un PDF sur Google Drive :**
1. Upload le fichier sur [drive.google.com](https://drive.google.com)
2. Partager → **Tous les utilisateurs disposant du lien** → Lecteur
3. Copier le lien
4. Dans l’app → type **LINK** → coller le lien

### Type FILE (upload depuis ton PC)

1. Type → **FILE**
2. Glisse le fichier ou clique pour le parcourir
3. Titre, catégorie, tags
4. **Enregistrer**

**Limites importantes :**
- Taille max ≈ **4,5 Mo** (limite Vercel)
- Formats : PDF, configs, docs, images…
- Au-delà de 4,5 Mo → utilise **LINK + Google Drive**

---

## 4. Bien organiser (bonne pratique)

À chaque ajout, remplis au minimum :

| Champ | Exemple |
|-------|---------|
| Titre | `TNS 2 - Cours traitement du signal` |
| Catégorie | Traitement du signal / Routage / … |
| Tags | `TNS, signal, cours` |
| Notes | Ce que tu veux retenir |

Sans catégorie ni tags, la recherche devient difficile.

---

## 5. Retrouver une ressource

| Méthode | Comment |
|---------|---------|
| **Recherche page** | Champ en haut sur **Ressources** |
| **Recherche globale** | `Ctrl+K` → tape un mot → Entrée |
| **Sidebar** | Clic sur une catégorie, un tag ou une collection |
| **Filtres** | Type (lien/fichier) + collection sur la page Ressources |
| **Favoris** | Étoile ⭐ sur une carte |
| **Historique** | Page Historique |

### Ouvrir une ressource
- Clic sur le **titre** → fiche détaillée
- Bouton **Ouvrir** → lien web, Drive, ou fichier uploadé

---

## 6. Favoris

Sur une carte ressource, clique l’**étoile** ⭐  
Les favoris sont accessibles via la sidebar **Favoris**.

---

## 7. Catégories

Page **Catégories** :
- **Créer** : nom + description
- **Modifier** : icône crayon
- **Supprimer** : icône poubelle

Ensuite, filtre depuis la sidebar en cliquant sur une catégorie.

---

## 8. Tags

Les tags se créent dans le formulaire ressource (liste séparée par des virgules).  
Ils apparaissent dans la sidebar : un clic filtre toutes les ressources portant ce tag.

---

## 9. Collections (parcours)

Une collection = un **parcours** ordonné de ressources (ex. révision d’examen).

### Créer une collection
1. Page **Collections**
2. Remplis le nom (et description si besoin)
3. Créer

### Remplir une collection
1. Ouvre la collection
2. Choisis une ressource dans la liste
3. **Ajouter**
4. Pour retirer : bouton supprimer à côté de la ressource

---

## 10. Fiche détaillée

`/resources/[id]` affiche :
- description, notes
- tags, favori
- collections liées
- dates (création, dernière consultation)

Tu peux **Modifier** ou **ouvrir** depuis cette page.  
Ouvrir une ressource met à jour l’**historique**.

---

## 11. Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+K` | Recherche globale (command palette) |
| `N` | Nouvelle ressource |

> `N` ne s’active pas si tu es déjà dans un champ texte.

---

## 12. Thème clair / sombre

Bouton thème en haut à droite (soleil / lune).  
Le choix suit aussi le thème système par défaut.

---

## 13. Sidebar

- **Réduire** (desktop) : bouton panneau dans le header → mode icônes
- **Mobile** : bouton ☰ → menu latéral

---

## 14. Sauvegarde : Export / Import

Page **Paramètres** :

### Export
Télécharge un fichier JSON avec catégories, tags, ressources, collections.  
À faire de temps en temps (copie de secours).

### Import
1. Glisse un fichier JSON exporté (ou choisis-le)
2. Les données sont **ajoutées** (pas d’écrasement total)
3. Attention : réimporter le même fichier peut créer des **doublons**

> L’export contient les **métadonnées** et liens/chemins, pas forcément une copie binaire de tous les fichiers.

---

## 15. Workflow recommandé au quotidien

1. Tu trouves un cours, un labo, un PDF utile  
2. Si PDF volumineux → Google Drive → lien  
3. Si fichier léger (< 4,5 Mo) → upload **FILE** depuis le PC  
4. Tu classes : catégorie + tags + notes  
5. Tu ranges dans une **collection** si c’est un parcours  
6. Tu retrouves plus tard avec `Ctrl+K` ou la sidebar  
7. Tu exportes de temps en temps depuis **Paramètres**

---

## 16. Ce qu’il ne faut pas faire

| À éviter | Pourquoi |
|----------|----------|
| Liens `file:///C:/...` | Bloqués par le navigateur depuis un site web |
| Upload FILE > 4,5 Mo | Limite Vercel → utiliser Drive |
| Type FILE sans Blob configuré | Échec d’upload |
| Réimport JSON en boucle | Doublons |
| Titres vagues (`doc1`, `pdf`) | Impossible à retrouver |

---

## 17. Dépannage rapide

| Problème | Solution |
|----------|----------|
| Impossible de se connecter | Vérifier identifiant / mot de passe Vercel |
| Upload échoue | Fichier < 4,5 Mo ; type FILE ; Blob Public configuré |
| Catégorie illisible | Rafraîchir (Ctrl+F5) après le dernier déploiement |
| Ressource introuvable | `Ctrl+K` ou filtre tag/catégorie |
| Fichier Drive inaccessible | Vérifier le partage « toute personne avec le lien » |

Diagnostic technique upload (admin) :  
`https://ressources-telecom-pearl.vercel.app/api/upload/health`

---

## 19. Fonctionnalités avancées

### Notes Markdown
Dans le formulaire ressource, édite tes notes en Markdown puis bascule en **Aperçu**.  
Sur la fiche détail, les notes sont rendues (titres, listes, liens, code).

### Actions groupées
Sur **Ressources** : coche plusieurs cartes → Favoris / Retirer favoris / Supprimer en masse.

### Filtres avancés
- Plage de dates (création)
- Multi-tags (`BGP, OSPF` = AND)
- Sans catégorie

### Ressources liées
Sur la fiche d’une ressource : suggestions basées sur la catégorie et les tags communs.

### Progression de parcours
Dans une **collection** : statut À faire / En cours / Terminé + barre de progression %.

### Aperçu embarqué
Sur la fiche : preview PDF, Google Drive et YouTube quand possible.

| Besoin | Action |
|--------|--------|
| Page web | Type **LINK** |
| PDF léger | Type **FILE** (PC → app) |
| PDF lourd | Drive → type **LINK** |
| Classer | Catégorie + tags |
| Parcours | Collection |
| Retrouver vite | `Ctrl+K` |
| Sauvegarder | Paramètres → Export |

**Drive / Blob = stockage des fichiers**  
**L’app = catalogue intelligent** (titres, notes, tags, parcours)
