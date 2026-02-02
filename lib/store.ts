// ==================================================================
// لوحة التحكم - نظام الفريق - ملف البيانات
// ==================================================================
// يحتوي هذا الملف على جميع البيانات الوهمية للوحة التحكم.
// يمكنك تعديل أي قيم هنا لتخصيص بياناتك بسهولة.
// ==================================================================

// ===== تعريف الأنواع =====

export type EquipmentStatus = "للشراء" | "تم الطلب" | "تم الاستلام";
export type TaskStatus = "قيد الانتظار" | "قيد التنفيذ" | "مكتملة";
export type Priority = "عالية" | "متوسطة" | "منخفضة";

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string; // كود لون للأفاتار
}

export interface Equipment {
    id: string;
    name: string;
    category: string;
    price: number;
    status: EquipmentStatus;
    owner: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    assignee: string; // معرف عضو الفريق
    priority: Priority;
}

export interface Milestone {
    id: string;
    phase: string;
    description: string;
    startDate: string;
    endDate: string;
    isComplete: boolean;
    isCurrent: boolean;
}

export interface Budget {
    totalBudget: number;
    oneTimeCosts: {
        category: string;
        amount: number;
    }[];
    monthlyCosts: {
        category: string;
        amount: number;
    }[];
    revenuePerStudent: number; // الإيرادات الشهرية لكل طالب
}

// ===== بيانات أعضاء الفريق =====
// عدّل الأسماء والأدوار وألوان الأفاتار حسب الحاجة
export const teamMembers: TeamMember[] = [
    {
        id: "1",
        name: "أحمد حسن",
        role: "منشئ المحتوى والمعلم",
        avatar: "#10b981", // أخضر زمردي
    },
    {
        id: "2",
        name: "سارة إبراهيم",
        role: "محررة فيديو",
        avatar: "#06b6d4", // سماوي
    },
    {
        id: "3",
        name: "عمر خالد",
        role: "مسؤول التسويق",
        avatar: "#8b5cf6", // بنفسجي
    },
    {
        id: "4",
        name: "ليلى أحمد",
        role: "مديرة العمليات",
        avatar: "#ec4899", // وردي
    },
];

// ===== قائمة المعدات =====
// أضف أو احذف أو عدّل عناصر المعدات هنا
// الأسعار بالعملة المحلية
export const equipment: Equipment[] = [
    {
        id: "1",
        name: "كاميرا Sony FX30",
        category: "كاميرا",
        price: 1799,
        status: "تم الاستلام",
        owner: "أحمد حسن",
    },
    {
        id: "2",
        name: "عدسة Sigma 16mm f/1.4",
        category: "عدسة",
        price: 399,
        status: "تم الاستلام",
        owner: "أحمد حسن",
    },
    {
        id: "3",
        name: "عدسة Sigma 30mm f/1.4",
        category: "عدسة",
        price: 339,
        status: "تم الطلب",
        owner: "أحمد حسن",
    },
    {
        id: "4",
        name: "ميكروفون Rode Wireless GO II",
        category: "ميكروفون",
        price: 299,
        status: "تم الاستلام",
        owner: "أحمد حسن",
    },
    {
        id: "5",
        name: "ميكروفون Rode NTG4+ Shotgun",
        category: "ميكروفون",
        price: 299,
        status: "للشراء",
        owner: "سارة إبراهيم",
    },
    {
        id: "6",
        name: "طقم إضاءة Aputure MC RGBWW",
        category: "إضاءة",
        price: 299,
        status: "تم الاستلام",
        owner: "الاستوديو",
    },
    {
        id: "7",
        name: "إضاءة Aputure Amaran 200d",
        category: "إضاءة",
        price: 345,
        status: "تم الطلب",
        owner: "الاستوديو",
    },
    {
        id: "8",
        name: "حامل ثلاثي Manfrotto MT055XPRO3",
        category: "دعامات",
        price: 199,
        status: "تم الاستلام",
        owner: "الاستوديو",
    },
    {
        id: "9",
        name: "جهاز مونتاج (Ryzen 9 + RTX 4070)",
        category: "كمبيوتر",
        price: 2499,
        status: "تم الاستلام",
        owner: "سارة إبراهيم",
    },
    {
        id: "10",
        name: "شاشة LG 27\" 4K (27UP850)",
        category: "شاشة",
        price: 449,
        status: "تم الاستلام",
        owner: "سارة إبراهيم",
    },
    {
        id: "11",
        name: "Elgato Stream Deck",
        category: "ملحقات",
        price: 149,
        status: "للشراء",
        owner: "أحمد حسن",
    },
    {
        id: "12",
        name: "خلفية شاشة خضراء",
        category: "خلفيات",
        price: 89,
        status: "تم الاستلام",
        owner: "الاستوديو",
    },
    {
        id: "13",
        name: "طقم تنظيم كابلات",
        category: "كابلات",
        price: 45,
        status: "تم الاستلام",
        owner: "الاستوديو",
    },
];

