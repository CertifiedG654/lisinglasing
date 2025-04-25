document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    
    // Staff credentials for each role
    const staffCredentials = [
        { 
            role: 'admin', 
            username: 'admin123', 
            password: 'lisinglasing',
            dashboard: 'admin-dashboard.html'
        },
        { 
            role: 'audit', 
            username: 'audit123', 
            password: 'lisinglasing',
            dashboard: 'audit.html'
        },
        { 
            role: 'supervisor', 
            username: 'supervisor123', 
            password: 'lisinglasing',
            dashboard: 'supervisor-dashboard.html'
        },
        { 
            role: 'cashier', 
            username: 'cashier123', 
            password: 'lisinglasing',
            dashboard: 'cashier-dashboard.html'
        }
    ];

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Check staff credentials
        const staff = staffCredentials.find(user => {
            return user.username === username && user.password === password;
        });

        if (staff) {
            localStorage.setItem('currentRole', staff.role);
            window.location.href = staff.dashboard;
            return;
        }
        
        // Check customer credentials
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const customer = customers.find(customer => {
            return customer.username === username && customer.password === password;
        });
        
        if (customer) {
            localStorage.setItem('loggedInCustomer', JSON.stringify(customer));
            window.location.href = 'customer-dashboard.html';
            return;
        }
        
        // If neither matches
        errorMsg.textContent = 'Invalid username or password';
        errorMsg.style.display = 'block';
        
        // Clear password field
        document.getElementById('password').value = '';
    });

    // Add logout functionality if on a dashboard page
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentRole');
            localStorage.removeItem('loggedInCustomer');
            window.location.href = 'index.html';
        });
    }
});