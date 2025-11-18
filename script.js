let state = {
    books: [],
    manga: [],
    all: []
};

// تحميل البيانات
async function loadData() {
    const b = await fetch("books.json").then(r => r.json());
    const m = await fetch("manga.json").then(r => r.json());

    state.books = b;
    state.manga = m;
    state.all = [...b, ...m];

    renderGrid(state.all);
}

// عرض الرئيسية
function showHome() {
    hideAll();
    renderGrid(state.all);
    document.getElementById("homeView").classList.remove("hidden");
}

// عرض الكتب
function showBooks() {
    hideAll();
    renderGrid(state.books);
    document.getElementById("homeView").classList.remove("hidden");
}

// عرض المانغا
function showManga() {
    hideAll();
    renderGrid(state.manga);
    document.getElementById("homeView").classList.remove("hidden");
}

// رسم قائمة العناصر
function renderGrid(list) {
    const g = document.getElementById("grid");
    g.innerHTML = "";

    list.forEach(item => {
        const div = document.createElement("div");
        div.className = "grid-item";
        div.innerHTML = `
            <img src="${item.cover}">
            <h3>${item.title}</h3>
            <button onclick="openItem('${item.id}', '${item.type}')">عرض</button>
        `;
        g.appendChild(div);
    });
}

function openItem(id, type) {
    if (type === "manga") return openManga(id);
    if (type === "book") return openBook(id);
}

/* فتح مانغا */
function openManga(id) {
    hideAll();

    const m = state.manga.find(x => x.id === id);

    document.getElementById("mangaTitle").innerText = m.title;
    document.getElementById("mangaCover").src = m.cover;

    // قائمة الفصول
    const sel = document.getElementById("chapterSelect");
    sel.innerHTML = "";
    m.chapters.forEach(ch => {
        const o = document.createElement("option");
        o.value = ch.path;
        o.textContent = "الفصل " + ch.num;
        sel.appendChild(o);
    });

    sel.onchange = () => loadChapter(sel.value);

    loadChapter(m.chapters[0].path);

    document.getElementById("mangaView").classList.remove("hidden");
}

/* تحميل فصل */
function loadChapter(path) {
    const p = document.getElementById("pages");
    p.innerHTML = "";

    for (let i = 1; i <= 500; i++) {
        const num = String(i).padStart(2, "0");
        const img = new Image();
        img.src = `${path}${num}.jpg`;

        img.onload = () => p.appendChild(img);
        img.onerror = () => {};
    }
}

/* إخفاء الكل */
function hideAll() {
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
}

window.onload = loadData;
