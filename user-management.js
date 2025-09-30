document.addEventListener('DOMContentLoaded', function() {


    // DOM Elements
    const userForm = document.getElementById('userForm');
    const userTableBody = document.getElementById('userTableBody');
    const cancelBtn = document.getElementById('cancelBtn');
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('searchInput');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
   
    // Form fields
    const userIdField = document.getElementById('userId');
    const firstNameField = document.getElementById('firstName');
    const lastNameField = document.getElementById('lastName');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const addressField = document.getElementById('address');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const roleField = document.getElementById('role');
   
    // Initialize users array from localStorage or create empty array
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const staffCredentials = JSON.parse(localStorage.getItem('staffCredentials')) || [];

    // Load initial data if empty
    if (users.length === 0) {
        // Load from register.js customers
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        users = customers.map(customer => ({
            ...customer,
            role: 'customer'
        }));
        
        // Load from auth.js staff
        const defaultStaff = [
            {
                firstName: 'Admin',
                lastName: '',
                phone: '1234567890',
                email: 'admin@lisinglasing.com',
                address: 'Address',
                username: 'admin123',
                password: 'lisinglasing',
                role: 'admin'
            },
            {
                firstName: 'Auditor',
                lastName: '',
                phone: '1234567890',
                email: 'audit@lisinglasing.com',
                address: 'Address',
                username: 'audit123',
                password: 'lisinglasing',
                role: 'audit'
            },
            {
                firstName: 'Supervisor',
                lastName: '',
                phone: '1234567890',
                email: 'supervisor@lisinglasing.com',
                address: 'Address',
                username: 'supervisor123',
                password: 'lisinglasing',
                role: 'supervisor'
            },
            {
                firstName: 'Cashier',
                lastName: '',
                phone: '1234567890',
                email: 'cashier@lisinglasing.com',
                address: 'Address',
                username: 'cashier123',
                password: 'lisinglasing',
                role: 'cashier'
            }
        ];
        
        users = [...users, ...defaultStaff];
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Render user table
    function renderUserTable(filter = '') {
        userTableBody.innerHTML = '';
       
        const filteredUsers = users.filter(user =>
            user.username.toLowerCase().includes(filter.toLowerCase()) ||
            user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
            user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
            user.email.toLowerCase().includes(filter.toLowerCase()) ||
            user.role.toLowerCase().includes(filter.toLowerCase())
        );
       
        if (filteredUsers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 30px;">
                    No users found. Add your first user above.
                </td>
            `;
            userTableBody.appendChild(row);
            return;
        }
       
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
           
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.role}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${user.username}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${user.username}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
           
            userTableBody.appendChild(row);
        });
       
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
       
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }
   
    // Handle form submission
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
       
        const userData = {
            firstName: firstNameField.value.trim(),
            lastName: lastNameField.value.trim(),
            phone: phoneField.value.trim(),
            email: emailField.value.trim(),
            address: addressField.value.trim(),
            username: usernameField.value.trim(),
            password: passwordField.value,
            role: roleField.value
        };
       
        if (userIdField.value) {
            // Update existing user
            const index = users.findIndex(u => u.username === userIdField.value);
            if (index !== -1) {
                // Keep password if not changed
                if (!passwordField.value) {
                    userData.password = users[index].password;
                }
                users[index] = userData;
            }
        } else {
            // Add new user
            users.push(userData);
        }
       
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
       
        // Update auth.js credentials if staff user
        if (['admin', 'audit', 'supervisor', 'cashier'].includes(userData.role)) {
            updateStaffCredentials(userData);
        }
       
        // Reset form and refresh table
        resetForm();
        renderUserTable();
       
        // Show success message
        alert('User saved successfully!');
    });
   
    // Update staff credentials in auth.js
    function updateStaffCredentials(userData) {
        let staffCredentials = JSON.parse(localStorage.getItem('staffCredentials')) || [];
        
        // Remove existing if any
        staffCredentials = staffCredentials.filter(staff => staff.username !== userData.username);
        
        // Add new credentials
        staffCredentials.push({
            username: userData.username,
            password: userData.password,
            role: userData.role,
            dashboard: `${userData.role}-dashboard.html`
        });
        
        localStorage.setItem('staffCredentials', JSON.stringify(staffCredentials));
    }
   
    // Handle edit
    function handleEdit(e) {
        const username = e.target.closest('button').getAttribute('data-id');
        const user = users.find(u => u.username === username);
       
        if (user) {
            userIdField.value = user.username;
            firstNameField.value = user.firstName;
            lastNameField.value = user.lastName;
            phoneField.value = user.phone;
            emailField.value = user.email;
            addressField.value = user.address;
            usernameField.value = user.username;
            passwordField.value = '';
            roleField.value = user.role;
            
            // Scroll to form
            document.querySelector('.user-form-container').scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
   
    // Handle delete
    function handleDelete(e) {
        if (confirm('Are you sure you want to delete this user?')) {
            const username = e.target.closest('button').getAttribute('data-id');
            users = users.filter(u => u.username !== username);
           
            // Save to localStorage
            localStorage.setItem('users', JSON.stringify(users));
           
            // Remove from staff credentials if staff user
            const user = users.find(u => u.username === username);
            if (user && ['admin', 'audit', 'supervisor', 'cashier'].includes(user.role)) {
                let staffCredentials = JSON.parse(localStorage.getItem('staffCredentials')) || [];
                staffCredentials = staffCredentials.filter(staff => staff.username !== username);
                localStorage.setItem('staffCredentials', JSON.stringify(staffCredentials));
            }
           
            // Reset form if editing the deleted user
            if (userIdField.value === username) {
                resetForm();
            }
           
            // Refresh table
            renderUserTable();
        }
    }
   
    // Handle cancel
    cancelBtn.addEventListener('click', resetForm);
   
    // Handle clear
    clearBtn.addEventListener('click', function() {
        if (confirm('Clear all form fields?')) {
            resetForm();
        }
    });
   
    // Handle search
    searchInput.addEventListener('input', function() {
        renderUserTable(this.value);
    });
   
    // Handle logout
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentRole');
        window.location.href = 'front-page.html';
    });
   
    // Handle back to dashboard
    backToDashboardBtn.addEventListener('click', function() {
        window.location.href = 'admin-dashboard.html';
    });
   
    // Reset form
    function resetForm() {
        userForm.reset();
        userIdField.value = '';
    }
   
    // Initial render
    renderUserTable();
});