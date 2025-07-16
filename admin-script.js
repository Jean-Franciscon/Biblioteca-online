// Constantes e configurações
const BOOKS_STORAGE_KEY = 'library_books';
const RESERVATIONS_STORAGE_KEY = 'library_reservations';
const CATEGORIES_STORAGE_KEY = 'library_categories';
const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_PASSWORD = 'admin123';

// Variáveis globais
let currentBooks = [];
let currentReservations = [];
let currentCategories = [];
let currentSection = 'dashboard';
let editingBookId = null;

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
        const defaultCategories = [
            'Ficção', 'Fantasia', 'Romance', 'Mistério', 
            'Biografia', 'História', 'Ciência', 'Autoajuda'
        ];
        saveCategories(defaultCategories);
        return defaultCategories;
    }
}

// Função para salvar categorias no localStorage
function saveCategories(categories) {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
}

// Função para gerar ID único
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Função auxiliar para converter arquivo para Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Função para verificar autenticação
function isAuthenticated() {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    return session === 'authenticated';
}

// Função para fazer login
function login(password) {
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
        return true;
    }
    return false;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    showLoginScreen();
}

// Função para mostrar tela de login
function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
}

// Função para mostrar painel administrativo
function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'grid';
    loadData();
    updateCategorySelects();
    showSection('dashboard');
}

// Função para carregar dados
function loadData() {
    currentBooks = loadBooks();
    currentReservations = loadReservations();
    currentCategories = loadCategories();
    updateDashboard();
}

// Função para atualizar dashboard
function updateDashboard() {
    const totalBooks = currentBooks.length;
    const borrowedBooks = currentReservations.filter(r => r.status === 'borrowed').length;
    
    // Calcular devoluções pendentes (livros vencidos)
    const now = new Date();
    const pendingReturns = currentReservations.filter(r => 
        r.status === 'borrowed' && new Date(r.returnDate) < now
    ).length;
    
    const totalReservations = currentReservations.filter(r => r.status === 'pending').length;

    document.getElementById('total-books').textContent = totalBooks;
    document.getElementById('borrowed-books').textContent = borrowedBooks;
    document.getElementById('pending-returns').textContent = pendingReturns;
    document.getElementById('total-reservations').textContent = totalReservations;

    updateRecentActivity();
}

// Função para atualizar atividade recente
function updateRecentActivity(message = null, type = 'info') {
    const activityList = document.getElementById("activity-list");
    let activities = JSON.parse(localStorage.getItem("recent_activities")) || [];

    if (message) {
        activities.unshift({ timestamp: new Date().toISOString(), message: message, type: type });
        activities = activities.slice(0, 5); // Manter apenas as 5 atividades mais recentes
        localStorage.setItem("recent_activities", JSON.stringify(activities));
    }

    if (activities.length === 0) {
        activityList.innerHTML = "<p class=\"no-activity\">Nenhuma atividade recente</p>";
        return;
    }

    activityList.innerHTML = activities.map(activity => {
        const date = new Date(activity.timestamp).toLocaleDateString("pt-BR");
        const time = new Date(activity.timestamp).toLocaleTimeString("pt-BR");
        const activityType = activity.type || 'info';
        const typeClass = activityType === 'warning' ? 'activity-warning' : activityType === 'success' ? 'activity-success' : '';
        return `
            <div class="activity-item ${typeClass}">
                <strong>${activity.message}</strong> <span class="activity-time">(${date} ${time})</span>
            </div>
        `;
    }).join("");
}

// Função para mostrar seção
function showSection(sectionName) {
    // Atualizar menu lateral
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Mostrar seção correspondente
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');

    currentSection = sectionName;

    // Carregar dados específicos da seção
    switch (sectionName) {
        case 'manage-books':
            displayBooksTable();
            break;
        case 'reservations':
            displayReservations();
            break;
        case 'manage-categories':
            displayCategories();
            break;
        case 'manage-banner':
            displayBannerSection();
            break;
    }
}

