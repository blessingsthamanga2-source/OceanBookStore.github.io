// Admin Dashboard JavaScript for BookStore

console.log('Admin script loaded');

let earningsChart = null;
let categoryChart = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loaded');
    
    // Check if user is admin
    const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
    
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }
    
    // Update admin info
    updateAdminInfo(currentUser);
    
    // Update current date
    updateCurrentDate();
    
    // Load admin data
    loadAdminData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize charts
    initializeCharts();
});

// Update admin info
function updateAdminInfo(user) {
    const avatar = document.getElementById('adminAvatar');
    const name = document.getElementById('adminName');
    const email = document.getElementById('adminEmail');
    
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (name) name.textContent = user.name;
    if (email) email.textContent = user.email;
}

// Update current date
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Load all admin data
function loadAdminData() {
    // Load stats
    loadStats();
    
    // Load recent sales
    loadRecentSales();
    
    // Load recent books
    loadRecentBooks();
    
    // Load recent users
    loadRecentUsers();
    
    // Setup search functionality
    setupSearch();
}

// Load statistics
function loadStats() {
    try {
        const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
        const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
        const purchases = JSON.parse(localStorage.getItem('bookstore_purchases')) || [];
        
        // Calculate stats
        const totalUsers = users.length;
        const totalBooks = books.length;
        const totalSales = purchases.length;
        
        // Calculate platform earnings (30% commission)
        let platformEarnings = 0;
        purchases.forEach(purchase => {
            platformEarnings += purchase.total * 0.30;
        });
        
        // Calculate growth (demo data)
        const earningsGrowth = '12.5%';
        const usersGrowth = users.filter(u => {
            const created = new Date(u.createdAt);
            const today = new Date();
            return created.toDateString() === today.toDateString();
        }).length;
        
        const booksGrowth = books.filter(b => {
            const uploaded = new Date(b.uploadDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return uploaded > weekAgo;
        }).length;
        
        const salesGrowth = purchases.length > 0 ? 
            Math.round((purchases.filter(p => {
                const purchaseDate = new Date(p.date);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return purchaseDate > monthAgo;
            }).length / purchases.length) * 100) + '%' : '0%';
        
        // Update UI
        document.getElementById('platformEarnings').textContent = formatCurrency(platformEarnings);
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('totalSales').textContent = totalSales;
        document.getElementById('earningsGrowth').textContent = earningsGrowth;
        document.getElementById('usersGrowth').textContent = usersGrowth;
        document.getElementById('booksGrowth').textContent = booksGrowth;
        document.getElementById('salesGrowth').textContent = salesGrowth;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showAlert('Error loading statistics', 'error');
    }
}

// Load recent sales
function loadRecentSales(searchTerm = '') {
    try {
        const purchases = JSON.parse(localStorage.getItem('bookstore_purchases')) || [];
        const tableBody = document.getElementById('salesTableBody');
        
        if (!tableBody) return;
        
        // Filter if search term provided
        let filteredPurchases = purchases;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredPurchases = purchases.filter(purchase => 
                purchase.id.toLowerCase().includes(term) ||
                (purchase.customer && purchase.customer.name.toLowerCase().includes(term)) ||
                (purchase.customer && purchase.customer.email.toLowerCase().includes(term))
            );
        }
        
        // Sort by date (newest first)
        filteredPurchases.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Take first 10
        const recentPurchases = filteredPurchases.slice(0, 10);
        
        // Update table
        tableBody.innerHTML = '';
        
        if (recentPurchases.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <p>No sales found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        recentPurchases.forEach(purchase => {
            const booksCount = purchase.items ? purchase.items.length : 0;
            const platformCut = purchase.platformCommission || purchase.total * 0.30;
            const authorCut = purchase.authorsEarnings || purchase.total * 0.70;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${purchase.id}</strong></td>
                <td>
                    ${purchase.customer ? purchase.customer.name : 'Unknown'}<br>
                    <small>${purchase.customer ? purchase.customer.email : ''}</small>
                </td>
                <td>${booksCount} book${booksCount !== 1 ? 's' : ''}</td>
                <td>${formatCurrency(purchase.total)}</td>
                <td><strong style="color: #2ecc71;">${formatCurrency(platformCut)}</strong></td>
                <td><strong style="color: #3498db;">${formatCurrency(authorCut)}</strong></td>
                <td>${formatDate(purchase.date)}</td>
                <td>
                    <button class="btn-admin btn-view" data-id="${purchase.id}">View</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('#salesTableBody .btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                const purchaseId = this.getAttribute('data-id');
                viewPurchaseDetails(purchaseId);
            });
        });
        
    } catch (error) {
        console.error('Error loading sales:', error);
        showAlert('Error loading sales data', 'error');
    }
}

