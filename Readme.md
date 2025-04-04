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

1. 1.  Cloner le dépôt :
1.     
git clone https://github.com/votre-repo/gestion-clients.git
cd gestion-clients

1. 2.  Installer les dépendances :
 
npm install

## 🔧 Configuration

1. 1.  Créer un fichier `.env` :

cp .env.example .env

1. 2.  Configurer Firebase :

VITE\_FIREBASE\_API\_KEY=votre\_cle\_api
VITE\_FIREBASE\_AUTH\_DOMAIN=votre\_domaine
VITE\_FIREBASE\_PROJECT\_ID=votre\_id
VITE\_FIREBASE\_STORAGE\_BUCKET=votre\_bucket
VITE\_FIREBASE\_MESSAGING\_SENDER\_ID=votre\_sender
VITE\_FIREBASE\_APP\_ID=votre\_app\_id

1. 3.  Lancer l'application :

npm run dev

## 📂 Structure

src/
├── components/
│   ├── clients/
│   ├── modals/
│   └── ui/
├── lib/
│   ├── firebase.ts
│   └── hooks/
├── pages/
│   └── Clients.tsx
└── types/

## 🚀 Déploiement

[![Déployer sur Vercel](https://vercel.com/button)](https://vercel.com/new)

**Options:**

*   Vercel
*   Firebase Hosting
*   Netlify


## 📜 Licence

MIT © 2025 CHAH SAAD & DOUMBIA SEYBOU DIOKOLO
