document.addEventListener('DOMContentLoaded', function() {
    // Process any pending inventory updates
    processPendingInventoryUpdates();

    // DOM Elements
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const recycleBinTableBody = document.getElementById('recycleBinTableBody');
    const searchInput = document.getElementById('searchInput');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const inventoryTab = document.getElementById('inventoryTab');
    const recycleBinTab = document.getElementById('recycleBinTab');
    const inventoryTable = document.getElementById('inventoryTable');
    const recycleBinTable = document.getElementById('recycleBinTable');
    const inventoryControls = document.getElementById('inventoryControls');
    const recycleBinControls = document.getElementById('recycleBinControls');
    const emptyRecycleBin = document.getElementById('emptyRecycleBin');
    
    // Modal elements
    const deleteModal = document.getElementById('deleteModal');
    const deleteReason = document.getElementById('deleteReason');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    
    // Discrepancy modal elements
    const discrepancyModal = document.getElementById('discrepancyModal');
    const discrepancyDetails = document.getElementById('discrepancyDetails');
    const discrepancyNotes = document.getElementById('discrepancyNotes');
    const closeDiscrepancyModal = document.getElementById('closeDiscrepancyModal');
    const saveDiscrepancyRemarks = document.getElementById('saveDiscrepancyRemarks');
    
    // Variables for operations
    let productToDelete = null;
    let currentView = 'inventory';
    let currentDiscrepancyProduct = null;

    // Initialize data
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let deletedProducts = JSON.parse(localStorage.getItem('deletedProducts')) || [];
    let discrepancyRemarks = JSON.parse(localStorage.getItem('discrepancyRemarks')) || {};

    // Function to update inventory when orders are completed
    function updateInventoryForCompletedOrder(order) {
        try {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            
            order.items.forEach(orderItem => {
                const productIndex = products.findIndex(p => p.id === orderItem.id);
                
                if (productIndex !== -1) {
                    // Deduct the quantity from inventory
                    products[productIndex].quantity -= orderItem.quantity;
                    
                    // Ensure quantity doesn't go below 0
                    if (products[productIndex].quantity < 0) {
                        products[productIndex].quantity = 0;
                    }
                    
                    // Update low stock status
                    if (products[productIndex].quantity <= products[productIndex].lowStockThreshold) {
                        products[productIndex].lowStock = true;
                    } else {
                        products[productIndex].lowStock = false;
                    }
                    
                    console.log(`Deducted ${orderItem.quantity} ${orderItem.name} from inventory. Remaining: ${products[productIndex].quantity}`);
                } else {
                    console.warn(`Product ${orderItem.name} not found in inventory`);
                }
            });
            
            // Save updated products back to localStorage
            localStorage.setItem('products', JSON.stringify(products));
            
            // Refresh the inventory display if we're on the inventory page
            if (typeof renderInventoryTable === 'function') {
                renderInventoryTable();
            }
            
            return true;
        } catch (error) {
            console.error('Error updating inventory:', error);
            return false;
        }
    }

    // Function to process all pending inventory updates
    function processPendingInventoryUpdates() {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const inventoryUpdates = JSON.parse(localStorage.getItem('pendingInventoryUpdates')) || [];
            
            // Process orders that are completed but inventory not updated
            const completedOrders = orders.filter(order => 
                order.status === 'completed' && 
                !inventoryUpdates.includes(order.id)
            );
            
            completedOrders.forEach(order => {
                if (updateInventoryForCompletedOrder(order)) {
                    inventoryUpdates.push(order.id);
                    console.log(`Inventory updated for order ${order.id}`);
                }
            });
            
            // Save the processed updates
            localStorage.setItem('pendingInventoryUpdates', JSON.stringify(inventoryUpdates));
            
        } catch (error) {
            console.error('Error processing inventory updates:', error);
        }
    }

    // Render inventory table with discrepancy tracking
    function renderInventoryTable(filter = '') {
        inventoryTableBody.innerHTML = '';
       
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(filter.toLowerCase()) ||
            product.category.toLowerCase().includes(filter.toLowerCase())
        );
       
        if (filteredProducts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 30px;">
                    No inventory items found. Add products in Product Management.
                </td>
            `;
            inventoryTableBody.appendChild(row);
            return;
        }
       
        filteredProducts.forEach(product => {
            const row = document.createElement('tr');
            const expectedStock = product.expectedStock || product.quantity; // Fallback to quantity if expectedStock not set
            const actualStock = product.quantity;
            const discrepancy = expectedStock - actualStock;
            const hasDiscrepancy = discrepancy !== 0;
            const remarks = discrepancyRemarks[product.id] || "No remarks available";
            
            row.innerHTML = `
                <td>
                    ${product.image ? `<img src="${product.image}" style="max-width: 50px; max-height: 50px; margin-right: 10px; vertical-align: middle;">` : ''}
                    ${product.name}
                </td>
                <td>${product.category}</td>
                <td>${expectedStock}</td>
                <td>${actualStock}</td>
                <td class="${hasDiscrepancy ? (discrepancy > 0 ? 'discrepancy-positive' : 'discrepancy-negative') : 'no-discrepancy'}">
                    ${hasDiscrepancy ? discrepancy : 'No discrepancy'}
                    ${hasDiscrepancy ? `<button class="discrepancy-btn" data-id="${product.id}">Remarks</button>` : ''}
                </td>
                <td>
                    <button class="delete-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            
            // Add event listener to delete button
            row.querySelector('.delete-btn').addEventListener('click', () => {
                showDeleteModal(product);
            });
            
            // Add event listener to discrepancy button if it exists
            if (hasDiscrepancy) {
                row.querySelector('.discrepancy-btn').addEventListener('click', () => {
                    showDiscrepancyModal(product, remarks);
                });
            }
            
            inventoryTableBody.appendChild(row);
        });
    }

    // Render recycle bin table
    function renderRecycleBinTable() {
        recycleBinTableBody.innerHTML = '';
       
        if (deletedProducts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 30px;">
                    Recycle bin is empty
                </td>
            `;
            recycleBinTableBody.appendChild(row);
            return;
        }
       
        deletedProducts.forEach(product => {
            const row = document.createElement('tr');
           
            row.innerHTML = `
                <td>
                    ${product.image ? `<img src="${product.image}" style="max-width: 50px; max-height: 50px; margin-right: 10px; vertical-align: middle;">` : ''}
                    ${product.name}
                </td>
                <td>${product.category}</td>
                <td>${new Date(product.deletedOn).toLocaleString()}</td>
                <td>${product.deleteReason || 'No reason provided'}</td>
                <td>
                    <button class="restore-btn" data-id="${product.id}">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                </td>
            `;
           
            // Add event listener to restore button
            row.querySelector('.restore-btn').addEventListener('click', () => {
                restoreProduct(product.id);
            });
           
            recycleBinTableBody.appendChild(row);
        });
    }

    // Show delete confirmation modal
    function showDeleteModal(product) {
        productToDelete = product;
        deleteReason.value = '';
        deleteModal.style.display = 'block';
    }
    
    // Hide delete modal
    function hideDeleteModal() {
        deleteModal.style.display = 'none';
        productToDelete = null;
    }
    
    // Show discrepancy modal
    function showDiscrepancyModal(product, remarks) {
        currentDiscrepancyProduct = product;
        discrepancyDetails.textContent = `Product: ${product.name}\nExpected Stock: ${product.expectedStock || product.quantity}\nActual Stock: ${product.quantity}\nDiscrepancy: ${(product.expectedStock || product.quantity) - product.quantity}\n\nCurrent Remarks: ${remarks}`;
        discrepancyNotes.value = discrepancyRemarks[product.id] || '';
        discrepancyModal.style.display = 'block';
    }
    
    // Hide discrepancy modal
    function hideDiscrepancyModal() {
        discrepancyModal.style.display = 'none';
        currentDiscrepancyProduct = null;
    }
    
    // Save discrepancy remarks
    saveDiscrepancyRemarks.addEventListener('click', function() {
        if (currentDiscrepancyProduct) {
            discrepancyRemarks[currentDiscrepancyProduct.id] = discrepancyNotes.value.trim();
            localStorage.setItem('discrepancyRemarks', JSON.stringify(discrepancyRemarks));
            renderInventoryTable();
            hideDiscrepancyModal();
            alert('Remarks saved successfully!');
        }
    });
    
    // Close discrepancy modal
    closeDiscrepancyModal.addEventListener('click', hideDiscrepancyModal);
    
    // Handle delete confirmation
    confirmDelete.addEventListener('click', function() {
        if (!deleteReason.value.trim()) {
            alert('Please enter a reason for deletion');
            return;
        }
       
        // Add deletion details to product
        productToDelete.deletedOn = new Date().toISOString();
        productToDelete.deleteReason = deleteReason.value.trim();
       
        // Move product to recycle bin
        deletedProducts.push(productToDelete);
        products = products.filter(p => p.id !== productToDelete.id);
       
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
       
        // Refresh the tables
        if (currentView === 'inventory') {
            renderInventoryTable();
        } else {
            renderRecycleBinTable();
        }
       
        // Hide the modal
        hideDeleteModal();
       
        // Show success message
        alert('Product moved to recycle bin!');
    });
    
    // Restore product from recycle bin
    function restoreProduct(productId) {
        const productIndex = deletedProducts.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            const product = deletedProducts[productIndex];
           
            // Remove deletion metadata
            delete product.deletedOn;
            delete product.deleteReason;
           
            // Move back to active products
            products.push(product);
            deletedProducts.splice(productIndex, 1);
           
            // Save to localStorage
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
           
            // Refresh the tables
            renderInventoryTable();
            renderRecycleBinTable();
           
            // Show success message
            alert('Product restored successfully!');
        }
    }
    
    // Empty recycle bin
    emptyRecycleBin.addEventListener('click', function() {
        if (confirm('Are you sure you want to permanently delete all items in the recycle bin?')) {
            deletedProducts = [];
            localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
            renderRecycleBinTable();
            alert('Recycle bin emptied successfully!');
        }
    });
    
    // Handle cancel delete
    cancelDelete.addEventListener('click', hideDeleteModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === deleteModal) {
            hideDeleteModal();
        }
        if (event.target === discrepancyModal) {
            hideDiscrepancyModal();
        }
    });

    // Switch between inventory and recycle bin views
    inventoryTab.addEventListener('click', function() {
        if (currentView !== 'inventory') {
            currentView = 'inventory';
            inventoryTab.classList.add('active');
            recycleBinTab.classList.remove('active');
            inventoryTable.style.display = 'table';
            recycleBinTable.style.display = 'none';
            inventoryControls.style.display = 'block';
            recycleBinControls.style.display = 'none';
            renderInventoryTable();
        }
    });
    
    recycleBinTab.addEventListener('click', function() {
        if (currentView !== 'recycleBin') {
            currentView = 'recycleBin';
            recycleBinTab.classList.add('active');
            inventoryTab.classList.remove('active');
            recycleBinTable.style.display = 'table';
            inventoryTable.style.display = 'none';
            recycleBinControls.style.display = 'block';
            inventoryControls.style.display = 'none';
            renderRecycleBinTable();
        }
    });

    // Handle search
    searchInput.addEventListener('input', function() {
        if (currentView === 'inventory') {
            renderInventoryTable(this.value);
        }
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
    
    // Initial render
    renderInventoryTable();
    renderRecycleBinTable();
});