# backend/accounts/views.py - VERSION COMPLÈTE AVEC VALIDATION
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
import json

User = get_user_model()

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Endpoint pour créer un nouveau compte utilisateur
    """
    try:
        data = request.data
        
        # Récupérer les données
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        
        # Validation des champs obligatoires
        if not username or not email or not password:
            return Response({
                'error': 'Tous les champs sont requis (username, email, password)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validation longueur username
        if len(username) < 3:
            return Response({
                'error': 'Le nom d\'utilisateur doit faire au moins 3 caractères'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(username) > 30:
            return Response({
                'error': 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validation email format basique
        if '@' not in email or '.' not in email:
            return Response({
                'error': 'Format d\'email invalide'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validation mot de passe
        if len(password) < 6:
            return Response({
                'error': 'Le mot de passe doit faire au moins 6 caractères'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérification confirmation mot de passe
        if password != confirm_password:
            return Response({
                'error': 'Les mots de passe ne correspondent pas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Ce nom d\'utilisateur est déjà utilisé'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'Cette adresse email est déjà utilisée'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer l'utilisateur
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        return Response({
            'message': 'Compte créé avec succès',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'created_at': user.date_joined.isoformat()
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Erreur interne du serveur: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint pour se connecter
    """
    try:
        data = request.data
        
        # Récupérer les données
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        # Validation des champs
        if not username or not password:
            return Response({
                'error': 'Nom d\'utilisateur et mot de passe requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authentification
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if user.is_active:
                # Connexion réussie
                login(request, user)
                
                return Response({
                    'message': 'Connexion réussie',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'last_login': user.last_login.isoformat() if user.last_login else None
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Ce compte est désactivé'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'error': 'Nom d\'utilisateur ou mot de passe incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Erreur interne du serveur: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Endpoint pour se déconnecter
    """
    try:
        if request.user.is_authenticated:
            logout(request)
            return Response({
                'message': 'Déconnexion réussie'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Utilisateur déjà déconnecté'
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la déconnexion: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def current_user(request):
    """
    Endpoint pour obtenir les informations de l'utilisateur connecté
    """
    try:
        if request.user.is_authenticated:
            return Response({
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'is_active': request.user.is_active,
                    'date_joined': request.user.date_joined.isoformat(),
                    'last_login': request.user.last_login.isoformat() if request.user.last_login else None
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Utilisateur non authentifié'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': f'Erreur interne du serveur: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    """
    Endpoint pour récupérer le token CSRF
    """
    return Response({
        'csrf_token': get_token(request)
    })

# Endpoint de test pour vérifier que l'API fonctionne
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Endpoint de santé pour vérifier que l'API fonctionne
    """
    return Response({
        'status': 'API is working',
        'timestamp': json.dumps(None, default=str),
        'endpoints': {
            'register': '/api/auth/register/',
            'login': '/api/auth/login/',
            'logout': '/api/auth/logout/',
            'current_user': '/api/auth/me/',
            'csrf_token': '/api/auth/csrf/',
            'health': '/api/auth/health/'
        }
    }, status=status.HTTP_200_OK)