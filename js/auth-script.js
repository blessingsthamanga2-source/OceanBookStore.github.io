// Authentication JavaScript for BookStore

console.log('Auth script loaded');

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
    if (currentUser) {
        redirectBasedOnUserType(currentUser);
        return;
    }
    
    // Setup tab switching
    setupTabs();
    
    // Setup user type selection
    setupUserTypeSelection();
    
    // Setup form submissions
    setupFormSubmissions();
});

// Setup tab switching
function setupTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    if (!tabs.length || !forms.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === tabName + 'Form') {
                    form.classList.add('active');
                }
            });
            
            // Clear errors
            document.querySelectorAll('.error-message').forEach(error => {
                error.style.display = 'none';
            });
        });
    });
}

// Setup user type selection
function setupUserTypeSelection() {
    const userOptions = document.querySelectorAll('.user-option');
    const userTypeInput = document.getElementById('userType');
    
    if (!userOptions.length || !userTypeInput) return;
    
    userOptions.forEach(option => {
        option.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // Update selection
            userOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update hidden input
            userTypeInput.value = type;
        });
    });
}

// Setup form submissions
function setupFormSubmissions() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Switch to login links
    document.querySelectorAll('.switch-to-login').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
            if (loginTab) loginTab.click();
        });
    });
    
    // Forgot password
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', handleForgotPassword);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const loginError = document.getElementById('loginError');
    
    // Clear previous error
    if (loginError) loginError.style.display = 'none';
    
    // Validation
    if (!email || !password) {
        showError(loginError, 'Please fill in all fields');
        return;
    }
    
    // Authenticate
    const user = authenticateUser(email, password);
    
    if (user) {
        loginSuccess(user);
    } else {
        showError(loginError, 'Invalid email or password');
    }
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const userType = document.getElementById('userType').value;
    const registerError = document.getElementById('registerError');
    
    // Clear previous error
    if (registerError) registerError.style.display = 'none';
    
    // Validation
    if (!name || !email || !password) {
        showError(registerError, 'Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showError(registerError, 'Password must be at least 6 characters');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError(registerError, 'Please enter a valid email address');
        return;
    }
    
    // Check if user exists
    if (userExists(email)) {
        showError(registerError, 'An account with this email already exists');
        return;
    }
    
    // Register user
    const user = registerUser(name, email, password, userType);
    
    if (user) {
        loginSuccess(user);
    } else {
        showError(registerError, 'Registration failed. Please try again.');
    }
}

// Handle forgot password
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = prompt('Enter your email address to reset password:');
    
    if (email) {
        // In a real app, you would send a reset email
        alert(`Password reset instructions would be sent to ${email}\n\nFor now, try remembering your password. 😊`);
    }
}

// Authenticate user
function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Remove password from user object before returning
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    
    return null;
}

// Register new user
function registerUser(name, email, password, userType) {
    const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
    
    // Check if first user (make admin)
    const isFirstUser = users.length === 0;
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password, // In real app, hash this!
        type: userType,
        role: isFirstUser ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        balance: 0,
        books: userType === 'author' ? [] : null
    };
    
    // Special admin email for demo
    if (email === 'admin@bookstore.com') {
        newUser.role = 'admin';
        newUser.type = 'admin';
    }
    
    users.push(newUser);
    localStorage.setItem('bookstore_users', JSON.stringify(users));
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

// Check if user exists
function userExists(email) {
    const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
    return users.some(user => user.email === email);
}

// Login success
function loginSuccess(user) {
    // Save user session
    localStorage.setItem('bookstore_current_user', JSON.stringify(user));
    
    // Show success message
    alert(`Welcome ${user.name}! 🎉\n\nRedirecting to ${getDashboardLink(user)}...`);
    
    // Redirect
    redirectBasedOnUserType(user);
}

// Get dashboard link based on user type
function getDashboardLink(user) {
    if (user.role === 'admin') {
        return 'admin-dashboard.html';
    } else if (user.type === 'author') {
        return 'author-dashboard.html';
    } else {
        return 'reader-browse.html';
    }
}

// Redirect based on user type
function redirectBasedOnUserType(user) {
    setTimeout(() => {
        window.location.href = getDashboardLink(user);
    }, 1000);
}

// Show error message
function showError(element, message) {
    if (!element) return;
    
    element.textContent = message;
    element.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Export functions for use in other files
window.Auth = {
    authenticateUser,
    registerUser,
    userExists,
    isValidEmail
};