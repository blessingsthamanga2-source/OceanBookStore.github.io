// Download Handler for BookStore

console.log('Download handler loaded');

const DownloadHandler = {
    // Check if user can download and show appropriate buttons
    setupDownloadButtons: async function(bookId) {
        const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
        
        if (!currentUser) {
            return {
                canDownload: false,
                hasSample: false,
                message: 'Please login to download'
            };
        }
        
        // Check if user has purchased this book
        const purchaseCheck = await fileStorage.canDownload(currentUser.id, bookId);
        
        // Check if book has sample (for demo, all books have samples)
        const hasSample = true;
        
        return {
            canDownload: purchaseCheck.canDownload,
            purchaseId: purchaseCheck.purchaseId,
            downloads: purchaseCheck.downloads,
            hasSample: hasSample,
            message: purchaseCheck.canDownload ? 'Ready to download' : 'Purchase to download'
        };
    },
    
    // Download book file
    downloadBook: async function(bookId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
            if (!currentUser) {
                throw new Error('Please login to download');
            }
            
            // Check purchase
            const purchaseCheck = await fileStorage.canDownload(currentUser.id, bookId);
            if (!purchaseCheck.canDownload) {
                throw new Error('You need to purchase this book first');
            }
            
            // Get book data
            const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
            const book = books.find(b => b.id === bookId);
            if (!book) {
                throw new Error('Book not found');
            }
            
            // Increment download count
            if (purchaseCheck.purchaseId) {
                await fileStorage.incrementDownload(purchaseCheck.purchaseId);
            }
            
            // Create download content
            const downloadContent = createBookDownloadContent(book);
            
            // Create and download file
            const blob = new Blob([downloadContent], { type: 'text/plain' });
            const filename = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${bookId}.txt`;
            downloadFile(blob, filename);
            
            // Return success info
            return {
                success: true,
                filename: filename,
                downloads: purchaseCheck.downloads + 1,
                bookTitle: book.title
            };
            
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    },
    
    // Download sample
    downloadSample: async function(bookId) {
        try {
            const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
            const book = books.find(b => b.id === bookId);
            
            if (!book) {
                throw new Error('Book not found');
            }
            
            // Create sample content
            const sampleContent = `
                SAMPLE CHAPTER
                =============
                
                ${book.title}
                by ${book.author}
                
                This is a sample from "${book.title}"
                
                In a real implementation, this would be the first chapter
                or a few pages from the book.
                
                For demonstration purposes only.
                
                Book Details:
                - Title: ${book.title}
                - Author: ${book.author}
                - Price: $${book.price.toFixed(2)}
                - Category: ${book.category || 'General'}
                - Full book: ${book.description ? book.description.substring(0, 100) + '...' : 'No description'}
                
                Purchase the full version to continue reading!
                
                ---
                BookStore - Digital Book Marketplace
                Authors earn 70% | Platform commission 30%
            `;
            
            // Create and download file
            const blob = new Blob([sampleContent], { type: 'text/plain' });
            const filename = `Sample_${book.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
            downloadFile(blob, filename);
            
            return {
                success: true,
                filename: filename,
                bookTitle: book.title
            };
            
        } catch (error) {
            console.error('Sample download error:', error);
            throw error;
        }
    },
    
    // Preview book cover (simulated)
    previewBookCover: async function(bookId) {
        // In a real app, this would return the actual cover image URL
        // For demo, we'll return a colored div
        return null;
    },
    
    // Get file extension from mime type
    getFileExtension: function(mimeType) {
        const extensions = {
            'application/pdf': 'pdf',
            'application/epub+zip': 'epub',
            'application/x-mobipocket-ebook': 'mobi',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'text/plain': 'txt'
        };
        
        return extensions[mimeType] || 'file';
    }
};

// Create global instance
const downloadHandler = DownloadHandler;

// Export for use in other files
window.downloadHandler = downloadHandler;