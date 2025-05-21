# Projet Angular Spring Boot

## Aperçu
Ce projet est une application full-stack construite avec Angular pour le frontend et Spring Boot pour le backend. Il offre une plateforme robuste pour gérer les documents, les auteurs et l'authentification des utilisateurs.

## Fonctionnalités
- **Authentification des Utilisateurs**: Système sécurisé de connexion et d'inscription.
- **Gestion des Documents**: Créer, lire, mettre à jour et supprimer des documents.
- **Gestion des Auteurs**: Gérer les auteurs associés aux documents.
- **Tableau de Bord Administrateur**: Tableau de bord complet pour les administrateurs afin de gérer les utilisateurs, les documents et les auteurs.
- **Traces de Connexion**: Surveiller et enregistrer les activités de connexion des utilisateurs.

## Technologies Utilisées
- **Frontend**:
  - Angular
  - TypeScript
  - HTML/CSS
- **Backend**:
  - Spring Boot
  - Java
  - Spring Security
  - Authentification JWT
- **Base de Données**:
  - (Spécifiez votre base de données ici, par exemple, MySQL, PostgreSQL)

## Instructions d'Installation
1. **Cloner le Dépôt**:
   ```bash
   git clone <url-du-dépôt>
   cd angular-spring-boot-project
   ```

2. **Configuration du Frontend**:
   ```bash
   cd Front-end-project
   npm install
   ng serve
   ```

3. **Configuration du Backend**:
   ```bash
   cd Back-end-project
   mvn clean install
   mvn spring-boot:run
   ```

4. **Accéder à l'Application**:
   - Frontend: `http://localhost:4200`
   - Backend: `http://localhost:8080`

## Utilisation
- **Connexion**: Utilisez la page de connexion pour vous authentifier.
- **Tableau de Bord Administrateur**: Accédez au tableau de bord pour gérer les documents et les auteurs.
- **Accueil Utilisateur**: Les utilisateurs réguliers peuvent consulter et gérer leurs documents.

## Contribution
Les contributions sont les bienvenues ! Veuillez ouvrir une issue ou soumettre une pull request.

## Licence
Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails. 
