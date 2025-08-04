# backend/medicine_tracker/middleware.py - CRÉER ce fichier
class DisableCSRFMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Désactiver CSRF pour toutes les URLs API
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        response = self.get_response(request)
        return response