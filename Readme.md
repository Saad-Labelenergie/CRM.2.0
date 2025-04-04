# 📋 CRM - LabelEnergie

![Banner](https://labelenergie.fr/logo.jpg) <!-- Ajoutez une bannière réelle ici -->

## 👨‍💻 Développeurs
- **CHAH SAAD**
- **DOUMBIA SEYBOU DIOKOLO**

## 🚀 Fonctionnalités Principales
| Fonctionnalité | Description |
|---------------|-------------|
| 📊 Tableau de bord | Statistiques visuelles sur le portefeuille clients |
| 🔍 Recherche avancée | Filtrage multi-critères des clients |
| 👁️ Double vue | Affichage en mode grille ou liste |
| ⏳ Historique | Tracking complet des modifications |
| 🏷️ Gestion des statuts | Workflow en 3 états (En cours/En attente/Terminé) |


💻 Technologies
---------------

**Frontend:**

*   React 18 + TypeScript
    
*   Tailwind CSS
    
*   Framer Motion (animations)
    
*   Lucide Icons
    

**Backend:**

*   Firebase Firestore
    
*   Firebase Authentication
    

**Outils:**

*   Vite (build tool)
    
*   ESLint + Prettier
    
*   Husky (git hooks)

## 🛠️ Installation

### Clonage du dépôt
\`\`\`bash
git clone https://github.com/votre-repo/gestion-clients.git
cd gestion-clients

### Installation des dépendances

bash

Copy

npm install

## 🔧 Configuration

1. 1.  Copier le fichier d'environnement :
1.     

bash

Copy

cp .env.example .env

1. 2.  Configurer les variables Firebase dans `.env` :
1.     

env

Copy

VITE\_FIREBASE\_API\_KEY=votre\_cle\_api
VITE\_FIREBASE\_AUTH\_DOMAIN=votre\_domaine
VITE\_FIREBASE\_PROJECT\_ID=votre\_id
VITE\_FIREBASE\_STORAGE\_BUCKET=votre\_bucket
VITE\_FIREBASE\_MESSAGING\_SENDER\_ID=votre\_sender
VITE\_FIREBASE\_APP\_ID=votre\_app\_id

## 🚀 Lancement

Pour démarrer l'application en mode développement :

bash


npm run dev

## 📂 Structure du projet


src/
├── components/          # Composants React
│   ├── clients/        # Composants spécifiques aux clients
│   ├── modals/         # Modales
│   └── ui/             # Composants d'interface génériques
├── lib/                # Bibliothèques et helpers
│   ├── firebase.ts     # Configuration Firebase
│   └── hooks/          # Hooks personnalisés
├── pages/              # Pages de l'application
│   └── Clients.tsx     # Page principale
└── types/              # Définitions TypeScript
## 🚀 Déploiement

[![Déployer sur Vercel](https://vercel.com/button)](https://vercel.com/new)

**Options:**

*   Vercel
*   Firebase Hosting
*   Netlify


## 📜 Licence

MIT © 2025 CHAH SAAD & DOUMBIA SEYBOU DIOKOLO
