document.addEventListener('DOMContentLoaded', function() {


    // DOM Elements
    const productForm = document.getElementById('productForm');
    const productTableBody = document.getElementById('productTableBody');
    const cancelBtn = document.getElementById('cancelBtn');
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('searchInput');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const productImageField = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
   
    // Form fields
    const productIdField = document.getElementById('productId');
    const productNameField = document.getElementById('productName');
    const productCategoryField = document.getElementById('productCategory');
    const productPriceField = document.getElementById('productPrice');
    const productQuantityField = document.getElementById('productQuantity');
    const productDescriptionField = document.getElementById('productDescription');
   
    // Initialize products array from localStorage or create empty array
    let products = JSON.parse(localStorage.getItem('products')) || [];
   
    // Function to convert image to base64
    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Image preview handler
    productImageField.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });

    // Render product table
    function renderProductTable(filter = '') {
        productTableBody.innerHTML = '';
       
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(filter.toLowerCase()) ||
            product.category.toLowerCase().includes(filter.toLowerCase())
        );
       
        if (filteredProducts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 30px;">
                    No products found. Add your first product above.
                </td>
            `;
            productTableBody.appendChild(row);
            return;
        }
       
        filteredProducts.forEach(product => {
            const row = document.createElement('tr');
           
            row.innerHTML = `
                <td>
                    ${product.image ? `<img src="${product.image}" style="max-width: 50px; max-height: 50px; margin-right: 10px; vertical-align: middle;">` : ''}
                    ${product.name}
                </td>
                <td>${product.category}</td>
                <td>₱${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            `;
           
            productTableBody.appendChild(row);
            
            // Add event listener to edit button
            row.querySelector('.edit-btn').addEventListener('click', handleEdit);
        });
    }
   
    // Handle form submission
    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
       
        let imageBase64 = '';
        if (productImageField.files[0]) {
            imageBase64 = await getBase64(productImageField.files[0]);
        } else if (productIdField.value) {
            // Keep existing image if editing and no new image selected
            const existingProduct = products.find(p => p.id === productIdField.value);
            imageBase64 = existingProduct?.image || '';
        }

        const productData = {
            id: productIdField.value || Date.now().toString(),
            name: productNameField.value,
            category: productCategoryField.value,
            price: parseFloat(productPriceField.value),
            quantity: parseInt(productQuantityField.value),
            description: productDescriptionField.value,
            image: imageBase64
        };
       
        if (productIdField.value) {
            // Update existing product
            const index = products.findIndex(p => p.id === productIdField.value);
            if (index !== -1) {
                products[index] = productData;
            }
        } else {
            // Add new product
            products.push(productData);
        }
       
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
       
        // Reset form and refresh table
        resetForm();
        renderProductTable();
       
        // Show success message
        alert('Product saved successfully!');
    });
   
    // Handle edit
    function handleEdit(e) {
        const productId = e.target.closest('button').getAttribute('data-id');
        const product = products.find(p => p.id === productId);
       
        if (product) {
            productIdField.value = product.id;
            productNameField.value = product.name;
            productCategoryField.value = product.category;
            productPriceField.value = product.price;
            productQuantityField.value = product.quantity;
            productDescriptionField.value = product.description || '';
           
            // Show existing image if available
            if (product.image) {
                previewImage.src = product.image;
                imagePreview.style.display = 'block';
            } else {
                imagePreview.style.display = 'none';
            }
           
            // Scroll to form
            document.querySelector('.product-form-container').scrollIntoView({
                behavior: 'smooth'
            });
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
        renderProductTable(this.value);
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
        productForm.reset();
        productIdField.value = '';
        imagePreview.style.display = 'none';
        previewImage.src = '#';
    }
   
    // Initial render
    renderProductTable();
});