const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Book Schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    price: Number,
    description: String,
    category: String,
    bookFile: {
        url: String,
        public_id: String,
        format: String
    },
    coverImage: {
        url: String,
        public_id: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Book = mongoose.model('Book', bookSchema);

// SIMPLE FILE UPLOAD (No Cloudinary for now)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'backend/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is working!',
        timestamp: new Date().toISOString()
    });
});

// Upload file endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        console.log('📤 File upload request received');
        console.log('File info:', req.file);
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No file uploaded' 
            });
        }
        
        // Create URL for the uploaded file
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.json({
            success: true,
            file: {
                url: fileUrl,
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Save book to database
app.post('/api/books', async (req, res) => {
    try {
        console.log('📝 Saving book to database:', req.body.title);
        
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            bookFile: req.body.bookFile || { url: '#' },
            coverImage: req.body.coverImage || { url: '#' }
        });
        
        const savedBook = await book.save();
        console.log('✅ Book saved:', savedBook._id);
        
        res.json({
            success: true,
            book: savedBook,
            message: 'Book saved successfully'
        });
        
    } catch (error) {
        console.error('❌ Save book error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json({ success: true, books });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }
        res.json({ success: true, book });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload`);
    console.log(`📚 Books endpoint: http://localhost:${PORT}/api/books`);
});
