const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Sample books data
let books = [
    {
        id: 1,
        title: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        category: "Fiction",
        status: "Available",
        copies: 5,
        isbn: "9782070612758",
        pages: 96,
        publicationDate: "1943-04-06"
    },
    {
        id: 2,
        title: "Les Misérables",
        author: "Victor Hugo",
        category: "Classic",
        status: "Borrowed",
        copies: 3,
        isbn: "9782253010696",
        pages: 1463,
        publicationDate: "1862-01-01"
    },
    {
        id: 3,
        title: "L'Étranger",
        author: "Albert Camus",
        category: "Philosophical",
        status: "Available",
        copies: 4,
        isbn: "9782070360024",
        pages: 123,
        publicationDate: "1942-01-01"
    }
];

// API Routes
// GET /api/books - Get all books
app.get('/api/books', (req, res) => {
    console.log('GET /api/books - Returning', books.length, 'books');
    res.json(books);
});

// GET /api/stats - Get statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalBooks: books.length,
        availableBooks: books.filter(b => b.status === 'Available').length,
        borrowedBooks: books.filter(b => b.status === 'Borrowed').length,
        totalCopies: books.reduce((sum, book) => sum + book.copies, 0)
    };
    res.json(stats);
});

// POST /api/books - Add new book
app.post('/api/books', (req, res) => {
    const newBook = {
        id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        ...req.body,
        status: req.body.status || 'Available',
        copies: req.body.copies || 1,
        publicationDate: req.body.publicationDate || new Date().toISOString().split('T')[0]
    };
    books.push(newBook);
    res.status(201).json(newBook);
});

// PUT /api/books/:id - Update book
app.put('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === bookId);
    
    if (index !== -1) {
        books[index] = { ...books[index], ...req.body };
        res.json(books[index]);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

// DELETE /api/books/:id - Delete book
app.delete('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === bookId);
    
    if (index !== -1) {
        const deletedBook = books.splice(index, 1)[0];
        res.json({ 
            message: 'Book deleted successfully',
            book: deletedBook 
        });
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

// GET /api/books/:id - Get book by ID
app.get('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);
    
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

// Frontend Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('✅ SERVER STARTED');
    console.log('='.repeat(60));
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📚 API:      http://localhost:${PORT}/api/books`);
    console.log('='.repeat(60));
});