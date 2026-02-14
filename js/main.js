// js/main.js

let currentData = null;

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

// js/main.js - تحديث دالة createBookCard

function createBookCard(book) {
    return `
        <div class="book-card">
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
                
                <!-- الأزرار الجديدة -->
                <div class="book-actions">
                    <button onclick="openPDF('${book.pdfUrl}', '${book.title}')" class="btn-read">
                        <i class="fas fa-book-open"></i> قراءة
                    </button>
                    <a href="${book.pdfUrl}" download class="btn-download" onclick="event.stopPropagation()">
                        <i class="fas fa-download"></i> تحميل
                    </a>
                </div>
            </div>
        </div>
    `;
}

// تحديث دالة openPDF لمنع انتشار الحدث
function openPDF(pdfUrl, title, event) {
    if (event) {
        event.stopPropagation();
    }
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = title;
    viewer.src = pdfUrl;
    modal.classList.add('show');
}

// إغلاق PDF
function closePDF() {
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    modal.classList.remove('show');
    viewer.src = '';
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

// الأحداث
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
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
            const category = e.target.closest('a').textContent.trim();
            renderBooks(category);
        });
    });
});
