// دالة لعرض كل المحتوى
function showAll() {
    // إظهار جميع العناصر
    document.querySelectorAll('.manga-item, .book-item').forEach(item => {
        item.style.display = 'block';
    });
    
    // إظهار جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'block';
    });
}

// دالة لعرض المانغا فقط
function showMangaOnly() {
    // إخفاء الكتب وإظهار المانغا
    document.querySelectorAll('.book-item').forEach(item => {
        item.style.display = 'none';
    });
    document.querySelectorAll('.manga-item').forEach(item => {
        item.style.display = 'block';
    });
    
    // إخفاء قسم الكتب وإظهار قسم المانغا
    document.getElementById('books-section').style.display = 'none';
    document.getElementById('manga-section').style.display = 'block';
}

// دالة لعرض الكتب فقط
function showBooksOnly() {
    // إخفاء المانغا وإظهار الكتب
    document.querySelectorAll('.manga-item').forEach(item => {
        item.style.display = 'none';
    });
    document.querySelectorAll('.book-item').forEach(item => {
        item.style.display = 'block';
    });
    
    // إخفاء قسم المانغا وإظهار قسم الكتب
    document.getElementById('manga-section').style.display = 'none';
    document.getElementById('books-section').style.display = 'block';
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // يمكن إضافة أي تهيئة إضافية هنا
    console.log('تم تحميل الموقع بنجاح');
});