// Função para adicionar livro
async function addBook(bookData) {
    const coverFile = document.getElementById('book-cover').files[0];
    let coverUrl = null;

    if (coverFile) {
        coverUrl = await toBase64(coverFile);
    }

    const newBook = {
        id: generateId(),
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        synopsis: bookData.synopsis,
        availableCopies: parseInt(bookData.copies),
        returnPeriod: parseInt(bookData.returnPeriod || 30),
        cover: coverUrl
    };

    currentBooks.push(newBook);
    saveBooks(currentBooks);
    updateDashboard();
    
    return true;
}

// Função para editar livro
async function editBook(bookId, bookData) {
    const bookIndex = currentBooks.findIndex(book => book.id === bookId);
    if (bookIndex === -1) return false;

    const coverFile = document.getElementById("edit-book-cover").files[0];
    let coverUrl = currentBooks[bookIndex].cover; // Mantém a capa existente por padrão

    if (coverFile) {
        coverUrl = await toBase64(coverFile);
    }

    currentBooks[bookIndex] = {
        ...currentBooks[bookIndex],
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        synopsis: bookData.synopsis,
        availableCopies: parseInt(bookData.copies),
        returnPeriod: parseInt(bookData.returnPeriod || 30),
        cover: coverUrl
    };

    saveBooks(currentBooks);
    updateDashboard();
    displayBooksTable();
    
    return true;
}

// Função para excluir livro
function deleteBook(bookId) {
    const bookIndex = currentBooks.findIndex(book => book.id === bookId);
    if (bookIndex === -1) return false;

    currentBooks.splice(bookIndex, 1);
    saveBooks(currentBooks);
    updateDashboard();
    displayBooksTable();
    
    return true;
}

