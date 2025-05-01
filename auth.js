document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
   
    // Initialize default staff credentials if they don't exist
    if (!localStorage.getItem('staffCredentials')) {
        const defaultStaff = [
            {
                username: 'admin123',
                password: 'lisinglasing',
                role: 'admin',
                dashboard: 'admin-dashboard.html'
            },
            {
                username: 'audit123',
                password: 'lisinglasing',
                role: 'audit',
                dashboard: 'audit.html'
            },
            {
                username: 'supervisor123',
                password: 'lisinglasing',
                role: 'supervisor',
                dashboard: 'supervisor-dashboard.html'
            },
            {
                username: 'cashier123',
                password: 'lisinglasing',
                role: 'cashier',
                dashboard: 'cashier-dashboard.html'
            }
        ];
        localStorage.setItem('staffCredentials', JSON.stringify(defaultStaff));
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
       
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
       
        // Check staff credentials first
        const staffCredentials = JSON.parse(localStorage.getItem('staffCredentials')) || [];
        const staff = staffCredentials.find(user => {
            return user.username === username && user.password === password;
        });

        if (staff) {
            localStorage.setItem('currentRole', staff.role);
            window.location.href = staff.dashboard;
            return;
        }
       
        // Check regular users (from both possible locations)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const allUsers = [...users, ...customers];
        
        const user = allUsers.find(user => {
            return user.username === username && user.password === password;
        });
       
        if (user) {
            if (user.role === 'customer') {
                localStorage.setItem('loggedInCustomer', JSON.stringify(user));
                window.location.href = 'customer-dashboard.html';
            } else {
                localStorage.setItem('currentRole', user.role);
                // Determine dashboard based on role
                let dashboard;
                switch(user.role) {
                    case 'admin': dashboard = 'admin-dashboard.html'; break;
                    case 'audit': dashboard = 'audit.html'; break;
                    case 'supervisor': dashboard = 'supervisor-dashboard.html'; break;
                    case 'cashier': dashboard = 'cashier-dashboard.html'; break;
                    default: dashboard = 'index.html';
                }
                window.location.href = dashboard;
            }
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

    // Role verification for protected pages
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
    if (protectedPages[currentPage]) {
        const requiredRole = protectedPages[currentPage];
        const currentRole = localStorage.getItem('currentRole');
        const loggedInCustomer = localStorage.getItem('loggedInCustomer');

        if (requiredRole === 'customer') {
            if (!loggedInCustomer) {
                alert('Please login as customer');
                window.location.href = 'index.html';
            }
        } else {
            if (currentRole !== requiredRole) {
                alert(`Access denied. Requires ${requiredRole} role.`);
                window.location.href = 'index.html';
            }
        }
    }
});