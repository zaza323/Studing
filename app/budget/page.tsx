"use client";

import { useState, useEffect } from "react";
import {
    budget as initialBudget,
    getAssetCategoryTotals,
    getTotalAssetsCost
} from "@/lib/store";
import { DollarSign, TrendingUp, Users, Plus, Trash2, X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function BudgetPage() {
    // State for monthly costs (still editable manually)
    const [monthlyCosts, setMonthlyCosts] = useState(initialBudget.monthlyCosts);

    // Dynamic Data from Assets (Read-only on this page)
    const [assetCategories, setAssetCategories] = useState<{ name: string, value: number }[]>([]);
    const [totalOneTime, setTotalOneTime] = useState(0);

    // Load asset data on mount
    useEffect(() => {
        setAssetCategories(getAssetCategoryTotals());
        setTotalOneTime(getTotalAssetsCost());
    }, []);

    // State for modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Local Calculations
    const totalMonthly = monthlyCosts.reduce((sum, item) => sum + item.amount, 0);
    const breakEvenStudents = Math.ceil(totalMonthly / initialBudget.revenuePerStudent);

    // Handlers
    const handleAddExpense = (newExpense: { category: string; amount: number }) => {
        // Only handles monthly now
        setMonthlyCosts([...monthlyCosts, newExpense]);
        setIsAddModalOpen(false);
    };

    const handleDeleteExpense = (index: number) => {
        setMonthlyCosts(monthlyCosts.filter((_, i) => i !== index));
    };

    // Chart Data (Use asset categories directly)
    const chartData = assetCategories;

    const COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444", "#3b82f6"];

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
                            monthlyCosts.map((cost, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                                >
                                    <span className="text-gray-700">{cost.category}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">
                                            ${cost.amount.toLocaleString()}/شهر
                                        </span>
                                        <button
                                            onClick={() => handleDeleteExpense(index)}
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
                                    label={(props: any) =>
                                        `${(props.percent ? props.percent * 100 : 0).toFixed(0)}%`
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
                                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "القيمة"]}
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
                                ${initialBudget.revenuePerStudent}/شهر
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

            {/* Add Cost Modal - Only for Monthly now */}
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
    onAdd: (c: { category: string, amount: number }) => void
}) {
    const [formData, setFormData] = useState({ category: "", amount: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category || !formData.amount) return;
        onAdd({
            category: formData.category,
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
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="مثال: فاتورة كهرباء، اشتراك Zoom"
                        />
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
