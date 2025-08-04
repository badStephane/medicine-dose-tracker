#!/bin/bash

# Fonction pour vérifier si un port est en écoute
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Arrêter les processus en cours sur les ports utilisés
echo "Arrêt des processus existants sur les ports 8000 et 3000..."
kill $(lsof -t -i:8000) 2>/dev/null || true
kill $(lsof -t -i:3000) 2>/dev/null || true

# Démarrer le backend Django
echo "Démarrage du serveur backend Django sur http://localhost:8000"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt >/dev/null 2>&1 || echo "Assurez-vous d'avoir installé les dépendances Python"
python manage.py migrate >/dev/null 2>&1 || echo "Erreur lors des migrations"

# Démarrer le serveur backend en arrière-plan
python manage.py runserver 0.0.0.0:8000 > django.log 2>&1 &
BACKEND_PID=$!

# Attendre que le serveur backend soit prêt
BACKEND_READY=0
for i in {1..10}; do
    if check_port 8000; then
        BACKEND_READY=1
        break
    fi
    echo "En attente du démarrage du serveur backend... (tentative $i/10)"
    sleep 2
done

if [ $BACKEND_READY -eq 0 ]; then
    echo "Erreur: Le serveur backend n'a pas démarré correctement"
    exit 1
fi

# Démarrer le serveur frontend
echo "Démarrage du serveur frontend sur http://localhost:3000"
cd ../frontend

# Vérifier si Python est disponible
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo "Erreur: Python n'est pas installé"
    exit 1
fi

# Démarrer le serveur frontend en arrière-plan
$PYTHON_CMD -m http.server 3000 > frontend.log 2>&1 &
FRONTEND_PID=$!

# Attendre que le serveur frontend soit prêt
FRONTEND_READY=0
for i in {1..5}; do
    if check_port 3000; then
        FRONTEND_READY=1
        break
    fi
    echo "En attente du démarrage du serveur frontend... (tentative $i/5)"
    sleep 1
done

if [ $FRONTEND_READY -eq 1 ]; then
    echo ""
    echo "========================================"
    echo "Serveurs démarrés avec succès!"
    echo "- Backend: http://localhost:8000"
    echo "- Frontend: http://localhost:3000"
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter les serveurs"
    echo "========================================"
    echo ""
    
    # Fonction pour nettoyer les processus à la sortie
    cleanup() {
        echo "Arrêt des serveurs..."
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        deactivate
        exit 0
    }
    
    # Capturer le signal d'interruption (Ctrl+C)
    trap cleanup INT
    
    # Attendre indéfiniment
    wait
else
    echo "Erreur: Le serveur frontend n'a pas démarré correctement"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
python3 -m http.server 3000