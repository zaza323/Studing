// ==================================================================
// لوحة التحكم - نظام الفريق - ملف البيانات
// ==================================================================
// يحتوي هذا الملف على جميع البيانات الوهمية للوحة التحكم.
// يمكنك تعديل أي قيم هنا لتخصيص بياناتك بسهولة.
// ==================================================================

// ===== تعريف الأنواع =====

export type AssetStatus = "للشراء" | "تم الطلب" | "تم الاستلام";
export type TaskStatus = "قيد الانتظار" | "قيد التنفيذ" | "مكتملة";
export type Priority = "عالية" | "متوسطة" | "منخفضة";
export type AssetCategory = "Production" | "Infrastructure" | "Licenses" | "Electronics";

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string; // كود لون للأفاتار
}

export interface Asset {
    id: string;
    name: string;
    category: AssetCategory;
    price: number;
    status: AssetStatus;
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
    monthlyCosts: {
        category: string;
        amount: number;
    }[];
    revenuePerStudent: number; // الإيرادات الشهرية لكل طالب
}

// ===== بيانات أعضاء الفريق =====
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

// ===== قائمة الأصول والممتلكات =====
export const assets: Asset[] = [
    // Production Assets
    {
        id: "1",
        name: "كاميرا Sony FX30",
        category: "Production",
        price: 1799,
        status: "تم الاستلام",
        owner: "أحمد حسن",
    },
    {
        id: "2",
        name: "عدسة Sigma 16mm f/1.4",
        category: "Production",
        price: 399,
        status: "تم الاستلام",
        owner: "أحمد حسن",
    },
    {
        id: "3",
        name: "ميكروفون Rode Wireless GO II",
        category: "Production",
        price: 299,
        status: "تم الاستلام",
        owner: "أحمد حسن",
    },

    // Infrastructure Assets
    {
        id: "4",
        name: "نظام كاميرات مراقبة Ring",
        category: "Infrastructure",
        price: 450,
        status: "تم الطلب",
        owner: "الاستوديو",
    },
    {
        id: "5",
        name: "أثاث مكتبي (طاولات وكراسي)",
        category: "Infrastructure",
        price: 1200,
        status: "تم الاستلام",
        owner: "الاستوديو",
    },
    {
        id: "6",
        name: "وحدة تكييف هواء سبليت",
        category: "Infrastructure",
        price: 800,
        status: "للشراء",
        owner: "الاستوديو",
    },

    // Electronics Assets
    {
        id: "7",
        name: "جهاز مونتاج (Ryzen 9 + RTX 4070)",
        category: "Electronics",
        price: 2499,
        status: "تم الاستلام",
        owner: "سارة إبراهيم",
    },
    {
        id: "8",
        name: "شاشة LG 27\" 4K (27UP850)",
        category: "Electronics",
        price: 449,
        status: "تم الاستلام",
        owner: "سارة إبراهيم",
    },

    // Licenses
    {
        id: "9",
        name: "رخصة تجارية سنوية",
        category: "Licenses",
        price: 500,
        status: "تم الاستلام",
        owner: "ليلى أحمد",
    },
    {
        id: "10",
        name: "تصريح تصوير سينمائي",
        category: "Licenses",
        price: 150,
        status: "للشراء",
        owner: "ليلى أحمد",
    },
];

// ===== بيانات المهام =====
export const tasks: Task[] = [
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
    // ... يمكن إضافة المزيد من المهام هنا
];

// ===== الجدول الزمني / المعالم =====
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
export const budget: Budget = {
    totalBudget: 15000,
    monthlyCosts: [
        { category: "الكهرباء", amount: 150 },
        { category: "الإنترنت", amount: 80 },
        { category: "Adobe Creative Cloud", amount: 55 },
        { category: "الاستضافة والدومين", amount: 25 },
        { category: "إعلانات التسويق", amount: 200 },
    ],
    revenuePerStudent: 49.99,
};

// ===== بيانات الاستراتيجية =====

