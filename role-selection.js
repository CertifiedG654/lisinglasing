document.addEventListener('DOMContentLoaded', function() {
    const roleButtons = document.querySelectorAll('.role-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBox = document.getElementById('loginBox');
    const roleBox = document.getElementById('roleBox');
    
    roleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const role = this.getAttribute('data-role');
            alert(`You have selected ${role} role. Redirecting to ${role} dashboard...`);
            // Here you would typically redirect to the appropriate dashboard
            // window.location.href = `${role}-dashboard.html`;
        });
    });
    
    logoutBtn.addEventListener('click', function() {
        roleBox.style.display = 'none';
        loginBox.style.display = 'block';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });
});