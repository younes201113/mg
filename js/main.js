// main.js
let books = [];
let currentCategory = 'الكل';

// تحميل البيانات
function loadData() {
    books = [...libraryData.books, ...libraryData.manga];
    // ترتيب الكتب حسب ID
    books.sort((a, b) => a.id - b.id);
    displayBooks(books);
    setupCategories();
    setupTabs();
}

// عرض الكتب
function displayBooks(booksToShow) {
    const container = document.getElementById('booksContainer');
    
    // تجميع الكتب حسب التصنيف
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
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html || '<p class="no-books">لا توجد كتب</p>';
}

// إعداد التصنيفات الجانبية
function setupCategories() {
    const categories = ['الكل', ...new Set(books.map(b => b.category === 'رواية' ? 'روايات' : b.category))];
    const list = document.getElementById('categoryList');
    list.innerHTML = categories.map(cat => 
        `<li><a href="#" onclick="filterByCategory('${cat}')" class="${cat === currentCategory ? 'active' : ''}">${cat}</a></li>`
    ).join('');
}

// إعداد التبويبات العلوية
function setupTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        const tabCategory = tab.textContent === 'روايات' ? 'رواية' : tab.textContent;
        if (tabCategory === currentCategory || (currentCategory === 'روايات' && tab.textContent === 'روايات')) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
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
    setupCategories();
    setupTabs();
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
        'مانغا': 'dragon',
        'كتب عربية': 'book'
    };
    return icons[category] || 'book';
}

// تشغيل
document.addEventListener('DOMContentLoaded', loadData);
