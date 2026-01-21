// Checkout JavaScript for BookStore

console.log('Checkout script loaded');

let shoppingCart = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded');
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
    if (!currentUser) {
        alert('Please login to checkout');
        window.location.href = 'login.html';
        return;
    }
    
    // Load shopping cart
    loadShoppingCart();
    
    // Setup event listeners
    setupEventListeners();
    
    // Auto-fill user info
    autoFillUserInfo(currentUser);
});

// Load shopping cart
function loadShoppingCart() {
    shoppingCart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
    
    if (shoppingCart.length === 0) {
        showEmptyCart();
    } else {
        displayCartItems();
        updateOrderSummary();
        updatePayButton();
    }
}

// Show empty cart message
function showEmptyCart() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-cart">
            <div>🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some books before checking out!</p>
            <a href="reader-browse.html" class="btn btn-primary">
                Browse Books →
            </a>
        </div>
    `;
    
    // Disable pay button
    const payButton = document.getElementById('payButton');
    if (payButton) {
        payButton.disabled = true;
    }
}

// Display cart items
function displayCartItems() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;
    
    let html = '';
    
    shoppingCart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const colorIndex = item.id % 5;
        const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
        
        html += `
            <div class="cart-item" data-index="${index}">
                <div class="cart-item-cover" style="background: ${colors[colorIndex]}">
                    ${item.title.charAt(0)}
                </div>
                
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>by ${item.author}</p>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                </div>
                
                <div>
                    <div class="item-price">$${itemTotal.toFixed(2)}</div>
                    <button class="remove-item" data-index="${index}">Remove</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners for quantity controls
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateQuantity(index, -1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateQuantity(index, 1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeItem(index);
        });
    });
}

// Update quantity
function updateQuantity(index, change) {
    const newQuantity = shoppingCart[index].quantity + change;
    
    if (newQuantity < 1) {
        removeItem(index);
        return;
    }
    
    if (newQuantity > 10) {
        alert('Maximum 10 copies per book');
        return;
    }
    
    shoppingCart[index].quantity = newQuantity;
    saveCart();
    displayCartItems();
    updateOrderSummary();
    updatePayButton();
}

// Remove item
function removeItem(index) {
    if (confirm(`Remove "${shoppingCart[index].title}" from cart?`)) {
        shoppingCart.splice(index, 1);
        saveCart();
        
        if (shoppingCart.length === 0) {
            showEmptyCart();
        } else {
            displayCartItems();
            updateOrderSummary();
            updatePayButton();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('bookstore_cart', JSON.stringify(shoppingCart));
}

// Update order summary
function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    if (!orderSummary) return;
    
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    const platformCommission = subtotal * 0.30; // 30% commission
    const authorsEarnings = subtotal * 0.70; // 70% for authors
    
    orderSummary.innerHTML = `
        <div class="summary-item">
            <span>Subtotal (${getTotalItems()} items)</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Estimated Tax (8%)</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-item summary-total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #ecf0f1;">
            <h4>Earnings Breakdown:</h4>
            <div class="summary-item">
                <span>Platform Commission (30%):</span>
                <span style="color: #2ecc71;">$${platformCommission.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Authors' Earnings (70%):</span>
                <span style="color: #3498db;">$${authorsEarnings.toFixed(2)}</span>
            </div>
        </div>
    `;
}

// Calculate subtotal
function calculateSubtotal() {
    return shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Get total items in cart
function getTotalItems() {
    return shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
}

// Update pay button
function updatePayButton() {
    const payButton = document.getElementById('payButton');
    if (!payButton) return;
    
    const isFormValid = document.getElementById('paymentForm')?.checkValidity() || false;
    const hasItems = shoppingCart.length > 0;
    const total = calculateSubtotal() * 1.08; // Including tax
    
    payButton.disabled = !(isFormValid && hasItems);
    payButton.textContent = hasItems 
        ? `Pay $${total.toFixed(2)}` 
        : 'Complete Purchase';
}

// Setup event listeners
function setupEventListeners() {
    // Form validation
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('input', updatePayButton);
    }
    
    // Pay button
    const payButton = document.getElementById('payButton');
    if (payButton) {
        payButton.addEventListener('click', processPayment);
    }
    
    // Test card info
    setupTestCardInfo();
}

// Auto-fill user info
function autoFillUserInfo(user) {
    const emailInput = document.getElementById('email');
    const firstNameInput = document.getElementById('firstName');
    
    if (emailInput && user.email) {
        emailInput.value = user.email;
    }
    
    if (firstNameInput && user.name) {
        const firstName = user.name.split(' ')[0];
        firstNameInput.value = firstName;
    }
}

// Setup test card info
function setupTestCardInfo() {
    // Auto-fill test card for demo
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiry');
    const cvcInput = document.getElementById('cvc');
    
    if (cardNumberInput && !cardNumberInput.value) {
        // Don't auto-fill in production
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('netlify')) {
            cardNumberInput.value = '4242 4242 4242 4242';
            expiryInput.value = '12/30';
            cvcInput.value = '123';
        }
    }
}

