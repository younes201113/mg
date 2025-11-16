async function loadBooks() {
  const res = await fetch("books.json");
  return await res.json();
}

function goHome() {
  document.getElementById("content").innerHTML = `
    <h1 class='welcome'>أهلاً بك في مكتبة Snoy</h1>
    <p class='welcome-sub'>اختر كتابًا أو مانغا من القائمة.</p>
  `;
}

async function showBooks() {
  const books = await loadBooks();
  const list = books.filter(b => b.type === "book");
  renderBooks(list);
}

async function showManga() {
  const books = await loadBooks();
  const list = books.filter(b => b.type === "manga");
  renderBooks(list);
}

function renderBooks(list) {
  let html = "";
  list.forEach(book => {
    html += `
      <div class="book-card" onclick="openBook(${book.id})">
        <img src="${book.cover}" alt="">
        <h3>${book.title}</h3>
        <p>المؤلف: ${book.author}</p>
      </div>
    `;
  });

  document.getElementById("content").innerHTML = html || "<p>لا يوجد محتوى.</p>";
}

async function openBook(id) {
  const books = await loadBooks();
  const book = books.find(b => b.id === id);

  document.getElementById("content").innerHTML = `
    <div class="book-view">
      <img src="${book.cover}" width="250">
      <h1>${book.title}</h1>
      <p>المؤلف: ${book.author}</p>
      <p>التقييم: ⭐ ${book.rating}</p>
      <p>عدد الصفحات: ${book.pages}</p>

      <button>⭐ إضافة للمفضلة</button>
      <button>📖 قراءة</button>
      <button>⬇ تحميل</button>
    </div>
  `;
}

/* البحث */
document.getElementById("searchInput").addEventListener("keyup", async function(e) {
  if (e.key === "Enter") {
    const books = await loadBooks();
    const q = this.value.trim();
    const results = books.filter(b => b.title.includes(q));

    renderBooks(results);
  }
});
