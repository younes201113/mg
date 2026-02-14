// main.js
let books = [];
let currentCategory = 'الكل';
let currentModalBook = null;

// تحميل البيانات
function loadData() {
    books = [...libraryData.books, ...libraryData.manga];
    books.sort((a, b) => a.id - b.id);
    displayBooks(books);
    setupCategories();
    setupTabs();
}

// عرض الكتب
function displayBooks(booksToShow) {
    const container = document.getElementById('booksContainer');
    
    const grouped = {};
    booksToShow.forEach(book => {
        const category = book.category === 'رواية' ? 'روايات' : book.category;
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(book);
    });
    
    let html = '';
    for (const [category, items] of Object.entries(grouped)) {
        html += `
            <h2 class="section-title"><i class="fas fa-${getIcon(category)}"></i> ${category}</h2>
            <div class="books-grid">
                ${items.map(book => `
                    <div class="book-card" onclick="openBookModal(${book.id})">
                        <div class="book-cover">
                            <i class="fas fa-${getIcon(book.category)}"></i>
                        </div>
                        <div class="book-info">
                            <h3 class="book-title">${book.title}</h3>
                            <div class="book-author">${book.author}</div>
                            <div class="book-meta">
                                <span class="book-category">${book.category}</span>
                                <span class="book-rating">${generateStarsSimple(book.rating)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html || '<p class="no-books">لا توجد كتب</p>';
}

// فتح المودال
function openBookModal(bookId) {
    currentModalBook = books.find(b => b.id === bookId);
    if (!currentModalBook) return;
    
    const modal = document.getElementById('pdfModal');
    document.getElementById('modalTitle').textContent = currentModalBook.title;
    
    // صورة الغلاف
    document.getElementById('modalCover').innerHTML = `<i class="fas fa-${getIcon(currentModalBook.category)}"></i>`;
    
    // التقييم
    document.getElementById('modalRating').innerHTML = generateStars(currentModalBook.rating);
    
    // روابط
    const pdfUrl = currentModalBook.pdfUrl;
    let downloadUrl = currentModalBook.downloadUrl || pdfUrl;
    
    if (pdfUrl.includes('drive.google.com')) {
        const fileId = pdfUrl.split('/d/')[1]?.split('/')[0];
        if (fileId) {
            downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }
    
    const readBtn = document.getElementById('modalReadBtn');
    readBtn.href = pdfUrl;
    readBtn.target = '_blank';
    
    document.getElementById('modalDownloadBtn').href = downloadUrl;
    
    // التصنيفات
    const tagsEl = document.getElementById('modalTags');
    tagsEl.innerHTML = currentModalBook.tags?.map(tag => 
        `<span class="modal-tag">${tag}</span>`
    ).join('') || '';
    
    // الوصف
    document.getElementById('modalDescription').textContent = 
        currentModalBook.description || 'لا يوجد وصف متاح';
    
    // تحديث المفضلة
    updateFavoriteButton();
    
    // تحميل التقييمات والتعليقات
    updateAverageRating(currentModalBook.id);
    loadComments(currentModalBook.id);
    
    // إظهار المودال
    modal.classList.add('show');
}

// إغلاق المودال
function closeModal() {
    const modal = document.getElementById('pdfModal');
    modal.classList.remove('show');
}

// توليد النجوم (كاملة)
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - rating < 1 && i - rating > 0) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// توليد النجوم (بسيطة)
function generateStarsSimple(rating) {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
}

// إعداد التصنيفات الجانبية
function setupCategories() {
    const categories = ['الكل', ...new Set(books.map(b => b.category === 'رواية' ? 'روايات' : b.category))];
    const list = document.getElementById('categoryList');
    list.innerHTML = categories.map(cat => 
        `<li><a href="#" onclick="filterByCategory('${cat}')">${cat}</a></li>`
    ).join('');
}

// إعداد التبويبات العلوية
function setupTabs() {
    const tabsContainer = document.getElementById('categoryTabs');
    const categories = ['الكل', 'روايات', 'تاريخ', 'مانغا'];
    tabsContainer.innerHTML = categories.map(cat => 
        `<button class="category-tab" onclick="filterByCategory('${cat}')">${cat}</button>`
    ).join('');
    
    // تفعيل التبويب النشط
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.textContent === currentCategory) {
            tab.classList.add('active');
        }
    });
}

