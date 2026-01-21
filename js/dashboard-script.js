// Author Dashboard JavaScript for BookStore

console.log('Dashboard script loaded');

let authorBooks = [];
let authorSales = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Author dashboard loaded');
    
    // Check if user is logged in as author
    const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
    
    if (!currentUser) {
        alert('Please login to access dashboard');
        window.location.href = 'login.html';
        return;
    }
    
    if (currentUser.type !== 'author' && currentUser.role !== 'admin') {
        alert('This dashboard is for authors only');
        window.location.href = 'index.html';
        return;
    }
    
    // Update user info
    updateUserInfo(currentUser);
    
    // Load author data
    loadAuthorData(currentUser);
    
    // Setup event listeners
    setupEventListeners();
});

// Update user info in UI
function updateUserInfo(user) {
    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');
    const email = document.getElementById('userEmail');
    
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (name) name.textContent = user.name;
    if (email) email.textContent = user.email;
}

// Load author data
function loadAuthorData(user) {
    // Load books
    loadAuthorBooks(user);
    
    // Load sales
    loadAuthorSales(user);
    
    // Update stats
    updateStats();
}

// Load author's books
function loadAuthorBooks(user) {
    const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
    
    // Filter books by this author
    authorBooks = books.filter(book => book.author === user.name || book.authorEmail === user.email);
    
    // Display books
    displayBooks();
}

// Load author's sales
function loadAuthorSales(user) {
    const purchases = JSON.parse(localStorage.getItem('bookstore_purchases')) || [];
    
    // Filter purchases that include this author's books
    authorSales = purchases.filter(purchase => {
        return purchase.items.some(item => {
            const book = authorBooks.find(b => b.id === item.id);
            return book !== undefined;
        });
    });
    
    // Display sales
    displaySales();
}

// Display books in table
function displayBooks() {
    const tableBody = document.getElementById('booksTableBody');
    const noBooksMessage = document.getElementById('noBooksMessage');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (authorBooks.length === 0) {
        if (noBooksMessage) {
            noBooksMessage.style.display = 'block';
        }
        return;
    }
    
    if (noBooksMessage) {
        noBooksMessage.style.display = 'none';
    }
    
    authorBooks.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${book.title}</strong></td>
            <td>$${book.price.toFixed(2)}</td>
            <td>${book.sales || 0}</td>
            <td>$${(book.authorEarnings || 0).toFixed(2)}</td>
            <td>
                <span class="book-status status-published">Published</span>
            </td>
            <td>
                <button class="btn-action btn-view" data-id="${book.id}">View</button>
                <button class="btn-action btn-edit" data-id="${book.id}">Edit</button>
                <button class="btn-action btn-delete" data-id="${book.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            viewBookDetails(bookId);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            editBook(bookId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            deleteBook(bookId);
        });
    });
}

// Display sales in table
function displaySales() {
    const tableBody = document.getElementById('salesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (authorSales.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;">
                No sales yet
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    // Take last 5 sales
    const recentSales = authorSales.slice(-5).reverse();
    
    recentSales.forEach(sale => {
        // Find author's books in this sale
        const authorItems = sale.items.filter(item => {
            const book = authorBooks.find(b => b.id === item.id);
            return book !== undefined;
        });
        
        if (authorItems.length === 0) return;
        
        // Calculate author's earnings from this sale
        const authorEarnings = authorItems.reduce((sum, item) => {
            const book = authorBooks.find(b => b.id === item.id);
            const quantity = item.quantity || 1;
            return sum + (book.price * quantity * 0.70); // 70% royalty
        }, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(sale.date)}</td>
            <td>${authorItems.map(item => item.title).join(', ')}</td>
            <td>$${authorItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)}</td>
            <td style="color: #2ecc71;">$${authorEarnings.toFixed(2)}</td>
            <td>
                <span class="book-status status-published">Completed</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update stats
function updateStats() {
    // Total books
    document.getElementById('totalBooks').textContent = authorBooks.length;
    
    // Total sales
    const totalSales = authorBooks.reduce((sum, book) => sum + (book.sales || 0), 0);
    document.getElementById('totalSales').textContent = totalSales;
    
    // Total earnings
    const totalEarnings = authorBooks.reduce((sum, book) => sum + (book.authorEarnings || 0), 0);
    document.getElementById('totalEarnings').textContent = `$${totalEarnings.toFixed(2)}`;
    
    // Average rating
    const avgRating = authorBooks.length > 0 
        ? authorBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / authorBooks.length
        : 0;
    document.getElementById('avgRating').textContent = avgRating.toFixed(1);
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('bookstore_current_user');
            alert('Logged out successfully');
            window.location.href = 'index.html';
        });
    }
    
    // Menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all
                menuItems.forEach(i => i.classList.remove('active'));
                
                // Add active to clicked
                this.classList.add('active');
                
                // Load section
                const section = this.getAttribute('href').substring(1);
                loadSection(section);
            }
        });
    });
    
    // Quick action buttons
    setupQuickActions();
}

