/* ----- Local DB & state ----- */
const DB_KEY = 'snoy_db_v1'; // local storage key
let state = {
  users: {},   // users: { username: { favorites: [ids], ratings: {id:rating} } }
  books: []    // loaded from books.json
};
let currentUser = null;

/* ----- Helpers ----- */
function saveState(){ localStorage.setItem(DB_KEY, JSON.stringify(state)); }
function loadState(){
  const raw = localStorage.getItem(DB_KEY);
  if(raw){ try{ state = JSON.parse(raw); } catch(e){ console.error(e); } }
}

/* ----- init: load books.json then UI ----- */
async function init(){
  loadState();
  // load books.json
  try {
    const res = await fetch('books.json');
    state.books = await res.json();
  } catch(e){
    console.error('فشل في تحميل books.json', e);
    state.books = state.books || [];
  }
  // UI bindings
  document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
  document.getElementById('homeLogo').addEventListener('click', goHome);
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keyup', (e)=>{ if(e.key==='Enter') doSearch(); });
  document.getElementById('loginBtn').addEventListener('click', doLogin);

  // sidebar handlers
  document.querySelectorAll('.side-btn').forEach(b=>{
    b.addEventListener('click', ()=> {
      const action = b.getAttribute('data-action');
      if(action==='home') goHome();
      if(action==='books') showBooks();
      if(action==='manga') showManga();
      if(action==='favorites') showFavorites();
      if(action==='account') showAccount();
    });
  });

  // initial render: show books grid
  renderGrid(state.books);
  updateAccountUI();
}

/* ----- UI actions ----- */
function toggleSidebar(){
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('closed');
}

function goHome(){
  hideAllViews();
  document.getElementById('homeView').classList.remove('hidden');
  renderGrid(state.books);
}

function hideAllViews(){
  document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
}

/* ----- render grid ----- */
function renderGrid(list){
  const grid = document.getElementById('gridArea');
  if(!list || list.length===0){
    grid.innerHTML = '<p class="muted">لا يوجد محتوى.</p>';
    return;
  }
  let html = '';
  list.forEach(book=>{
    html += `
      <div class="book-card" onclick="openBook(${book.id})">
        <img src="${book.cover}" alt="${escapeHtml(book.title)}">
        <h3>${escapeHtml(book.title)}</h3>
        <p>${escapeHtml(book.author)}</p>
      </div>
    `;
  });
  grid.innerHTML = html;
}

/* ----- open book detail ----- */
function openBook(id){
  const book = state.books.find(b=>b.id===id);
  if(!book) {
    alert('لم يتم العثور على الكتاب');
    return;
  }
  hideAllViews();
  const view = document.getElementById('bookView');
  view.classList.remove('hidden');
  // build detail
  const fav = isFavorite(id);
  const userRate = getUserRating(id) || book.rating || 0;
  view.innerHTML = `
    <div class="book-view">
      <img class="cover" src="${book.cover}" alt="${escapeHtml(book.title)}" />
      <h1>${escapeHtml(book.title)}</h1>
      <p class="muted">المؤلف: ${escapeHtml(book.author)} — الصفحات: ${book.pages || '—'}</p>
      <p>التقييم العام: ⭐ ${book.rating || 0} — تقييمك: <strong id="myRate">${userRate}</strong></p>
      <div class="controls">
        <button class="btn" onclick="toggleFavorite(${id})">${fav? '💖 إزالة من المفضلة' : '🤍 إضافة للمفضلة'}</button>
        <button class="btn alt" onclick="promptRate(${id})">⭐ قيم</button>
        <button class="btn alt" onclick="readBook(${id})">📖 قراءة</button>
        <button class="btn alt" onclick="downloadBook(${id})">⬇ تحميل</button>
      </div>
      <section class="comments" id="commentsArea">
        <h3>التعليقات</h3>
        <div id="commentsList"></div>
        <div id="commentForm"></div>
      </section>
    </div>
  `;
  renderComments(id);
}

