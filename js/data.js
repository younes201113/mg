// js/data.js

const libraryData = {
    books: [
        {
            id: 1,
            title: "تأليفة غرناطة",
            author: "رضوى عاشور",
            category:  "رواية",
            tags: ["تاريخي", "عربي", "أدب"],
            rating: 4.5,
            pdfUrl: "https://drive.google.com/file/d/11X-a1GDf3l2TIa4ZKVw2F0myRfWkQOSl/preview",
            cover: "covers/gharnata.jpg",
            description: "رواية تاريخية عن الأندلس..."
        },
        {
            id: 2,
            title: "أرض زيكولا",
            author: "أحمد خالد توفيق",
            category: "رواية",
            tags: ["خيال", "مغامرة", "عربي"],
            rating: 4.8,
            pdfUrl: "https://drive.google.com/file/d/11X-a1GDf3l2TIa4ZKVw2F0myRfWkQOSl/preview",
            cover: "covers/zikola.jpg",
            description: "قصة مثيرة في عالم موازي..."
        },
        {
            id: 3,
            title: "تاريخ أوروبا في العصور الوسطى",
            author: "سلسلة كتب",
            category: "تاريخ",
            tags: ["تاريخ", "أوروبا", "عصور وسطى"],
            rating: 4.3,
            pdfUrl: "https://drive.google.com/file/d/11X-a1GDf3l2TIa4ZKVw2F0myRfWkQOSl/preview",
            cover: "covers/europe.jpg",
            description: "دراسة شاملة لتاريخ أوروبا..."
        }
    ],
    
    manga: [
        {
            id: 101,
            title: "فصل النخبة",
            author: "Shunsaku Tomose",
            category: "مانغا",
            tags: ["شونين", "أكشن", "مدرسي"],
            rating: 4.7,
            pdfUrl: "https://drive.google.com/file/d/11X-a1GDf3l2TIa4ZKVw2F0myRfWkQOSl/preview",
            cover: "manga/elite.jpg",
            description: "طلاب نخبة في مدرسة خاصة..."
        }
    ],
    
    tags: ["تاريخي", "عربي", "أدب", "خيال", "مغامرة", "تاريخ", "أوروبا", "شونين", "أكشن", "مدرسي"],
    
    categories: ["الكل", "كتب", "روايات", "تاريخ", "مانغا", "سير ذاتية"]
};

// حفظ في localStorage كنسخة احتياطية
if (!localStorage.getItem('libraryData')) {
    localStorage.setItem('libraryData', JSON.stringify(libraryData));
}
