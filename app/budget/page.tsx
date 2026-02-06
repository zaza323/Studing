"use client";

import { useState, useEffect } from "react";
import type { MonthlyExpense as BaseMonthlyExpense, ExpenseCategory, Asset as BaseAsset, AssetCategory } from "@/lib/store";
import { DollarSign, TrendingUp, Users, Loader2, Pencil } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Extend types to support MongoDB _id
interface MonthlyExpense extends Omit<BaseMonthlyExpense, "id"> {
    _id: string;
    id?: string;
}

interface Asset extends Omit<BaseAsset, "id"> {
    _id: string;
    id?: string;
}

export default function BudgetPage() {
    // State
    const [monthlyCosts, setMonthlyCosts] = useState<MonthlyExpense[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revenuePerStudentInput, setRevenuePerStudentInput] = useState("49.99");
    const [isRevenueEditorOpen, setIsRevenueEditorOpen] = useState(false);
    const [revenueDraft, setRevenueDraft] = useState("49.99");

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [assetsRes, expensesRes] = await Promise.all([
                    fetch("/api/assets"),
                    fetch("/api/expenses")
                ]);

                if (assetsRes.ok && expensesRes.ok) {
                    const assetsData = await assetsRes.json();
                    const expensesData = await expensesRes.json();
                    setAssets(assetsData);
                    setMonthlyCosts(expensesData);
                }
            } catch (error) {
                console.error("Failed to fetch budget data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const storedRevenue = localStorage.getItem("revenuePerStudent");
        if (storedRevenue !== null) {
            setRevenuePerStudentInput(storedRevenue);
            setRevenueDraft(storedRevenue);
        }
    }, []);

    // Calculations
    const revenuePerStudent = Number(revenuePerStudentInput);
    const safeRevenuePerStudent = Number.isFinite(revenuePerStudent) ? revenuePerStudent : 0;
    const totalOneTime = assets.reduce((sum, item) => sum + item.price, 0);
    const totalMonthly = monthlyCosts.reduce((sum, item) => sum + item.amount, 0);
    const breakEvenStudents = safeRevenuePerStudent > 0
        ? Math.ceil(totalMonthly / safeRevenuePerStudent)
        : 0;

    const assetCategoryLabels: Record<AssetCategory, string> = {
        Production: "إنتاج وتصوير",
        Infrastructure: "بنية تحتية",
        Electronics: "أجهزة إلكترونية",
        Licenses: "تراخيص وتصاريح",
        Furniture: "الأثاث",
    };

    const expenseCategoryLabels: Record<ExpenseCategory, string> = {
        Software: "الخدمات والاشتراكات الرقمية",
        Utilities: "خدمات أساسية",
        Other: "رواتب الموظفين",
    };

    const getAssetCategoryTotals = () => {
        const categories: Record<string, number> = {};
        assets.forEach(asset => {
            if (categories[asset.category]) {
                categories[asset.category] += asset.price;
            } else {
                categories[asset.category] = asset.price;
            }
        });
        return Object.entries(categories).map(([name, value]) => ({
            name: assetCategoryLabels[name as AssetCategory] ?? name,
            value,
        }));
    };

    const assetCategories = getAssetCategoryTotals();
    const chartData = assetCategories;

    const expenseCategories: ExpenseCategory[] = ["Software", "Utilities", "Other"];
    const monthlyCategoryTotals = expenseCategories
        .map((category) => ({
            category,
            total: monthlyCosts
                .filter((cost) => cost.category === category)
                .reduce((sum, cost) => sum + cost.amount, 0),
        }))
        .filter((entry) => entry.total > 0);

    const COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444", "#3b82f6"];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">الميزانية</h1>
                <p className="text-gray-600 mt-1">حاسبة الميزانية - متصلة تلقائياً بالأصول</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard
                    title="تراكمي التكاليف المرة واحدة"
                    value={`$${totalOneTime.toLocaleString()}`}
                    subtitle="إجمالي قيمة الأصول والمعدات"
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                />
                <SummaryCard
                    title="التكاليف الشهرية"
                    value={`$${totalMonthly.toLocaleString()}`}
                    subtitle="التكاليف التشغيلية المتكررة"
                    icon={TrendingUp}
                    iconColor="text-blue-600"
                />
                <SummaryCard
                    title="نقطة التعادل"
                    value={`${breakEvenStudents}`}
                    subtitle="طالب شهرياً لتغطية التشغيل"
                    icon={Users}
                    iconColor="text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* One-Time Costs Breakdown (Read-Only / Linked to Assets) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            تكاليف التأسيس (من الأصول)
                        </h2>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                            تلقائي
                        </span>
                    </div>

                    <div className="space-y-3 flex-1">
                        {assetCategories.length === 0 ? (
                            <p className="text-center text-gray-400 py-4">لا توجد أصول مسجلة بعد</p>
                        ) : (
                            assetCategories.map((cat, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-emerald-50/50 transition-colors"
                                >
                                    <span className="text-gray-700 font-medium">{cat.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900">
                                            ${cat.value.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="border-t-2 border-gray-200 pt-3 mt-4">
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                            <span className="font-bold text-gray-900">إجمالي الأصول</span>
                            <span className="font-bold text-emerald-600 text-lg">
                                ${totalOneTime.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Monthly Costs Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            التكاليف التشغيلية الشهرية
                        </h2>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            تلقائي
                        </span>
                    </div>

                    <div className="space-y-3 flex-1">
                        {monthlyCategoryTotals.length === 0 ? (
                            <p className="text-center text-gray-400 py-4">لا توجد تكاليف شهرية</p>
                        ) : (
                            monthlyCategoryTotals.map((entry) => (
                                <div
                                    key={entry.category}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <span className="text-gray-700 font-medium">
                                        {expenseCategoryLabels[entry.category]}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">
                                            ${entry.total.toLocaleString()}/شهر
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="border-t-2 border-gray-200 pt-3 mt-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="font-bold text-gray-900">الإجمالي الشهري</span>
                            <span className="font-bold text-blue-600 text-lg">
                                ${totalMonthly.toLocaleString()}/شهر
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        توزيع تكاليف الأصول حسب الفئة
                    </h2>
                    <div className="h-80 w-full" style={{ direction: "ltr" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props: { percent?: number }) =>
                                        `${((props.percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "القيمة"]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Break-Even Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        تحليل الاستدامة المالية
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg relative">
                            <p className="text-sm text-gray-600 mb-1">الإيرادات المتوقعة لكل طالب</p>
                            <p className="text-2xl font-bold text-purple-600">
                                ${safeRevenuePerStudent.toLocaleString()}/شهر
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setRevenueDraft(revenuePerStudentInput);
                                    setIsRevenueEditorOpen((prev) => !prev);
                                }}
                                className="absolute left-3 top-3 rounded-md border border-purple-200 bg-white p-1.5 text-purple-600 shadow-sm hover:bg-purple-50"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            {isRevenueEditorOpen && (
                                <div className="absolute left-3 top-12 z-10 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                                    <p className="text-xs text-gray-600 mb-2">كم تريد أن يكون الرقم الجديد؟</p>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={revenueDraft}
                                        onChange={(event) => setRevenueDraft(event.target.value)}
                                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-300 focus:outline-none"
                                    />
                                    <div className="mt-3 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsRevenueEditorOpen(false)}
                                            className="rounded-md px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRevenuePerStudentInput(revenueDraft);
                                                localStorage.setItem("revenuePerStudent", revenueDraft);
                                                setIsRevenueEditorOpen(false);
                                            }}
                                            className="rounded-md bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700"
                                        >
                                            حفظ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">
                                التكاليف الشهرية الثابتة
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                ${totalMonthly.toLocaleString()}/شهر
                            </p>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-300">
                            <p className="text-sm text-gray-600 mb-1">
                                عدد الطلاب للوصول لنقطة التعادل
                            </p>
                            <p className="text-3xl font-bold text-emerald-600">
                                {breakEvenStudents} طالب
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    );
}



