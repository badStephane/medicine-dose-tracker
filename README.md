# Medicine Dose Tracker App

[Medicine Dose Tracker](https://github.com/badStephane/medicine-dose-tracker) développé avec Django et JavaScript Vanilla.

## Description

`Les utilisateurs reçoivent des notifications lorsqu'il est temps de prendre leurs médicaments.`

## Prérequis

```bash
Python 3.8+
Django 4.2+
SQLite (développement) / PostgreSQL (production)
```

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/badStephane/medicine-dose-tracker.git
cd medicine-dose-tracker

# Configurer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
cd backend
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur (optionnel)
python manage.py createsuperuser
```

## Démarrer l'application

```bash
# Démarrer le serveur backend
python manage.py runserver

# Dans un autre terminal, démarrer le serveur frontend
cd frontend
python -m http.server 3000
```

Or

```bash
./run.sh
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Fonctionnalités

- Gestion des utilisateurs (inscription, connexion, profil)
- Suivi des médicaments avec rappels
- Interface utilisateur réactive
- API RESTful complète
- Sécurisation des données utilisateur

## Développement

### Commandes utiles

```bash
# Créer des migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate
```

## Auteur

Auteur - [@badStephane](https://github.com/badStephane)