/* ----- favorites ----- */
function ensureUser(){
  if(!currentUser){
    alert('سجّل الدخول أولاً (اسمك في الديسكورد)');
    doLogin();
    return false;
  }
  if(!state.users[currentUser]) state.users[currentUser] = { favorites: [], ratings: {}, comments: {} };
  return true;
}
function toggleFavorite(id){
  if(!ensureUser()) return;
  const favs = state.users[currentUser].favorites;
  const idx = favs.indexOf(id);
  if(idx === -1) favs.push(id);
  else favs.splice(idx,1);
  saveState(); updateAccountUI();
  openBook(id); // re-render to update button
}
function isFavorite(id){
  return currentUser && state.users[currentUser] && state.users[currentUser].favorites.includes(id);
}
function showFavorites(){
  hideAllViews();
  document.getElementById('favView').classList.remove('hidden');
  const favGrid = document.getElementById('favGrid');
  if(!currentUser || !state.users[currentUser] || state.users[currentUser].favorites.length===0){
    favGrid.innerHTML = '<p class="muted">لم تضف كتبًا للمفضلة بعد.</p>';
    return;
  }
  const list = state.users[currentUser].favorites.map(id=> state.books.find(b=>b.id===id)).filter(Boolean);
  let html = '';
  list.forEach(book=>{
    html += `
      <div class="book-card" onclick="openBook(${book.id})">
        <img src="${book.cover}" alt="${escapeHtml(book.title)}">
        <h3>${escapeHtml(book.title)}</h3>
        <p>${escapeHtml(book.author)}</p>
      </div>
    `;
  });
  favGrid.innerHTML = html;
}

/* ----- ratings ----- */
function promptRate(id){
  if(!ensureUser()) return;
  const r = prompt('أعطِ تقييماً من 1 إلى 5:');
  const val = Number(r);
  if(!val || val<1 || val>5) return alert('قيمة غير صحيحة');
  state.users[currentUser].ratings[id] = val;
  saveState();
  openBook(id);
}
function getUserRating(id){
  return currentUser && state.users[currentUser] && state.users[currentUser].ratings[id];
}

/* ----- comments (simple, local) ----- */
function renderComments(bookId){
  const area = document.getElementById('commentsList');
  area.innerHTML = '';
  const comments = (state.users.comments && state.users.comments[bookId]) || [];
  // global comments stored under state.comments? We'll store globally per book at state.comments
  const globalComments = state.comments && state.comments[bookId] ? state.comments[bookId] : [];
  // render global
  if(globalComments.length===0) area.innerHTML = '<p class="muted">لا يوجد تعليقات بعد.</p>';
  else {
    globalComments.forEach(c=>{
      area.innerHTML += `<div class="comment"><strong>${escapeHtml(c.user)}</strong>: ${escapeHtml(c.text)}</div>`;
    });
  }
  // form for posting
  const form = document.getElementById('commentForm');
  if(ensureUser()){
    form.innerHTML = `<textarea id="commentText" rows="3" style="width:100%;border-radius:8px;padding:8px;background:#2a0f40;color:#fff;border:1px solid rgba(255,255,255,0.04)"></textarea>
      <div style="text-align:left;margin-top:6px;"><button class="small-btn" onclick="postComment(${bookId})">نشر التعليق</button></div>`;
  } else {
    form.innerHTML = '<p class="muted">سجّل دخولك لتتمكن من التعليق.</p>';
  }
}
function postComment(bookId){
  if(!ensureUser()) return;
  const txt = document.getElementById('commentText').value.trim();
  if(!txt) return alert('اكتب تعليقاً أولاً');
  state.comments = state.comments || {};
  state.comments[bookId] = state.comments[bookId] || [];
  state.comments[bookId].push({ user: currentUser, text: txt, at: Date.now() });
  saveState();
  renderComments(bookId);
}

/* ----- read / download (opens pdf link if available) ----- */
function readBook(id){
  const book = state.books.find(b=>b.id===id);
  if(!book) return;
  if(book.files && book.files.pdf){
    window.open(book.files.pdf, '_blank');
  } else {
    alert('لا يوجد ملف قراءة متاح لهذا الكتاب.');
  }
}
function downloadBook(id){
  const book = state.books.find(b=>b.id===id);
  if(!book) return;
  if(book.files && book.files.pdf){
    const a = document.createElement('a'); a.href = book.files.pdf; a.download = '';
    document.body.appendChild(a); a.click(); a.remove();
  } else {
    alert('لا يوجد ملف تحميل متاح لهذا الكتاب.');
  }
}

/* ----- search ----- */
async function doSearch(){
  const q = document.getElementById('searchInput').value.trim();
  if(!q) return alert('أدخل كلمة للبحث');
  const arr = state.books.filter(b => (b.title + ' ' + (b.author||'')).toLowerCase().includes(q.toLowerCase()));
  hideAllViews();
  document.getElementById('homeView').classList.remove('hidden');
  renderGrid(arr);
}

/* ----- login (simple username prompt) ----- */
function doLogin(){
  const name = prompt('اكتب اسمك (يوزر الديسكورد) للتسجيل / الدخول:');
  if(!name) return;
  currentUser = name.trim();
  if(!state.users[currentUser]) state.users[currentUser] = { favorites: [], ratings: {} };
  saveState();
  updateAccountUI();
  alert('مرحباً ' + currentUser);
}

