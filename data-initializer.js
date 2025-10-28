// data-initializer.js
function initializeAppData() {
    console.log('Initializing application data...');
    
    // Initialize essential data structures if they don't exist
    if (!localStorage.getItem('auditLog')) {
        localStorage.setItem('auditLog', JSON.stringify([]));
        console.log('Initialized auditLog');
    }
    
    if (!localStorage.getItem('cashierQueue')) {
        localStorage.setItem('cashierQueue', JSON.stringify([]));
        console.log('Initialized cashierQueue');
    }
    
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
        console.log('Initialized orders');
    }
    
    if (!localStorage.getItem('lastOrderNumber')) {
        localStorage.setItem('lastOrderNumber', '0');
        console.log('Initialized lastOrderNumber');
    }
    
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
        console.log('Initialized products');
    }

    if (!localStorage.getItem('productReviews')) {
    localStorage.setItem('productReviews', JSON.stringify([]));
    console.log('Initialized productReviews');
}
    
    // Initialize staff credentials if they don't exist
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
        console.log('Initialized staffCredentials');
    }
    
    console.log('Application data initialization complete.');
}

// Call this function when the app loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAppData();
});