// ===== بيانات المهام =====
// أدر مهام فريقك هنا
export const tasks: Task[] = [
    // قيد الانتظار
    {
        id: "1",
        title: "تسجيل الدرس 6: الدوال المتقدمة",
        description: "تسجيل وحدة الدوال المتقدمة للدورة الأولى",
        status: "قيد الانتظار",
        assignee: "1",
        priority: "عالية",
    },
    {
        id: "2",
        title: "تصميم صور مصغرة للدورة",
        description: "إنشاء صور مصغرة احترافية لجميع الدروس العشرة",
        status: "قيد الانتظار",
        assignee: "3",
        priority: "متوسطة",
    },
    {
        id: "3",
        title: "إعداد حملة البريد الإلكتروني",
        description: "تحضير سلسلة رسائل بريد إلكتروني قبل الإطلاق",
        status: "قيد الانتظار",
        assignee: "3",
        priority: "عالية",
    },
    {
        id: "4",
        title: "شراء المعدات المتبقية",
        description: "طلب عدسة Sigma 30mm وميكروفون Shotgun",
        status: "قيد الانتظار",
        assignee: "4",
        priority: "متوسطة",
    },

    // قيد التنفيذ
    {
        id: "5",
        title: "مونتاج الدرس 4: الحلقات والتكرار",
        description: "تدريج الألوان وإضافة الرسومات للدرس 4",
        status: "قيد التنفيذ",
        assignee: "2",
        priority: "عالية",
    },
    {
        id: "6",
        title: "الانتهاء من إعداد الصوت بالاستوديو",
        description: "اختبار وتحسين المعالجة الصوتية",
        status: "قيد التنفيذ",
        assignee: "1",
        priority: "متوسطة",
    },
    {
        id: "7",
        title: "بناء الصفحة الرئيسية",
        description: "إنشاء صفحة الدورة مع التسعير",
        status: "قيد التنفيذ",
        assignee: "3",
        priority: "عالية",
    },

    // مكتملة
    {
        id: "8",
        title: "إعداد إضاءة الاستوديو",
        description: "إعداد نظام الإضاءة الثلاثية",
        status: "مكتملة",
        assignee: "1",
        priority: "عالية",
    },
    {
        id: "9",
        title: "مونتاج الدرس 1: المقدمة",
        description: "إكمال مونتاج درس المقدمة",
        status: "مكتملة",
        assignee: "2",
        priority: "عالية",
    },
    {
        id: "10",
        title: "مونتاج الدرس 2: المتغيرات وأنواع البيانات",
        description: "إكمال مونتاج الدرس 2",
        status: "مكتملة",
        assignee: "2",
        priority: "عالية",
    },
    {
        id: "11",
        title: "مونتاج الدرس 3: الشروط",
        description: "إكمال مونتاج الدرس 3",
        status: "مكتملة",
        assignee: "2",
        priority: "متوسطة",
    },
    {
        id: "12",
        title: "إنشاء محتوى وسائل التواصل",
        description: "تصميم منشورات لإنستغرام وتويتر",
        status: "مكتملة",
        assignee: "3",
        priority: "منخفضة",
    },
];