// Setup quick actions
function setupQuickActions() {
    // View earnings
    const viewEarningsBtn = document.querySelector('[onclick="viewEarnings()"]');
    if (viewEarningsBtn) {
        viewEarningsBtn.addEventListener('click', viewEarnings);
    }
    
    // Export data
    const exportDataBtn = document.querySelector('[onclick="exportData()"]');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
}

// View book details
function viewBookDetails(bookId) {
    const book = authorBooks.find(b => b.id === bookId);
    if (!book) return;
    
    let message = `Title: ${book.title}\n`;
    message += `Author: ${book.author}\n`;
    message += `Price: $${book.price.toFixed(2)}\n`;
    message += `Category: ${book.category || 'Uncategorized'}\n`;
    message += `Sales: ${book.sales || 0}\n`;
    message += `Earnings: $${(book.authorEarnings || 0).toFixed(2)}\n`;
    message += `Uploaded: ${formatDate(book.uploadDate)}\n\n`;
    message += `Description:\n${book.description || 'No description'}`;
    
    alert(message);
}

// Edit book
function editBook(bookId) {
    alert(`Editing book #${bookId}\n\nIn a real dashboard, this would open an edit form.`);
}

// Delete book
function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
        // Remove from books array
        const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
        const updatedBooks = books.filter(book => book.id !== bookId);
        localStorage.setItem('bookstore_books', JSON.stringify(updatedBooks));
        
        // Update local data
        authorBooks = authorBooks.filter(book => book.id !== bookId);
        
        // Update UI
        displayBooks();
        updateStats();
        
        alert('Book deleted successfully');
    }
}

// View earnings
function viewEarnings() {
    const totalEarnings = authorBooks.reduce((sum, book) => sum + (book.authorEarnings || 0), 0);
    const totalSales = authorBooks.reduce((sum, book) => sum + (book.sales || 0), 0);
    
    let message = `📊 Earnings Report\n`;
    message += `================\n\n`;
    message += `Total Books: ${authorBooks.length}\n`;
    message += `Total Sales: ${totalSales}\n`;
    message += `Total Earnings: $${totalEarnings.toFixed(2)}\n\n`;
    
    message += `Book Breakdown:\n`;
    authorBooks.forEach(book => {
        message += `- ${book.title}: ${book.sales || 0} sales, $${(book.authorEarnings || 0).toFixed(2)}\n`;
    });
    
    message += `\nYou earn 70% of every sale!\n`;
    message += `Platform commission: 30%\n`;
    
    alert(message);
}

// Export data
function exportData() {
    const data = {
        author: document.getElementById('userName').textContent,
        books: authorBooks,
        sales: authorSales,
        totalEarnings: authorBooks.reduce((sum, book) => sum + (book.authorEarnings || 0), 0),
        exportDate: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookstore_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Data exported successfully!');
}

// Load section (for menu navigation)
function loadSection(section) {
    // In a real app, this would load different content
    // For now, we'll just show alerts
    switch(section) {
        case 'books':
            alert('Loading books management...');
            break;
        case 'earnings':
            viewEarnings();
            break;
        case 'settings':
            alert('Loading settings...');
            break;
        default:
            // Dashboard is default
            window.location.reload();
    }
}

// Format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Export functions for use in HTML
window.viewEarnings = viewEarnings;
window.exportData = exportData;

// Export for use in other files
window.Dashboard = {
    loadAuthorData,
    viewBookDetails,
    editBook,
    deleteBook
};