// Função para exibir tabela de livros
function displayBooksTable(searchTerm = '') {
    const booksTableBody = document.getElementById('books-table-body');
    const noBooksMessage = document.getElementById('no-books-message');

    let booksToShow = currentBooks;
    if (searchTerm) {
        booksToShow = currentBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (booksToShow.length === 0) {
        document.querySelector('.books-table-container').style.display = 'none';
        noBooksMessage.style.display = 'block';
        return;
    }

    document.querySelector('.books-table-container').style.display = 'block';
    noBooksMessage.style.display = 'none';

    booksTableBody.innerHTML = booksToShow.map(book => `
        <tr>
            <td>
                ${book.cover ? 
                    `<img src="${book.cover}" alt="${book.title}" class="book-cover-small" />` : 
                    `<div class="book-cover-small book-cover-placeholder">📚</div>`
                }
            </td>
            <td><strong>${book.title}</strong></td>
            <td>${book.author}</td>
            <td><span class="badge">${book.category}</span></td>
            <td>${book.availableCopies}</td>
            <td>
                <div class="book-actions-table">
                    <button class="btn btn-secondary btn-small" onclick="openEditModal('${book.id}')">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="confirmDelete('${book.id}', '${book.title}')">
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Função para exibir reservas
function displayReservations() {
    const reservationsList = document.getElementById("reservations-list");
    const noReservationsMessage = document.getElementById("no-reservations-message");

    let reservationsToShow = currentReservations.filter(r => r.status !== 'returned');

    // Ordenar as reservas: vencidas primeiro, depois do menor timer para o maior
    reservationsToShow.sort((a, b) => {
        if (a.status === 'pending' && b.status === 'borrowed') return 1;
        if (a.status === 'borrowed' && b.status === 'pending') return -1;
        
        if (a.status === 'borrowed' && b.status === 'borrowed') {
            const aReturnDate = new Date(a.returnDate);
            const bReturnDate = new Date(b.returnDate);
            const now = new Date();

            const aExpired = aReturnDate < now;
            const bExpired = bReturnDate < now;

            if (aExpired && !bExpired) return -1;
            if (!aExpired && bExpired) return 1;
            if (aExpired && bExpired) return aReturnDate - bReturnDate;

            return aReturnDate - bReturnDate;
        }

        return new Date(a.reservationDate) - new Date(b.reservationDate);
    });

    if (reservationsToShow.length === 0) {
        reservationsList.style.display = "none";
        noReservationsMessage.style.display = "block";
        return;
    }

    reservationsList.style.display = "block";
    noReservationsMessage.style.display = "none";

    reservationsList.innerHTML = reservationsToShow.map(reservation => {
        const date = new Date(reservation.reservationDate).toLocaleDateString("pt-BR");
        const time = new Date(reservation.reservationDate).toLocaleTimeString("pt-BR");
            
            return `
                <div class="reservation-card ${reservation.status === 'borrowed' && new Date(reservation.returnDate) < new Date() ? 'expired' : ''}">
                    <div class="reservation-header">
                        <div class="reservation-book">${reservation.bookTitle}</div>
                        <div class="reservation-date">${date} às ${time}</div>
                        <div class="reservation-status ${reservation.status}">${reservation.status === 'borrowed' ? 'Emprestado' : 'Pendente'}</div>
                    </div>
                    ${reservation.status === 'borrowed' ? `
                        <div class="timer-display ${new Date(reservation.returnDate) < new Date() ? 'expired' : (Math.ceil((new Date(reservation.returnDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 3 ? 'warning' : '')}">
                            ${new Date(reservation.returnDate) < new Date() ? 
                                `⚠️ Vencido há ${Math.ceil(Math.abs(new Date(reservation.returnDate) - new Date()) / (1000 * 60 * 60 * 24))} dia(s)` : 
                                `⏰ ${Math.ceil((new Date(reservation.returnDate) - new Date()) / (1000 * 60 * 60 * 24))} dia(s) restante(s)`
                            }
                        </div>
                    ` : ''}
                    <div class="reservation-details">
                        <div class="reservation-field">
                            <strong>Solicitante:</strong>
                            <span>${reservation.requesterName}</span>
                        </div>
                        <div class="reservation-field">
                            <strong>Setor:</strong>
                            <span>${reservation.requesterSector}</span>
                        </div>
                        <div class="reservation-field">
                            <strong>Telefone:</strong>
                            <span>${reservation.requesterPhone}</span>
                        </div>
                        <div class="reservation-field">
                            <strong>Autor:</strong>
                            <span>${reservation.bookAuthor}</span>
                        </div>
                    </div>
                    ${reservation.observations ? `
                        <div class="reservation-field">
                            <strong>Observações:</strong>
                            <span>${reservation.observations}</span>
                        </div>
                    ` : ''}
                    <div class="reservation-actions">
                        ${reservation.status === 'borrowed' ? `
                            <button class="btn btn-primary btn-small" onclick="extendReservation('${reservation.id}')">
                                Estender Reserva
                            </button>
                            <button class="btn btn-success btn-small" onclick="returnBook('${reservation.id}')">
                                Marcar como Devolvido
                            </button>
                        ` : `
                            <button class="btn btn-primary btn-small" onclick="approveReservation('${reservation.id}')">
                                Aprovar
                            </button>
                            <button class="btn btn-danger btn-small" onclick="rejectReservation('${reservation.id}')">
                                Rejeitar
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
}

// Função para abrir modal de edição
function openEditModal(bookId) {
    const book = currentBooks.find(b => b.id === bookId);
    if (!book) return;

    editingBookId = bookId;

    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-book-title').value = book.title;
    document.getElementById('edit-book-author').value = book.author;
    document.getElementById('edit-book-category').value = book.category;
    document.getElementById('edit-book-copies').value = book.availableCopies;
    document.getElementById('edit-return-period').value = book.returnPeriod || 30;
    document.getElementById('edit-book-synopsis').value = book.synopsis;
    
    // Limpar o campo de arquivo (não pode ser preenchido programaticamente por segurança)
    const editBookCoverInput = document.getElementById('edit-book-cover');
    editBookCoverInput.value = '';
    
    // Mostrar preview da capa atual se existir
    const previewContainer = document.getElementById('current-edit-book-cover-preview');
    if (book.cover) {
        previewContainer.innerHTML = `
            <div style="margin-top: 10px;">
                <p><strong>Capa atual:</strong></p>
                <img src="${book.cover}" alt="Capa atual" style="max-width: 100px; max-height: 120px; border-radius: 5px;" />
            </div>
        `;
    } else {
        previewContainer.innerHTML = '<p style="margin-top: 10px; color: #666;">Nenhuma capa cadastrada</p>';
    }

    document.getElementById('edit-book-modal').style.display = 'block';
}

// Função para fechar modal de edição
function closeEditModal() {
    document.getElementById('edit-book-modal').style.display = 'none';
    editingBookId = null;
}

// Função para confirmar exclusão
function confirmDelete(bookId, bookTitle) {
    showModernConfirm(
        `Tem certeza que deseja excluir o livro "${bookTitle}"? Esta ação não pode ser desfeita.`,
        () => {
            if (deleteBook(bookId)) {
                showModernAlert("Livro excluído com sucesso!", "success");
            } else {
                showModernAlert("Erro ao excluir livro.", "error");
            }
        }
    );
}

// Função para fechar modal de confirmação
function closeConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
}

// Função para aprovar reserva
function approveReservation(reservationId) {
    const reservationIndex = currentReservations.findIndex(r => r.id === reservationId);
    if (reservationIndex === -1) return;

    const reservation = currentReservations[reservationIndex];
    const book = currentBooks.find(b => b.id === reservation.bookId);

    if (!book) {
        showModernAlert("Livro não encontrado para esta reserva.", "error");
        return;
    }

    if (book.availableCopies <= 0) {
        showModernAlert("Não há exemplares disponíveis para este livro.", "error");
        return;
    }

    reservation.status = 'borrowed';
    reservation.borrowDate = new Date().toISOString();
    reservation.returnDate = new Date(new Date().setDate(new Date().getDate() + (book.returnPeriod || 30))).toISOString();

    book.availableCopies--;
    saveBooks(currentBooks);

    saveReservations(currentReservations);
    
    updateDashboard();
    displayReservations();
    updateRecentActivity(`Reserva do livro "${book.title}" de ${reservation.requesterName} aprovada e emprestada.`, 'success');
    showModernAlert("Reserva aprovada com sucesso!", "success");
}

// Função para rejeitar reserva
function rejectReservation(reservationId) {
    const reservationIndex = currentReservations.findIndex(r => r.id === reservationId);
    if (reservationIndex === -1) return;

    const reservation = currentReservations[reservationIndex];
    
    showModernConfirm(
        `Tem certeza que deseja rejeitar a reserva do livro "${reservation.bookTitle}" de ${reservation.requesterName}?`,
        () => {
            if (reservation.status === 'borrowed') {
                const bookIndex = currentBooks.findIndex(b => b.id === reservation.bookId);
                if (bookIndex !== -1) {
                    currentBooks[bookIndex].availableCopies++;
                    saveBooks(currentBooks);
                }
            }

            currentReservations.splice(reservationIndex, 1);
            saveReservations(currentReservations);
            
            displayReservations();
            updateDashboard();
            updateRecentActivity(`Reserva do livro "${reservation.bookTitle}" de ${reservation.requesterName} rejeitada.`);
            showModernAlert("Reserva rejeitada com sucesso!", "info");
        }
    );
}

// Função para estender reserva
function extendReservation(reservationId) {
    const reservationIndex = currentReservations.findIndex(r => r.id === reservationId);
    if (reservationIndex === -1) return;

    const reservation = currentReservations[reservationIndex];
    const book = currentBooks.find(b => b.id === reservation.bookId);

    if (!book) {
        showModernAlert("Livro não encontrado para esta reserva.", "error");
        return;
    }

    // Estender a data de devolução em 30 dias
    const currentReturnDate = new Date(reservation.returnDate);
    const newReturnDate = new Date(currentReturnDate.setDate(currentReturnDate.getDate() + 30));
    reservation.returnDate = newReturnDate.toISOString();

    saveReservations(currentReservations);
    updateDashboard();
    displayReservations();
    updateRecentActivity(`Reserva do livro "${book.title}" de ${reservation.requesterName} estendida por 30 dias.`);
    showModernAlert("Reserva estendida com sucesso por 30 dias!", "success");
}

// Função para marcar livro como devolvido
function returnBook(reservationId) {
    const reservationIndex = currentReservations.findIndex(r => r.id === reservationId);
    if (reservationIndex === -1) return;

    const reservation = currentReservations[reservationIndex];
    const book = currentBooks.find(b => b.id === reservation.bookId);

    if (!book) {
        showModernAlert("Livro não encontrado para esta reserva.", "error");
        return;
    }

    // Marcar como devolvido
    reservation.status = 'returned';
    book.availableCopies++;
    saveBooks(currentBooks);

    saveReservations(currentReservations);
    updateDashboard();
    displayReservations();
    updateRecentActivity(`Livro "${book.title}" devolvido por ${reservation.requesterName}.`);
    showModernAlert("Livro marcado como devolvido com sucesso!", "success");
}

// Função para verificar e atualizar devoluções atrasadas
function checkOverdueBooks() {
    const now = new Date();
    currentReservations.forEach(reservation => {
        if (reservation.status === 'borrowed' && new Date(reservation.returnDate) < now) {
            // Opcional: Adicionar lógica para notificar ou marcar como atrasado
            // Por enquanto, a interface já destaca os atrasados
        }
    });
}

// Funções para gerenciar categorias
function displayCategories() {
    const categoriesList = document.getElementById('categories-list');
    const noCategoriesMessage = document.getElementById('no-categories-message');

    if (currentCategories.length === 0) {
        categoriesList.style.display = 'none';
        noCategoriesMessage.style.display = 'block';
        return;
    }

    categoriesList.style.display = 'block';
    noCategoriesMessage.style.display = 'none';

    categoriesList.innerHTML = currentCategories.map(category => `
        <li class="category-item">
            <span class="category-name">${category}</span>
            <button class="btn btn-danger btn-small" onclick="confirmDeleteCategory('${category}')">
                Remover
            </button>
        </li>
    `).join('');
}

function addCategory(categoryName) {
    // Verificar se a categoria já existe
    if (currentCategories.includes(categoryName)) {
        showModernAlert("Esta categoria já existe!", "error");
        return false;
    }

    // Adicionar nova categoria
    currentCategories.push(categoryName);
    saveCategories(currentCategories);
    
    // Atualizar interface
    displayCategories();
    updateCategorySelects();
    
    return true;
}

function deleteCategory(categoryName) {
    // Verificar se existem livros usando esta categoria
    const booksWithCategory = currentBooks.filter(book => book.category === categoryName);
    if (booksWithCategory.length > 0) {
        showModernAlert(`Não é possível remover esta categoria pois existem ${booksWithCategory.length} livro(s) cadastrado(s) nela.`, "error");
        return false;
    }

    // Remover categoria
    currentCategories = currentCategories.filter(cat => cat !== categoryName);
    saveCategories(currentCategories);
    
    // Atualizar interface
    displayCategories();
    updateCategorySelects();
    
    return true;
}

function updateCategorySelects() {
    // Atualizar select de categoria no formulário de adicionar livro
    const addBookSelect = document.getElementById('book-category');
    const editBookSelect = document.getElementById('edit-book-category');
    
    const optionsHtml = '<option value="">Selecione uma categoria</option>' + 
        currentCategories.map(category => `<option value="${category}">${category}</option>`).join('');
    
    if (addBookSelect) {
        addBookSelect.innerHTML = optionsHtml;
    }
    
    if (editBookSelect) {
        editBookSelect.innerHTML = optionsHtml;
    }
}

function confirmDeleteCategory(categoryName) {
    showModernConfirm(
        `Tem certeza que deseja remover a categoria "${categoryName}"?`,
        () => {
            if (deleteCategory(categoryName)) {
                showModernAlert("Categoria removida com sucesso!", "success");
            }
        }
    );
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (isAuthenticated()) {
        showAdminPanel();
    } else {
        showLoginScreen();
    }

    // Event listener para login
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('admin-password').value;
        
        if (login(password)) {
            showAdminPanel();
        } else {
            showModernAlert("Senha incorreta. Tente novamente.", "error");
            document.getElementById('admin-password').value = '';
        }
    });

    // Event listener para logout
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Event listeners para navegação lateral
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Event listener para formulário de adicionar livro
    document.getElementById("add-book-form").addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const bookData = {
            title: formData.get("title"),
            author: formData.get("author"),
            category: formData.get("category"),
            synopsis: formData.get("synopsis"),
            copies: formData.get("copies"),
            returnPeriod: formData.get("returnPeriod")
        };

        // Validar campos obrigatórios
        if (!bookData.title || !bookData.author || !bookData.category || !bookData.synopsis || !bookData.copies || !bookData.returnPeriod) {
            showModernAlert("Por favor, preencha todos os campos obrigatórios.", "warning");
            return;
        }

        if (await addBook(bookData)) {
            showModernAlert("Livro cadastrado com sucesso!", "success");
            this.reset();
            updateRecentActivity(`Livro "${bookData.title}" cadastrado no sistema.`, 'info');
        } else {
            showModernAlert("Erro ao cadastrar livro. Tente novamente.", "error");
        }
    });

    // Event listener para formulário de adicionar categoria
    document.getElementById('add-category-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categoryName = document.getElementById('new-category-name').value.trim();
        
        if (!categoryName) {
            showModernAlert("Por favor, digite o nome da categoria.", "warning");
            return;
        }

        if (addCategory(categoryName)) {
            showModernAlert("Categoria adicionada com sucesso!", "success");
            this.reset();
        }
    });

    // Event listener para busca de livros
    document.getElementById('manage-search-btn').addEventListener('click', function() {
        const searchTerm = document.getElementById('manage-search').value;
        displayBooksTable(searchTerm);
    });

    document.getElementById('manage-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value;
            displayBooksTable(searchTerm);
        }
    });

    // Event listeners para modal de edição
    document.getElementById('close-edit-modal').addEventListener('click', closeEditModal);
    document.getElementById('cancel-edit').addEventListener('click', closeEditModal);

    document.getElementById("save-edit").addEventListener("click", async function() {
        if (!editingBookId) return;

        const bookData = {
            title: document.getElementById("edit-book-title").value,
            author: document.getElementById("edit-book-author").value,
            category: document.getElementById("edit-book-category").value,
            synopsis: document.getElementById("edit-book-synopsis").value,
            copies: document.getElementById("edit-book-copies").value,
            returnPeriod: document.getElementById("edit-return-period").value
        };

        // Validar campos obrigatórios
        if (!bookData.title || !bookData.author || !bookData.category || !bookData.synopsis || !bookData.copies || !bookData.returnPeriod) {
            showModernAlert("Por favor, preencha todos os campos obrigatórios.", "warning");
            return;
        }

        if (await editBook(editingBookId, bookData)) {
            showModernAlert("Livro atualizado com sucesso!", "success");
            closeEditModal();
        } else {
            showModernAlert("Erro ao atualizar livro. Tente novamente.", "error");
        }
    });

    // Event listeners para modal de confirmação
    document.getElementById('close-confirm-modal').addEventListener('click', closeConfirmModal);
    document.getElementById('cancel-confirm').addEventListener('click', closeConfirmModal);

    // Fechar modais clicando fora
    window.addEventListener('click', function(e) {
        const editModal = document.getElementById('edit-book-modal');
        const confirmModal = document.getElementById('confirm-modal');
        
        if (e.target === editModal) {
            closeEditModal();
        }
        if (e.target === confirmModal) {
            closeConfirmModal();
        }
    });

    // Iniciar verificação de livros atrasados a cada hora
    setInterval(checkOverdueBooks, 60 * 60 * 1000); 
});






// Adiciona atividade recente no dashboard
function addRecentActivity(message, type = 'info') {
    const list = document.getElementById('recent-activities');
    if (!list) return;
    const li = document.createElement('li');
    li.textContent = message;
    li.className = type === 'warning' ? 'activity-warning' : type === 'success' ? 'activity-success' : '';
    list.prepend(li);
}


// Função para exibir seção de gerenciamento de banner
function displayBannerSection() {
    displayCurrentBanner();
    displayBooksForBannerSelection();
}

// Função para exibir o banner atual
function displayCurrentBanner() {
    const featuredBookId = localStorage.getItem('library_featured_book');
    const currentBannerDisplay = document.getElementById('current-banner-display');
    
    if (featuredBookId) {
        const featuredBook = currentBooks.find(book => book.id === featuredBookId);
        if (featuredBook) {
            document.getElementById('current-banner-title').textContent = featuredBook.title;
            document.getElementById('current-banner-author').textContent = `por ${featuredBook.author}`;
            document.getElementById('current-banner-category').textContent = featuredBook.category;
            
            const coverImg = document.getElementById('current-banner-cover');
            if (featuredBook.cover) {
                coverImg.src = featuredBook.cover;
                coverImg.alt = featuredBook.title;
                coverImg.style.display = 'block';
            } else {
                coverImg.src = 'https://via.placeholder.com/120x160/667eea/ffffff?text=📚';
                coverImg.alt = 'Capa do livro';
                coverImg.style.display = 'block';
            }
        } else {
            // Livro não encontrado, limpar seleção
            localStorage.removeItem('library_featured_book');
            displayNoBannerSelected();
        }
    } else {
        displayNoBannerSelected();
    }
}

// Função para exibir quando nenhum banner está selecionado
function displayNoBannerSelected() {
    document.getElementById('current-banner-title').textContent = 'Nenhum livro selecionado';
    document.getElementById('current-banner-author').textContent = '-';
    document.getElementById('current-banner-category').textContent = '-';
    
    const coverImg = document.getElementById('current-banner-cover');
    coverImg.src = 'https://via.placeholder.com/120x160/cccccc/666666?text=Sem+Banner';
    coverImg.alt = 'Nenhum banner selecionado';
    coverImg.style.display = 'block';
}

// Função para exibir livros para seleção de banner
function displayBooksForBannerSelection() {
    const booksSelectionGrid = document.getElementById('books-selection-grid');
    const noBooksMessage = document.getElementById('no-books-banner');
    const featuredBookId = localStorage.getItem('library_featured_book');

    if (currentBooks.length === 0) {
        booksSelectionGrid.style.display = 'none';
        noBooksMessage.style.display = 'block';
        return;
    }

    booksSelectionGrid.style.display = 'grid';
    noBooksMessage.style.display = 'none';

    booksSelectionGrid.innerHTML = currentBooks.map(book => `
        <div class="book-selection-card ${book.id === featuredBookId ? 'selected' : ''}" 
             onclick="selectBookForBanner('${book.id}')">
            ${book.cover ? 
                `<img src="${book.cover}" alt="${book.title}" />` : 
                `<div class="book-cover-placeholder">📚</div>`
            }
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">por ${book.author}</div>
            </div>
            ${book.id === featuredBookId ? '<div class="selected-badge">Selecionado</div>' : ''}
        </div>
    `).join('');
}

// Função para selecionar livro para banner
function selectBookForBanner(bookId) {
    localStorage.setItem('library_featured_book', bookId);
    displayBannerSection();
    
    const book = currentBooks.find(b => b.id === bookId);
    if (book) {
        updateRecentActivity(`Livro "${book.title}" selecionado como destaque do banner.`, 'info');
        showModernAlert(`Livro "${book.title}" selecionado como destaque!`, 'success');
    }
}

// Função para carregar livros no menu de gerenciamento de banners
function loadBannerBooks() {
    const bannerSelect = document.getElementById('banner-book-select');
    if (!bannerSelect) return;
    bannerSelect.innerHTML = '';
    currentBooks.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = book.title;
        bannerSelect.appendChild(option);
    });
}