// Process payment
async function processPayment(e) {
    e.preventDefault();
    
    if (isProcessing) return;
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
    if (!currentUser) {
        alert('Please login to complete purchase');
        window.location.href = 'login.html';
        return;
    }
    
    // Validate form
    const paymentForm = document.getElementById('paymentForm');
    if (!paymentForm || !paymentForm.checkValidity()) {
        alert('Please fill in all required fields correctly');
        return;
    }
    
    // Validate cart
    if (shoppingCart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('expiry').value.trim();
    const cvc = document.getElementById('cvc').value.trim();
    const termsAccepted = document.getElementById('terms')?.checked || false;
    
    if (!termsAccepted) {
        alert('Please accept the Terms of Service');
        return;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Validate card (basic validation)
    if (!isValidCard(cardNumber, expiry, cvc)) {
        alert('Please check your card details');
        return;
    }
    
    // Start processing
    isProcessing = true;
    const payButton = document.getElementById('payButton');
    const originalText = payButton.textContent;
    payButton.textContent = 'Processing...';
    payButton.disabled = true;
    
    try {
        // Simulate payment processing
        const paymentResult = await simulatePaymentProcessing();
        
        if (paymentResult.success) {
            await handleSuccessfulPayment(currentUser, email, paymentResult);
        } else {
            throw new Error(paymentResult.message || 'Payment failed');
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        
        // Show error message
        alert(`Payment failed: ${error.message}\n\nPlease try again or use a different card.`);
        
        // Reset button
        payButton.textContent = originalText;
        payButton.disabled = false;
        isProcessing = false;
    }
}

// Simulate payment processing
async function simulatePaymentProcessing() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, always succeed with test cards
    // In real app, integrate with Stripe/other payment processor
    return {
        success: true,
        paymentId: 'pi_' + Math.random().toString(36).substr(2, 14),
        amount: calculateSubtotal() * 1.08,
        receiptUrl: 'https://stripe.com/receipt/demo'
    };
}

// Handle successful payment
async function handleSuccessfulPayment(user, email, paymentResult) {
    try {
        const purchaseId = 'BK-' + Date.now();
        const purchaseDate = new Date().toLocaleString();
        const total = calculateSubtotal() * 1.08;
        
        // Create purchase record
        const purchaseData = {
            id: purchaseId,
            stripePaymentId: paymentResult.paymentId,
            date: purchaseDate,
            customer: {
                id: user.id,
                name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
                email: email
            },
            items: [...shoppingCart],
            total: total,
            platformCommission: total * 0.30,
            authorsEarnings: total * 0.70,
            receiptUrl: paymentResult.receiptUrl
        };
        
        // Save purchase to database
        savePurchase(purchaseData);
        
        // Record purchase for file access (in real app)
        recordPurchaseForDownloads(user.id, purchaseData.items);
        
        // Clear cart
        shoppingCart = [];
        localStorage.removeItem('bookstore_cart');
        
        // Generate receipt
        generateReceipt(purchaseData);
        
        // Show success message
        const booksCount = purchaseData.items.reduce((sum, item) => sum + item.quantity, 0);
        
        const successMessage = `
✅ PAYMENT SUCCESSFUL!

Receipt #: ${purchaseId}
Date: ${purchaseDate}
Customer: ${user.name}
Email: ${email}
Books Purchased: ${booksCount}
Total Paid: $${total.toFixed(2)}

💰 Platform Commission: $${(total * 0.30).toFixed(2)}
📚 Authors Earnings: $${(total * 0.70).toFixed(2)}

Books are now available for download!
Thank you for your business!
        `;
        
        alert(successMessage);
        
        // Redirect to success page
        window.location.href = 'payment-success.html?payment=' + purchaseId;
        
    } catch (error) {
        console.error('Error handling successful payment:', error);
        alert('Payment processed but there was an error saving your purchase. Please contact support.');
        throw error;
    }
}

// Save purchase to localStorage
function savePurchase(purchaseData) {
    const purchases = JSON.parse(localStorage.getItem('bookstore_purchases')) || [];
    purchases.push(purchaseData);
    localStorage.setItem('bookstore_purchases', JSON.stringify(purchases));
}

// Record purchase for downloads (simulated)
function recordPurchaseForDownloads(userId, items) {
    // In a real app, this would record which books the user can download
    console.log(`Recording purchase for user ${userId}:`, items);
}

// Generate receipt (simulated)
function generateReceipt(purchaseData) {
    // In a real app, this would generate and email a receipt
    console.log('Generating receipt:', purchaseData);
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate card (basic validation for demo)
function isValidCard(cardNumber, expiry, cvc) {
    // Remove spaces from card number
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    // Basic validation
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        return false;
    }
    
    // Validate expiry (MM/YY format)
    const [month, year] = expiry.split('/').map(num => parseInt(num.trim()));
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (!month || !year || month < 1 || month > 12 || year < currentYear || 
        (year === currentYear && month < currentMonth)) {
        return false;
    }
    
    // Validate CVC
    if (!cvc || cvc.length < 3 || cvc.length > 4) {
        return false;
    }
    
    return true;
}

// Export functions for use in other files
window.Checkout = {
    updateQuantity,
    removeItem,
    calculateSubtotal,
    processPayment
};