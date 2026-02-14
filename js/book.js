// js/book.js

// استخراج ID الكتاب من الرابط
const urlParams = new URLSearchParams(window.location.search);
const bookId = parseInt(urlParams.get('id'));

// تحميل البيانات
let currentData = JSON.parse(localStorage.getItem('libraryData')) || libraryData;

// دالة عرض تفاصيل الكتاب
function renderBookDetails() {
    // البحث عن الكتاب في الكتب والمانغا
    let book = [...currentData.books, ...currentData.manga].find(b => b.id === bookId);
    
    if (!book) {
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('bookDetailsContainer');
    
    container.innerHTML = `
        <div class="book-details-card">
            <div class="book-details-header">
                <button onclick="goBack()" class="back-btn">
                    <i class="fas fa-arrow-right"></i> رجوع
                </button>
                <button onclick="toggleFavorite(${book.id})" class="favorite-btn ${isFavorite(book.id) ? 'active' : ''}">
                    <i class="fas fa-heart"></i>
                    <span>${isFavorite(book.id) ? 'في المفضلة' : 'أضف للمفضلة'}</span>
                </button>
            </div>

            <div class="book-details-content">
                <!-- العمود الأول: الغلاف -->
                <div class="book-cover-column">
                    <div class="book-cover-large">
                        <i class="fas fa-${getCoverIcon(book.category)}"></i>
                    </div>
                    
                    <!-- التقييم -->
                    <div class="book-rating-large">
                        <div class="rating-stars">
                            ${generateStars(book.rating)}
                        </div>
                        <span class="rating-value">${book.rating}/5</span>
                    </div>

                    <!-- الأزرار -->
                    <div class="book-details-actions">
                        <a href="${book.pdfUrl}" target="_blank" class="btn-read-large">
                            <i class="fas fa-book-open"></i> قراءة
                        </a>
                        <a href="${book.downloadUrl || book.pdfUrl}" download class="btn-download-large" target="_blank">
                            <i class="fas fa-download"></i> تحميل
                        </a>
                    </div>
                </div>

                <!-- العمود الثاني: المعلومات -->
                <div class="book-info-column">
                    <h1 class="book-title-large">${book.title}</h1>
                    <h3 class="book-author-large">${book.author}</h3>
                    
                    <!-- التصنيفات -->
                    <div class="book-tags">
                        ${book.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>

                    <!-- الوصف -->
                    <div class="book-description">
                        <h4><i class="fas fa-info-circle"></i> عن الكتاب</h4>
                        <p>${book.description || 'لا يوجد وصف متاح'}</p>
                    </div>

                    <!-- التعليقات -->
                    <div class="book-comments">
                        <h4><i class="fas fa-comments"></i> التعليقات والتقييمات</h4>
                        
                        <!-- إضافة تقييم -->
                        <div class="add-rating">
                            <p>قيم هذا الكتاب:</p>
                            <div class="rating-input">
                                ${[1,2,3,4,5].map(num => `
                                    <i class="far fa-star" onclick="rateBook(${book.id}, ${num})" data-rating="${num}"></i>
                                `).join('')}
                            </div>
                        </div>

                        <!-- إضافة تعليق -->
                        <div class="add-comment">
                            <textarea id="commentText" placeholder="اكتب تعليقك..."></textarea>
                            <button onclick="addComment(${book.id})" class="btn-add-comment">
                                <i class="fas fa-paper-plane"></i> أضف تعليق
                            </button>
                        </div>

                        <!-- قائمة التعليقات -->
                        <div class="comments-list" id="commentsList">
                            ${renderComments(book.id)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
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

// عرض التعليقات
function renderComments(bookId) {
    const comments = JSON.parse(localStorage.getItem(`comments_${bookId}`)) || [];
    if (comments.length === 0) {
        return '<p class="no-comments">لا توجد تعليقات بعد. كن أول من يعلق!</p>';
    }
    
    return comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.author || 'زائر'}</span>
                <span class="comment-date">${new Date(comment.date).toLocaleDateString('ar-EG')}</span>
            </div>
            <p class="comment-text">${comment.text}</p>
        </div>
    `).join('');
}

// إضافة تعليق
function addComment(bookId) {
    const commentText = document.getElementById('commentText').value;
    if (!commentText.trim()) return;
    
    const comments = JSON.parse(localStorage.getItem(`comments_${bookId}`)) || [];
    comments.push({
        author: 'زائر',
        text: commentText,
        date: new Date().toISOString()
    });
    
    localStorage.setItem(`comments_${bookId}`, JSON.stringify(comments));
    document.getElementById('commentText').value = '';
    renderBookDetails(); // إعادة تحميل الصفحة
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

// التحقق من المفضلة
function isFavorite(bookId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(bookId);
}

// إضافة/إزالة من المفضلة
function toggleFavorite(bookId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.indexOf(bookId);
    
    if (index === -1) {
        favorites.push(bookId);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderBookDetails(); // إعادة تحميل الصفحة
}

// الرجوع للصفحة الرئيسية
function goBack() {
    window.history.back();
}

// أيقونات
function getCoverIcon(category) {
    const icons = {
        'رواية': 'book-open',
        'تاريخ': 'scroll',
        'مانغا': 'dragon'
    };
    return icons[category] || 'book';
}

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', renderBookDetails);