// Load recent books
function loadRecentBooks(searchTerm = '') {
    try {
        const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
        const tableBody = document.getElementById('booksTableBody');
        
        if (!tableBody) return;
        
        // Filter if search term provided
        let filteredBooks = books;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredBooks = books.filter(book => 
                book.title.toLowerCase().includes(term) ||
                book.author.toLowerCase().includes(term) ||
                book.category.toLowerCase().includes(term)
            );
        }
        
        // Sort by upload date (newest first)
        filteredBooks.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        // Take first 10
        const recentBooks = filteredBooks.slice(0, 10);
        
        // Update table
        tableBody.innerHTML = '';
        
        if (recentBooks.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <p>No books found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        recentBooks.forEach(book => {
            const sales = book.sales || 0;
            const authorEarnings = book.authorEarnings || 0;
            const platformCut = authorEarnings > 0 ? authorEarnings * 0.30 / 0.70 : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${book.title}</strong></td>
                <td>${book.author}</td>
                <td>${formatCurrency(book.price)}</td>
                <td>${sales}</td>
                <td>${formatCurrency(authorEarnings)}</td>
                <td><strong style="color: #2ecc71;">${formatCurrency(platformCut)}</strong></td>
                <td>
                    <span class="badge badge-success">Published</span>
                </td>
                <td>
                    <button class="btn-admin btn-view" data-id="${book.id}">View</button>
                    <button class="btn-admin btn-edit" data-id="${book.id}">Edit</button>
                    <button class="btn-admin btn-delete" data-id="${book.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('#booksTableBody .btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookId = parseInt(this.getAttribute('data-id'));
                viewBookDetails(bookId);
            });
        });
        
        document.querySelectorAll('#booksTableBody .btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookId = parseInt(this.getAttribute('data-id'));
                editBook(bookId);
            });
        });
        
        document.querySelectorAll('#booksTableBody .btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookId = parseInt(this.getAttribute('data-id'));
                deleteBook(bookId);
            });
        });
        
    } catch (error) {
        console.error('Error loading books:', error);
        showAlert('Error loading books data', 'error');
    }
}

// Load recent users
function loadRecentUsers(searchTerm = '') {
    try {
        const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
        const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
        const purchases = JSON.parse(localStorage.getItem('bookstore_purchases')) || [];
        const tableBody = document.getElementById('usersTableBody');
        
        if (!tableBody) return;
        
        // Filter if search term provided
        let filteredUsers = users;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredUsers = users.filter(user => 
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                user.type.toLowerCase().includes(term)
            );
        }
        
        // Sort by creation date (newest first)
        filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Take first 10
        const recentUsers = filteredUsers.slice(0, 10);
        
        // Update table
        tableBody.innerHTML = '';
        
        if (recentUsers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <p>No users found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        recentUsers.forEach(user => {
            // Count user's books (if author)
            const userBooks = books.filter(book => book.author === user.name || book.authorEmail === user.email);
            const booksCount = userBooks.length;
            
            // Count user's sales (if author)
            const userSales = purchases.filter(purchase => 
                purchase.items.some(item => 
                    userBooks.some(book => book.id === item.id)
                )
            ).length;
            
            // Get status badge
            let statusBadge = '';
            if (user.role === 'admin') {
                statusBadge = '<span class="badge badge-admin">Admin</span>';
            } else if (user.type === 'author') {
                statusBadge = '<span class="badge badge-success">Author</span>';
            } else {
                statusBadge = '<span class="badge badge-info">Reader</span>';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.type}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${booksCount}</td>
                <td>${userSales}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-admin btn-view" data-id="${user.id}">View</button>
                    <button class="btn-admin btn-edit" data-id="${user.id}">Edit</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('#usersTableBody .btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-id'));
                viewUserDetails(userId);
            });
        });
        
        document.querySelectorAll('#usersTableBody .btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-id'));
                editUser(userId);
            });
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Error loading users data', 'error');
    }
}

