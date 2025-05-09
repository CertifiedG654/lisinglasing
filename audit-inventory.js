document.addEventListener('DOMContentLoaded', function() {
    // Check audit role
    const currentRole = localStorage.getItem('currentRole');
    if (currentRole !== 'audit') {
        alert('Access denied. Please login as auditor.');
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const searchInput = document.getElementById('searchInput');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const auditNotes = document.getElementById('auditNotes');
    const saveNotesBtn = document.getElementById('saveNotesBtn');
    
    // Variables
    let selectedProductId = null;
    let auditNotesData = JSON.parse(localStorage.getItem('auditNotesData')) || {};

    // Initialize and render inventory
    function renderInventoryTable(filter = '') {
        // Get products from admin inventory
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts')) || [];
        
        inventoryTableBody.innerHTML = '';
        
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(filter.toLowerCase()) ||
            product.category.toLowerCase().includes(filter.toLowerCase())
        );
        
        if (filteredProducts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 30px;">
                    No inventory items found.
                </td>
            `;
            inventoryTableBody.appendChild(row);
            return;
        }
        
        filteredProducts.forEach(product => {
            const row = document.createElement('tr');
            const expectedStock = product.expectedStock || product.quantity;
            const actualStock = product.quantity;
            const discrepancy = expectedStock - actualStock;
            const hasDiscrepancy = discrepancy !== 0;
            const isDeleted = deletedProducts.some(p => p.id === product.id);
            
            // Check if product has audit notes
            const hasNotes = auditNotesData[product.id] && auditNotesData[product.id].notes;
            
            row.innerHTML = `
                <td>
                    ${product.image ? `<img src="${product.image}" style="max-width: 50px; max-height: 50px; margin-right: 10px; vertical-align: middle;">` : ''}
                    ${product.name}
                    ${hasNotes ? '<i class="fas fa-comment-alt" style="color: var(--accent-gold); margin-left: 5px;"></i>' : ''}
                </td>
                <td>${product.category}</td>
                <td>${expectedStock}</td>
                <td>${actualStock}</td>
                <td class="${hasDiscrepancy ? (discrepancy > 0 ? 'discrepancy-positive' : 'discrepancy-negative') : 'no-discrepancy'}">
                    ${hasDiscrepancy ? discrepancy : 'No discrepancy'}
                </td>
                <td>
                    ${isDeleted ? '<span style="color: #dc3545;">Deleted</span>' : 'Active'}
                </td>
            `;
            
            // Add click event to select product for notes
            row.addEventListener('click', () => {
                selectProductForNotes(product);
            });
            
            // Highlight selected row
            if (product.id === selectedProductId) {
                row.style.backgroundColor = 'rgba(255, 213, 79, 0.1)';
            }
            
            inventoryTableBody.appendChild(row);
        });
    }
    
    // Select product for adding notes
    function selectProductForNotes(product) {
        selectedProductId = product.id;
        auditNotes.value = auditNotesData[product.id]?.notes || '';
        renderInventoryTable(searchInput.value);
    }
    
    // Save audit notes
    saveNotesBtn.addEventListener('click', function() {
        if (!selectedProductId) {
            alert('Please select a product first');
            return;
        }
        
        if (!auditNotes.value.trim()) {
            alert('Please enter some notes before saving');
            return;
        }
        
        // Save notes
        if (!auditNotesData[selectedProductId]) {
            auditNotesData[selectedProductId] = {};
        }
        
        auditNotesData[selectedProductId] = {
            notes: auditNotes.value.trim(),
            lastUpdated: new Date().toISOString(),
            updatedBy: 'auditor' // Could be enhanced with actual user info
        };
        
        localStorage.setItem('auditNotesData', JSON.stringify(auditNotesData));
        
        // Refresh table to show note indicator
        renderInventoryTable(searchInput.value);
        
        alert('Notes saved successfully!');
    });

    // Handle search
    searchInput.addEventListener('input', function() {
        renderInventoryTable(this.value);
    });
    
    // Handle logout
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentRole');
        window.location.href = 'index.html';
    });
    
    // Handle back to dashboard
    backToDashboardBtn.addEventListener('click', function() {
        window.location.href = 'audit.html';
    });
    
    // Initial render
    renderInventoryTable();
    
    // Set up real-time updates by checking for changes periodically
    let lastProductsUpdate = localStorage.getItem('productsLastUpdate') || 0;
    
    setInterval(() => {
        const currentUpdate = localStorage.getItem('productsLastUpdate') || 0;
        if (currentUpdate !== lastProductsUpdate) {
            lastProductsUpdate = currentUpdate;
            renderInventoryTable(searchInput.value);
        }
    }, 2000); // Check every 2 seconds
});