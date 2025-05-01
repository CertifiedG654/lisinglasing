document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMsg = document.getElementById('reg-error-msg');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get all form values
        const userData = {
            firstName: document.getElementById('reg-firstname').value.trim(),
            lastName: document.getElementById('reg-lastname').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            address: document.getElementById('reg-address').value.trim(),
            username: document.getElementById('reg-username').value.trim(),
            password: document.getElementById('reg-password').value,
            confirmPassword: document.getElementById('reg-confirm-password').value,
            role: 'customer' // Add role field
        };
        
        // Validation
        if (userData.password !== userData.confirmPassword) {
            showError('Passwords do not match!');
            return;
        }
        
        if (userData.password.length < 6) {
            showError('Password must be at least 6 characters!');
            return;
        }
        
        if (!validateEmail(userData.email)) {
            showError('Please enter a valid email address!');
            return;
        }
        
        if (!validatePhone(userData.phone)) {
            showError('Please enter a valid phone number!');
            return;
        }
        
        // Get existing data from BOTH storage locations
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        
        // Check if username already exists in either storage
        if (users.some(user => user.username === userData.username) || 
            customers.some(customer => customer.username === userData.username)) {
            showError('Username already exists!');
            return;
        }
        
        // Check if email already exists in either storage
        if (users.some(user => user.email === userData.email) || 
            customers.some(customer => customer.email === userData.email)) {
            showError('Email address already registered!');
            return;
        }
        
        // Remove confirmPassword before saving
        delete userData.confirmPassword;
        
        // Add to both storage locations for compatibility
        users.push(userData);
        customers.push(userData);
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('customers', JSON.stringify(customers));
        
        // Show success message and redirect to login page
        alert('Registration successful! Please login with your credentials.');
        window.location.href = 'index.html';
    });
    
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const re = /^[0-9]{10,15}$/;
        return re.test(phone);
    }
});