// ===== الجدول الزمني / المعالم =====
// حدد مراحل مشروعك والتواريخ
export const milestones: Milestone[] = [
    {
        id: "1",
        phase: "المرحلة 1: إعداد الاستوديو",
        description: "شراء المعدات، إعداد مساحة التسجيل، ضبط الإضاءة والصوت",
        startDate: "2026-01-15",
        endDate: "2026-02-10",
        isComplete: true,
        isCurrent: false,
    },
    {
        id: "2",
        phase: "المرحلة 2: تسجيل أول 10 ساعات",
        description: "تسجيل ومونتاج محتوى الدورة الأولى (10 ساعات من دروس الفيديو)",
        startDate: "2026-02-01",
        endDate: "2026-03-15",
        isComplete: false,
        isCurrent: true,
    },
    {
        id: "3",
        phase: "المرحلة 3: الإطلاق التجريبي والتسويق",
        description: "إطلاق النسخة التجريبية، تشغيل حملات تسويقية، جذب أول 50 طالب",
        startDate: "2026-03-10",
        endDate: "2026-04-30",
        isComplete: false,
        isCurrent: false,
    },
];

// ===== بيانات الميزانية =====
// حدّث التكاليف وافتراضات الإيرادات هنا
export const budget: Budget = {
    totalBudget: 15000, // إجمالي الميزانية المخصصة للمشروع

    // التكاليف لمرة واحدة للمعدات
    oneTimeCosts: [
        { category: "الكاميرات والعدسات", amount: 2537 },
        { category: "معدات الصوت", amount: 598 },
        { category: "الإضاءة", amount: 644 },
        { category: "الكمبيوتر والشاشة", amount: 2948 },
        { category: "الملحقات والكابلات", amount: 283 },
    ],

    // التكاليف الشهرية المتكررة
    monthlyCosts: [
        { category: "الكهرباء", amount: 150 },
        { category: "الإنترنت", amount: 80 },
        { category: "Adobe Creative Cloud", amount: 55 },
        { category: "الاستضافة والدومين", amount: 25 },
        { category: "إعلانات التسويق", amount: 200 },
    ],

    // افتراض: الإيرادات لكل طالب شهرياً
    revenuePerStudent: 49.99, // سعر الاشتراك الشهري
};

// ===== دوال مساعدة =====

export function getTotalEquipmentCost(): number {
    return equipment.reduce((sum, item) => sum + item.price, 0);
}

export function getEquipmentBudgetUsed(): number {
    return equipment
        .filter((item) => item.status === "تم الاستلام" || item.status === "تم الطلب")
        .reduce((sum, item) => sum + item.price, 0);
}

export function getTotalOneTimeCosts(): number {
    return budget.oneTimeCosts.reduce((sum, cost) => sum + cost.amount, 0);
}

export function getTotalMonthlyCosts(): number {
    return budget.monthlyCosts.reduce((sum, cost) => sum + cost.amount, 0);
}

export function getBreakEvenStudents(): number {
    const monthlyCosts = getTotalMonthlyCosts();
    return Math.ceil(monthlyCosts / budget.revenuePerStudent);
}

export function getTasksByStatus(status: TaskStatus): Task[] {
    return tasks.filter((task) => task.status === status);
}

export function getTasksByAssignee(assigneeId: string): Task[] {
    return tasks.filter((task) => task.assignee === assigneeId);
}

export function getTeamMemberById(id: string): TeamMember | undefined {
    return teamMembers.find((member) => member.id === id);
}

export function getDaysUntilLaunch(): number {
    const launchDate = new Date("2026-04-30"); // بناءً على تاريخ نهاية المرحلة 3
    const today = new Date();
    const diffTime = launchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}
