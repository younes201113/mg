// js/main.js
let currentData = libraryData;
let currentModalBook = null;

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
    
    let html = '<div class="books-grid">';
    allItems.forEach(book => {
        html += `
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
    });
    html += '</div>';
    container.innerHTML = html;
}

// فتح المودال
function openBookModal(bookId) {
    const modal = document.getElementById('pdfModal');
    const modalTitle = document.getElementById('modalTitle');
    
    currentModalBook = [...currentData.books, ...currentData.manga].find(b => b.id === bookId);
    if (!currentModalBook) return;
    
    modalTitle.textContent = currentModalBook.title;
    
    // تعبئة البيانات
    document.getElementById('modalCover').innerHTML = `<i class="fas fa-${getCoverIcon(currentModalBook.category)}"></i>`;
    document.getElementById('modalRating').innerHTML = generateStars(currentModalBook.rating);
    document.getElementById('modalReadBtn').href = currentModalBook.pdfUrl;
    document.getElementById('modalDownloadBtn').href = currentModalBook.downloadUrl || currentModalBook.pdfUrl;
    document.getElementById('modalReadBtn').setAttribute('onclick', 'openPDF(); return false;');
    
    // التصنيفات
    const tagsHtml = currentModalBook.tags.map(tag => `<span class="modal-tag">${tag}</span>`).join('');
    document.getElementById('modalTags').innerHTML = tagsHtml;
    
    // الوصف
    document.querySelector('#modalDescription p').textContent = currentModalBook.description || 'لا يوجد وصف متاح';
    
    // إخفاء الـ PDF وإظهار التفاصيل
    document.getElementById('pdfViewerContainer').style.display = 'none';
    document.querySelector('.modal-body').style.display = 'block';
    
    // إظهار المودال
    modal.style.display = 'flex';
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
    modal.style.display = 'none';
    document.getElementById('pdfViewer').src = '';
    document.querySelector('.modal-body').style.display = 'block';
    document.getElementById('pdfViewerContainer').style.display = 'none';
}

// البحث
function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value;
    renderBooks('الكل', searchTerm);
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

// أيقونات
function getCoverIcon(category) {
    const icons = {
        'رواية': 'book-open',
        'تاريخ': 'scroll',
        'مانغا': 'dragon'
    };
    return icons[category] || 'book';
}

// تبديل المفضلة
function toggleFavoriteFromModal() {
    alert('مش هتشتغل دلوقتي');
}

// الأحداث
document.addEventListener('DOMContentLoaded', () => {
    renderBooks();
    
    // البحث
    document.getElementById('searchInput').addEventListener('input', searchBooks);
    
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
            renderBooks(e.target.closest('a').textContent.trim());
        });
    });
    
    // إغلاق المودال عند الضغط خارج المحتوى
    window.onclick = function(event) {
        const modal = document.getElementById('pdfModal');
        if (event.target == modal) {
            closePDF();
        }
    };
});
