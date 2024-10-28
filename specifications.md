### Cahier des charges pour le projet **Collatask**

#### 1. Contexte du projet
- **Nom du projet** : **Collatask**
  - **Explication du nom** : Collatask vient de « collaboration » (« Colla ») et « task » (tâche). L'application vise à faciliter l'organisation collaborative de projets.

- **Objectif principal** : Développer une application web de gestion de projets et de tâches comparable à Trello, avec une interface accessible via un nom de domaine personnalisé, favorisant la productivité en équipe.

#### 2. Détails du projet

##### 2.1. Fonctionnalités requises

- **Création et gestion de comptes utilisateurs** :
  - **Création de compte** :
    - Formulaire de création de compte demandant un username, un email, et un mot de passe.
    - Envoi d'un email de vérification pour authentifier l'adresse email avec un code de confirmation.
    - L'email doit être vérifié avant que l’utilisateur puisse utiliser pleinement l'application (création de projets, ajout de membres).
  - **Connexion et gestion des sessions** :
    - Formulaire de connexion permettant de s'authentifier avec le login (username ou email) et le mot de passe.
    - **Gestion des tokens et des sessions** :
      - **Token d'accès principal** :
        - Utilisé pour authentifier l'utilisateur lors de chaque requête.
        - Durée de validité en fonction de la sélection de la case « Remember Me » :
          - **Case cochée** : Le token d’accès principal est valide pendant 14 jours.
          - **Case décochée** : Le token d’accès principal est valide pendant 1 jour.
        - Ce token expire à la fin de la durée définie et peut être renouvelé si un refresh token valide est encore actif.
      - **Refresh token** :
        - Permet de régénérer le token d'accès principal sans forcer l'utilisateur à se reconnecter trop souvent.
        - Valide pour **1 heure**, quelle que soit la sélection de « Remember Me ».
        - À expiration du token d'accès, le refresh token génère un nouveau token d'accès principal si l'utilisateur est actif. Si le refresh token expire (aucune interaction pendant 1 heure), l’utilisateur est redirigé vers la page de connexion pour s'authentifier de nouveau.
    - **Déconnexion** :
      - Permet de supprimer le token d’accès et le refresh token.
  - **Gestion des informations de compte** :
    - Page de profil pour modifier : email, mot de passe, username et photo de profil.

- **Gestion de projets** :
  - **Création de projets** :
    - Création de projets avec un titre et une description.
    - Le créateur est automatiquement l’**owner** du projet.
    - Possibilité d'ajouter des utilisateurs par email (recherche automatique par email dans la base de données).
  - **Rôles des utilisateurs dans les projets** :
    - Quatre rôles définis : 'Viewer', 'Member', 'Admin', 'Owner'.
      - **Viewer** : Accès en lecture seule.
      - **Member** : Accès pour créer et modifier des tâches.
      - **Admin** : Gestion des boards et des rôles des utilisateurs (sauf Owner).
      - **Owner** : Possède tous les droits du projet, y compris sa suppression.
    - Le rôle par défaut pour tout nouvel utilisateur ajouté à un projet est 'Viewer'.
  - **Affichage et gestion des projets** :
    - Page 'Mes Projets' listant tous les projets associés à l'utilisateur, avec un aperçu des membres et des tâches en cours.

- **Gestion des boards** :
  - **Création et modification de boards** :
    - Par défaut, chaque projet contient trois boards : 'Todo', 'In Progress', 'Done'.
    - Possibilité de créer de nouveaux boards personnalisés avec nom et description.
    - Les admins et l'owner peuvent modifier ou supprimer les boards existants.
  - **Organisation et interaction avec les boards** :
    - Les utilisateurs peuvent cliquer sur un board pour voir les détails et ajouter ou gérer des cards.
    - Drag-and-drop pour organiser et réorganiser les boards.

- **Gestion des cards** :
  - **Création et modification de cards** :
    - Les utilisateurs peuvent ajouter des cards sur un board avec des champs : nom, description, date de début, date de fin, et assignation d’utilisateurs.
    - Les membres et plus peuvent éditer les cards.
  - **Interaction et déplacement des cards** :
    - Drag-and-drop entre boards pour changer le statut des tâches.
    - Interface permettant de modifier les détails des cards (titre, description, dates, assignations).
  
- **Pages et navigation** :
  - **Page d'accueil** : Accessible sans compte, présente les fonctionnalités et inclut des boutons de connexion, inscription, et création de projet.
  - **Page de création de projet** : Formulaire pour créer un projet avec titre, description, et ajout d’utilisateurs.
  - **Page de projet** : Accès aux boards, à la création/modification des tâches, et gestion des utilisateurs dans une interface conviviale.

##### 2.2. Technologies envisagées
- **Base de données** : PostgreSQL pour une gestion des données relationnelle.
- **Back-end** : Node.js avec Express pour un serveur performant et facile à maintenir.
- **Front-end** : React avec Vite.js pour une expérience utilisateur réactive et moderne.

#### 3. Public cible
- Utilisateurs ayant besoin de gérer des projets en équipe, quelle que soit leur taille, recherchant une interface intuitive pour la gestion collaborative des tâches.

#### 4. Échéancier
- **1er octobre - 15 novembre** : Développement de la base de données et de l'API back-end.
- **15 novembre** : Début du développement front-end.
- **1er décembre - 5 décembre** : Tests utilisateurs initiaux pour feedback fonctionnel.
- **1er janvier - 5 janvier** : Deuxième série de tests utilisateurs.
- **1er février** : Lancement de la version bêta.
- **1er mars** : Lancement officiel de l'application.

#### 5. Équipe projet
- **Responsable** : Jules Dufraiche (Full stack)

#### 6. Critères de réussite
- Recueillir des retours d'utilisateurs via plusieurs séries de tests.
- Intégrer un bouton « Donnez votre avis » lors du lancement pour optimiser l'expérience utilisateur.
- Collecter des retours d'utilisateurs au cours des six mois suivant la publication pour affiner l'application.

_v:0.4_
