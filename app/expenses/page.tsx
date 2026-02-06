"use client";

import { useState, useEffect, Suspense, type ElementType, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import type { MonthlyExpense as BaseMonthlyExpense, ExpenseCategory, ExpenseStatus } from "@/lib/store";
import { Plus, Trash2, X, FolderOpen, Receipt, Zap, Box, DollarSign, Pencil, Loader2 } from "lucide-react";

// Extend to support MongoDB _id
interface MonthlyExpense extends Omit<BaseMonthlyExpense, "id"> {
    _id: string;
    id?: string;
}

function ExpensesContent() {
    const searchParams = useSearchParams();
    const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<MonthlyExpense | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | "All">("All");
    const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

    // Fetch Expenses
    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/expenses");
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Sync URL param to state
    useEffect(() => {
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
            if (["Software", "Utilities", "Other"].includes(categoryParam)) {
                setSelectedCategory(categoryParam as ExpenseCategory);
            }
        } else {
            setSelectedCategory("All");
        }
    }, [searchParams]);

    // Filter Expenses
    const filteredExpenses = selectedCategory === "All"
        ? expenses
        : expenses.filter(e => e.category === selectedCategory);

    // Category Metrics Calculation
    const getCategoryMetrics = (category: ExpenseCategory) => {
        const categoryExpenses = expenses.filter(e => e.category === category);
        const count = categoryExpenses.length;
        const totalCost = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
        return { count, totalCost };
    };

    // Handlers
    const handleAddExpense = async (newExpense: Omit<MonthlyExpense, "_id" | "id">) => {
        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newExpense),
            });
            if (res.ok) {
                const savedExpense = await res.json();
                setExpenses([...expenses, savedExpense]);
                setIsAddModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to add expense", error);
        }
    };

    const handleUpdateExpense = async (updatedExpense: Omit<MonthlyExpense, "_id" | "id">) => {
        if (!editingExpense) return;
        try {
            const res = await fetch(`/api/expenses/${editingExpense._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedExpense),
            });
            if (res.ok) {
                const savedExpense = await res.json();
                setExpenses(expenses.map(e =>
                    e._id === editingExpense._id ? savedExpense : e
                ));
                setEditingExpense(null);
            }
        } catch (error) {
            console.error("Failed to update expense", error);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
            try {
                const res = await fetch(`/api/expenses/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    setExpenses(expenses.filter((e) => e._id !== id));
                }
            } catch (error) {
                console.error("Failed to delete expense", error);
            }
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: ExpenseStatus) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                const savedExpense = await res.json();
                setExpenses(expenses.map(e =>
                    e._id === id ? savedExpense : e
                ));
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">المصاريف الشهرية</h1>
                    <p className="text-gray-600 mt-1">
                        إدارة التكاليف التشغيلية والاشتراكات الشهرية
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    إضافة مصرف جديد
                </button>
            </div>

            {/* Grand Total Summary */}
            <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium text-gray-300">إجمالي المصاريف الشهرية</h2>
                    <p className="text-4xl font-bold mt-1">${expenses.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}<span className="text-lg font-normal text-gray-400">/شهر</span></p>
                </div>
                <div className="p-4 bg-white/10 rounded-full">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
            </div>

            {/* Category Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <CategoryCard
                    title="الخدمات والاشتراكات الرقمية"
                    category="Software"
                    icon={Receipt}
                    color="blue"
                    metrics={getCategoryMetrics("Software")}
                    isSelected={selectedCategory === "Software"}
                    onClick={() => setSelectedCategory(selectedCategory === "Software" ? "All" : "Software")}
                />
                <CategoryCard
                    title="خدمات أساسية"
                    category="Utilities"
                    icon={Zap} // Using Zap for Utilities/Electricity
                    color="emerald"
                    metrics={getCategoryMetrics("Utilities")}
                    isSelected={selectedCategory === "Utilities"}
                    onClick={() => setSelectedCategory(selectedCategory === "Utilities" ? "All" : "Utilities")}
                />
                <CategoryCard
                    title="رواتب الموظفين"
                    category="Other"
                    icon={Box}
                    color="orange"
                    metrics={getCategoryMetrics("Other")}
                    isSelected={selectedCategory === "Other"}
                    onClick={() => setSelectedCategory(selectedCategory === "Other" ? "All" : "Other")}
                />
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        قائمة المصاريف
                        {selectedCategory !== "All" && <span className="text-sm font-normal text-gray-500">({selectedCategory})</span>}
                    </h3>
                    <span className="text-sm text-gray-500">
                        {filteredExpenses.length} عنصر
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التكلفة الشهرية</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد مصاريف في هذه الفئة.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <Fragment key={expense._id}>
                                        <tr
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            onClick={() => setExpandedExpenseId(expandedExpenseId === expense._id ? null : expense._id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{expense.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <CategoryBadge category={expense.category} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${expense.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <StatusDropdown
                                                    currentStatus={expense.status}
                                                    onUpdate={(s) => handleUpdateStatus(expense._id, s)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingExpense(expense);
                                                        }}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                                                        title="تعديل"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteExpense(expense._id);
                                                        }}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedExpenseId === expense._id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-6 py-4 text-sm text-gray-600">
                                                    <span className="font-medium text-gray-700">الملاحظة: </span>
                                                    {expense.note?.trim() ? expense.note : "لا توجد ملاحظة"}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {isAddModalOpen && (
                <ExpenseModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddExpense}
                    title="إضافة مصروف جديد"
                />
            )}

            {/* Edit Expense Modal */}
            {editingExpense && (
                <ExpenseModal
                    onClose={() => setEditingExpense(null)}
                    onSave={handleUpdateExpense}
                    initialData={editingExpense}
                    title="تعديل المصروف"
                />
            )}
        </div>
    );
}

