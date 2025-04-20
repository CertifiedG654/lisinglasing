document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBox = document.getElementById('loginBox');
    const roleBox = document.getElementById('roleBox');
    const errorMsg = document.getElementById('errorMsg');
    
    // Fixed credentials for staff
    const staffCredentials = {
        username: "123admins",
        password: "lisinglasing"
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Check staff credentials
        if (username === staffCredentials.username && password === staffCredentials.password) {
            loginBox.style.display = 'none';
            roleBox.style.display = 'block';
            errorMsg.style.display = 'none';
            return;
        }
        
        // Check customer credentials
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const customer = customers.find(c => c.username === username && c.password === password);
        
        if (customer) {
            localStorage.setItem('loggedInCustomer', customer.username);
            window.location.href = 'customer-dashboard.html';
            return;
        }
        
        // If neither matches
        errorMsg.textContent = 'Invalid username or password';
        errorMsg.style.display = 'block';
    });
});