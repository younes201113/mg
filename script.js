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
function readBook(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book || book.type !== 'book') return;
  
  // افتح رابط القراءة
  if (book.files && book.files.read) {
    window.open(book.files.read, '_blank');
  } else {
    alert('الكتاب غير متاح للقراءة');
  }
}

function downloadBook(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book || book.type !== 'book') return;
  
  // افتح رابط التحميل
  if (book.files && book.files.download) {
    window.open(book.files.download, '_blank');
  } else {
    alert('الكتاب غير متاح للتحميل');
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
            <p class="muted">المؤلف: ${escapeHtml(manga.author)} — الفصول: ${manga.chapters ? manga.chapters.length : 0}</p>
            <p>التقييم العام: ⭐ ${manga.rating || 0} — تقييمك: <strong id="myRate">${userRate}</strong></p>
            <div class="controls">
                <button class="btn" onclick="toggleFavorite(${manga.id})">${fav ? '💖 إزالة من المفضلة' : '🤍 إضافة للمفضلة'}</button>
                <button class="btn alt" onclick="promptRate(${manga.id})">⭐ قيم</button>
                <button class="btn alt" onclick="showMangaChapters(${manga.id})">📖 قراءة الفصول</button>
            </div>
            <section class="comments" id="commentsArea">
                <h3>التعليقات</h3>
                <div id="commentsList"></div>
                <div id="commentForm"></div>
            </section>
        </div>
    `;
    renderComments(manga.id);
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
async function showMangaChapters(bookId) {
    console.log('🔍 جاري فتح فصول الكتاب رقم:', bookId);
    
    const book = state.books.find(b => b.id == bookId);
    if (!book) {
        alert('❌ الكتاب غير موجود');
        return;
    }

    // إذا عندك mangaDexId، حمّل الفصول من API
    if (book.mangaDexId && (!book.chapters || book.chapters.length === 0)) {
        try {
            console.log('🚀 جاري تحميل الفصول من MangaDex...');
            
            // عرض تحميل
            const loadingMsg = document.createElement('div');
            loadingMsg.innerHTML = '📖 جاري تحميل الفصول...';
            loadingMsg.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:20px; border-radius:10px; z-index:1000; color:black;';
            document.body.appendChild(loadingMsg);

            // جلب الفصول من API
            const chaptersResponse = await fetch(
                `https://api.mangadex.org/manga/${book.mangaDexId}/feed?` +
                `order[chapter]=asc&` +
                `translatedLanguage[]=ar&` +
                `limit=20`
            );
            
            const chaptersData = await chaptersResponse.json();
            document.body.removeChild(loadingMsg);

            if (!chaptersData.data || chaptersData.data.length === 0) {
                throw new Error('لا توجد فصول مترجمة للعربية');
            }

            // حفظ الفصول في state مؤقتاً
            book.chapters = chaptersData.data.map((chapter, index) => ({
                number: index + 1,
                title: chapter.attributes.title || `الفصل ${index + 1}`,
                chapterId: chapter.id, // حفظ الـ ID لتحميل الصور لاحقاً
                pages: [] // بتكون فارغة لحد ما يفتح الفصل
            }));

            console.log('✅ تم تحميل', book.chapters.length, 'فصل');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الفصول:', error);
            alert('حدث خطأ في تحميل الفصول');
            return;
        }
    }

    // إذا ما زاد ما في فصول
    if (!book.chapters || book.chapters.length === 0) {
        alert('❌ لا توجد فصول متاحة');
        return;
    }

    console.log('✅ وجدنا الكتاب:', book.title);
    console.log('📖 عدد الفصول:', book.chapters.length);
    
    // إنشاء واجهة الفصول
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
async function openChapter(bookId, chapterNumber) {
    console.log('🔍 فتح الفصل:', bookId, chapterNumber);
    
    const book = state.books.find(b => b.id == bookId);
    if (!book) {
        alert('الكتاب غير موجود');
        return;
    }
    
    const chapter = book.chapters.find(c => c.number == chapterNumber);
    if (!chapter) {
        alert('الفصل غير موجود');
        return;
    }

    // إذا الصفحات فارغة، حمّلها من API
    if (!chapter.pages || chapter.pages.length === 0) {
        try {
            console.log('🖼 جاري تحميل صفحات الفصل...');
            
            // عرض تحميل
            const loadingMsg = document.createElement('div');
            loadingMsg.innerHTML = '📖 جاري تحميل الصفحات...';
            loadingMsg.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:20px; border-radius:10px; z-index:1000; color:black;';
            document.body.appendChild(loadingMsg);

            // جلب الصور من API
            const pagesResponse = await fetch(
                `https://api.mangadex.org/at-home/server/${chapter.chapterId}`
            );
            const pagesData = await pagesResponse.json();
            document.body.removeChild(loadingMsg);

            // حفظ الصور في الفصل
            chapter.pages = pagesData.chapter.data.map(page => 
                `${pagesData.baseUrl}/data/${pagesData.chapter.hash}/${page}`
            );

            console.log('✅ تم تحميل', chapter.pages.length, 'صفحة');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الصفحات:', error);
            alert('حدث خطأ في تحميل الصفحات');
            return;
        }
    }

    console.log('📖 الفصل:', chapter);
    
    // عرض الصفحات
    hideAllViews();
    const view = document.createElement('div');
    view.className = 'view';
    view.id = 'mangaChapterView';
    
    let pagesHTML = '';
    chapter.pages.forEach((page, index) => {
        pagesHTML += `
            <div style="text-align: center; margin: 20px 0;">
                <img src="${page}" class="manga-page" alt="صفحة ${index + 1}" 
                     style="max-width: 100%; height: auto; border-radius: 10px;">
                <p class="muted">صفحة ${index + 1}</p>
            </div>
        `;
    });
    
    view.innerHTML = `
        <div class="manga-reader">
            <div class="chapter-header">
                <h2>${book.title} - الفصل ${chapter.number}</h2>
                <p class="muted">${chapter.title}</p>
                <button class="back-to-chapters-btn btn" onclick="showMangaChapters(${book.id})">
                    ← العودة للفصول
                </button>
            </div>
            <div class="manga-pages-container">
                ${pagesHTML}
            </div>
        </div>
    `;
    
    document.getElementById('content').appendChild(view);
    showBackButton();
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
