// Reader Browsing JavaScript for BookStore

console.log('Reader script loaded');

let currentBooks = [];
let filteredBooks = [];
let currentCategory = 'all';
let currentSearch = '';
let shoppingCart = [];
let bookModal = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Reader page loaded');
    
    // Load books
    loadBooks();
    
    // Load shopping cart
    loadShoppingCart();
    
    // Setup search and filters
    setupSearchAndFilters();
    
    // Setup cart icon
    setupCartIcon();
    
    // Setup modal
    setupModal();
    
    // Setup event listeners
    setupEventListeners();
});

// Load books from localStorage
function loadBooks() {
    try {
        const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
        currentBooks = books;
        filteredBooks = [...books];
        
        displayBooks(filteredBooks);
        
        // Update book count
        updateBookCount();
        
    } catch (error) {
        console.error('Error loading books:', error);
        showNotification('Error loading books', 'error');
    }
}

// Display books in grid
function displayBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    const noBooksMessage = document.getElementById('noBooksMessage');
    
    if (!booksGrid) return;
    
    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        if (noBooksMessage) {
            noBooksMessage.style.display = 'block';
        }
        return;
    }
    
    if (noBooksMessage) {
        noBooksMessage.style.display = 'none';
    }
    
    books.forEach(book => {
        const bookCard = createBookCard(book);
        booksGrid.appendChild(bookCard);
    });
}

// Create book card element
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    // Generate cover color based on book ID
    const coverColors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    const colorIndex = book.id % coverColors.length;
    
    card.innerHTML = `
        <div class="book-cover" style="background: ${coverColors[colorIndex]};">
            ${book.title.charAt(0)}
        </div>
        <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-author">by ${book.author}</div>
            <div class="book-rating">
                ${generateStarRating(book.rating || 0)}
            </div>
            <div class="book-price">$${book.price.toFixed(2)}</div>
            <button class="btn-buy" data-id="${book.id}">
                Add to Cart
            </button>
        </div>
    `;
    
    // Add click event to view details
    card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('btn-buy')) {
            openBookDetails(book);
        }
    });
    
    // Add cart event
    const buyBtn = card.querySelector('.btn-buy');
    buyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        addToCart(book);
    });
    
    return card;
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    if (hasHalfStar) {
        stars += '½';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars + ` ${rating.toFixed(1)}`;
}

// Load shopping cart
function loadShoppingCart() {
    shoppingCart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
    updateCartCount();
}

// Setup search and filters
function setupSearchAndFilters() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Category filters
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter by category
            currentCategory = this.getAttribute('data-category');
            filterBooks();
        });
    });
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        currentSearch = searchInput.value.trim().toLowerCase();
        filterBooks();
    }
}

// Filter books based on search and category
function filterBooks() {
    filteredBooks = currentBooks.filter(book => {
        // Filter by category
        if (currentCategory !== 'all' && book.category !== currentCategory) {
            return false;
        }
        
        // Filter by search
        if (currentSearch) {
            const searchTerm = currentSearch.toLowerCase();
            return (
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                (book.description && book.description.toLowerCase().includes(searchTerm)) ||
                (book.category && book.category.toLowerCase().includes(searchTerm))
            );
        }
        
        return true;
    });
    
    displayBooks(filteredBooks);
}

// Setup cart icon
function setupCartIcon() {
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            if (shoppingCart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert('Your cart is empty. Add some books first!');
            }
        });
    }
}

