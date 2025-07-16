// Constantes e configurações
const BOOKS_STORAGE_KEY = 'library_books';
const RESERVATIONS_STORAGE_KEY = 'library_reservations';
const CATEGORIES_STORAGE_KEY = 'library_categories';
const FEATURED_BOOK_KEY = 'library_featured_book';

// Variáveis globais
let currentBooks = [];
let filteredBooks = [];
let selectedBookForReservation = null;

// Função para carregar livros do localStorage
function loadBooks() {
    const booksJson = localStorage.getItem(BOOKS_STORAGE_KEY);
    return booksJson ? JSON.parse(booksJson) : [];
}

// Função para salvar livros no localStorage
function saveBooks(books) {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
}

// Função para carregar reservas do localStorage
function loadReservations() {
    const reservationsJson = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    return reservationsJson ? JSON.parse(reservationsJson) : [];
}

// Função para salvar reservas no localStorage
function saveReservations(reservations) {
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
}

// Função para carregar categorias do localStorage
function loadCategories() {
    const categoriesJson = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (categoriesJson) {
        return JSON.parse(categoriesJson);
    } else {
        // Categorias padrão se não existirem
        return ['Ficção', 'Fantasia', 'Romance', 'Mistério', 
            'Biografia', 'História', 'Ciência', 'Autoajuda'];
    }
}

