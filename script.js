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
  hideBackButton(); // <-- أضف هنا
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
    showBackButton(); // <-- أضف هنا
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
    hideBackButton(); // <-- أضف هنا
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
  const name = prompt('اكتب اسمك لتسجيل الدخول:');
  if(!name) return;
  currentUser = name.trim();
  if(!state.users[currentUser]) state.users[currentUser] = { favorites: [], ratings: {} };
  saveState();
  updateAccountUI();
  alert('مرحباً ' + currentUser);
}

/* ----- account view ----- */
function showAccount(){ 
  hideAllViews();
  document.getElementById('accountView').classList.remove('hidden');
  hideBackButton();
  document.getElementById('accountName').innerText = currentUser || 'غير مسجل';
  }

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
    hideBackButton(); // <-- أضف هنا
}

function showBooks() {
  const books = state.books.filter(book => book.type === 'book');
  hideAllViews();
  document.getElementById('homeView').classList.remove('hidden');
  renderGrid(books);
    hideBackButton(); // <-- أضف هنا
}

// تعديل دالة openBook لدعم المانغا
const originalOpenBook = openBook;
openBook = function(id) {
  const item = state.books.find(b => b.id === id);
  if (!item) {
    alert('لم يتم العثور على المحتوى');
    return;
  }
  
  if (item.type === 'manga') {
    openMangaDetail(item);
  } else {
    originalOpenBook(id);
  }
}

// واجهة تفاصيل المانغا (نفس واجهة الكتب)
function openMangaDetail(manga) {
    hideAllViews();
    const view = document.getElementById('bookView');
    view.classList.remove('hidden');
    showBackButton();
    
    const fav = isFavorite(manga.id);
    const userRate = getUserRating(manga.id) || manga.rating || 0;
    
    view.innerHTML = `
        <div class="book-view">
            <img class="cover" src="${manga.cover}" alt="${escapeHtml(manga.title)}" />
            <h1>${escapeHtml(manga.title)}</h1>
            <p class="muted">المؤلف: ${escapeHtml(manga.author)}</p>
            <p>التقييم العام: ⭐ ${manga.rating || 0} — تقييمك: <strong id="myRate">${userRate}</strong></p>
            <div class="controls">
                <button class="btn" onclick="toggleFavorite(${manga.id})">${fav ? '💖 إزالة من المفضلة' : '🤍 إضافة للمفضلة'}</button>
                <button class="btn alt" onclick="promptRate(${manga.id})">⭐ قيم</button>
                <button class="btn alt" onclick="showMangaChapters(${JSON.stringify(manga).replace(/"/g, '&quot;')})">📖 قراءة الفصول</button>
            </div>
        </div>
    `;
}

// دالة قراءة المانغا (تفتح في نفس الصفحة)
function readManga(id) {
  const manga = state.books.find(b => b.id === id);
  if (!manga) return;
  
  hideAllViews();
    showBackButton(); // <-- أضف هنا
  const mangaView = document.createElement('div');
  mangaView.className = 'view';
  mangaView.id = 'mangaReaderView';
  
  const pages = manga.files?.pages || [];
  
  // عرض كل الصور بشكل أفقي
  const pagesHTML = pages.map(page => 
    `<img class="manga-page" src="${page}" alt="صفحة المانغا">`
  ).join('');
  
  mangaView.innerHTML = `
    <div class="manga-reader">
      <div class="reader-header">
        <button class="back-btn" onclick="showMangaOnly()">← العودة</button>
        <h2>${manga.title}</h2>
      </div>
      <div class="manga-pages-container">
        ${pagesHTML}
      </div>
    </div>
  `;
  
  document.getElementById('content').appendChild(mangaView);
}

/* ----- start ----- */
init();

// ==========================================
// زر الرجوع الذكي - ضعه في نهاية script.js
// ==========================================

const backButton = document.getElementById('backHomeBtn');

// إذا الزر ما موجود، أنشئه ديناميكيًا
if (!backButton) {
    const backBtn = document.createElement('button');
    backBtn.id = 'backHomeBtn';
    backBtn.className = 'back-home-btn';
    backBtn.innerHTML = '← الرجوع';
    backBtn.onclick = goBack;
    document.body.appendChild(backBtn);
}

function toggleBackButton(show) {
    const btn = document.getElementById('backHomeBtn');
    if (btn) {
        if (show) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    }
}

function hideBackButton() {
    toggleBackButton(false);
}

function showBackButton() {
    toggleBackButton(true);
}

function goBack() {
    window.history.back();
}

// إخفاء الزر افتراضيًا عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    hideBackButton();
});

// استدعاء الدوال في أماكنها المناسبة في الكود الحالي:
// عندما تفتح كتاب أو مانغا: showBackButton()
// عندما ترجع للرئيسية: hideBackButton()

// ===== نظام عرض فصول المانغا =====
function showMangaChapters(book) {
    hideAllViews();
    const view = document.createElement('div');
    view.className = 'view';
    view.id = 'mangaChaptersView';
    
    let chaptersHTML = '';
    book.chapters.forEach(ch => {
        chaptersHTML += `
            <div class="chapter-item">
                <button class="chapter-btn" onclick="openChapter(${book.id}, ${ch.number})">
                    الفصل ${ch.number} - ${ch.title}
                </button>
            </div>
        `;
    });
    
    view.innerHTML = `
        <div class="manga-chapters">
            <h1>${book.title}</h1>
            <p class="muted">اختر الفصل للقراءة</p>
            <div class="chapters-list">
                ${chaptersHTML}
            </div>
        </div>
    `;
    
    document.getElementById('content').appendChild(view);
    showBackButton();
}

function openChapter(bookId, chapterNumber) {
    const book = state.books.find(b => b.id === bookId);
    const chapter = book.chapters.find(c => c.number === chapterNumber);
    
    hideAllViews();
    const view = document.createElement('div');
    view.className = 'view';
    view.id = 'mangaChapterView';
    
    let pagesHTML = '';
    chapter.pages.forEach((page, index) => {
        pagesHTML += `<img src="${page}" class="manga-page" alt="صفحة ${index + 1}">`;
    });
    
    view.innerHTML = `
        <div class="manga-reader">
            <div class="chapter-header">
                <h2>${book.title} - الفصل ${chapter.number}</h2>
                <p class="muted">${chapter.title}</p>
            </div>
            <div class="manga-pages-container">
                ${pagesHTML}
            </div>
        </div>
    `;
    
    document.getElementById('content').appendChild(view);
    showBackButton();
}