// Initialize charts
function initializeCharts() {
    try {
        // Earnings Chart
        const earningsCtx = document.getElementById('earningsChart');
        if (earningsCtx) {
            // Sample data for demo
            const monthlyData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Platform Earnings (30%)',
                    data: [1200, 1800, 2200, 1900, 2500, 3200],
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            };
            
            earningsChart = new Chart(earningsCtx.getContext('2d'), {
                type: 'line',
                data: monthlyData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `$${context.parsed.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Category Chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
            
            // Count books by category
            const categoryCount = {};
            books.forEach(book => {
                const category = book.category || 'uncategorized';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
            
            // Prepare chart data
            const chartData = {
                labels: Object.keys(categoryCount),
                datasets: [{
                    data: Object.values(categoryCount),
                    backgroundColor: [
                        '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
                        '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'
                    ],
                    borderWidth: 1
                }]
            };
            
            categoryChart = new Chart(categoryCtx.getContext('2d'), {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
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
    
    // Export data button
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAllData);
    }
    
    // Quick actions
    setupQuickActions();
    
    // Menu items
    setupMenuNavigation();
    
    // Search functionality
    setupSearch();
}

// Setup quick actions
function setupQuickActions() {
    // Add Book
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
        addBookBtn.addEventListener('click', function() {
            window.location.href = 'author-upload.html';
        });
    }
    
    // Add User
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', addUser);
    }
    
    // View Reports
    const viewReportsBtn = document.getElementById('viewReportsBtn');
    if (viewReportsBtn) {
        viewReportsBtn.addEventListener('click', viewReports);
    }
    
    // Send Email
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', sendEmail);
    }
    
    // Backup Data
    const backupDataBtn = document.getElementById('backupDataBtn');
    if (backupDataBtn) {
        backupDataBtn.addEventListener('click', backupData);
    }
    
    // Platform Settings
    const platformSettingsBtn = document.getElementById('platformSettingsBtn');
    if (platformSettingsBtn) {
        platformSettingsBtn.addEventListener('click', platformSettings);
    }
}

// Setup menu navigation
function setupMenuNavigation() {
    const menuItems = document.querySelectorAll('.admin-menu-item');
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
}

// Setup search
function setupSearch() {
    // Sales search
    const salesSearch = document.getElementById('salesSearch');
    if (salesSearch) {
        salesSearch.addEventListener('input', function() {
            loadRecentSales(this.value);
        });
    }
    
    // Books search
    const booksSearch = document.getElementById('booksSearch');
    if (booksSearch) {
        booksSearch.addEventListener('input', function() {
            loadRecentBooks(this.value);
        });
    }
    
    // Users search
    const usersSearch = document.getElementById('usersSearch');
    if (usersSearch) {
        usersSearch.addEventListener('input', function() {
            loadRecentUsers(this.value);
        });
    }
}

// View purchase details
function viewPurchaseDetails(purchaseId) {
    const purchases = JSON.parse(localStorage.getItem('bookstore_purchases')) || [];
    const purchase = purchases.find(p => p.id === purchaseId);
    
    if (!purchase) {
        showAlert('Purchase not found', 'error');
        return;
    }
    
    let message = `📊 Purchase Details\n`;
    message += `================\n\n`;
    message += `Order ID: ${purchase.id}\n`;
    message += `Date: ${purchase.date}\n`;
    message += `Customer: ${purchase.customer ? purchase.customer.name : 'Unknown'}\n`;
    message += `Email: ${purchase.customer ? purchase.customer.email : 'Unknown'}\n`;
    message += `Total: ${formatCurrency(purchase.total)}\n`;
    message += `Platform Commission (30%): ${formatCurrency(purchase.platformCommission || purchase.total * 0.30)}\n`;
    message += `Authors Earnings (70%): ${formatCurrency(purchase.authorsEarnings || purchase.total * 0.70)}\n\n`;
    
    if (purchase.items && purchase.items.length > 0) {
        message += 'Items:\n';
        purchase.items.forEach((item, index) => {
            message += `${index + 1}. ${item.title} by ${item.author} - ${formatCurrency(item.price)} x ${item.quantity || 1}\n`;
        });
    }
    
    alert(message);
}

// View book details
function viewBookDetails(bookId) {
    const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
    const book = books.find(b => b.id === bookId);
    
    if (!book) {
        showAlert('Book not found', 'error');
        return;
    }
    
    let message = `📚 Book Details\n`;
    message += `==============\n\n`;
    message += `Title: ${book.title}\n`;
    message += `Author: ${book.author}\n`;
    message += `Author Email: ${book.authorEmail || 'N/A'}\n`;
    message += `Price: ${formatCurrency(book.price)}\n`;
    message += `Category: ${book.category || 'Uncategorized'}\n`;
    message += `Sales: ${book.sales || 0}\n`;
    message += `Author Earnings: ${formatCurrency(book.authorEarnings || 0)}\n`;
    message += `Platform Commission: ${formatCurrency((book.authorEarnings || 0) * 0.30 / 0.70)}\n`;
    message += `Uploaded: ${formatDate(book.uploadDate)}\n\n`;
    message += `Description:\n${book.description || 'No description'}`;
    
    alert(message);
}

// Edit book
function editBook(bookId) {
    alert(`Editing book #${bookId}\n\nIn a real admin panel, this would open an edit form.`);
}

// Delete book
function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book? This will remove all sales records and cannot be undone.')) {
        const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
        const updatedBooks = books.filter(book => book.id !== bookId);
        localStorage.setItem('bookstore_books', JSON.stringify(updatedBooks));
        
        showAlert('Book deleted successfully', 'success');
        loadRecentBooks();
        loadStats();
        
        // Update charts if they exist
        if (categoryChart) {
            categoryChart.destroy();
            initializeCharts();
        }
    }
}

// View user details
function viewUserDetails(userId) {
    const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showAlert('User not found', 'error');
        return;
    }
    
    let message = `👤 User Details\n`;
    message += `==============\n\n`;
    message += `Name: ${user.name}\n`;
    message += `Email: ${user.email}\n`;
    message += `Type: ${user.type}\n`;
    message += `Role: ${user.role}\n`;
    message += `Joined: ${formatDate(user.createdAt)}\n`;
    message += `Balance: ${formatCurrency(user.balance || 0)}\n\n`;
    
    if (user.type === 'author') {
        const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
        const userBooks = books.filter(book => book.author === user.name || book.authorEmail === user.email);
        
        message += `Books Published: ${userBooks.length}\n`;
        message += `Total Sales: ${userBooks.reduce((sum, book) => sum + (book.sales || 0), 0)}\n`;
        message += `Total Earnings: ${formatCurrency(userBooks.reduce((sum, book) => sum + (book.authorEarnings || 0), 0))}\n`;
    }
    
    alert(message);
}

