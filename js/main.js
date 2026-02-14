// main.js
let books = [];
let currentCategory = 'الكل';

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
                    <div class="book-card" onclick="openPDF('${book.pdfUrl}', '${book.title}')">
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

// فتح PDF في الفريم
// فتح PDF في الفريم
function openPDF(url, title) {
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    const modalTitle = document.getElementById('modalTitle');
    
    // البحث عن الكتاب كامل عشان نعرض الأزرار
    currentModalBook = books.find(b => b.pdfUrl === url || b.pdfUrl.includes(url.split('/').pop()));
    
    // لو الرابط من Drive
    if (url.includes('drive.google.com')) {
        const fileId = url.split('/d/')[1]?.split('/')[0];
        if (fileId) {
            url = `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }
    
    modalTitle.textContent = title;
    viewer.src = url;
    
    // تجهيز روابط الأزرار
    const readBtn = document.getElementById('modalReadBtn');
    const downloadBtn = document.getElementById('modalDownloadBtn');
    const favBtn = document.getElementById('modalFavoriteBtn');
    
    if (currentModalBook) {
        readBtn.href = currentModalBook.pdfUrl;
        readBtn.style.display = 'inline-flex';
        
        // رابط التحميل
        if (currentModalBook.pdfUrl.includes('drive.google.com')) {
            const fileId = currentModalBook.pdfUrl.split('/d/')[1]?.split('/')[0];
            downloadBtn.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
        } else {
            downloadBtn.href = currentModalBook.pdfUrl;
        }
        
        // تحديث زر المفضلة
        updateFavoriteButton();
    }
    
    modal.classList.add('show');
}

// إغلاق الفريم
function closePDF() {
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    modal.classList.remove('show');
    viewer.src = '';
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

// تشغيل
document.addEventListener('DOMContentLoaded', loadData);

// إغلاق الفريم عند الضغط خارج المحتوى
window.onclick = function(event) {
    const modal = document.getElementById('pdfModal');
    if (event.target === modal) {
        closePDF();
    }
};
