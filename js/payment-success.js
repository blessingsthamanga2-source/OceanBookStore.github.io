// Payment Success JavaScript for BookStore

console.log('Payment success script loaded');

let purchaseData = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment success page loaded');
    
    // Get payment ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment');
    
    if (!paymentId) {
        // No payment ID, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Load purchase data
    loadPurchaseData(paymentId);
    
    // Setup event listeners
    setupEventListeners();
});

// Load purchase data
function loadPurchaseData(paymentId) {
    try {
        const purchases = JSON.parse(localStorage.getItem('bookstore_purchases')) || [];
        
        // Find purchase by ID
        purchaseData = purchases.find(p => p.id === paymentId);
        
        if (!purchaseData) {
            // Try to find by Stripe payment ID
            purchaseData = purchases.find(p => p.stripePaymentId === paymentId);
        }
        
        if (!purchaseData) {
            alert('Purchase not found');
            window.location.href = 'index.html';
            return;
        }
        
        // Update UI with purchase details
        updatePurchaseDetails();
        
        // Display purchased books
        displayPurchasedBooks();
        
    } catch (error) {
        console.error('Error loading purchase:', error);
        alert('Error loading purchase details');
        window.location.href = 'index.html';
    }
}

// Update purchase details in UI
function updatePurchaseDetails() {
    if (!purchaseData) return;
    
    // Update text elements
    const elements = {
        'paymentId': purchaseData.id,
        'paymentDate': formatDate(purchaseData.date),
        'paymentAmount': formatCurrency(purchaseData.total),
        'commissionAmount': formatCurrency(purchaseData.platformCommission || purchaseData.total * 0.30)
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Display purchased books
function displayPurchasedBooks() {
    if (!purchaseData || !purchaseData.items) return;
    
    const container = document.getElementById('booksPurchased');
    if (!container) return;
    
    let html = '';
    
    purchaseData.items.forEach((item, index) => {
        html += `
            <div class="book-item">
                <div>
                    <strong>${item.title}</strong><br>
                    <small>by ${item.author}</small><br>
                    <small>Quantity: ${item.quantity || 1}</small>
                </div>
                <div>
                    <a href="#" class="download-link" data-book-id="${item.id}" onclick="downloadBook(${item.id}, event)">
                        ⬇️ Download
                    </a>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Setup event listeners
function setupEventListeners() {
    // Download all button
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', downloadAllBooks);
    }
    
    // Continue shopping button
    const continueBtn = document.querySelector('.btn-secondary');
    if (continueBtn) {
        continueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'reader-browse.html';
        });
    }
    
    // Back to home button
    const homeBtn = document.querySelector('.btn-success[href="index.html"]');
    if (homeBtn) {
        homeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
}

// Download a book
function downloadBook(bookId, event) {
    if (event) event.preventDefault();
    
    // Get book data
    const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
    const book = books.find(b => b.id === bookId);
    
    if (!book) {
        alert('Book not found');
        return;
    }
    
    // Create download content
    const downloadContent = `
        BOOK DOWNLOAD
        =============
        
        ${book.title}
        by ${book.author}
        
        Thank you for your purchase!
        
        This is a demo download. In a real implementation,
        this would be the actual book file (PDF/EPUB).
        
        Book Details:
        - Title: ${book.title}
        - Author: ${book.author}
        - Price: $${book.price.toFixed(2)}
        - Category: ${book.category || 'General'}
        
        Purchase Date: ${purchaseData.date}
        Purchase ID: ${purchaseData.id}
        
        You can download this book again anytime from your account.
        
        Enjoy your reading!
        
        ---
        BookStore - Digital Book Marketplace
        Authors earn 70% | Platform commission 30%
    `;
    
    // Create and trigger download
    const blob = new Blob([downloadContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}_${bookId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showDownloadSuccess(book.title);
}

// Download all books
function downloadAllBooks() {
    if (!purchaseData || !purchaseData.items) return;
    
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    if (downloadAllBtn) {
        downloadAllBtn.disabled = true;
        downloadAllBtn.textContent = 'Downloading...';
    }
    
    // Download each book with a delay
    let downloaded = 0;
    const total = purchaseData.items.length;
    
    purchaseData.items.forEach((item, index) => {
        setTimeout(() => {
            downloadBook(item.id);
            downloaded++;
            
            if (downloaded === total) {
                if (downloadAllBtn) {
                    downloadAllBtn.textContent = 'All Books Downloaded!';
                }
                alert('All books downloaded successfully!');
                
                // Re-enable button after 3 seconds
                setTimeout(() => {
                    if (downloadAllBtn) {
                        downloadAllBtn.disabled = false;
                        downloadAllBtn.textContent = '⬇️ Download All Books';
                    }
                }, 3000);
            }
        }, index * 1000); // 1 second delay between downloads
    });
}

// Show download success message
function showDownloadSuccess(bookTitle) {
    // Create notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = `✅ Downloaded: ${bookTitle}`;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
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
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);

// Export functions for use in HTML
window.downloadBook = downloadBook;
window.downloadAllBooks = downloadAllBooks;

// Export for use in other files
window.PaymentSuccess = {
    loadPurchaseData,
    formatCurrency,
    formatDate
};