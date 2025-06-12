// Gestion des appels API
const Api = {
    // Headers par défaut pour les requêtes
    getHeaders: function() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (Auth.isAuthenticated()) {
            headers['Authorization'] = `Bearer ${Auth.getToken()}`;
        }

        return headers;
    },

    // Appel API générique
    call: async function(endpoint, method = 'GET', data = null) {
        UI.showLoading();

        const url = `${CONFIG.API_URL}${endpoint}`;
        const options = {
            method: method,
            headers: this.getHeaders()
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || 'Une erreur est survenue');
            }

            UI.hideLoading();
            return responseData;
        } catch (error) {
            UI.hideLoading();
            UI.showMessage(error.message, 'error');
            throw error;
        }
    },

    // Méthodes spécifiques
    login: async function(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        UI.showLoading();

        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Échec de la connexion');
            }

            // Stocker le token
            Auth.setToken(data.access_token);

            // Récupérer les informations utilisateur
            await this.getCurrentUser();

            UI.hideLoading();
            return data;
        } catch (error) {
            UI.hideLoading();
            UI.showMessage(error.message, 'error');
            throw error;
        }
    },

    register: async function(userData) {
        return this.call('/users/', 'POST', userData);
    },

    getCurrentUser: async function() {
        try {
            const userData = await this.call('/users/me');
            Auth.setUser(userData);
            return userData;
        } catch (error) {
            Auth.logout();
            throw error;
        }
    },

    getBooks: async function(skip = 0, limit = 100) {
        return this.call(`/books/?skip=${skip}&limit=${limit}`);
    },

    getBook: async function(id) {
        return this.call(`/books/${id}`);
    },

    searchBooks: async function(query) {
        const params = new URLSearchParams();
        if (query) {
            params.append('query', query);
        }
    
        return this.call(`/books/search/?${params.toString()}`);
    },

    updatePassword: async function(newPassword) {
        const data = {
            password: newPassword
        };

        const id = Auth.getUser().id;
    
        return this.call('/users/me', 'PUT', data);
    },

    borrowBook: async function(userId, bookId, loanPeriodDays = 14) {
        const data = {
            user_id: userId,
            book_id: bookId,
            loan_period_days: loanPeriodDays
        };
        const params = new URLSearchParams();
        params.append('user_id', userId);
        params.append('book_id', bookId);
        params.append('loan_period_days', loanPeriodDays);
        return this.call(`/loans/?${params.toString()}`, 'POST', data);
    },    
    
    // Marks a specific loan as returned
    returnBook: async function(loanId) {
        // Use the generic call function for consistency and error handling
        return this.call(`/loans/${loanId}/return`, 'POST');
    },

    // Extends the due date of a specific loan
    extendLoan: async function(loanId, extensionDays = 7) {
        const data = {
            extension_days: extensionDays
        };
        // Use the generic call function for consistency and error handling
        return this.call(`/loans/${loanId}/extend`, 'POST', data);
    },
    
    // Fetches all loans for the current user
    getUserLoans: async function() {
        // Get the current user's ID from authentication state
        const userId = Auth.getUser().id;
        // Use the generic call function for consistency and error handling
        return this.call(`/loans/user/${userId}`);
    },

    // Fetches all loans (typically for admin users)
    getLoans: async function() {
        // Use the generic call function for consistency and error handling
        return this.call(`/loans/`);
    }
};