// Edit user
function editUser(userId) {
    alert(`Editing user #${userId}\n\nIn a real admin panel, this would open an edit form.`);
}

// Add user
function addUser() {
    const name = prompt('Enter user name:');
    if (!name) return;
    
    const email = prompt('Enter user email:');
    if (!email) return;
    
    const password = prompt('Enter temporary password (min 6 chars):');
    if (!password || password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    const type = prompt('User type (reader/author/admin):', 'reader');
    if (!['reader', 'author', 'admin'].includes(type.toLowerCase())) {
        alert('Invalid user type');
        return;
    }
    
    // Add user
    const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        type: type.toLowerCase(),
        role: type.toLowerCase() === 'admin' ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        balance: 0,
        books: type.toLowerCase() === 'author' ? [] : null
    };
    
    users.push(newUser);
    localStorage.setItem('bookstore_users', JSON.stringify(users));
    
    showAlert(`User "${name}" added successfully. Password: ${password}`, 'success');
    loadRecentUsers();
    loadStats();
}

// View reports
function viewReports() {
    const purchases = JSON.parse(localStorage.getItem('bookstore_purchases')) || [];
    const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
    const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
    
    let message = `📈 Platform Reports\n`;
    message += `==================\n\n`;
    message += `Total Users: ${users.length}\n`;
    message += `- Authors: ${users.filter(u => u.type === 'author').length}\n`;
    message += `- Readers: ${users.filter(u => u.type === 'reader').length}\n`;
    message += `- Admins: ${users.filter(u => u.role === 'admin').length}\n\n`;
    
    message += `Total Books: ${books.length}\n`;
    message += `Total Sales: ${purchases.length}\n\n`;
    
    // Calculate platform earnings
    let platformEarnings = 0;
    let authorsEarnings = 0;
    
    purchases.forEach(purchase => {
        platformEarnings += purchase.total * 0.30;
        authorsEarnings += purchase.total * 0.70;
    });
    
    message += `Platform Earnings (30%): ${formatCurrency(platformEarnings)}\n`;
    message += `Authors Earnings (70%): ${formatCurrency(authorsEarnings)}\n`;
    message += `Total Revenue: ${formatCurrency(platformEarnings + authorsEarnings)}\n\n`;
    
    // Top selling books
    message += `Top Selling Books:\n`;
    const sortedBooks = [...books].sort((a, b) => (b.sales || 0) - (a.sales || 0));
    sortedBooks.slice(0, 5).forEach((book, index) => {
        message += `${index + 1}. ${book.title} - ${book.sales || 0} sales\n`;
    });
    
    alert(message);
}

