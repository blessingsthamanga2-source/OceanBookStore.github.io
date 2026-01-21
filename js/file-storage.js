// File Storage System for BookStore
// Uses localStorage for demo purposes (in real app, use IndexedDB or server storage)

console.log('File storage system loaded');

const FileStorage = {
    // Save file data (simulated)
    saveFile: async function(bookId, file, type = 'book') {
        console.log(`Simulating file upload: ${file.name} for book ${bookId}`);
        
        // In a real app, this would upload to server
        // For demo, we'll just store file info
        return new Promise((resolve) => {
            setTimeout(() => {
                const fileId = `${bookId}_${type}_${Date.now()}`;
                
                // Store file info
                const fileInfo = {
                    id: fileId,
                    bookId: bookId,
                    type: type,
                    name: file.name,
                    size: file.size,
                    mimeType: file.type,
                    uploadedAt: new Date().toISOString()
                };
                
                // Save to localStorage (in real app, this would be server-side)
                const files = JSON.parse(localStorage.getItem('bookstore_files')) || [];
                files.push(fileInfo);
                localStorage.setItem('bookstore_files', JSON.stringify(files));
                
                console.log(`File saved: ${file.name} (ID: ${fileId})`);
                resolve(fileId);
            }, 1000); // Simulate upload delay
        });
    },
    
    // Get file info
    getFile: async function(fileId) {
        const files = JSON.parse(localStorage.getItem('bookstore_files')) || [];
        return files.find(file => file.id === fileId) || null;
    },
    
    // Get all files for a book
    getBookFiles: async function(bookId) {
        const files = JSON.parse(localStorage.getItem('bookstore_files')) || [];
        return files.filter(file => file.bookId === bookId);
    },
    
    // Record purchase for download access
    recordPurchase: async function(userId, bookId, purchaseId) {
        console.log(`Recording purchase: User ${userId} purchased book ${bookId}`);
        
        // In a real app, this would be saved to server database
        const purchases = JSON.parse(localStorage.getItem('bookstore_user_purchases')) || [];
        
        purchases.push({
            userId: userId,
            bookId: bookId,
            purchaseId: purchaseId,
            purchaseDate: new Date().toISOString(),
            downloads: 0
        });
        
        localStorage.setItem('bookstore_user_purchases', JSON.stringify(purchases));
        
        return true;
    },
    
    // Check if user can download a book
    canDownload: async function(userId, bookId) {
        const purchases = JSON.parse(localStorage.getItem('bookstore_user_purchases')) || [];
        const purchase = purchases.find(p => p.userId === userId && p.bookId === bookId);
        
        return {
            canDownload: !!purchase,
            purchaseId: purchase ? purchase.purchaseId : null,
            downloads: purchase ? purchase.downloads : 0
        };
    },
    
    // Increment download count
    incrementDownload: async function(purchaseId) {
        const purchases = JSON.parse(localStorage.getItem('bookstore_user_purchases')) || [];
        const purchaseIndex = purchases.findIndex(p => p.purchaseId === purchaseId);
        
        if (purchaseIndex !== -1) {
            purchases[purchaseIndex].downloads += 1;
            purchases[purchaseIndex].lastDownload = new Date().toISOString();
            localStorage.setItem('bookstore_user_purchases', JSON.stringify(purchases));
            return purchases[purchaseIndex].downloads;
        }
        
        return 0;
    },
    
    // Delete book files
    deleteBookFiles: async function(bookId) {
        const files = JSON.parse(localStorage.getItem('bookstore_files')) || [];
        const updatedFiles = files.filter(file => file.bookId !== bookId);
        localStorage.setItem('bookstore_files', JSON.stringify(updatedFiles));
        return true;
    },
    
    // Get storage statistics
    getStats: async function() {
        const files = JSON.parse(localStorage.getItem('bookstore_files')) || [];
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        
        return {
            fileCount: files.length,
            totalSize: totalSize,
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
        };
    }
};

// Download file helper
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Validate file type
function validateFileType(file, allowedTypes) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    
    // Check by extension
    const hasValidExtension = allowedTypes.some(type => 
        file.name.toLowerCase().endsWith(type.toLowerCase())
    );
    
    // Check by MIME type
    const hasValidMimeType = allowedTypes.some(type => {
        const cleanType = type.replace('.', '').toLowerCase();
        return mimeType.toLowerCase().includes(cleanType);
    });
    
    return hasValidExtension || hasValidMimeType;
}

// Validate file size
function validateFileSize(file, maxSizeMB) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

// Create book download content
function createBookDownloadContent(book) {
    return `
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
        - Purchase Date: ${new Date().toLocaleString()}
        
        You can download this book again anytime from your account.
        
        Enjoy your reading!
        
        ---
        BookStore - Digital Book Marketplace
        Authors earn 70% | Platform commission 30%
    `;
}

// Export for use in other files
window.fileStorage = FileStorage;
window.downloadFile = downloadFile;
window.validateFileType = validateFileType;
window.validateFileSize = validateFileSize;
window.createBookDownloadContent = createBookDownloadContent;