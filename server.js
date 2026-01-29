const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Simple Routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// File Upload Route
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for temporary storage
const upload = multer({ dest: 'uploads/' });

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'bookstore',
            resource_type: 'auto'
        });

        // Delete temporary file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Book model
const BookSchema = new mongoose.Schema({
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

const Book = mongoose.model('Book', BookSchema);

// Save book to database
app.post('/api/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.json({ success: true, book });
    } catch (error) {
        console.error('Save book error:', error);
        res.status(500).json({ error: 'Failed to save book' });
    }
});

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json({ success: true, books });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: 'Failed to get books' });
    }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ success: true, book });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ error: 'Failed to get book' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});