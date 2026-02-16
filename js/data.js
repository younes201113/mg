// js/data.js

const libraryData = {
    books: [
        {
            id: 1,
            title: "ثلاثية غرناطة",
            author: "رضوى عاشور",
            category: "رواية",
            tags: ["تاريخي", "عربي", "أدب"],
            rating: 4.5,
            pdfUrl: "https://drive.google.com/file/d/1sUSiWDZHxLBT3irIt0mZx1BBYJ-nrc-1/preview",
            cover: "covers/gharnata.jpg",
            description: "ثلاثية غرناطة هي رواية تاريخية للكاتبة رضوى عاشور، تتكوّن من ثلاثة أجزاء: غرناطة، مريمة، والرحيل تحكي قصة عائلة أندلسية مسلمة تعيش في غرناطة بعد سقوطها في أيدي الإسبان، وتُظهر كيف تغيّرت حياتهم مع مرور الزمن بسبب القمع ومحاولات طمس الهوية والدين واللغة"
        },
        {
            id: 1,
            title: "هاري بوتر",
            author: "رضوى عاشور",
            category: "رواية",
            tags: ["خيال", "مغامرة", "سحر", "فانتازيا مدرسية"],
            rating: 4.5,
            pdfUrl: "https://drive.google.com/file/d/1Wmxr5NYPiSPrXqjrKvPfWG6IgRZ9sW3B/preview",
            cover: "https://www.alarabimag.com/images/thumbs/mid/19953.webp",
            description: "رواية من سلسلة هاري بوتر للكاتبة ج. ك. رولينغ. في هذا الجزء يعود هاري بوتر إلى المدرسة بينما ترفض الوزارة تصديق عودة فولدمورت، فينشئ مع أصدقائه جماعة سرّية لتعليم الطلاب الدفاع عن أنفسهم، وتتصاعد الأحداث حتى مواجهة كبيرة تكشف خطورة المرحلة القادمة."
        },
        {
            id: 1,
            title: "العادات الذرية",
            author: "جيمس كلير",
            category: "...",
            tags: ["تعليم", "تحفيز", "أدب"],
            rating: 4.5,
            pdfUrl: "https://drive.google.com/file/d/13bdtLlKUCKPwfLPP6cczqtTcWxscJIRi/preview",
            cover: "https://i.postimg.cc/kXQFY2vP/alʿadat-aldhryt.jpg",
            description: " "العادات الذرية" لجيمس كلير هو دليل عملي لتحسين حياتك من خلال تطوير العادات اليومية. يقدم الكتاب إطارًا فعالًا يساعدك على بناء مهاراتك تدريجيًا، بغض النظر عن أهدافك. باعتباره أحد أبرز الخبراء في اكتساب العادات، يشارك جيمس كلير استراتيجيات عملية لاكتساب عادات إيجابية، والتخلص من العادات السلبية، والتحكم في السلوكيات اليومية لتحقيق نتائج مدهشة. من خلال هذا الكتاب، ستتعلم كيفية تخصيص وقت لاكتساب عادات جديدة، التغلب على نقص الحافز، تعزيز قوة الإرادة، وتهيئة بيئتك المحيطة لدعم نجاحك في الحياة."
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
            author: "نورمان ديفيز",
            category: "تاريخ",
            tags: ["تاريخ", "أوروبا", "عصور وسطى"],
            rating: 4.3,
            pdfUrl: "https://drive.google.com/file/d/1j7kWkmLnZbpppTwwaknFDxQ5f6PS-i0o/preview",
            cover: "covers/europe.jpg",
            description: "كتاب للمؤرخ نورمان ديفيز يقدّم عرضًا واسعًا لتاريخ القارة الأوروبية مع تركيز كبير على منطقة أوروبا الوسطى، ويتتبع تطور الشعوب والدول من العصور القديمة مرورًا بالوسطى والحديثة وصولًا إلى القرن العشرين، مع إبراز التداخل بين السياسة والدين والثقافة والحروب وتأثيرها في تشكيل هوية المنطقة."
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