// Send email
function sendEmail() {
    const emailType = prompt('Email type (announcement/promotion/notification):', 'announcement');
    if (!emailType) return;
    
    alert(`Email ${emailType} would be sent to all users.\n\nIn a real implementation, this would integrate with an email service.`);
}

// Backup data
function backupData() {
    exportAllData();
}

// Platform settings
function platformSettings() {
    alert('Platform Settings:\n\n- Commission Rate: 30%\n- Payment Processor: Stripe\n- File Storage: Local (demo)\n\nIn a real panel, you could change these settings.');
}

// Export all data
function exportAllData() {
    try {
        const data = {
            users: JSON.parse(localStorage.getItem('bookstore_users')) || [],
            books: JSON.parse(localStorage.getItem('bookstore_books')) || [],
            purchases: JSON.parse(localStorage.getItem('bookstore_purchases')) || [],
            exportDate: new Date().toISOString(),
            exportType: 'full_backup'
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookstore_full_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAlert('All data exported successfully', 'success');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showAlert('Error exporting data', 'error');
    }
}

// Load section
function loadSection(section) {
    // In a real app, this would load different content
    // For now, we'll just show alerts
    switch(section) {
        case 'earnings':
            viewReports();
            break;
        case 'users':
            alert('Loading users management...');
            break;
        case 'authors':
            alert('Loading authors management...');
            break;
        case 'analytics':
            alert('Loading analytics dashboard...');
            break;
        case 'settings':
            platformSettings();
            break;
        default:
            // Dashboard is default
            window.location.reload();
    }
}

// Show alert
function showAlert(message, type = 'info') {
    const alertBox = document.getElementById('adminAlert');
    if (!alertBox) return;
    
    alertBox.textContent = message;
    alertBox.className = `admin-alert alert-${type}`;
    alertBox.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
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
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export functions for use in other files
window.Admin = {
    loadAdminData,
    viewPurchaseDetails,
    viewBookDetails,
    editBook,
    deleteBook,
    viewUserDetails,
    editUser,
    addUser,
    viewReports,
    exportAllData
};