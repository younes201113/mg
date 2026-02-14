// ================== main.js ==================
let books = [];
let currentCategory = 'الكل';
let currentModalBook = null;

// ---------- تحميل البيانات وعرضها ----------
function loadData() {
    books = [...libraryData.books, ...libraryData.manga];
    books.sort((a, b) => a.id - b.id);
    displayBooks(books);
    setupCategories();
    setupTabs();
}

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

// ---------- إعداد القوائم والتبويبات ----------
function setupCategories() {
    const categories = ['الكل', ...new Set(books.map(b => b.category === 'رواية' ? 'روايات' : b.category))];
    const list = document.getElementById('categoryList');
    list.innerHTML = categories.map(cat =>
        `<li><a href="#" onclick="filterByCategory('${cat}')">${cat}</a></li>`
    ).join('');
}

function setupTabs() {
    const tabsContainer = document.getElementById('categoryTabs');
    const categories = ['الكل', 'روايات', 'تاريخ', 'مانغا'];
    tabsContainer.innerHTML = categories.map(cat =>
        `<button class="category-tab" onclick="filterByCategory('${cat}')">${cat}</button>`
    ).join('');
    // Highlight the active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.textContent === currentCategory) tab.classList.add('active');
    });
}

function filterByCategory(category) {
    currentCategory = category;
    if (category === 'الكل') {
        displayBooks(books);
    } else {
        const filterCat = category === 'روايات' ? 'رواية' : category;
        displayBooks(books.filter(b => b.category === filterCat));
    }

    // Update active states in both sidebar and tabs
    document.querySelectorAll('.category-tab, .categories a').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.textContent === category) tab.classList.add('active');
    });
    document.querySelectorAll('.categories a').forEach(link => {
        if (link.textContent.trim() === category) link.classList.add('active');
    });
}

// ---------- البحث ----------
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    displayBooks(books.filter(b => b.title.includes(term) || b.author.includes(term)));
});

// ---------- أيقونات التصنيفات ----------
function getIcon(category) {
    const icons = { 'روايات': 'book-open', 'رواية': 'book-open', 'تاريخ': 'scroll', 'مانغا': 'dragon' };
    return icons[category] || 'book';
}

function generateStarsSimple(rating) {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
}

// ========== دوال المودال (النافذة المنبثقة) ==========
function openBookModal(bookId) {
    currentModalBook = books.find(b => b.id === bookId);
    if (!currentModalBook) return;

    const modal = document.getElementById('bookModal'); // تأكد إن id بتاع المودال هو bookModal
    document.getElementById('modalTitle').textContent = currentModalBook.title;
    document.getElementById('modalCover').innerHTML = `<i class="fas fa-${getIcon(currentModalBook.category)}"></i>`;
    document.getElementById('modalRating').innerHTML = generateStars(currentModalBook.rating);

    // تجهيز رابط التحميل
    let downloadUrl = currentModalBook.pdfUrl;
    if (currentModalBook.pdfUrl.includes('drive.google.com')) {
        const fileId = currentModalBook.pdfUrl.split('/d/')[1]?.split('/')[0];
        if (fileId) downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    document.getElementById('modalDownloadBtn').href = downloadUrl;

    // عرض التصنيفات (Tags)
    const tagsEl = document.getElementById('modalTags');
    tagsEl.innerHTML = currentModalBook.tags?.map(t => `<span class="modal-tag">${t}</span>`).join('') || '';

    // عرض الوصف
    document.getElementById('modalDescription').textContent = currentModalBook.description || 'لا يوجد وصف متاح';

    // تحديث زر المفضلة
    updateFavoriteButton();

    // تحميل التقييمات والتعليقات
    updateAverageRating(currentModalBook.id);
    loadComments(currentModalBook.id);

    // إعادة ضبط نجوم التقييم (تظهر كلها فارغة عشان المستخدم يقيم من جديد)
    const ratingStars = document.querySelectorAll('.rating-stars-input i');
    ratingStars.forEach(star => star.className = 'far fa-star');

    // عرض قسم التفاصيل وإخفاء قارئ PDF
    document.querySelector('.modal-body').style.display = 'block';
    document.getElementById('pdfViewerContainer').style.display = 'none';

    modal.classList.add('show');
}

// دالة عرض النجوم الكاملة (نصف نجمة ونجمة كاملة)
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) stars += '<i class="fas fa-star"></i>';
        else if (i - rating < 1 && i - rating > 0) stars += '<i class="fas fa-star-half-alt"></i>';
        else stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

