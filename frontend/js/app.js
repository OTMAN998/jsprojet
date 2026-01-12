
const API_BASE_URL = 'http://localhost:3000/api';


let books = [];
let currentBookId = null;


const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const apiStatus = document.getElementById('apiStatus');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const addBookBtn = document.getElementById('addBookBtn');
const searchBtn = document.getElementById('searchBtn');
const bookModal = document.getElementById('bookModal');
const bookForm = document.getElementById('bookForm');


document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Bibliothèque Manager...');
    
    
    const isLoggedIn = localStorage.getItem('bibliothequeLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showMainApp();
    } else {
        showLoginPage();
    }
    
    
    setupEventListeners();
    
    
    testAPIConnection();
});


function setupEventListeners() {
    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
   
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadData);
    }
    
    
    if (addBookBtn) {
        addBookBtn.addEventListener('click', () => {
            showBookForm('add');
        });
    }
    
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchBooks);
    }
    
    
    if (bookForm) {
        bookForm.addEventListener('submit', handleBookFormSubmit);
    }
    
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            showPage(page);
        });
    });
}


async function testAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (response.ok) {
            if (apiStatus) {
                apiStatus.innerHTML = '<i class="fas fa-check-circle"></i> Connecté à l\'API';
                apiStatus.className = 'api-status connected';
            }
            return true;
        } else {
            throw new Error(`API error: ${response.status}`);
        }
    } catch (error) {
        console.error('API connection failed:', error);
        if (apiStatus) {
            apiStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Impossible de se connecter à l\'API';
            apiStatus.className = 'api-status error';
        }
        return false;
    }
}


function showLoginPage() {
    loginPage.classList.add('active');
    mainApp.classList.remove('active');
}


async function showMainApp() {
    loginPage.classList.remove('active');
    mainApp.classList.add('active');
    
    
    await loadData();
    
    
    showPage('dashboard');
}


function showPage(pageName) {
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = pageName === 'dashboard' ? 'Tableau de Bord' : 'Gestion des Livres';
    }
    
    
    const pages = document.querySelectorAll('.content-page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const selectedPage = document.getElementById(`${pageName}Page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    
    if (pageName === 'books') {
        loadBooksManagementTable();
    }
}


async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    
    if (username === 'admin' && password === 'admin') {
        const apiConnected = await testAPIConnection();
        
        if (apiConnected) {
            localStorage.setItem('bibliothequeLoggedIn', 'true');
            await showMainApp();
        } else {
            alert('Impossible de se connecter au serveur. Veuillez démarrer le serveur backend.');
        }
    } else {
        alert('Identifiants incorrects. Utilisez admin/admin');
    }
}


function handleLogout() {
    localStorage.removeItem('bibliothequeLoggedIn');
    showLoginPage();
}


async function loadData() {
    try {
        
        const booksResponse = await fetch(`${API_BASE_URL}/books`);
        if (!booksResponse.ok) throw new Error('Failed to load books');
        books = await booksResponse.json();
        
      
        const statsResponse = await fetch(`${API_BASE_URL}/stats`);
        if (!statsResponse.ok) throw new Error('Failed to load stats');
        const stats = await statsResponse.json();
        
        
        renderStats(stats);
        renderBooksTable();
        
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Erreur de chargement des données');
    }
}


function renderStats(stats) {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.totalBooks}</h3>
                <p>Livres Totaux</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.availableBooks}</h3>
                <p>Livres Disponibles</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.borrowedBooks}</h3>
                <p>Livres Empruntés</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-copy"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.totalCopies}</h3>
                <p>Copies Totales</p>
            </div>
        </div>
    `;
}


function renderBooksTable() {
    const tableBody = document.getElementById('booksTable');
    if (!tableBody) return;
    
    
    const recentBooks = [...books].slice(0, 5);
    
    tableBody.innerHTML = '';
    
    if (recentBooks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                    Aucun livre trouvé
                </td>
            </tr>
        `;
        return;
    }
    
    recentBooks.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>
                <span class="status-badge ${book.status === 'Available' ? 'status-available' : 'status-borrowed'}">
                    ${book.status === 'Available' ? 'Disponible' : 'Emprunté'}
                </span>
            </td>
            <td>${book.copies}</td>
            <td>
                <div class="actions">
                    <button class="btn-action" onclick="editBook(${book.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action" onclick="deleteBook(${book.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}