// تصفية حسب التصنيف
function filterByCategory(category) {
    currentCategory = category;
    
    if (category === 'الكل') {
        displayBooks(books);
    } else {
        const filterCat = category === 'روايات' ? 'رواية' : category;
        displayBooks(books.filter(b => b.category === filterCat));
    }
    
    // تحديث التصنيفات النشطة
    document.querySelectorAll('.category-tab, .categories a').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.textContent === category) tab.classList.add('active');
    });
    
    document.querySelectorAll('.categories a').forEach(link => {
        if (link.textContent.trim() === category) link.classList.add('active');
    });
}

// البحث
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = books.filter(b => 
        b.title.toLowerCase().includes(term) || 
        b.author.toLowerCase().includes(term)
    );
    displayBooks(filtered);
});

// أيقونات
function getIcon(category) {
    const icons = {
        'روايات': 'book-open',
        'رواية': 'book-open',
        'تاريخ': 'scroll',
        'مانغا': 'dragon'
    };
    return icons[category] || 'book';
}

// ===== وظائف المفضلة =====
function toggleFavorite() {
    if (!currentModalBook) return;
    
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.indexOf(currentModalBook.id);
    
    if (index === -1) {
        favorites.push(currentModalBook.id);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton();
}

function updateFavoriteButton() {
    const favBtn = document.getElementById('modalFavoriteBtn');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFav = favorites.includes(currentModalBook.id);
    
    if (isFav) {
        favBtn.classList.add('active');
        favBtn.querySelector('span').textContent = 'في المفضلة';
    } else {
        favBtn.classList.remove('active');
        favBtn.querySelector('span').textContent = 'أضف للمفضلة';
    }
}

// ===== وظائف التقييم =====
function rateBook(rating) {
    if (!currentModalBook) return;
    
    const bookId = currentModalBook.id;
    const ratings = JSON.parse(localStorage.getItem(`ratings_${bookId}`)) || [];
    ratings.push(rating);
    localStorage.setItem(`ratings_${bookId}`, JSON.stringify(ratings));
    
    updateAverageRating(bookId);
    
    // تحديث النجوم
    const stars = document.querySelectorAll('.rating-stars-input i');
    stars.forEach((star, index) => {
        star.className = index < rating ? 'fas fa-star' : 'far fa-star';
    });
}

function updateAverageRating(bookId) {
    const ratings = JSON.parse(localStorage.getItem(`ratings_${bookId}`)) || [];
    const avgRating = ratings.length > 0 
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : currentModalBook.rating;
    
    document.getElementById('averageRating').innerHTML = 
        `⭐ متوسط التقييم: ${avgRating} (${ratings.length} تقييم)`;
}

// ===== وظائف التعليقات =====
function addComment() {
    if (!currentModalBook) return;
    
    const commentText = document.getElementById('commentText').value;
    if (!commentText.trim()) return;
    
    const bookId = currentModalBook.id;
    const comments = JSON.parse(localStorage.getItem(`comments_${bookId}`)) || [];
    
    comments.push({
        author: 'زائر',
        text: commentText,
        date: new Date().toISOString()
    });
    
    localStorage.setItem(`comments_${bookId}`, JSON.stringify(comments));
    document.getElementById('commentText').value = '';
    loadComments(bookId);
}

function loadComments(bookId) {
    const comments = JSON.parse(localStorage.getItem(`comments_${bookId}`)) || [];
    const commentsList = document.getElementById('commentsList');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">لا توجد تعليقات بعد</p>';
        return;
    }
    
    comments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${new Date(comment.date).toLocaleDateString('ar-EG')}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
}

// تشغيل
document.addEventListener('DOMContentLoaded', loadData);

// إغلاق المودال عند الضغط خارج المحتوى
window.onclick = function(event) {
    const modal = document.getElementById('pdfModal');
    if (event.target === modal) {
        closeModal();
    }
};