function showPdfViewer() {
    if (!currentModalBook) return;
    const viewer = document.getElementById('pdfViewer');
    let pdfUrl = currentModalBook.pdfUrl;

    // تحويل رابط Drive إلى رابط preview
    if (pdfUrl.includes('drive.google.com')) {
        const fileId = pdfUrl.split('/d/')[1]?.split('/')[0];
        if (fileId) pdfUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    }
    viewer.src = pdfUrl;
    document.querySelector('.modal-body').style.display = 'none';
    document.getElementById('pdfViewerContainer').style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('bookModal');
    modal.classList.remove('show');
    document.getElementById('pdfViewer').src = '';
    document.querySelector('.modal-body').style.display = 'block';
    document.getElementById('pdfViewerContainer').style.display = 'none';
}

// ========== دوال المفضلة ==========
function updateFavoriteButton() {
    const favBtn = document.getElementById('modalFavoriteBtn');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFav = favorites.includes(currentModalBook.id);
    favBtn.classList.toggle('active', isFav);
    favBtn.querySelector('span').textContent = isFav ? 'في المفضلة' : 'أضف للمفضلة';
}

function toggleFavorite() {
    if (!currentModalBook) return;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.indexOf(currentModalBook.id);
    index === -1 ? favorites.push(currentModalBook.id) : favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton();
}

// ========== دوال التقييم ==========
function rateBook(rating) {
    if (!currentModalBook) return;
    const bookId = currentModalBook.id;
    const ratings = JSON.parse(localStorage.getItem(`ratings_${bookId}`)) || [];
    ratings.push(rating);
    localStorage.setItem(`ratings_${bookId}`, JSON.stringify(ratings));
    updateAverageRating(bookId);

    // تحديث النجوم اللي اختارها
    const stars = document.querySelectorAll('.rating-stars-input i');
    stars.forEach((star, index) => {
        star.className = index < rating ? 'fas fa-star' : 'far fa-star';
    });
}

function updateAverageRating(bookId) {
    const ratings = JSON.parse(localStorage.getItem(`ratings_${bookId}`)) || [];
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : currentModalBook.rating;
    document.getElementById('averageRating').innerHTML = `⭐ متوسط التقييم: ${avgRating} (${ratings.length} تقييم)`;
}

// ========== دوال التعليقات ==========
function addComment() {
    if (!currentModalBook) return;
    const commentText = document.getElementById('commentText').value;
    if (!commentText.trim()) return;

    const bookId = currentModalBook.id;
    const comments = JSON.parse(localStorage.getItem(`comments_${bookId}`)) || [];
    comments.push({ author: 'زائر', text: commentText, date: new Date().toISOString() });
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
    commentsList.innerHTML = comments.map(c => `
        <div class="comment-item">
            <div class="comment-header"><span class="comment-author">${c.author}</span><span class="comment-date">${new Date(c.date).toLocaleDateString('ar-EG')}</span></div>
            <div class="comment-text">${c.text}</div>
        </div>
    `).join('');
}

// ---------- التشغيل والإغلاق ----------
document.addEventListener('DOMContentLoaded', loadData);

window.onclick = function(event) {
    const modal = document.getElementById('bookModal');
    if (event.target === modal) closeModal();
};
