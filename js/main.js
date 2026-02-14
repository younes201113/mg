// js/main.js

let currentData = null;
let currentModalBook = null;

// تحميل البيانات
function loadData() {
    const saved = localStorage.getItem('libraryData');
    if (saved) {
        currentData = JSON.parse(saved);
    } else {
        currentData = libraryData;
    }
    renderBooks();
}

// عرض الكتب
function renderBooks(filterCategory = 'الكل', searchTerm = '') {
    const container = document.getElementById('booksContainer');
    let allItems = [...currentData.books, ...currentData.manga];
    
    // فلترة حسب التصنيف
    if (filterCategory !== 'الكل') {
        allItems = allItems.filter(item => 
            item.category === filterCategory || 
            item.tags.includes(filterCategory)
        );
    }
    
    // فلترة حسب البحث
    if (searchTerm) {
        allItems = allItems.filter(item => 
            item.title.includes(searchTerm) || 
            item.author.includes(searchTerm)
        );
    }
    
    // تجميع حسب التصنيفات
    const grouped = groupByCategory(allItems);
    
    let html = '';
    for (const [category, items] of Object.entries(grouped)) {
        html += `
            <h2 class="section-title"><i class="fas fa-${getCategoryIcon(category)}"></i> ${category}</h2>
            <div class="books-grid">
                ${items.map(item => createBookCard(item)).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// تجميع حسب التصنيف
function groupByCategory(items) {
    const groups = {
        'كتب عربية': [],
        'روايات': [],
        'تاريخ': [],
        'مانغا': [],
        'سير ذاتية': []
    };
    
    items.forEach(item => {
        if (item.category === 'رواية') {
            groups['روايات'].push(item);
        } else if (item.category === 'تاريخ') {
            groups['تاريخ'].push(item);
        } else if (item.category === 'مانغا') {
            groups['مانغا'].push(item);
        } else if (item.tags.includes('سيرة')) {
            groups['سير ذاتية'].push(item);
        } else {
            groups['كتب عربية'].push(item);
        }
    });
    
    // حذف المجموعات الفارغة
    return Object.fromEntries(
        Object.entries(groups).filter(([_, items]) => items.length > 0)
    );
}

// إنشاء كارت الكتاب
function createBookCard(book) {
    return `
        <div class="book-card" onclick="openBookModal(${book.id})">
            <div class="book-cover">
                <i class="fas fa-${getCoverIcon(book.category)}"></i>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <div class="book-author">${book.author}</div>
                <div class="book-meta">
                    <span class="book-category">${book.category}</span>
                    <span class="book-rating"><i class="fas fa-star"></i> ${book.rating}</span>
                </div>
            </div>
        </div>
    `;
}

// فتح المودال مع تفاصيل الكتاب
function openBookModal(bookId) {
    const modal = document.getElementById('pdfModal');
    const modalTitle = document.getElementById('modalTitle');
    
    // البحث عن الكتاب
    currentModalBook = [...currentData.books, ...currentData.manga].find(b => b.id === bookId);
    
    if (!currentModalBook) return;
    
    modalTitle.textContent = currentModalBook.title;
    
    // تعبئة البيانات
    document.getElementById('modalCover').innerHTML = `<i class="fas fa-${getCoverIcon(currentModalBook.category)}"></i>`;
    document.getElementById('modalRating').innerHTML = generateStars(currentModalBook.rating);
    document.getElementById('modalReadBtn').href = currentModalBook.pdfUrl;
    document.getElementById('modalDownloadBtn').href = currentModalBook.downloadUrl || currentModalBook.pdfUrl;
    
    // تعبئة التصنيفات
    const tagsHtml = currentModalBook.tags.map(tag => `<span class="modal-tag">${tag}</span>`).join('');
    document.getElementById('modalTags').innerHTML = tagsHtml;
    
    // تعبئة الوصف
    document.querySelector('#modalDescription p').textContent = 
        currentModalBook.description || 'لا يوجد وصف متاح';
    
    // تحديث زر المفضلة
    updateFavoriteButton();
    
    // تعبئة التعليقات
    loadComments(currentModalBook.id);
    
    // إخفاء الـ PDF وإظهار التفاصيل
    document.getElementById('pdfViewerContainer').style.display = 'none';
    document.querySelector('.modal-body').style.display = 'block';
    
    modal.classList.add('show');
}

// توليد النجوم
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

// تحديث زر المفضلة
function updateFavoriteButton() {
    const favBtn = document.getElementById('modalFavoriteBtn');
    const isFav = isFavorite(currentModalBook.id);
    
    if (isFav) {
        favBtn.classList.add('active');
        favBtn.querySelector('span').textContent = 'في المفضلة';
    } else {
        favBtn.classList.remove('active');
        favBtn.querySelector('span').textContent = 'أضف للمفضلة';
    }
}

// التحقق من المفضلة
function isFavorite(bookId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(bookId);
}

// تبديل المفضلة من المودال
function toggleFavoriteFromModal() {
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

// تحميل التعليقات
function loadComments(bookId) {
    const comments = JSON.parse(localStorage.getItem(`comments_${bookId}`)) || [];
    const commentsList = document.getElementById('modalCommentsList');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">لا توجد تعليقات بعد</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="modal-comment-item">
            <div class="modal-comment-header">
                <span class="modal-comment-author">${comment.author || 'زائر'}</span>
                <span class="modal-comment-date">${new Date(comment.date).toLocaleDateString('ar-EG')}</span>
            </div>
            <div class="modal-comment-text">${comment.text}</div>
        </div>
    `).join('');
}