// Função para gerar ID único
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Função para exibir livros na grade
function displayBooks(books = null) {
    const booksToShow = books || currentBooks;
    const booksGrid = document.getElementById('books-grid');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    if (booksToShow.length === 0) {
        booksGrid.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.textContent = 'Nenhum livro encontrado';
        return;
    }

    booksGrid.style.display = 'grid';
    noResults.style.display = 'none';
    resultsCount.textContent = `${booksToShow.length} livro(s) encontrado(s)`;

    booksGrid.innerHTML = booksToShow.map(book => `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-cover">
                ${book.cover ? `<img src="${book.cover}" alt="${book.title}" />` : 
                    `<div class="book-cover-placeholder">📚</div>`}
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">por ${book.author}</p>
                <div class="book-actions">
                    <button class="btn btn-secondary btn-synopsis" data-book-id="${book.id}">
                        Ver Sinopse
                    </button>
                    <button class="btn btn-primary btn-reserve" data-book-id="${book.id}" 
                            ${book.availableCopies === 0 ? 'disabled' : ''}>
                        ${book.availableCopies === 0 ? 'Indisponível' : 'Reservar Livro'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Adicionar event listeners para os botões
    document.querySelectorAll('.btn-synopsis').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.target.getAttribute('data-book-id');
            showSynopsisModal(bookId);
        });
    });

    document.querySelectorAll('.btn-reserve').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.target.getAttribute('data-book-id');
            showReservationModal(bookId);
        });
    });
}

// Função para exibir o livro em destaque
function displayFeaturedBook() {
    const books = currentBooks;
    if (books.length === 0) return;

    // Verificar se há um livro configurado como destaque
    const featuredBookId = localStorage.getItem(FEATURED_BOOK_KEY);
    let featuredBook;
    
    if (featuredBookId) {
        featuredBook = books.find(book => book.id === featuredBookId);
    }
    
    // Se não há livro configurado ou o livro não existe mais, selecionar um aleatório
    if (!featuredBook) {
        featuredBook = books[Math.floor(Math.random() * books.length)];
    }
    
    document.getElementById('featured-book-title').textContent = featuredBook.title;
    document.getElementById('featured-book-author').textContent = `por ${featuredBook.author}`;
    document.getElementById('featured-book-description').textContent = featuredBook.synopsis.substring(0, 150) + '...';
    
    const coverImg = document.getElementById('featured-book-cover');
    if (featuredBook.cover) {
        coverImg.src = featuredBook.cover;
        coverImg.alt = featuredBook.title;
        coverImg.style.display = 'block';
    } else {
        coverImg.src = 'https://via.placeholder.com/120x160/667eea/ffffff?text=📚'; // Placeholder
        coverImg.alt = 'Capa do livro';
        coverImg.style.display = 'block';
    }

    document.getElementById('featured-book-btn').onclick = () => {
        showSynopsisModal(featuredBook.id);
    };
}

// Função para mostrar modal de sinopse
function showSynopsisModal(bookId) {
    const book = currentBooks.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('modal-book-title').textContent = book.title;
    document.getElementById('modal-book-author').textContent = book.author;
    document.getElementById('modal-book-category').textContent = book.category;
    document.getElementById('modal-book-copies').textContent = book.availableCopies;
    document.getElementById('modal-book-synopsis').textContent = book.synopsis;
    
    const modalCover = document.getElementById('modal-book-cover');
    if (book.cover) {
        modalCover.src = book.cover;
        modalCover.alt = book.title;
    } else {
        modalCover.src = 'https://via.placeholder.com/120x160/667eea/ffffff?text=📚';
    }

    const reserveBtn = document.getElementById('reserve-from-modal');
    reserveBtn.onclick = () => {
        closeSynopsisModal();
        showReservationModal(bookId);
    };

    if (book.availableCopies === 0) {
        reserveBtn.disabled = true;
        reserveBtn.textContent = 'Indisponível';
    } else {
        reserveBtn.disabled = false;
        reserveBtn.textContent = 'Reservar Livro';
    }

    document.getElementById('synopsis-modal').style.display = 'block';
}

// Função para fechar modal de sinopse
function closeSynopsisModal() {
    document.getElementById('synopsis-modal').style.display = 'none';
}

// Função para mostrar modal de reserva
function showReservationModal(bookId) {
    const book = currentBooks.find(b => b.id === bookId);
    if (!book || book.availableCopies === 0) return;

    selectedBookForReservation = book;

    document.getElementById('reservation-book-title').textContent = book.title;
    document.getElementById('reservation-book-author').textContent = `por ${book.author}`;
    
    const reservationCover = document.getElementById('reservation-book-cover');
    if (book.cover) {
        reservationCover.src = book.cover;
        reservationCover.alt = book.title;
    } else {
        reservationCover.src = 'https://via.placeholder.com/80x100/667eea/ffffff?text=📚';
    }

    // Limpar formulário
    document.getElementById('reservation-form').reset();

    document.getElementById('reservation-modal').style.display = 'block';
}

// Função para fechar modal de reserva
function closeReservationModal() {
    document.getElementById('reservation-modal').style.display = 'none';
    selectedBookForReservation = null;
}

// Função para processar reserva
function processReservation(formData) {
    if (!selectedBookForReservation) return false;

    const reservation = {
        id: generateId(),
        bookId: selectedBookForReservation.id,
        bookTitle: selectedBookForReservation.title,
        bookAuthor: selectedBookForReservation.author,
        requesterName: formData.get('requesterName'),
        requesterSector: formData.get('requesterSector'),
        requesterPhone: formData.get('requesterPhone'),
        observations: formData.get('observations') || '',
        reservationDate: new Date().toISOString(),
        status: 'pending'
    };

    // Salvar reserva
    const reservations = loadReservations();
    reservations.push(reservation);
    saveReservations(reservations);
    
    // Adicionar notificação de atividade recente para a solicitação
    let activities = JSON.parse(localStorage.getItem("recent_activities")) || [];
    activities.unshift({ 
        timestamp: new Date().toISOString(), 
        message: `Livro "${selectedBookForReservation.title}" solicitado para reserva por ${formData.get("requesterName")}.`, 
        type: 'warning' 
    });
    activities = activities.slice(0, 5);
    localStorage.setItem("recent_activities", JSON.stringify(activities));

    return true;
}

// Função para filtrar livros
function filterBooks() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedCategory = document.querySelector('input[name="category"]:checked').value;

    filteredBooks = currentBooks.filter(book => {
        const matchesSearch = searchTerm === '' || 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm);

        const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayBooks(filteredBooks);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Carregar livros iniciais
    currentBooks = loadBooks();
    
    // Renderizar filtros de categoria dinamicamente
    renderCategoryFilters();
    
    // Inicializar funcionalidades
    initMobileSidebar();
    addAnimationStyles();
    addFilterAnimations();
    
    // Exibir livros e livro em destaque
    displayBooks();
    displayFeaturedBook();

    // Event listeners para busca e filtros
    document.getElementById('search-btn').addEventListener('click', filterBooks);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterBooks();
        }
    });

    // Event listeners para modais - Sinopse
    document.getElementById('close-synopsis-modal').addEventListener('click', closeSynopsisModal);
    document.getElementById('close-synopsis-btn').addEventListener('click', closeSynopsisModal);

    // Event listeners para modais - Reserva
    document.getElementById('close-reservation-modal').addEventListener('click', closeReservationModal);
    document.getElementById('cancel-reservation').addEventListener('click', closeReservationModal);

    // Event listener para formulário de reserva
    document.getElementById('submit-reservation').addEventListener('click', function(e) {
        e.preventDefault();
        
        const form = document.getElementById('reservation-form');
        const formData = new FormData(form);

        // Validar campos obrigatórios
        const requiredFields = ['requesterName', 'requesterSector', 'requesterPhone'];
        let isValid = true;

        requiredFields.forEach(field => {
            const value = formData.get(field);
            if (!value || value.trim() === '') {
                isValid = false;
                const input = document.getElementById(field.replace('requester', 'requester-').toLowerCase());
                input.style.borderColor = '#dc3545';
            } else {
                const input = document.getElementById(field.replace('requester', 'requester-').toLowerCase());
                input.style.borderColor = '#28a745';
            }
        });

        if (!isValid) {
            showModernAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }

        // Processar reserva
        if (processReservation(formData)) {
            showModernAlert('Reserva realizada com sucesso! Você será contatado em breve.', 'success');
            closeReservationModal();
            displayBooks(); // Atualizar exibição dos livros
        } else {
            showModernAlert('Erro ao processar reserva. Tente novamente.', 'error');
        }
    });

    // Fechar modais clicando fora
    window.addEventListener('click', function(e) {
        const synopsisModal = document.getElementById('synopsis-modal');
        const reservationModal = document.getElementById('reservation-modal');
        
        if (e.target === synopsisModal) {
            closeSynopsisModal();
        }
        if (e.target === reservationModal) {
            closeReservationModal();
        }
    });
});



// Função para renderizar filtros de categoria dinamicamente
function renderCategoryFilters() {
    const categoryFilters = document.getElementById('category-filters');
    const categories = loadCategories();
    
    // Limpar filtros existentes
    categoryFilters.innerHTML = '';
    
    // Adicionar opção "Todas as Categorias"
    const allCategoriesOption = document.createElement('label');
    allCategoriesOption.className = 'filter-option';
    allCategoriesOption.innerHTML = `
        <input type="radio" name="category" value="all" checked>
        <span>Todas as Categorias</span>
    `;
    categoryFilters.appendChild(allCategoriesOption);
    
    // Adicionar filtros para cada categoria
    categories.forEach(category => {
        const categoryOption = document.createElement('label');
        categoryOption.className = 'filter-option';
        categoryOption.innerHTML = `
            <input type="radio" name="category" value="${category}">
            <span>${category}</span>
        `;
        categoryFilters.appendChild(categoryOption);
    });
    
    // Adicionar event listeners para os filtros
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', filterBooks);
    });
}


// Funcionalidade do menu lateral mobile
function initMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Fechar sidebar clicando no overlay
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Fechar sidebar ao selecionar uma categoria (mobile)
    document.addEventListener('change', function(e) {
        if (e.target.name === 'category' && window.innerWidth <= 768) {
            setTimeout(() => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }, 300);
        }
    });

    // Fechar sidebar ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Adicionar animações aos elementos do filtro
function addFilterAnimations() {
    const filterOptions = document.querySelectorAll('.filter-option');
    
    filterOptions.forEach((option, index) => {
        option.style.animationDelay = `${index * 0.1}s`;
        option.classList.add('fade-in-up');
    });
}

// CSS para animações (será adicionado dinamicamente)
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in-up {
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
        }
        
        .filter-option {
            animation-fill-mode: forwards;
        }
    `;
    document.head.appendChild(style);
}



// Função para mostrar alertas modernos
function showModernAlert(message, type = 'info') {
    const existingAlert = document.querySelector('.modern-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `modern-alert modern-alert-${type}`;
    
    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    alertDiv.innerHTML = `
        <div class="modern-alert-content">
            <span class="modern-alert-icon">${iconMap[type] || iconMap.info}</span>
            <span class="modern-alert-message">${message}</span>
            <button class="modern-alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// Função para mostrar confirmação moderna
function showModernConfirm(message, onConfirm, onCancel = null) {
    // Remover confirmações existentes
    const existingConfirm = document.querySelector('.modern-confirm');
    if (existingConfirm) {
        existingConfirm.remove();
    }

    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'modern-confirm';
    
    confirmDiv.innerHTML = `
        <div class="modern-confirm-overlay"></div>
        <div class="modern-confirm-content">
            <div class="modern-confirm-header">
                <span class="modern-confirm-icon">⚠️</span>
                <h3>Confirmação</h3>
            </div>
            <div class="modern-confirm-body">
                <p>${message}</p>
            </div>
            <div class="modern-confirm-footer">
                <button class="btn btn-secondary modern-confirm-cancel">Cancelar</button>
                <button class="btn btn-primary modern-confirm-ok">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(confirmDiv);

    // Event listeners
    const cancelBtn = confirmDiv.querySelector('.modern-confirm-cancel');
    const okBtn = confirmDiv.querySelector('.modern-confirm-ok');
    const overlay = confirmDiv.querySelector('.modern-confirm-overlay');

    const closeConfirm = () => {
        confirmDiv.remove();
        if (onCancel) onCancel();
    };

    const confirmAction = () => {
        confirmDiv.remove();
        if (onConfirm) onConfirm();
    };

    cancelBtn.addEventListener('click', closeConfirm);
    overlay.addEventListener('click', closeConfirm);
    okBtn.addEventListener('click', confirmAction);
}



