# Gestion des Guides Touristiques — Sénégal

Application web front-end développée avec **Angular** pour consulter, rechercher, filtrer et administrer un répertoire de guides touristiques au Sénégal. Toutes les données sont **fictives** et n'ont qu'un but pédagogique.

## Capture d'écran

![Aperçu de l'application](capture-ecran.png)

## Fonctionnalités

- **Tableau de bord** : nombre total de guides et répartition par statut (Disponible, En mission, Indisponible).
- **Répertoire en cartes responsive** : nom, prénom, spécialité, région, téléphone, e-mail, note formatée avec un pipe et badge de statut.
- **Recherche et filtres** : recherche par nom, prénom ou spécialité (insensible à la casse et aux accents), filtres par région et par statut, filtres rapides, bouton de réinitialisation et message explicite quand aucun guide ne correspond.
- **Formulaire CRUD** : ajout, modification et suppression (avec confirmation) d'un guide, champs obligatoires, validation de l'e-mail, du téléphone, des longueurs minimales et de la note, messages de succès ou d'erreur.
- **Données de démonstration** : 8 guides fictifs, sauvegardés dans le `localStorage`, avec un bouton pour les rétablir.
- **Accessibilité** : champs reliés à leurs labels, navigation au clavier, focus visible.

## Architecture du code

| Fichier | Rôle |
|---|---|
| `src/main.ts` | Point d'entrée : démarre l'application avec le composant racine `App` et la configuration `app.config.ts`. |
| `src/app/app.config.ts` | Configuration globale des fournisseurs (providers) de l'application. |
| `src/app/app.routes.ts` | Configuration des routes (application sur une seule page). |
| `src/app/app.ts`, `app.html`, `app.css` | Composant racine : assemble la liste et le formulaire, calcule les statistiques, affiche les notifications. |
| `src/app/models/guide-touristique.ts` | Interface `GuideTouristique`, type `StatutGuide`, listes `REGIONS` et `STATUTS`, type `ResultatOperation`. |
| `src/app/services/guide.ts` | Service injectable : état des guides (RxJS), opérations CRUD, persistance `localStorage`, données de démonstration. |
| `src/app/components/guide-list/` | Composant de liste : recherche, filtres, cartes, état vide, confirmation de suppression. |
| `src/app/components/guide-form/` | Composant de formulaire : ajout et modification avec validations. |
| `src/index.html`, `src/styles.css` | Page hôte et styles globaux. |
| `angular.json`, `package.json` | Configuration du projet et dépendances. |

## Prérequis

- **Node.js** (version LTS) et **npm**
- **Angular CLI** : `npm install -g @angular/cli`

## Installation et lancement

```bash
# 1. Se placer dans le dossier du projet
cd gestion-guides-touristiques

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
ng serve
```

Ouvrir ensuite **http://localhost:4200** dans le navigateur (`ng serve -o` l'ouvre automatiquement).

Pour générer la version de production : `ng build`.

## Bibliothèques et ressources externes

- **Angular** (composants standalone, formulaires, pipes) et **RxJS** pour l'état réactif.
- **TypeScript** pour le typage.
- Aucune bibliothèque d'interface externe : les styles sont écrits en CSS. Les données sont fictives (e-mails en `example.org`).

## Limites de la solution

1. **Données stockées uniquement dans le `localStorage`** : elles restent dans un seul navigateur, ne sont pas partagées entre plusieurs agents et peuvent être effacées.
2. **Validation uniquement côté client** : elle ne remplace pas une validation côté serveur. Il n'y a pas non plus d'authentification, donc n'importe qui peut modifier ou supprimer les fiches.

## Évolution possible vers une API REST

Remplacer le `localStorage` par un service qui utilise `HttpClient` et appelle une API REST :

- `GET /api/guides` : lister les guides
- `POST /api/guides` : ajouter
- `PUT /api/guides/:id` : modifier
- `DELETE /api/guides/:id` : supprimer

Seul `GuideService` serait modifié : ses méthodes renverraient des `Observable` issus de `HttpClient`, et les composants resteraient presque identiques. Le serveur ajouterait la validation des données, l'authentification des agents et une base de données partagée.