async function loadBooksManagementTable() {
    const tableBody = document.getElementById('booksManagementTable');
    if (!tableBody) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (!response.ok) throw new Error('Failed to load books');
        
        books = await response.json();
        
        tableBody.innerHTML = '';
        
        if (books.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: #666;">
                        <i class="fas fa-book" style="font-size: 24px; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                        Aucun livre dans la bibliothèque
                    </td>
                </tr>
            `;
            return;
        }
        
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>
                    <span class="status-badge ${book.status === 'Available' ? 'status-available' : 'status-borrowed'}">
                        ${book.status === 'Available' ? 'Disponible' : 'Emprunté'}
                    </span>
                </td>
                <td>${book.copies}</td>
                <td>
                    <div class="actions">
                        <button class="btn-action" onclick="editBook(${book.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action" onclick="deleteBook(${book.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading books management table:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i> Erreur de chargement
                </td>
            </tr>
        `;
    }
}


function showBookForm(mode, bookId = null) {
    currentBookId = bookId;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalSubmitText = document.getElementById('modalSubmitText');
    
    if (mode === 'add') {
        modalTitle.textContent = 'Ajouter un Livre';
        modalSubmitText.textContent = 'Ajouter';
        bookForm.reset();
        document.getElementById('bookStatus').value = 'Available';
        document.getElementById('bookCopies').value = '1';
    } else if (mode === 'edit' && bookId) {
        const book = books.find(b => b.id === bookId);
        if (book) {
            modalTitle.textContent = 'Modifier le Livre';
            modalSubmitText.textContent = 'Modifier';
            
            document.getElementById('bookTitle').value = book.title;
            document.getElementById('bookAuthor').value = book.author;
            document.getElementById('bookCategory').value = book.category;
            document.getElementById('bookStatus').value = book.status;
            document.getElementById('bookCopies').value = book.copies;
        }
    }
    
    bookModal.classList.add('active');
}


function hideModal() {
    bookModal.classList.remove('active');
    currentBookId = null;
}


async function handleBookFormSubmit(e) {
    e.preventDefault();
    
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        category: document.getElementById('bookCategory').value,
        status: document.getElementById('bookStatus').value,
        copies: parseInt(document.getElementById('bookCopies').value),
        publicationDate: new Date().toISOString().split('T')[0]
    };
    
    try {
        let response;
        let method;
        let url;
        
        if (currentBookId) {
            
            method = 'PUT';
            url = `${API_BASE_URL}/books/${currentBookId}`;
        } else {
            
            method = 'POST';
            url = `${API_BASE_URL}/books`;
        }
        
        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            alert(currentBookId ? 'Livre modifié avec succès !' : 'Livre ajouté avec succès !');
            hideModal();
            
            
            await loadData();
            
            
            const booksPage = document.getElementById('booksPage');
            if (booksPage.classList.contains('active')) {
                await loadBooksManagementTable();
            }
        } else {
            throw new Error(`Failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Erreur lors de la sauvegarde du livre');
    }
}


function editBook(bookId) {
    showBookForm('edit', bookId);
}


async function deleteBook(bookId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Livre supprimé avec succès !');
            
            
            await loadData();
            
            
            const booksPage = document.getElementById('booksPage');
            if (booksPage.classList.contains('active')) {
                await loadBooksManagementTable();
            }
        } else {
            throw new Error(`Failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Erreur lors de la suppression du livre');
    }
}


async function searchBooks() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        await loadBooksManagementTable();
        return;
    }
    
    const tableBody = document.getElementById('booksManagementTable');
    if (!tableBody) return;
    
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
    );
    
    tableBody.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #666;">
                    <i class="fas fa-search"></i> Aucun résultat trouvé
                </td>
            </tr>
        `;
        return;
    }
    
    filteredBooks.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>
                <span class="status-badge ${book.status === 'Available' ? 'status-available' : 'status-borrowed'}">
                    ${book.status === 'Available' ? 'Disponible' : 'Emprunté'}
                </span>
            </td>
            <td>${book.copies}</td>
            <td>
                <div class="actions">
                    <button class="btn-action" onclick="editBook(${book.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action" onclick="deleteBook(${book.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}


window.editBook = editBook;
window.deleteBook = deleteBook;
window.hideModal = hideModal;