export interface Idea {
    id: string;
    title: string;
    content: string;
    category: string;
    color: string;
    createdAt: string;
}

export interface Competitor {
    id: string;
    name: string;
    logo: string;
    pricePoint: string;
    strengths: string[];
    weaknesses: string[];
    url: string;
    notes?: string;
}

export const initialCategories: string[] = ["General", "Marketing", "Product", "Feature", "Content"];

export const initialIdeas: Idea[] = [
    {
        id: '1',
        title: 'كورس الرياضيات المجاني',
        content: 'إطلاق كورس مجاني بالكامل لمبادئ الرياضيات لجذب طلاب جدد.',
        category: 'Content',
        color: 'bg-yellow-100',
        createdAt: '2026-01-20'
    },
    {
        id: '2',
        title: 'نظام المكافآت',
        content: 'تطبيق نظام نقاط (Gamification) لتحفيز الطلاب على إكمال الدروس.',
        category: 'Feature',
        color: 'bg-blue-100',
        createdAt: '2026-02-01'
    },
    {
        id: '3',
        title: 'حملة المؤثرين',
        content: 'التعاون مع 5 مؤثرين في مجال التعليم للترويج للمنصة.',
        category: 'Marketing',
        color: 'bg-purple-100',
        createdAt: '2026-02-03'
    },
];

export const initialCompetitors: Competitor[] = [
    {
        id: '1',
        name: 'JoAcademy',
        logo: 'bg-blue-600',
        strengths: ['قاعدة طلاب ضخمة', 'علامة تجارية قوية', 'محتوى متنوع'],
        weaknesses: ['واجهة قديمة', 'أسعار مرتفعة', 'دعم فني بطيء'],
        pricePoint: '$$$',
        url: 'joacademy.com',
        notes: ''
    },
    {
        id: '2',
        name: 'Abwaab',
        logo: 'bg-indigo-500',
        strengths: ['تكنولوجيا حديثة', 'دروس قصيرة', 'أسعار منافسة'],
        weaknesses: ['تغطية مواد أقل', 'غياب التفاعل المباشر'],
        pricePoint: '$$',
        url: 'abwaab.com',
        notes: ''
    },
    {
        id: '3',
        name: 'Weted',
        logo: 'bg-emerald-500',
        strengths: ['مجتمع طلابي قوي', 'اختبارات مكثفة'],
        weaknesses: ['تصميم بسيط', 'تسويق محدود'],
        pricePoint: '$',
        url: 'weted.com',
        notes: ''
    },
];

// ===== دوال مساعدة =====

export function getTotalAssetsCost(): number {
    return assets.reduce((sum, item) => sum + item.price, 0);
}

export function getAssetsBudgetUsed(): number {
    return assets
        .filter((item) => item.status === "تم الاستلام" || item.status === "تم الطلب")
        .reduce((sum, item) => sum + item.price, 0);
}

export function getAssetCategoryTotals(): { name: string; value: number }[] {
    const categories: Record<string, number> = {};

    assets.forEach(asset => {
        if (categories[asset.category]) {
            categories[asset.category] += asset.price;
        } else {
            categories[asset.category] = asset.price;
        }
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
}

export function getTotalMonthlyCosts(): number {
    return budget.monthlyCosts.reduce((sum, cost) => sum + cost.amount, 0);
}

export function getBreakEvenStudents(): number {
    const monthlyCosts = getTotalMonthlyCosts();
    return Math.ceil(monthlyCosts / budget.revenuePerStudent);
}

export function getTeamMemberById(id: string): TeamMember | undefined {
    return teamMembers.find((member) => member.id === id);
}

export function getDaysUntilLaunch(): number {
    const launchDate = new Date("2026-04-30");
    const today = new Date();
    const diffTime = launchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

export function getCategoryTotal(category: string): number {
    return assets
        .filter((asset) => asset.category === category)
        .reduce((sum, asset) => sum + asset.price, 0);
}
