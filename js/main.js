// main.js
let books = [];

// تحميل البيانات
function loadData() {
    books = [...libraryData.books, ...libraryData.manga];
    displayBooks(books);
    setupCategories();
}

// عرض الكتب
function displayBooks(booksToShow) {
    const container = document.getElementById('booksContainer');
    container.innerHTML = booksToShow.map(book => `
        <div class="book-card" onclick="window.open('${book.pdfUrl}', '_blank')">
            <div class="book-cover">
                <i class="fas fa-${getIcon(book.category)}"></i>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <div class="book-author">${book.author}</div>
                <div class="book-meta">
                    <span class="book-category">${book.category}</span>
                    <span class="book-rating">${'★'.repeat(Math.floor(book.rating))}${'☆'.repeat(5-Math.floor(book.rating))}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// إعداد التصنيفات
function setupCategories() {
    const categories = [...new Set(books.map(b => b.category))];
    const list = document.getElementById('categoryList');
    list.innerHTML = '<li><a href="#" onclick="filterByCategory(\'الكل\')">الكل</a></li>' +
        categories.map(cat => 
            `<li><a href="#" onclick="filterByCategory('${cat}')">${cat}</a></li>`
        ).join('');
}

// تصفية حسب التصنيف
function filterByCategory(category) {
    if (category === 'الكل') {
        displayBooks(books);
    } else {
        displayBooks(books.filter(b => b.category === category));
    }
}

// البحث
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = books.filter(b => 
        b.title.includes(term) || b.author.includes(term)
    );
    displayBooks(filtered);
});

// أيقونات
function getIcon(category) {
    const icons = {'رواية':'book-open', 'تاريخ':'scroll', 'مانغا':'dragon'};
    return icons[category] || 'book';
}

// تشغيل
document.addEventListener('DOMContentLoaded', loadData);
