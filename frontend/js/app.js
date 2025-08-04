// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';
        
// Global state
let currentUser = null;
let medicines = [];
let editingMedicine = null;

// Utility functions
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// API Service
class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || Object.values(data)[0] || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async register(userData) {
        return this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async logout() {
        return this.request('/auth/logout/', {
            method: 'POST',
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me/');
    }

    // Medicine methods
    async getMedicines() {
        return this.request('/medicines/');
    }

    async addMedicine(medicineData) {
        return this.request('/medicines/', {
            method: 'POST',
            body: JSON.stringify(medicineData),
        });
    }

    async updateMedicine(id, medicineData) {
        return this.request(`/medicines/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(medicineData),
        });
    }

    async deleteMedicine(id) {
        return this.request(`/medicines/${id}/`, {
            method: 'DELETE',
        });
    }
}

const apiService = new ApiService();

// UI Functions
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    const alertClass = type === 'error' ? 'alert-danger' : 
                      type === 'success' ? 'alert-success' : 'alert-info';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function showLoading() {
    document.getElementById('loading').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.remove('hidden');
}

function updateNavbar() {
    const navbarMenu = document.getElementById('navbar-menu');
    const heroButtons = document.getElementById('hero-buttons');
    
    if (currentUser) {
        navbarMenu.innerHTML = `
            <a class="nav-link" href="#" onclick="showDashboard()">
                <i class="fas fa-tachometer-alt me-1"></i>Dashboard
            </a>
            <span class="nav-link">Welcome, ${currentUser.username}!</span>
            <button class="btn btn-outline-light btn-sm" onclick="logout()">
                <i class="fas fa-sign-out-alt me-1"></i>Logout
            </button>
        `;
        
        heroButtons.innerHTML = `
            <button class="btn btn-light btn-lg" onclick="showDashboard()">
                <i class="fas fa-tachometer-alt me-2"></i>Go to Dashboard
            </button>
        `;
    } else {
        navbarMenu.innerHTML = `
            <a class="nav-link" href="#" onclick="showLogin()">
                <i class="fas fa-sign-in-alt me-1"></i>Login
            </a>
            <a class="nav-link" href="#" onclick="showSignup()">
                <i class="fas fa-user-plus me-1"></i>Sign Up
            </a>
        `;
        
        heroButtons.innerHTML = `
            <button class="btn btn-light btn-lg me-3" onclick="showSignup()">
                <i class="fas fa-user-plus me-2"></i>Get Started
            </button>
            <button class="btn btn-outline-light btn-lg" onclick="showLogin()">
                <i class="fas fa-sign-in-alt me-2"></i>Login
            </button>
        `;
    }
}

// Page Navigation Functions
function showHome() {
    showPage('home-page');
}

function showLogin() {
    showPage('login-page');
    document.getElementById('login-form').reset();
}

function showSignup() {
    showPage('signup-page');
    document.getElementById('signup-form').reset();
}

function showDashboard() {
    if (!currentUser) {
        showLogin();
        return;
    }
    showPage('dashboard-page');
    loadMedicines();
}

function showMedicineForm(medicine = null) {
    editingMedicine = medicine;
    showPage('medicine-form-page');
    
    const form = document.getElementById('medicine-form');
    const title = document.getElementById('form-title');
    const submitBtn = document.getElementById('form-submit-btn');
    
    if (medicine) {
        // Edit mode
        title.innerHTML = '<i class="fas fa-edit me-2"></i>Edit Medicine';
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Medicine';
        
        document.getElementById('medicine-id').value = medicine.id;
        document.getElementById('medicine-name').value = medicine.name;
        document.getElementById('medicine-dosage').value = medicine.dosage;
        document.getElementById('medicine-frequency').value = medicine.frequency;
    } else {
        // Add mode
        title.innerHTML = '<i class="fas fa-plus me-2"></i>Add New Medicine';
        submitBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Add Medicine';
        form.reset();
    }
}

// Auth Functions
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    try {
        showLoading();
        const response = await apiService.login({ username, password });
        currentUser = response.user;
        showAlert('Login successful!', 'success');
        updateNavbar();
        showDashboard();
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function signup() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!username || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }

    try {
        showLoading();
        await apiService.register({
            username,
            email,
            password,
            confirm_password: confirmPassword
        });
        showAlert('Account created successfully! Please log in.', 'success');
        showLogin();
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function logout() {
    try {
        // Sauvegarder le token CSRF avant la déconnexion
        const csrfToken = getCookie('csrftoken');
        
        // Appeler l'API de déconnexion
        await apiService.logout();
        
        // Effacer les données utilisateur
        currentUser = null;
        medicines = [];
        
        // Nettoyer les données locales
        localStorage.removeItem('user');
        
        // Mettre à jour l'interface utilisateur
        updateNavbar();
        showAlert('Déconnexion réussie', 'success');
        
        // Rediriger vers la page d'accueil après un court délai
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        showAlert('Erreur lors de la déconnexion: ' + (error.message || 'Veuillez réessayer'), 'error');
    }
}

// Medicine Functions
async function loadMedicines() {
    try {
        showLoading();
        const response = await apiService.getMedicines();
        medicines = response.medicines;
        renderMedicines();
    } catch (error) {
        showAlert('Failed to load medicines', 'error');
    } finally {
        hideLoading();
    }
}

function renderMedicines() {
    const container = document.getElementById('medicines-container');
    const emptyState = document.getElementById('empty-state');

    if (medicines.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        container.innerHTML = `
            <div class="row">
                ${medicines.map(medicine => `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card medicine-card h-100">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="fas fa-pills me-2 text-primary"></i>
                                    ${medicine.name}
                                </h5>
                                <p class="card-text">
                                    <strong><i class="fas fa-capsules me-1"></i>Dosage:</strong> ${medicine.dosage}<br>
                                    <strong><i class="fas fa-clock me-1"></i>Frequency:</strong> ${medicine.frequency}
                                </p>
                                <small class="text-muted">
                                    <i class="fas fa-calendar-plus me-1"></i>Added: ${formatDate(medicine.created_at)}
                                    ${medicine.updated_at !== medicine.created_at ? 
                                        `<br><i class="fas fa-edit me-1"></i>Updated: ${formatDate(medicine.updated_at)}` : ''}
                                </small>
                            </div>
                            <div class="card-footer">
                                <div class="btn-group w-100" role="group">
                                    <button class="btn btn-outline-primary btn-sm" onclick="showMedicineForm(${JSON.stringify(medicine).replace(/"/g, '&quot;')})">
                                        <i class="fas fa-edit me-1"></i>Edit
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="deleteMedicine(${medicine.id})">
                                        <i class="fas fa-trash me-1"></i>Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

async function saveMedicine() {
    const name = document.getElementById('medicine-name').value.trim();
    const dosage = document.getElementById('medicine-dosage').value.trim();
    const frequency = document.getElementById('medicine-frequency').value.trim();

    if (!name || !dosage || !frequency) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    const medicineData = { name, dosage, frequency };

    try {
        showLoading();
        
        if (editingMedicine) {
            // Update existing medicine
            const response = await apiService.updateMedicine(editingMedicine.id, medicineData);
            const updatedMedicine = response.medicine;
            
            // Update local medicines array
            const index = medicines.findIndex(m => m.id === editingMedicine.id);
            if (index !== -1) {
                medicines[index] = updatedMedicine;
            }
            
            showAlert('Medicine updated successfully!', 'success');
        } else {
            // Add new medicine
            const response = await apiService.addMedicine(medicineData);
            medicines.push(response.medicine);
            showAlert('Medicine added successfully!', 'success');
        }
        
        showDashboard();
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function deleteMedicine(medicineId) {
    if (!confirm('Are you sure you want to delete this medicine?')) {
        return;
    }

    try {
        showLoading();
        await apiService.deleteMedicine(medicineId);
        medicines = medicines.filter(m => m.id !== medicineId);
        renderMedicines();
        showAlert('Medicine deleted successfully!', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Utility function to format dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Check authentication status on page load
async function checkAuthStatus() {
    try {
        showLoading();
        const response = await apiService.getCurrentUser();
        currentUser = response.user;
        updateNavbar();
        showDashboard();
    } catch (error) {
        currentUser = null;
        updateNavbar();
        showHome();
    } finally {
        hideLoading();
    }
}

// Event Listeners
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    login();
});

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    signup();
});

document.getElementById('medicine-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveMedicine();
});

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});