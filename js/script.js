// Main JavaScript for BookStore

console.log('BookStore loaded successfully!');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Check if user is logged in
    checkLoginStatus();
    
    // Initialize sample data if empty
    initializeSampleData();
    
    // Add any global event listeners
    setupGlobalListeners();
});

// Check if user is logged in
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
    
    if (currentUser) {
        console.log('User logged in:', currentUser.name);
        updateNavigationForUser(currentUser);
    } else {
        console.log('No user logged in');
    }
}

// Update navigation based on user role
function updateNavigationForUser(user) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    // Add user-specific links
    let userLink = '';
    if (user.role === 'admin') {
        userLink = `<a href="admin-dashboard.html" class="btn" style="background: #9b59b6; color: white; padding: 8px 15px;">
            👑 Admin
        </a>`;
    } else if (user.type === 'author') {
        userLink = `<a href="author-dashboard.html" class="btn" style="background: #3498db; color: white; padding: 8px 15px;">
            Author Dashboard
        </a>`;
    } else {
        userLink = `<a href="reader-browse.html" class="btn" style="background: #2ecc71; color: white; padding: 8px 15px;">
            My Books
        </a>`;
    }
    
    // Add logout button
    const logoutBtn = `<button onclick="logout()" class="btn" style="background: #e74c3c; color: white; padding: 8px 15px;">
        Logout
    </button>`;
    
    // Update navigation
    navLinks.innerHTML += userLink + logoutBtn;
}

// Initialize sample data
function initializeSampleData() {
    // Only initialize if no data exists
    if (!localStorage.getItem('bookstore_books')) {
        console.log('Initializing sample data...');
        
        // Sample books
        const sampleBooks = [
            {
                id: 1,
                title: "The Midnight Library",
                author: "Matt Haig",
                authorEmail: "matt@example.com",
                price: 12.99,
                description: "Between life and death there is a library. When Nora Seed finds herself in the Midnight Library, she has a chance to make things right.",
                category: "fiction",
                rating: 4.5,
                pages: 304,
                uploadDate: "2023-10-15T10:30:00Z",
                sales: 42,
                authorEarnings: 380.25,
                fileId: "sample_1_book",
                coverFileId: "sample_1_cover",
                sampleFileId: "sample_1_sample"
            },
            {
                id: 2,
                title: "Atomic Habits",
                author: "James Clear",
                authorEmail: "james@example.com",
                price: 14.99,
                description: "Tiny Changes, Remarkable Results. An easy & proven way to build good habits & break bad ones.",
                category: "non-fiction",
                rating: 4.8,
                pages: 320,
                uploadDate: "2023-10-10T14:20:00Z",
                sales: 87,
                authorEarnings: 913.50,
                fileId: "sample_2_book",
                coverFileId: "sample_2_cover",
                sampleFileId: "sample_2_sample"
            },
            {
                id: 3,
                title: "The Love Hypothesis",
                author: "Ali Hazelwood",
                authorEmail: "ali@example.com",
                price: 9.99,
                description: "A smart, funny STEMinist romance. As a third-year Ph.D. candidate, Olive Smith doesn't believe in lasting romantic relationships.",
                category: "romance",
                rating: 4.7,
                pages: 384,
                uploadDate: "2023-10-05T09:15:00Z",
                sales: 63,
                authorEarnings: 440.37,
                fileId: "sample_3_book",
                coverFileId: "sample_3_cover",
                sampleFileId: "sample_3_sample"
            }
        ];
        
        localStorage.setItem('bookstore_books', JSON.stringify(sampleBooks));
        
        // Sample purchases
        const samplePurchases = [
            {
                id: "BK-123456789",
                stripePaymentId: "pi_sample_123",
                date: "2023-10-20T14:30:00Z",
                customer: {
                    id: 1001,
                    name: "John Reader",
                    email: "john@example.com"
                },
                items: [
                    { id: 1, title: "The Midnight Library", author: "Matt Haig", price: 12.99, quantity: 1 }
                ],
                total: 12.99,
                yourCommission: 3.90,
                authorsEarnings: 9.09,
                receiptUrl: "https://stripe.com/receipt/sample"
            },
            {
                id: "BK-123456790",
                stripePaymentId: "pi_sample_124",
                date: "2023-10-18T11:20:00Z",
                customer: {
                    id: 1002,
                    name: "Sarah Booklover",
                    email: "sarah@example.com"
                },
                items: [
                    { id: 2, title: "Atomic Habits", author: "James Clear", price: 14.99, quantity: 1 },
                    { id: 3, title: "The Love Hypothesis", author: "Ali Hazelwood", price: 9.99, quantity: 1 }
                ],
                total: 24.98,
                yourCommission: 7.49,
                authorsEarnings: 17.49,
                receiptUrl: "https://stripe.com/receipt/sample2"
            }
        ];
        
        localStorage.setItem('bookstore_purchases', JSON.stringify(samplePurchases));
        
        console.log('Sample data initialized');
    }
}

// Setup global event listeners
function setupGlobalListeners() {
    // Add logout functionality to all logout buttons
    document.querySelectorAll('[onclick*="logout"]').forEach(btn => {
        btn.addEventListener('click', logout);
    });
    
    // Add confirmation for destructive actions
    document.querySelectorAll('.btn-danger, .btn-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to proceed?')) {
                e.preventDefault();
            }
        });
    });
}

// Logout function
function logout() {
    localStorage.removeItem('bookstore_current_user');
    alert('Logged out successfully');
    window.location.href = 'index.html';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#2ecc71';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else if (type === 'info') {
        notification.style.background = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Export functions for use in other files
window.BookStore = {
    formatCurrency,
    formatDate,
    showNotification,
    logout,
    checkLoginStatus
};