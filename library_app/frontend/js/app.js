// Application principale
const App = {
    // Initialisation de l'application
    init: function() {
        UI.init();
        this.loadInitialPage();
    },

    // Charge la page initiale en fonction de l'état d'authentification
    loadInitialPage: function() {
        if (Auth.isAuthenticated()) {
            this.loadPage('books');
        } else {
            this.loadPage('login');
        }
    },

    // Charge une page spécifique
    loadPage: function(page) {
        // Vérifier si la page nécessite une authentification
        const authRequiredPages = ['books', 'profile', 'loan_management', 'user_loans'];
        if (authRequiredPages.includes(page) && !Auth.isAuthenticated()) {
            UI.showMessage('Vous devez être connecté pour accéder à cette page', 'error');
            page = 'login';
        }

        // Charger le contenu de la page
        switch (page) {
            case 'login':
                this.loadLoginPage();
                break;
            case 'register':
                this.loadRegisterPage();
                break;
            case 'books':
                this.loadBooksPage();
                break;
            case 'profile':
                this.loadProfilePage();
                break;
            case 'loan_management': 
                this.loadLoanManagementPage();
                break;
            case 'user_loans': 
                this.loadUserLoansPage();
                break;
            default:
                this.loadLoginPage();
        }

        // Mettre à jour la navigation active
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });
    },

    // Charge la page de connexion
    loadLoginPage: function() {
        const html = `
            <div class="form-container">
                <h2 class="text-center mb-20">Connexion</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-block">Se connecter</button>
                </form>
                <p class="text-center mt-20">
                    Vous n'avez pas de compte ? 
                    <a href="#" class="nav-link" data-page="register">Inscrivez-vous</a>
                </p>
            </div>
        `;

        UI.setContent(html);

        // Configurer le formulaire de connexion
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await Api.login(email, password);
                UI.updateNavigation();
                UI.showMessage('Connexion réussie', 'success');
                this.loadPage('books');
            } catch (error) {
                console.error('Erreur de connexion:', error);
            }
        });

        // Configurer les liens de navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.loadPage(page);
            });
        });
    },

    // Charge la page d'inscription
    loadRegisterPage: function() {
        const html = `
            <div class="form-container">
                <h2 class="text-center mb-20">Inscription</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="full_name">Nom complet</label>
                        <input type="text" id="full_name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="confirm_password">Confirmer le mot de passe</label>
                        <input type="password" id="confirm_password" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-block">S'inscrire</button>
                </form>
                <p class="text-center mt-20">
                    Vous avez déjà un compte ? 
                    <a href="#" class="nav-link" data-page="login">Connectez-vous</a>
                </p>
            </div>
        `;

        UI.setContent(html);

        // Configurer le formulaire d'inscription
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('full_name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            // Vérifier que les mots de passe correspondent
            if (password !== confirmPassword) {
                UI.showMessage('Les mots de passe ne correspondent pas', 'error');
                return;
            }

            try {
                const userData = {
                    full_name: fullName,
                    email: email,
                    password: password
                };

                await Api.register(userData);
                UI.showMessage('Inscription réussie. Vous pouvez maintenant vous connecter.', 'success');
                this.loadPage('login');
            } catch (error) {
                console.error('Erreur d\'inscription:', error);
            }
        });

        // Configurer les liens de navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.loadPage(page);
            });
        });
    },

    // Charge la page des livres
    loadBooksPage: async function() {
        UI.showLoading();

        try {
            const books = await Api.getBooks();

            let html = `
                <h2 class="mb-20">Catalogue de Livres</h2>

                <!-- Search Bar -->
                <div class="search-container">
                    <input type="text" id="search-query" class="form-control" placeholder="Rechercher un livre...">
                    <button id="search-button" class="btn">Rechercher</button>
                </div>

                <div class="card-container">
            `;

            if (books.items.length === 0) {
                html += `<p>Aucun livre disponible.</p>`;
            } else {
                books.items.forEach(book => {
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <h3>${book.title}</h3>
                            </div>
                            <div class="card-body">
                                <p><strong>Auteur:</strong> ${book.author}</p>
                                <p><strong>ISBN:</strong> ${book.isbn}</p>
                                <p><strong>Année:</strong> ${book.publication_year}</p>
                                <p><strong>Disponible:</strong> ${book.quantity} exemplaire(s)</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn" onclick="App.viewBookDetails(${book.id})">Voir détails</button>
                            </div>
                        </div>
                    `;
                });
            }

            html += `</div>`;

            UI.setContent(html);
            document.getElementById('search-button').addEventListener('click', () => {
                const query = document.getElementById('search-query').value;
                this.searchBooks(query);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des livres:', error);
            UI.setContent(`<p>Erreur lors du chargement des livres. Veuillez réessayer.</p>`);
        }
    },

    // Affiche les détails d'un livre
    viewBookDetails: async function(bookId) {
        UI.showLoading();

        try {
            const book = await Api.getBook(bookId);
            const user = Auth.getUser();

            const html = `
                <div class="book-details">
                    <h2>${book.title}</h2>
                    <div class="book-info">
                        <p><strong>Auteur:</strong> ${book.author}</p>
                        <p><strong>ISBN:</strong> ${book.isbn}</p>
                        <p><strong>Année de publication:</strong> ${book.publication_year}</p>
                        <p><strong>Éditeur:</strong> ${book.publisher || 'Non spécifié'}</p>
                        <p><strong>Langue:</strong> ${book.language || 'Non spécifiée'}</p>
                        <p><strong>Pages:</strong> ${book.pages || 'Non spécifié'}</p>
                        <p><strong>Quantité disponible:</strong> ${book.quantity}</p>
                    </div>
                   <div class="book-actions">
                        ${book.quantity > 0 && user && user.is_admin ? 
                        `<button class="btn mt-20" onclick="App.borrowBook(${book.id}, ${user.id})">Emprunter</button>` : 
                        `<p class="mt-20 text-gray-500">${book.quantity === 0 ? 'Ce livre n\'est plus disponible.' : ''}</p>`
                        }
                    </div>
                    <button class="btn mt-20" onclick="App.loadPage('books')">Retour à la liste</button>
                </div>
            `;

            UI.setContent(html);
        } catch (error) {
            console.error('Erreur lors du chargement des détails du livre:', error);
            UI.setContent(`
                <p>Erreur lors du chargement des détails du livre. Veuillez réessayer.</p>
                <button class="btn mt-20" onclick="App.loadPage('books')">Retour à la liste</button>
            `);
        } finally {
            UI.hideLoading();
        }
    },

    searchBooks: async function(query) {
        UI.showLoading();
    
        try {
            const searchResults = await Api.searchBooks(query);
    
            let html = `
                <h2 class="mb-20">Résultats de la recherche</h2>

                <div class="card-container">
            `;
    
            if (searchResults.items.length === 0) {
                html += `<p>Aucun livre trouvé pour la recherche "${query}".</p>`;
            } else {
                searchResults.items.forEach(book => {
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <h3>${book.title}</h3>
                            </div>
                            <div class="card-body">
                                <p><strong>Auteur:</strong> ${book.author}</p>
                                <p><strong>ISBN:</strong> ${book.isbn}</p>
                                <p><strong>Année:</strong> ${book.publication_year}</p>
                                <p><strong>Disponible:</strong> ${book.quantity} exemplaire(s)</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn" onclick="App.viewBookDetails(${book.id})">Voir détails</button>
                            </div>
                        </div>
                    `;
                });
            }
    
            html += `</div>`;
    
            UI.setContent(html);
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            UI.setContent(`<p>Erreur lors de la recherche. Veuillez réessayer.</p>`);
        } finally {
            UI.hideLoading();
        }
    },

    // Charge la page de profil
    loadProfilePage: async function() {
        UI.showLoading();

        try {
            const user = Auth.getUser();

            if (!user) {
                await Api.getCurrentUser();
                user = Auth.getUser();
            }

            const initials = user.full_name
                .split(' ')
                .map(name => name.charAt(0))
                .join('')
                .toUpperCase();

            const html = `
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="profile-avatar">${initials}</div>
                        <h2>${user.full_name}</h2>
                    </div>

                    <div class="profile-info">
                        <div class="profile-info-item">
                            <div class="profile-info-label">Email</div>
                            <div class="profile-info-value">${user.email}</div>
                        </div>
                        <div class="profile-info-item">
                            <div class="profile-info-label">Statut</div>
                            <div class="profile-info-value">${user.is_active ? 'Actif' : 'Inactif'}</div>
                        </div>
                        <div class="profile-info-item">
                            <div class="profile-info-label">Rôle</div>
                            <div class="profile-info-value">${user.is_admin ? 'Administrateur' : 'Utilisateur'}</div>
                        </div>
                        <div class="profile-info-item">
                            <div class="profile-info-label">Téléphone</div>
                            <div class="profile-info-value">${user.phone || 'Non spécifié'}</div>
                        </div>
                        <div class="profile-info-item">
                            <div class="profile-info-label">Adresse</div>
                            <div class="profile-info-value">${user.address || 'Non spécifiée'}</div>
                        </div>
                    </div>

                    <button class="btn" id="edit-profile-btn">Modifier le profil</button>
                    <button id="update-password-btn" class="btn">Modifier le mot de passe</button>
                </div>
            `;

            UI.setContent(html);
            UI.hideLoading();

            // Configurer le bouton de modification du profil
            document.getElementById('edit-profile-btn').addEventListener('click', () => {
                this.loadEditProfilePage(user);
            });
            document.getElementById('update-password-btn').addEventListener('click', () => {
                this.loadEditPasswordPage(user);
            });
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
            UI.setContent(`<p>Erreur lors du chargement du profil. Veuillez réessayer.</p>`);
        }
    },

    // Charge la page de modification du profil
    loadEditProfilePage: function(user) {
        const html = `
            <div class="form-container">
                <h2 class="text-center mb-20">Modifier le profil</h2>
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label for="full_name">Nom complet</label>
                        <input type="text" id="full_name" class="form-control" value="${user.full_name}" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Téléphone</label>
                        <input type="text" id="phone" class="form-control" value="${user.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label for="address">Adresse</label>
                        <textarea id="address" class="form-control">${user.address || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-block">Enregistrer les modifications</button>
                </form>
                <button class="btn btn-block mt-20" onclick="App.loadPage('profile')">Annuler</button>
            </div>
        `;

        UI.setContent(html);

        // Configurer le formulaire de modification du profil
        document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('full_name').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;

            try {
                const userData = {
                    full_name: fullName,
                    phone: phone || null,
                    address: address || null
                };

                await Api.call('/users/me', 'PUT', userData);
                await Api.getCurrentUser();
                UI.showMessage('Profil mis à jour avec succès', 'success');
                this.loadPage('profile');
            } catch (error) {
                console.error('Erreur lors de la mise à jour du profil:', error);
            }
        });
    },

    // Charge la page de modification du password
    loadEditPasswordPage: function(user) {
        const html = `
        <div class="form-container">
            <div id="password-update-form">
                <h2>Modifier le mot de passe</h3>
                <form id="update-password-form">
                    <div class="form-group">
                        <label for="new-password">Nouveau mot de passe</label>
                        <input type="password" id="new-password" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirmer le nouveau mot de passe</label>
                        <input type="password" id="confirm-password" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-block mt-20">Mettre à jour</button>
                    <button class="btn btn-block mt-20" onclick="App.loadPage('profile')">Annuler</button>
                </form>
            </div>
        </div>
        `;

        UI.setContent(html);

        // Event listener for password update form submission
        document.getElementById('update-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) {
                UI.showMessage('Les mots de passe ne correspondent pas', 'error');
                return;
            }

            try {
                await Api.updatePassword(newPassword);
                UI.showMessage('Mot de passe mis à jour avec succès', 'success');
                this.loadPage('profile');
            } catch (error) {
                console.error('Erreur lors de la mise à jour du mot de passe:', error);
            }
        });
    },

    // Handles borrowing a book for a specific user
    borrowBook: async function(bookId, userId) {
        // userId is explicitly passed now as per backend requirement
        if (!userId) {
            UI.showMessage('Impossible d\'emprunter : Informations utilisateur manquantes.', 'error');
            return;
        }

        try {
            await Api.borrowBook(userId, bookId); // Pass userId to API call
            UI.showMessage('Livre emprunté avec succès', 'success');
            this.loadPage('books'); // Redirect to books page or user loans
        } catch (error) {
            // Error message already handled by Api.call
            console.error('Erreur lors de l\'emprunt du livre:', error);
        }
    },
    
    // Handles returning a book
    returnBook: async function(loanId) {
        try {
            await Api.returnBook(loanId);
            UI.showMessage('Livre retourné avec succès', 'success');
            // Reload the loan management page or user loans page
            const user = Auth.getUser();
            if (user && user.is_admin) {
                this.loadPage('loan_management');
            } else {
                this.loadPage('user_loans');
            }
        } catch (error) {
            // Error message already handled by Api.call
            console.error('Erreur lors du retour du livre:', error);
        }
    },

    // Handles extending a loan
    extendLoan: async function(loanId, extensionDays = 7) {
        try {
            await Api.extendLoan(loanId, extensionDays);
            UI.showMessage(`Emprunt prolongé de ${extensionDays} jours avec succès`, 'success');
            // Reload the loan management page
            const user = Auth.getUser();
            if (user && user.is_admin) {
                this.loadPage('loan_management');
            } else {
                UI.showMessage('Seuls les administrateurs peuvent prolonger les emprunts.', 'error');
                this.loadPage('user_loans'); // Or just reload the user's loans to reflect potential changes
            }
        } catch (error) {
            // Error message already handled by Api.call
            console.error('Erreur lors de la prolongation de l\'emprunt:', error);
        }
    },

    // Loads the page displaying loans for the current user
    loadUserLoansPage: async function() {
        UI.showLoading();
    
        try {
            // Fetch the user's loans
            const loans = await Api.getUserLoans();
            
            // Fetch the list of books
            const booksResponse = await Api.getBooks();
            const books = booksResponse.items;  // Extract the books array
    
            let html = `
                <h2 class="mb-20">Mes Emprunts</h2>
                <div class="loan-container">
            `;
    
            // Check if the user has no loans
            if (loans.length === 0) {
                html += `<p>Aucun emprunt en cours.</p>`;
            } else {
                // Iterate over each loan and display its details
                loans.forEach(loan => {
                    const returnDate = loan.return_date ? new Date(loan.return_date).toLocaleDateString() : 'Non retourné';
                    const isOverdue = !loan.return_date && new Date(loan.due_date) < new Date();
                    const loanStatusClass = isOverdue ? 'text-red-500' : '';
    
                    // Find the corresponding book using book_id from the books array
                    const book = books.find(b => b.id === loan.book_id);
    
                    html += `
                        <div class="loan-card">
                            <h3>Livre: ${book ? book.title : 'Livre non trouvé'}</h3> <!-- Book title -->
                            <p><strong>Auteur:</strong> ${book ? book.author : 'Auteur inconnu'}</p> <!-- Book author -->
                            <p><strong>Date d'emprunt:</strong> ${new Date(loan.loan_date).toLocaleDateString()}</p>
                            <p class="${loanStatusClass}"><strong>Date limite:</strong> ${new Date(loan.due_date).toLocaleDateString()}</p>
                            <p><strong>Date de retour:</strong> ${returnDate}</p>
                            <div class="loan-actions mt-20">
                            <!-- Display the "Retourner" button if the book is not returned -->
                            ${!loan.return_date ? `<button class="btn mt-20" onclick="App.returnBook(${loan.id})">Retourner</button>` : ''}
                            </div>
                        </div>
                    `;
                });
            }
    
            html += `</div>`;  // Close the loan container
            UI.setContent(html); // Set the generated HTML as the page content
    
        } catch (error) {
            console.error('Erreur lors du chargement des emprunts:', error);
            UI.setContent(`<p>Erreur lors du chargement des emprunts. Veuillez réessayer.</p>`);
        } finally {
            UI.hideLoading();  // Hide the loading indicator after processing
        }
    },
    

    // NEW: Loads the page for all loan management (typically for admin)
    loadLoanManagementPage: async function() {
        UI.showLoading();
        const user = Auth.getUser();

        if (!user || !user.is_admin) {
            UI.showMessage('Accès non autorisé. Seuls les administrateurs peuvent gérer les emprunts.', 'error');
            this.loadPage('books'); // Redirect if not admin
            return;
        }

        try {
            const loans = await Api.getLoans(); // Fetch all loans
            const booksResponse = await Api.getBooks(); // Get books data
            const books = booksResponse.items;
    
            let html = `
                <h2 class="mb-20">Gestion des Emprunts</h2>
                <div class="loan-container">
            `;
    
            if (loans.length === 0) {
                html += `<p>Aucun emprunt enregistré.</p>`;
            } else {
                loans.forEach(loan => {
                    const returnDate = loan.return_date ? new Date(loan.return_date).toLocaleDateString() : 'Non retourné';
                    const isOverdue = !loan.return_date && new Date(loan.due_date) < new Date();
                    const loanStatusClass = isOverdue ? 'text-red-500 font-bold' : '';

                    const book = books.find(b => b.id === loan.book_id);

                    html += `
                        <div class="loan-card">
                            <h3>Livre: ${book ? book.title : 'Livre non trouvé'}</h3>
                            <p><strong>Date d'emprunt:</strong> ${new Date(loan.loan_date).toLocaleDateString()}</p>
                            <p class="${loanStatusClass}"><strong>Date limite:</strong> ${new Date(loan.due_date).toLocaleDateString()}</p>
                            <p><strong>Date de retour:</strong> ${returnDate}</p>
                            <div class="loan-actions mt-20">
                                ${!loan.return_date ? `
                                    <button class="btn btn-secondary mr-10" onclick="App.returnBook(${loan.id})">Retourner</button>
                                    <button class="btn" onclick="App.extendLoan(${loan.id})">Prolonger (7 jours)</button>
                                ` : '<p class="text-green-600">Livre retourné</p>'}
                            </div>
                        </div>
                    `;
                });
            }
    
            html += `</div>`;
            UI.setContent(html);
        } catch (error) {
            console.error('Erreur lors du chargement de la gestion des emprunts:', error);
            UI.setContent(`<p>Erreur lors du chargement de la gestion des emprunts. Veuillez réessayer.</p>`);
        } finally {
            UI.hideLoading();
        }
    }
};

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});