"use client";

import { useState, useEffect, Suspense, type ElementType, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { teamMembers } from "@/lib/store";
import type { Asset as BaseAsset, AssetStatus, AssetCategory } from "@/lib/store";
import { Package, Plus, Trash2, X, FolderOpen, CircuitBoard, FileCheck, Truck, DollarSign, Pencil, Loader2 } from "lucide-react";

// Extend or redefine Asset to support MongoDB _id
interface Asset extends Omit<BaseAsset, "id"> {
    _id: string;
    id?: string; // Optional for compatibility
}

function AssetsContent() {
    const searchParams = useSearchParams();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "All">("All");
    const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
    const categoryLabels: Record<AssetCategory, string> = {
        Production: "إنتاج وتصوير",
        Infrastructure: "بنية تحتية",
        Electronics: "أجهزة إلكترونية",
        Licenses: "تراخيص وتصاريح",
        Furniture: "الأثاث",
    };

    // Fetch Assets
    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/assets");
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (error) {
            console.error("Failed to fetch assets", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Sync URL param to state
    useEffect(() => {
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
            if (["Production", "Infrastructure", "Electronics", "Licenses", "Furniture"].includes(categoryParam)) {
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
    const handleAddAsset = async (newAsset: Omit<Asset, "_id" | "id">) => {
        try {
            const res = await fetch("/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAsset),
            });
            if (res.ok) {
                const savedAsset = await res.json();
                setAssets([...assets, savedAsset]);
                setIsAddModalOpen(false);
            } else {
                const errData = await res.json();
                alert(`Error adding asset: ${errData.error || res.statusText}`);
            }
        } catch (error) {
            console.error("Failed to add asset", error);
            alert("Failed to add asset. Check console for details.");
        }
    };

    const handleUpdateAsset = async (updatedAsset: Omit<Asset, "_id" | "id">) => {
        if (!editingAsset) return;
        try {
            const res = await fetch(`/api/assets/${editingAsset._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedAsset),
            });
            if (res.ok) {
                const savedAsset = await res.json();
                setAssets(assets.map(a =>
                    a._id === editingAsset._id ? savedAsset : a
                ));
                setEditingAsset(null);
            }
        } catch (error) {
            console.error("Failed to update asset", error);
        }
    };

    const handleDeleteAsset = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا الأصل؟")) {
            try {
                const res = await fetch(`/api/assets/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    setAssets(assets.filter((a) => a._id !== id));
                }
            } catch (error) {
                console.error("Failed to delete asset", error);
            }
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: AssetStatus) => {
        try {
            const res = await fetch(`/api/assets/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                const savedAsset = await res.json();
                setAssets(assets.map(a =>
                    a._id === id ? savedAsset : a
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
                    title="الأثاث"
                    category="Furniture"
                    icon={Package}
                    color="orange"
                    metrics={getCategoryMetrics("Furniture")}
                    isSelected={selectedCategory === "Furniture"}
                    onClick={() => setSelectedCategory(selectedCategory === "Furniture" ? "All" : "Furniture")}
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
                        {selectedCategory !== "All" && (
                            <span className="text-sm font-normal text-gray-500">
                                ({categoryLabels[selectedCategory]})
                            </span>
                        )}
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
                                    <Fragment key={asset._id}>
                                        <tr
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            onClick={() => setExpandedAssetId(expandedAssetId === asset._id ? null : asset._id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{asset.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <CategoryBadge category={asset.category} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${asset.price.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <StatusDropdown
                                                    currentStatus={asset.status}
                                                    onUpdate={(s) => handleUpdateStatus(asset._id, s)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.owner}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingAsset(asset);
                                                        }}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                                                        title="تعديل"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAsset(asset._id);
                                                        }}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedAssetId === asset._id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={6} className="px-6 py-4 text-sm text-gray-600">
                                                    <span className="font-medium text-gray-700">الملاحظة: </span>
                                                    {asset.note?.trim() ? asset.note : "لا توجد ملاحظة"}
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

            {/* Add Asset Modal */}
            {isAddModalOpen && (
                <AssetModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddAsset}
                    title="إضافة أصل جديد"
                />
            )}

            {/* Edit Asset Modal */}
            {editingAsset && (
                <AssetModal
                    onClose={() => setEditingAsset(null)}
                    onSave={handleUpdateAsset}
                    initialData={editingAsset}
                    title="تعديل الأصل"
                />
            )}
        </div>
    );
}

export default function AssetsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
            <AssetsContent />
        </Suspense>
    );
}

type CategoryColor = "emerald" | "blue" | "purple" | "orange";

type CategoryMetrics = {
    count: number;
    totalCost: number;
};

type CategoryCardProps = {
    title: string;
    category?: AssetCategory;
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
        Furniture: "bg-yellow-100 text-yellow-800",
    };

    const labels: Record<AssetCategory, string> = {
        Production: "إنتاج وتصوير",
        Infrastructure: "بنية تحتية",
        Electronics: "أجهزة إلكترونية",
        Licenses: "تراخيص وتصاريح",
        Furniture: "الأثاث",
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

function AssetModal({
    onClose,
    onSave,
    initialData,
    title
}: {
    onClose: () => void,
    onSave: (item: Omit<Asset, "_id" | "id">) => void,
    initialData?: Asset,
    title: string
}) {
    const ownerOptions = teamMembers.map((member) => member.name);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        category: initialData?.category || "Production" as AssetCategory,
        price: initialData?.price?.toString() || "",
        owner: (initialData?.owner && ownerOptions.includes(initialData.owner))
            ? initialData.owner
            : ownerOptions[0] ?? "",
        status: initialData?.status || "للشراء" as AssetStatus,
        note: initialData?.note || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;
        onSave({
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            owner: formData.owner || "--",
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
                                <option value="Furniture">الأثاث</option>
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
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.owner}
                                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                            >
                                {ownerOptions.map((owner) => (
                                    <option key={owner} value={owner}>
                                        {owner}
                                    </option>
                                ))}
                            </select>
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
