"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { assets as initialAssets, budget } from "@/lib/store";
import type { Asset, AssetStatus, AssetCategory } from "@/lib/store";
import { Package, Plus, Trash2, X, Filter, FolderOpen, CircuitBoard, FileCheck, Truck, DollarSign } from "lucide-react";

export default function AssetsPage() {
    const searchParams = useSearchParams();
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "All">("All");

    // Sync URL param to state
    useEffect(() => {
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
            // Validate if it is a valid category
            if (["Production", "Infrastructure", "Electronics", "Licenses"].includes(categoryParam)) {
                setSelectedCategory(categoryParam as AssetCategory);
            }
        } else {
            setSelectedCategory("All");
        }
    }, [searchParams]);

    // Filter Assets
    const filteredAssets = selectedCategory === "All"
        ? assets
        : assets.filter(a => a.category === selectedCategory);

    // Category Metrics Calculation
    const getCategoryMetrics = (category: AssetCategory) => {
        const categoryAssets = assets.filter(a => a.category === category);
        const count = categoryAssets.length;
        const totalCost = categoryAssets.reduce((sum, item) => sum + item.price, 0);
        return { count, totalCost };
    };

    // Handlers
    const handleAddAsset = (newAsset: Omit<Asset, "id">) => {
        const asset: Asset = {
            ...newAsset,
            id: Date.now().toString(),
        };
        setAssets([...assets, asset]);
        setIsAddModalOpen(false);
    };

    const handleDeleteAsset = (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا الأصل؟")) {
            setAssets(assets.filter((a) => a.id !== id));
        }
    };

    const handleUpdateStatus = (id: string, newStatus: AssetStatus) => {
        setAssets(assets.map(a =>
            a.id === id ? { ...a, status: newStatus } : a
        ));
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">الأصول والممتلكات</h1>
                    <p className="text-gray-600 mt-1">
                        إدارة شاملة لجميع أصول الاستوديو والبنية التحتية
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    إضافة أصل جديد
                </button>
            </div>

            {/* Grand Total Summary */}
            <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium text-gray-300">إجمالي قيمة الأصول</h2>
                    <p className="text-4xl font-bold mt-1">${assets.reduce((sum, item) => sum + item.price, 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white/10 rounded-full">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
            </div>

            {/* Category Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <CategoryCard
                    title="إنتاج وتصوير"
                    category="Production"
                    icon={Package}
                    color="emerald"
                    metrics={getCategoryMetrics("Production")}
                    isSelected={selectedCategory === "Production"}
                    onClick={() => setSelectedCategory(selectedCategory === "Production" ? "All" : "Production")}
                />
                <CategoryCard
                    title="بنية تحتية"
                    category="Infrastructure"
                    icon={Truck}
                    color="blue"
                    metrics={getCategoryMetrics("Infrastructure")}
                    isSelected={selectedCategory === "Infrastructure"}
                    onClick={() => setSelectedCategory(selectedCategory === "Infrastructure" ? "All" : "Infrastructure")}
                />
                <CategoryCard
                    title="أجهزة إلكترونية"
                    category="Electronics"
                    icon={CircuitBoard}
                    color="purple"
                    metrics={getCategoryMetrics("Electronics")}
                    isSelected={selectedCategory === "Electronics"}
                    onClick={() => setSelectedCategory(selectedCategory === "Electronics" ? "All" : "Electronics")}
                />
                <CategoryCard
                    title="تراخيص وتصاريح"
                    category="Licenses"
                    icon={FileCheck}
                    color="orange"
                    metrics={getCategoryMetrics("Licenses")}
                    isSelected={selectedCategory === "Licenses"}
                    onClick={() => setSelectedCategory(selectedCategory === "Licenses" ? "All" : "Licenses")}
                />
            </div>

            {/* Assets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        قائمة الأصول
                        {selectedCategory !== "All" && <span className="text-sm font-normal text-gray-500">({selectedCategory})</span>}
                    </h3>
                    <span className="text-sm text-gray-500">
                        {filteredAssets.length} عنصر
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التكلفة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسؤول</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد أصول في هذه الفئة.
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{asset.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <CategoryBadge category={asset.category} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${asset.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusDropdown
                                                currentStatus={asset.status}
                                                onUpdate={(s) => handleUpdateStatus(asset.id, s)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.owner}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDeleteAsset(asset.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Asset Modal */}
            {isAddModalOpen && (
                <AddAssetModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddAsset}
                />
            )}
        </div>
    );
}

function CategoryCard({ title, category, icon: Icon, color, metrics, isSelected, onClick }: any) {
    const colorClasses: any = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
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

function CategoryBadge({ category }: { category: AssetCategory }) {
    const styles: Record<AssetCategory, string> = {
        Production: "bg-emerald-100 text-emerald-800",
        Infrastructure: "bg-blue-100 text-blue-800",
        Electronics: "bg-purple-100 text-purple-800",
        Licenses: "bg-orange-100 text-orange-800",
    };

    const labels: Record<AssetCategory, string> = {
        Production: "إنتاج",
        Infrastructure: "بنية تحتية",
        Electronics: "إلكترونيات",
        Licenses: "تراخيص",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[category]}`}>
            {labels[category]}
        </span>
    );
}

function StatusDropdown({ currentStatus, onUpdate }: { currentStatus: AssetStatus, onUpdate: (s: AssetStatus) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const styles = {
        "للشراء": "bg-gray-100 text-gray-700 border-gray-300",
        "تم الطلب": "bg-yellow-100 text-yellow-700 border-yellow-300",
        "تم الاستلام": "bg-emerald-100 text-emerald-700 border-emerald-300",
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${styles[currentStatus]}`}
            >
                {currentStatus}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                        {["للشراء", "تم الطلب", "تم الاستلام"].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    onUpdate(status as AssetStatus);
                                    setIsOpen(false);
                                }}
                                className={`block w-full text-right px-4 py-2 text-xs hover:bg-gray-100 ${status === currentStatus ? "text-emerald-600 font-bold" : "text-gray-700"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function AddAssetModal({ onClose, onAdd }: { onClose: () => void, onAdd: (item: Omit<Asset, "id">) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Production" as AssetCategory,
        price: "",
        owner: "",
        status: "للشراء" as AssetStatus
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;
        onAdd({
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            owner: formData.owner || "--",
            status: formData.status
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">إضافة أصل جديد</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الأصل</label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثال: كاميرا Sony"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                            >
                                <option value="Production">إنتاج وتصوير</option>
                                <option value="Infrastructure">بنية تحتية</option>
                                <option value="Electronics">أجهزة إلكترونية</option>
                                <option value="Licenses">تراخيص وتصاريح</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">السعر ($)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المالك / المسؤول</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.owner}
                                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                placeholder="اسم الشخص"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                            >
                                <option value="للشراء">للشراء</option>
                                <option value="تم الطلب">تم الطلب</option>
                                <option value="تم الاستلام">تم الاستلام</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors mt-2"
                    >
                        حفظ الأصل
                    </button>
                </form>
            </div>
        </div>
    );
}