// Setup modal
function setupModal() {
    bookModal = document.getElementById('bookModal');
    const closeModal = document.getElementById('closeModal');
    
    if (bookModal && closeModal) {
        closeModal.addEventListener('click', function() {
            bookModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === bookModal) {
                bookModal.style.display = 'none';
            }
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Clear search button (if exists)
    const clearSearchBtn = document.querySelector('.clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }
}

// Open book details modal
function openBookDetails(book) {
    if (!bookModal) return;
    
    // Generate cover color
    const coverColors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    ];
    const colorIndex = book.id % coverColors.length;
    
    document.getElementById('modalBookTitle').textContent = book.title;
    
    const modalBody = document.getElementById('modalBookDetails');
    modalBody.innerHTML = `
        <div class="book-cover-large" style="text-align: center;">
            <div style="
                width: 200px;
                height: 300px;
                margin: 0 auto;
                background: ${coverColors[colorIndex]};
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 4rem;
                font-weight: bold;
            ">
                ${book.title.charAt(0)}
            </div>
            <div class="book-price" style="font-size: 2rem; margin-top: 20px;">
                $${book.price.toFixed(2)}
            </div>
        </div>
        <div class="book-details">
            <h3>by ${book.author}</h3>
            <p><strong>Category:</strong> ${book.category ? book.category.replace('-', ' ') : 'General'}</p>
            <p><strong>Rating:</strong> ${generateStarRating(book.rating || 0)}</p>
            <p><strong>Pages:</strong> ${book.pages || 'N/A'}</p>
            <p><strong>Sales:</strong> ${book.sales || 0}</p>
            
            <h3>Description</h3>
            <p>${book.description || 'No description available.'}</p>
            
            <h3>Purchase Options</h3>
            <p>Buy this book and download instantly in your preferred format.</p>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn-buy" style="flex: 1;" data-id="${book.id}">
                    Add to Cart - $${book.price.toFixed(2)}
                </button>
                <button class="btn-download" id="buyNowBtn" data-id="${book.id}">
                    Buy Now
                </button>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button class="btn" style="background: #95a5a6; color: white; width: 100%;" onclick="downloadSample(${book.id})">
                    📖 Download Sample
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners inside modal
    modalBody.querySelector('.btn-buy').addEventListener('click', function() {
        addToCart(book);
        bookModal.style.display = 'none';
    });
    
    document.getElementById('buyNowBtn').addEventListener('click', function() {
        buyNow(book);
    });
    
    bookModal.style.display = 'block';
}

// Add to cart
function addToCart(book) {
    // Check if already in cart
    const existingItem = shoppingCart.find(item => item.id === book.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        shoppingCart.push({
            ...book,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('bookstore_cart', JSON.stringify(shoppingCart));
    
    // Update UI
    updateCartCount();
    showNotification(`"${book.title}" added to cart!`);
}

// Buy now (direct purchase)
function buyNow(book) {
    // For now, just add to cart and redirect to checkout
    addToCart(book);
    
    // Redirect to checkout after 1 second
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 1000);
}

// REAL DOWNLOAD FUNCTION
async function downloadBook(bookId) {
    try {
        // Get the book from our backend
        const response = await fetch(`http://localhost:5000/api/books/${bookId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Book not found');
        }
        
        const book = data.book;
        
        // Check if user has purchased (simplified for now)
        // In real app, check purchase records
        const hasPurchased = confirm(`Download "${book.title}"?\n\nPrice: $${book.price}\n\nClick OK to download (demo: no payment required)`);
        
        if (!hasPurchased) return;
        
        // Download the file
        const link = document.createElement('a');
        link.href = book.bookFile.url;
        link.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}.${book.bookFile.format || 'pdf'}`;
        link.target = '_blank';
        
        // For Cloudinary, we need to add download parameter
        if (book.bookFile.url.includes('cloudinary.com')) {
            link.href = book.bookFile.url.replace('/upload/', '/upload/fl_attachment/');
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        alert(`✅ Download started!\n\n"${book.title}" is downloading.\n\nFile: ${link.download}`);
        
    } catch (error) {
        console.error('Download error:', error);
        alert(`Download failed: ${error.message}`);
    }
}

// Download sample function
async function downloadSample(bookId) {
    try {
        const response = await fetch(`http://localhost:5000/api/books/${bookId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Book not found');
        }
        
        const book = data.book;
        
        // Create sample download link
        const link = document.createElement('a');
        
        // For demo, use the actual book file as sample
        // In real app, you'd have separate sample file
        link.href = book.bookFile.url;
        link.download = `Sample_${book.title.replace(/[^a-z0-9]/gi, '_')}.${book.bookFile.format || 'pdf'}`;
        link.target = '_blank';
        
        // For Cloudinary, add sample parameter
        if (book.bookFile.url.includes('cloudinary.com')) {
            link.href = book.bookFile.url.replace('/upload/', '/upload/fl_attachment:Sample_/');
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`✅ Sample downloading!\n\nSample of "${book.title}"`);
        
    } catch (error) {
        console.error('Sample download error:', error);
        alert(`Sample download failed: ${error.message}`);
    }
}

// Update the modal to use real downloads
async function openBookDetails(book) {
    // ... existing modal code ...
    
    // Add download button that uses real download
    const modalBody = document.getElementById('modalBookDetails');
    modalBody.innerHTML += `
        <div style="margin-top: 20px;">
            <button onclick="downloadBook('${book.id}')" class="btn-buy" style="width: 100%;">
                ⬇️ Download Book ($${book.price})
            </button>
            <button onclick="downloadSample('${book.id}')" class="btn-download" style="width: 100%; margin-top: 10px; background: #3498db;">
                📖 Download Sample (Free)
            </button>
        </div>
    `;
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Update book count
function updateBookCount() {
    const bookCountElement = document.querySelector('.book-count');
    if (bookCountElement) {
        bookCountElement.textContent = filteredBooks.length;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Set color based on type
        if (type === 'error') {
            notification.style.background = '#e74c3c';
        } else if (type === 'info') {
            notification.style.background = '#3498db';
        } else {
            notification.style.background = '#2ecc71';
        }
        
        // Auto-hide
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    currentSearch = '';
    filterBooks();
}

// Export functions for use in HTML
window.clearSearch = clearSearch;
window.downloadSample = downloadSample;

// Export for use in other files
window.Reader = {
    addToCart,
    buyNow,
    filterBooks,
    loadBooks

};
