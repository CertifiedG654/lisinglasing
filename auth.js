// auth.js - Complete Authentication System with Google OAuth

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js loaded - Initializing authentication system');
    
    // Google OAuth Configuration - REPLACE WITH YOUR ACTUAL CLIENT ID
    const GOOGLE_CLIENT_ID = '719732943587-mqejl68bk31f8nb0u8srghu2mm80pfrc.apps.googleusercontent.com';
    
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Initialize authentication system
    initializeAuthSystem();

    function initializeAuthSystem() {
        // Check if we're on a page that requires authentication
        checkAuthentication();
        
        // Initialize Google Sign-In if Google buttons exist
        if (document.getElementById('googleSignIn') || document.getElementById('googleSignUp')) {
            initializeGoogleSignIn();
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Check for OAuth redirect response
        checkOAuthResponse();
    }

    // ==================== GOOGLE AUTHENTICATION ====================

    function initializeGoogleSignIn() {
        // Load Google Identity Services if not already loaded
        if (typeof google === 'undefined') {
            loadGoogleScript().then(() => {
                setupGoogleOAuth();
            }).catch(error => {
                console.error('Failed to load Google script:', error);
            });
        } else {
            setupGoogleOAuth();
        }
    }

    function loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function setupGoogleOAuth() {
        if (typeof google === 'undefined') {
            console.error('Google Identity Services not available');
            return;
        }

        try {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: false,
                context: 'signin'
            });

            // Set up Google Sign-In buttons
            setupGoogleButtons();
            
            console.log('Google OAuth initialized successfully');
        } catch (error) {
            console.error('Error initializing Google OAuth:', error);
            setupFallbackGoogleAuth();
        }
    }

    function setupGoogleButtons() {
        const googleSignInBtn = document.getElementById('googleSignIn');
        const googleSignUpBtn = document.getElementById('googleSignUp');

        // Custom button handlers for better control
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', function(e) {
                e.preventDefault();
                triggerGoogleSignIn();
            });
        }

        if (googleSignUpBtn) {
            googleSignUpBtn.addEventListener('click', function(e) {
                e.preventDefault();
                triggerGoogleSignIn();
            });
        }

        // Also render official Google buttons
        renderGoogleButtons();
    }

    function renderGoogleButtons() {
        const googleSignInBtn = document.getElementById('googleSignIn');
        const googleSignUpBtn = document.getElementById('googleSignUp');

        try {
            if (googleSignInBtn && google.accounts.id.renderButton) {
                google.accounts.id.renderButton(googleSignInBtn, {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    width: googleSignInBtn.offsetWidth
                });
            }

            if (googleSignUpBtn && google.accounts.id.renderButton) {
                google.accounts.id.renderButton(googleSignUpBtn, {
                    theme: 'outline',
                    size: 'large',
                    text: 'signup_with',
                    width: googleSignUpBtn.offsetWidth
                });
            }
        } catch (error) {
            console.warn('Could not render Google buttons:', error);
        }
    }

    function triggerGoogleSignIn() {
        try {
            google.accounts.id.prompt();
        } catch (error) {
            console.error('Error triggering Google Sign-In:', error);
            // Fallback to manual OAuth flow
            startManualOAuthFlow();
        }
    }

    function handleGoogleSignIn(response) {
        console.log('Google Sign-In response received');
        
        if (response.credential) {
            showLoadingState(true);
            
            try {
                const userData = parseJwt(response.credential);
                processGoogleUser(userData);
            } catch (error) {
                console.error('Error processing Google Sign-In:', error);
                showError('Failed to process Google Sign-In. Please try again.');
                showLoadingState(false);
            }
        } else {
            console.error('No credential in Google response');
            showError('Google Sign-In failed. Please try again.');
        }
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid JWT token');
        }
    }

    // ==================== USER MANAGEMENT ====================

    function processGoogleUser(googleUser) {
        console.log('Processing Google user:', googleUser);
        
        const userData = {
            id: generateUserId(),
            firstName: googleUser.given_name || '',
            lastName: googleUser.family_name || '',
            email: googleUser.email,
            phone: '',
            address: '',
            username: generateUsernameFromEmail(googleUser.email),
            password: generateRandomPassword(),
            role: 'customer',
            googleId: googleUser.sub,
            picture: googleUser.picture,
            emailVerified: googleUser.email_verified || false,
            authProvider: 'google',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Check if user already exists
        const existingUser = findUserByGoogleId(googleUser.sub) || findUserByEmail(googleUser.email);

        if (existingUser) {
            // Update last login and log them in
            existingUser.lastLogin = new Date().toISOString();
            updateUser(existingUser);
            handleLoginSuccess(existingUser);
        } else {
            // Create new user
            createUser(userData);
            handleLoginSuccess(userData);
        }
    }

    function findUserByGoogleId(googleId) {
        const users = getAllUsers();
        return users.find(user => user.googleId === googleId);
    }

    function findUserByEmail(email) {
        const users = getAllUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    function findUserByUsername(username) {
        const users = getAllUsers();
        return users.find(user => user.username.toLowerCase() === username.toLowerCase());
    }

    function getAllUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const staff = JSON.parse(localStorage.getItem('staffCredentials')) || [];
        
        // Merge all users, removing duplicates by ID
        const allUsers = [...users, ...customers, ...staff];
        return allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
    }

    function createUser(userData) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const customers = JSON.parse(localStorage.getItem('customers')) || [];

        // Ensure username is unique
        let finalUsername = userData.username;
        let counter = 1;
        while (findUserByUsername(finalUsername)) {
            finalUsername = `${userData.username}${counter}`;
            counter++;
        }
        userData.username = finalUsername;

        users.push(userData);
        
        if (userData.role === 'customer') {
            customers.push(userData);
        }

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('customers', JSON.stringify(customers));
        
        console.log('User created successfully:', userData.username);
    }

    function updateUser(userData) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        
        // Update in users array
        const userIndex = users.findIndex(u => u.id === userData.id);
        if (userIndex !== -1) {
            users[userIndex] = userData;
        }
        
        // Update in customers array if applicable
        if (userData.role === 'customer') {
            const customerIndex = customers.findIndex(c => c.id === userData.id);
            if (customerIndex !== -1) {
                customers[customerIndex] = userData;
            }
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('customers', JSON.stringify(customers));
    }

    // ==================== TRADITIONAL LOGIN ====================

    function setupEventListeners() {
        // Traditional login form
        if (loginForm) {
            loginForm.addEventListener('submit', handleTraditionalLogin);
        }
        
        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Modal form toggles
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        
        if (showSignup) {
            showSignup.addEventListener('click', switchToSignupForm);
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', switchToLoginForm);
        }
        
        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', handleTraditionalSignup);
        }
    }

    function handleTraditionalLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username')?.value || 
                        document.getElementById('loginUsername')?.value;
        const password = document.getElementById('password')?.value || 
                        document.getElementById('loginPassword')?.value;

        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        showLoadingState(true);

        // Check staff credentials first
        const staffCredentials = JSON.parse(localStorage.getItem('staffCredentials')) || [];
        const staff = staffCredentials.find(user => 
            user.username === username && user.password === password
        );

        if (staff) {
            handleLoginSuccess(staff);
            return;
        }

        // Check regular users
        const users = getAllUsers();
        const user = users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === password
        );

        if (user) {
            user.lastLogin = new Date().toISOString();
            updateUser(user);
            handleLoginSuccess(user);
        } else {
            showLoadingState(false);
            showError('Invalid username or password');
            // Clear password field
            const passwordField = document.getElementById('password') || 
                                document.getElementById('loginPassword');
            if (passwordField) passwordField.value = '';
            
            // Add shake animation to form
            const form = e.target;
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    }

    function handleTraditionalSignup(e) {
        e.preventDefault();
        
        const userData = {
            id: generateUserId(),
            firstName: document.getElementById('signupFirstname')?.value.trim() || '',
            lastName: document.getElementById('signupLastname')?.value.trim() || '',
            phone: document.getElementById('signupPhone')?.value.trim() || '',
            email: document.getElementById('signupEmail')?.value.trim() || '',
            address: document.getElementById('signupAddress')?.value.trim() || '',
            username: document.getElementById('signupUsername')?.value.trim() || '',
            password: document.getElementById('signupPassword')?.value || '',
            confirmPassword: document.getElementById('signupConfirmPassword')?.value || '',
            role: 'customer',
            createdAt: new Date().toISOString(),
            authProvider: 'traditional'
        };

        // Validation
        const validationError = validateSignupData(userData);
        if (validationError) {
            showError(validationError);
            return;
        }

        // Check if username or email already exists
        if (findUserByUsername(userData.username)) {
            showError('Username already exists!');
            return;
        }

        if (findUserByEmail(userData.email)) {
            showError('Email address already registered!');
            return;
        }

        // Remove confirmPassword before saving
        delete userData.confirmPassword;

        // Create user
        createUser(userData);
        
        showToast('Registration successful! Please login.', 'success');
        
        // Switch to login form
        switchToLoginForm();
        
        // Clear form
        e.target.reset();
    }

    // ==================== UTILITY FUNCTIONS ====================

    function validateSignupData(userData) {
        if (!userData.firstName || !userData.lastName) {
            return 'Please enter your first and last name';
        }
        
        if (!userData.email || !isValidEmail(userData.email)) {
            return 'Please enter a valid email address';
        }
        
        if (!userData.username || userData.username.length < 3) {
            return 'Username must be at least 3 characters long';
        }
        
        if (!userData.password || userData.password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        
        if (userData.password !== userData.confirmPassword) {
            return 'Passwords do not match';
        }
        
        return null;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    function generateUsernameFromEmail(email) {
        return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    function generateRandomPassword() {
        return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    }

    function handleLoginSuccess(user) {
        console.log('Login successful for user:', user.username);
        
        showLoadingState(false);
        showToast(`Welcome back, ${user.firstName || user.username}!`, 'success');

        // Store user session
        if (user.role === 'customer') {
            localStorage.setItem('loggedInCustomer', JSON.stringify(user));
        } else {
            localStorage.setItem('currentRole', user.role);
            localStorage.setItem('currentUser', JSON.stringify(user));
        }

        localStorage.setItem('lastLogin', new Date().toISOString());

        // Redirect to appropriate dashboard
        setTimeout(() => {
            redirectToDashboard(user.role);
        }, 1000);
    }

    function redirectToDashboard(role) {
        const dashboards = {
            'admin': 'admin-dashboard.html',
            'audit': 'audit.html',
            'supervisor': 'supervisor-dashboard.html',
            'cashier': 'cashier-dashboard.html',
            'customer': 'customer-dashboard.html'
        };

        const dashboard = dashboards[role] || 'front-page.html';
        window.location.href = dashboard;
    }

    function handleLogout() {
        // Clear all user data
        localStorage.removeItem('currentRole');
        localStorage.removeItem('loggedInCustomer');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        
        showToast('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'front-page.html';
        }, 500);
    }

    function checkAuthentication() {
        const protectedPages = {
            'admin-dashboard.html': 'admin',
            'user-management.html': 'admin',
            'product-management.html': 'admin',
            'audit.html': 'audit',
            'supervisor-dashboard.html': 'supervisor',
            'cashier-dashboard.html': 'cashier',
            'customer-dashboard.html': 'customer'
        };

        const currentPage = window.location.pathname.split('/').pop();
        const requiredRole = protectedPages[currentPage];

        if (requiredRole) {
            if (requiredRole === 'customer') {
                const loggedInCustomer = localStorage.getItem('loggedInCustomer');
                if (!loggedInCustomer) {
                    redirectToLogin('Please login as customer');
                    return;
                }
            } else {
                const currentRole = localStorage.getItem('currentRole');
                if (currentRole !== requiredRole) {
                    redirectToLogin(`Access denied. Requires ${requiredRole} role.`);
                    return;
                }
            }
        }
    }

    function redirectToLogin(message) {
        if (message) {
            alert(message);
        }
        window.location.href = 'front-page.html';
    }

    function switchToSignupForm() {
        const loginFormContainer = document.getElementById('loginFormContainer');
        const signupFormContainer = document.getElementById('signupFormContainer');
        
        if (loginFormContainer && signupFormContainer) {
            loginFormContainer.style.display = 'none';
            signupFormContainer.style.display = 'block';
            clearErrors();
        }
    }

    function switchToLoginForm() {
        const loginFormContainer = document.getElementById('loginFormContainer');
        const signupFormContainer = document.getElementById('signupFormContainer');
        
        if (loginFormContainer && signupFormContainer) {
            signupFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'block';
            clearErrors();
        }
    }

    // ==================== UI HELPER FUNCTIONS ====================

    function showLoadingState(show) {
        const loginButton = document.getElementById('loginButton');
        const googleButtons = document.querySelectorAll('.google-signin-btn');
        
        if (loginButton) {
            if (show) {
                loginButton.classList.add('loading');
                loginButton.disabled = true;
            } else {
                loginButton.classList.remove('loading');
                loginButton.disabled = false;
            }
        }
        
        googleButtons.forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.classList.add('loading');
            } else {
                btn.classList.remove('loading');
            }
        });
    }

    function showError(message) {
        // Try modal error first
        const modalError = document.getElementById('modal-login-error-msg') || 
                          document.getElementById('modal-signup-error-msg') ||
                          document.getElementById('errorMsg');
        
        if (modalError) {
            modalError.textContent = message;
            modalError.style.display = 'block';
        } else {
            showToast(message, 'error');
        }
    }

    function showToast(message, type = 'success') {
        // Create toast if it doesn't exist
        let toast = document.getElementById('auth-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'auth-toast';
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                z-index: 10000;
                font-family: "Roboto Mono", monospace;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s;
                max-width: 300px;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.background = type === 'success' ? '#10b981' : 
                                type === 'error' ? '#ef4444' : '#f59e0b';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    }

    function checkOAuthResponse() {
        // Check for OAuth response in URL hash
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            // Handle OAuth response if using manual flow
            console.log('OAuth response detected:', hash);
        }
    }

    // ==================== FALLBACK METHODS ====================

    function setupFallbackGoogleAuth() {
        console.log('Setting up fallback Google auth');
        
        const googleButtons = document.querySelectorAll('.google-signin-btn');
        googleButtons.forEach(btn => {
            btn.addEventListener('click', startManualOAuthFlow);
        });
    }

    function startManualOAuthFlow() {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
            client_id=${GOOGLE_CLIENT_ID}&
            redirect_uri=${encodeURIComponent(window.location.origin)}&
            response_type=token&
            scope=email profile&
            include_granted_scopes=true`;
        
        window.location.href = authUrl.replace(/\s/g, '');
    }

    // ==================== INITIALIZE STAFF CREDENTIALS ====================

    function initializeStaffCredentials() {
        if (!localStorage.getItem('staffCredentials')) {
            const defaultStaff = [
                {
                    id: 'staff_admin_001',
                    username: 'admin123',
                    password: 'lisinglasing',
                    role: 'admin',
                    dashboard: 'admin-dashboard.html',
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@amoralise.com',
                    authProvider: 'traditional',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'staff_audit_001',
                    username: 'audit123',
                    password: 'lisinglasing',
                    role: 'audit',
                    dashboard: 'audit.html',
                    firstName: 'Audit',
                    lastName: 'User',
                    email: 'audit@amoralise.com',
                    authProvider: 'traditional',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'staff_supervisor_001',
                    username: 'supervisor123',
                    password: 'lisinglasing',
                    role: 'supervisor',
                    dashboard: 'supervisor-dashboard.html',
                    firstName: 'Supervisor',
                    lastName: 'User',
                    email: 'supervisor@amoralise.com',
                    authProvider: 'traditional',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'staff_cashier_001',
                    username: 'cashier123',
                    password: 'lisinglasing',
                    role: 'cashier',
                    dashboard: 'cashier-dashboard.html',
                    firstName: 'Cashier',
                    lastName: 'User',
                    email: 'cashier@amoralise.com',
                    authProvider: 'traditional',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('staffCredentials', JSON.stringify(defaultStaff));
        }
    }

    // Initialize staff credentials when the script loads
    initializeStaffCredentials();

    console.log('Authentication system initialized successfully');
});

// Make functions available globally for other scripts
window.authSystem = {
    login: function(username, password) {
        // Implementation for external login calls
    },
    logout: function() {
        localStorage.removeItem('currentRole');
        localStorage.removeItem('loggedInCustomer');
        localStorage.removeItem('currentUser');
        window.location.href = 'front-page.html';
    },
    getCurrentUser: function() {
        const customer = localStorage.getItem('loggedInCustomer');
        if (customer) return JSON.parse(customer);
        
        const user = localStorage.getItem('currentUser');
        if (user) return JSON.parse(user);
        
        return null;
    },
    isAuthenticated: function() {
        return !!localStorage.getItem('loggedInCustomer') || !!localStorage.getItem('currentUser');
    }
};