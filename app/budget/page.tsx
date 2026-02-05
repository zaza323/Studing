"use client";

import { useState, useEffect } from "react";
import type { MonthlyExpense as BaseMonthlyExpense, ExpenseCategory, Asset as BaseAsset } from "@/lib/store";
import { DollarSign, TrendingUp, Users, Plus, Trash2, X, Loader2 } from "lucide-react";
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Constants (could be fetched from config or env in future)
    const revenuePerStudent = 49.99;

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

    // Calculations
    const totalOneTime = assets.reduce((sum, item) => sum + item.price, 0);
    const totalMonthly = monthlyCosts.reduce((sum, item) => sum + item.amount, 0);
    const breakEvenStudents = Math.ceil(totalMonthly / revenuePerStudent);

    const getAssetCategoryTotals = () => {
        const categories: Record<string, number> = {};
        assets.forEach(asset => {
            if (categories[asset.category]) {
                categories[asset.category] += asset.price;
            } else {
                categories[asset.category] = asset.price;
            }
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    };

    const assetCategories = getAssetCategoryTotals();
    const chartData = assetCategories;

    // Handlers
    const handleAddExpense = async (newExpense: Omit<MonthlyExpense, "_id" | "id" | "status">) => {
        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newExpense, status: "Active" }),
            });
            if (res.ok) {
                const savedExpense = await res.json();
                setMonthlyCosts([...monthlyCosts, savedExpense]);
                setIsAddModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to add expense", error);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
            try {
                const res = await fetch(`/api/expenses/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    setMonthlyCosts(monthlyCosts.filter((c) => c._id !== id));
                }
            } catch (error) {
                console.error("Failed to delete expense", error);
            }
        }
    };

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

                {/* Monthly Costs Breakdown (Editable) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            التكاليف التشغيلية الشهرية
                        </h2>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> إضافة
                        </button>
                    </div>

                    <div className="space-y-3 flex-1">
                        {monthlyCosts.length === 0 ? (
                            <p className="text-center text-gray-400 py-4">لا توجد تكاليف شهرية</p>
                        ) : (
                            monthlyCosts.map((cost) => (
                                <div
                                    key={cost._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-gray-700 font-medium">{cost.name}</span>
                                        <span className="text-xs text-gray-400">{cost.category === "Software" ? "الخدمات والاشتراكات الرقمية" : cost.category === "Utilities" ? "خدمات أساسية" : "رواتب الموظفين"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">
                                            ${cost.amount.toLocaleString()}/شهر
                                        </span>
                                        <button
                                            onClick={() => handleDeleteExpense(cost._id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
                                    formatter={(value: number | string) => [`$${Number(value).toLocaleString()}`, "القيمة"]}
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
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">الإيرادات المتوقعة لكل طالب</p>
                            <p className="text-2xl font-bold text-purple-600">
                                ${revenuePerStudent}/شهر
                            </p>
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

            {/* Add Cost Modal */}
            {isAddModalOpen && (
                <AddCostModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddExpense}
                />
            )}
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

function AddCostModal({
    onClose,
    onAdd
}: {
    onClose: () => void,
    onAdd: (c: { name: string, category: ExpenseCategory, amount: number }) => void
}) {
    const [formData, setFormData] = useState({ name: "", category: "Software", amount: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.amount) return;
        onAdd({
            name: formData.name,
            category: formData.category as ExpenseCategory,
            amount: parseFloat(formData.amount)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">إضافة تكلفة شهرية</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم البند</label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثال: فاتورة كهرباء، اشتراك Zoom"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Software">الخدمات والاشتراكات الرقمية</option>
                            <option value="Utilities">خدمات أساسية</option>
                            <option value="Other">أخرى</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة الشهرية ($)</label>
                        <input
                            required
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 text-white font-medium py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700"
                        >
                            إضافة
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