export default function ExpensesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
            <ExpensesContent />
        </Suspense>
    );
}

type CategoryColor = "emerald" | "blue" | "orange";

type CategoryMetrics = {
    count: number;
    totalCost: number;
};

type CategoryCardProps = {
    title: string;
    icon: ElementType;
    color: CategoryColor;
    metrics: CategoryMetrics;
    isSelected: boolean;
    onClick: () => void;
};

function CategoryCard({ title, icon: Icon, color, metrics, isSelected, onClick }: CategoryCardProps) {
    const colorClasses: Record<CategoryColor, string> = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        orange: "bg-orange-50 text-orange-600 border-orange-200",
    };

    return (
        <div
            onClick={onClick}
            className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${isSelected
                ? `border-${color}-500 bg-${color}-50 ring-1 ring-${color}-500`
                : "border-gray-200 bg-white hover:border-gray-300"
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {isSelected && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${color}-200 text-${color}-800`}>
                        محدد
                    </span>
                )}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold text-gray-900">${metrics.totalCost.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{metrics.count} عناصر</p>
                </div>
            </div>
        </div>
    );
}

function CategoryBadge({ category }: { category: ExpenseCategory }) {
    const styles: Record<ExpenseCategory, string> = {
        Software: "bg-blue-100 text-blue-800",
        Utilities: "bg-emerald-100 text-emerald-800",
        Other: "bg-orange-100 text-orange-800",
    };

    const labels: Record<ExpenseCategory, string> = {
        Software: "الخدمات والاشتراكات الرقمية",
        Utilities: "خدمات أساسية",
        Other: "رواتب الموظفين",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[category]}`}>
            {labels[category]}
        </span>
    );
}

function StatusDropdown({ currentStatus, onUpdate }: { currentStatus: ExpenseStatus, onUpdate: (s: ExpenseStatus) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const styles = {
        "Active": "bg-emerald-100 text-emerald-700 border-emerald-300",
        "Paused": "bg-yellow-100 text-yellow-700 border-yellow-300",
        "Cancelled": "bg-red-100 text-red-700 border-red-300",
    };

    const labels = {
        "Active": "نشط",
        "Paused": "موقف",
        "Cancelled": "ملغى",
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${styles[currentStatus]}`}
            >
                {labels[currentStatus]}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                        {["Active", "Paused", "Cancelled"].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    onUpdate(status as ExpenseStatus);
                                    setIsOpen(false);
                                }}
                                className={`block w-full text-right px-4 py-2 text-xs hover:bg-gray-100 ${status === currentStatus ? "text-emerald-600 font-bold" : "text-gray-700"
                                    }`}
                            >
                                {labels[status as ExpenseStatus]}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ExpenseModal({
    onClose,
    onSave,
    initialData,
    title
}: {
    onClose: () => void,
    onSave: (item: Omit<MonthlyExpense, "_id" | "id">) => void,
    initialData?: MonthlyExpense,
    title: string
}) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        category: initialData?.category || "Software" as ExpenseCategory,
        amount: initialData?.amount?.toString() || "",
        status: initialData?.status || "Active" as ExpenseStatus,
        note: initialData?.note || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.amount) return;
        onSave({
            name: formData.name,
            category: formData.category,
            amount: parseFloat(formData.amount),
            status: formData.status,
            note: formData.note
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المصروف</label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثال: اشتراك Zoom"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                            >
                                <option value="Software">الخدمات والاشتراكات الرقمية</option>
                                <option value="Utilities">خدمات أساسية</option>
                                <option value="Other">رواتب الموظفين</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة الشهرية ($)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as ExpenseStatus })}
                        >
                            <option value="Active">نشط</option>
                            <option value="Paused">موقف مؤقتاً</option>
                            <option value="Cancelled">ملغى</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظة</label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            placeholder="أضف ملاحظة..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors mt-2"
                    >
                        حفظ
                    </button>
                </form>
            </div>
        </div>
    );
}