/* ----- account view ----- */
function showAccount(){ hideAllViews(); document.getElementById('accountView').classList.remove('hidden'); document.getElementById('accountName').innerText = currentUser || 'غير مسجل'; }
function updateAccountUI(){
  if(currentUser){
    document.getElementById('loginBtn').innerText = currentUser + ' ✓';
    document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ currentUser = null; updateAccountUI(); });
  } else {
    document.getElementById('loginBtn').innerText = 'تسجيل الدخول';
  }
}

/* ----- utilities ----- */
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

/* ----- manga functions ----- */
function showManga() {
  const manga = state.books.filter(book => book.type === 'manga');
  hideAllViews();
  document.getElementById('homeView').classList.remove('hidden');
  renderGrid(manga);
}

function showBooks() {
  const books = state.books.filter(book => book.type === 'book');
  hideAllViews();
  document.getElementById('homeView').classList.remove('hidden');
  renderGrid(books);
}

// تعديل دالة openBook لدعم المانغا
const originalOpenBook = openBook;
openBook = function(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) {
    alert('لم يتم العثور على المحتوى');
    return;
  }
  
  if (book.type === 'manga') {
    openMangaReader(book);
  } else {
    originalOpenBook(id);
  }
}

// قارئ المانغا
function openMangaReader(manga) {
  const pages = manga.files?.pages || [];
  if (pages.length === 0) {
    alert('لا توجد صفحات متاحة لهذه المانغا');
    return;
  }
  
  const windowFeatures = 'width=900,height=700,scrollbars=yes,resizable=yes';
  const mangaWindow = window.open('', '_blank', windowFeatures);
  
  mangaWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${manga.title} - قارئ المانغا</title>
      <style>
        body { 
          margin: 0; 
          padding: 20px; 
          background: #1a1a1a; 
          color: white; 
          text-align: center; 
          font-family: Arial, sans-serif;
        }
        .manga-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .manga-page { 
          max-width: 100%; 
          height: auto; 
          margin: 10px 0;
          border-radius: 5px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .controls { 
          margin: 20px 0; 
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
        }
        .nav-btn { 
          padding: 10px 20px; 
          background: #007bff; 
          color: white; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 14px;
        }
        .nav-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        .page-info { 
          font-size: 16px; 
          font-weight: bold; 
          padding: 0 15px;
        }
        .manga-title {
          margin-bottom: 20px;
          color: #fff;
        }
      </style>
    </head>
    <body>
      <div class="manga-container">
        <h2 class="manga-title">${manga.title}</h2>
        <div class="controls">
          <button class="nav-btn" onclick="prevPage()" id="prevBtn">السابق</button>
          <span class="page-info" id="pageInfo">الصفحة 1</span>
          <button class="nav-btn" onclick="nextPage()" id="nextBtn">التالي</button>
        </div>
        <img id="mangaImage" class="manga-page" src="${pages[0]}" alt="صفحة المانغا">
        <div class="controls">
          <button class="nav-btn" onclick="prevPage()">السابق</button>
          <span class="page-info" id="pageInfoBottom">الصفحة 1</span>
          <button class="nav-btn" onclick="nextPage()">التالي</button>
        </div>
      </div>
      <script>
        let currentPage = 1;
        const pages = ${JSON.stringify(pages)};
        const totalPages = pages.length;
        
        function updatePage() {
          document.getElementById('mangaImage').src = pages[currentPage - 1];
          document.getElementById('pageInfo').textContent = 'الصفحة ' + currentPage + ' من ' + totalPages;
          document.getElementById('pageInfoBottom').textContent = 'الصفحة ' + currentPage + ' من ' + totalPages;
          
          document.getElementById('prevBtn').disabled = currentPage === 1;
          document.getElementById('nextBtn').disabled = currentPage === totalPages;
        }
        
        function nextPage() {
          if (currentPage < totalPages) {
            currentPage++;
            updatePage();
          }
        }
        
        function prevPage() {
          if (currentPage > 1) {
            currentPage--;
            updatePage();
          }
        }
        
        // التحكم بالسهمين
        document.addEventListener('keydown', function(event) {
          if (event.key === 'ArrowRight') {
            prevPage();
          } else if (event.key === 'ArrowLeft') {
            nextPage();
          }
        });
        
        updatePage();
      </script>
    </body>
    </html>
  `);
}

/* ----- start ----- */
init();