// إضافة تعليق من المودال
function addCommentFromModal() {
    if (!currentModalBook) return;
    
    const commentText = document.getElementById('modalCommentText').value;
    if (!commentText.trim()) return;
    
    const comments = JSON.parse(localStorage.getItem(`comments_${currentModalBook.id}`)) || [];
    comments.push({
        author: 'زائر',
        text: commentText,
        date: new Date().toISOString()
    });
    
    localStorage.setItem(`comments_${currentModalBook.id}`, JSON.stringify(comments));
    document.getElementById('modalCommentText').value = '';
    loadComments(currentModalBook.id);
}

// فتح PDF للقراءة
function openPDF() {
    if (!currentModalBook) return;
    
    document.querySelector('.modal-body').style.display = 'none';
    document.getElementById('pdfViewerContainer').style.display = 'block';
    document.getElementById('pdfViewer').src = currentModalBook.pdfUrl;
}

// إغلاق المودال
function closePDF() {
    const modal = document.getElementById('pdfModal');
    modal.classList.remove('show');
    document.getElementById('pdfViewer').src = '';
    document.querySelector('.modal-body').style.display = 'block';
    document.getElementById('pdfViewerContainer').style.display = 'none';
}

// البحث
function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value;
    renderBooks('الكل', searchTerm);
}

// أيقونات التصنيفات
function getCategoryIcon(category) {
    const icons = {
        'كتب عربية': 'book',
        'روايات': 'book-open',
        'تاريخ': 'landmark',
        'مانغا': 'dragon',
        'سير ذاتية': 'user'
    };
    return icons[category] || 'book';
}

function getCoverIcon(category) {
    const icons = {
        'رواية': 'book-open',
        'تاريخ': 'scroll',
        'مانغا': 'dragon'
    };
    return icons[category] || 'book';
}

// تقييم الكتاب
function rateBook(bookId, rating) {
    const ratings = JSON.parse(localStorage.getItem(`ratings_${bookId}`)) || [];
    ratings.push(rating);
    localStorage.setItem(`ratings_${bookId}`, JSON.stringify(ratings));
    
    // حساب متوسط التقييم
    const average = ratings.reduce((a,b) => a + b, 0) / ratings.length;
    
    // تحديث واجهة النجوم
    const stars = document.querySelectorAll('.rating-input i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star';
        } else {
            star.className = 'far fa-star';
        }
    });
    
    alert('شكراً على تقييمك!');
}

// الأحداث
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // البحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchBooks);
    }
    
    // تصنيفات سريعة
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderBooks(e.target.textContent);
        });
    });
    
    // تصنيفات جانبية
    document.querySelectorAll('.categories a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.categories a').forEach(l => l.classList.remove('active'));
            e.target.closest('a').classList.add('active');
            const category = e.target.closest('a').textContent.trim();
            renderBooks(category);
        });
    });
    
    // إغلاق المودال عند الضغط على الـ X
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePDF);
    }
});
