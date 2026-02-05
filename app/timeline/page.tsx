"use client";

import { useState, useEffect } from "react";
import type { Milestone as BaseMilestone } from "@/lib/store";
import { Calendar, CheckCircle2, Clock, Circle, Plus, Trash2, X, Loader2, Pencil } from "lucide-react";

// Extend Milestone to support MongoDB _id
interface Milestone extends Omit<BaseMilestone, "id"> {
    _id: string;
    id?: string;
}

export default function TimelinePage() {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

    // Fetch Milestones
    useEffect(() => {
        fetchMilestones();
    }, []);

    const fetchMilestones = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/timeline");
            if (res.ok) {
                const data = await res.json();
                setMilestones(data);
            }
        } catch (error) {
            console.error("Failed to fetch milestones", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Sorting: Ensure milestones are sorted by start date
    const sortedMilestones = [...milestones].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Handlers
    const handleAddPhase = async (newPhase: Omit<Milestone, "_id" | "id" | "isComplete" | "isCurrent">) => {
        try {
            const res = await fetch("/api/timeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newPhase,
                    isComplete: false,
                    isCurrent: false,
                }),
            });
            if (res.ok) {
                const savedPhase = await res.json();
                setMilestones([...milestones, savedPhase]);
                setIsAddModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to add phase", error);
        }
    };

    const handleDeletePhase = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذه المرحلة؟")) {
            try {
                const res = await fetch(`/api/timeline/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    setMilestones(milestones.filter(m => m._id !== id));
                }
            } catch (error) {
                console.error("Failed to delete phase", error);
            }
        }
    };

    const handleEditPhase = async (updatedPhase: Omit<Milestone, "_id" | "id" | "isComplete" | "isCurrent">) => {
        if (!editingMilestone) return;
        try {
            const res = await fetch(`/api/timeline/${editingMilestone._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...updatedPhase,
                    isComplete: editingMilestone.isComplete,
                    isCurrent: editingMilestone.isCurrent,
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setMilestones(milestones.map(m => m._id === updated._id ? updated : m));
                setEditingMilestone(null);
            }
        } catch (error) {
            console.error("Failed to edit phase", error);
        }
    };

    const handleToggleComplete = async (id: string) => {
        const milestone = milestones.find(m => m._id === id);
        if (!milestone) return;

        try {
            const res = await fetch(`/api/timeline/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isComplete: !milestone.isComplete }),
            });
            if (res.ok) {
                const updated = await res.json();
                setMilestones(milestones.map(m =>
                    m._id === id ? updated : m
                ));
            }
        } catch (error) {
            console.error("Failed to toggle complete", error);
        }
    };

    const handleSetCurrent = async (id: string) => {
        const milestone = milestones.find(m => m._id === id);
        if (!milestone) return;

        const newIsCurrent = !milestone.isCurrent;

        try {
            // If setting to true, ideally unset others first (optional but good for consistency)
            if (newIsCurrent) {
                const others = milestones.filter(m => m.isCurrent && m._id !== id);
                await Promise.all(others.map(m =>
                    fetch(`/api/timeline/${m._id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isCurrent: false })
                    })
                ));
            }

            const res = await fetch(`/api/timeline/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCurrent: newIsCurrent }),
            });

            if (res.ok) {
                const updated = await res.json();
                setMilestones(milestones.map(m => {
                    if (m._id === id) return updated;
                    if (newIsCurrent && m.isCurrent) return { ...m, isCurrent: false };
                    return m;
                }));
            }
        } catch (error) {
            console.error("Failed to set current", error);
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
                    <h1 className="text-3xl font-bold text-gray-900">الجدول الزمني</h1>
                    <p className="text-gray-600 mt-1">خارطة طريق المشروع والمعالم الرئيسية</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    مرحلة جديدة
                </button>
            </div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto">
                {sortedMilestones.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        <p>لا توجد مراحل حالياً. أضف مرحلة جديدة للبدء.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute right-6 top-6 bottom-6 w-0.5 bg-gray-200" />

                        {/* Milestones */}
                        <div className="space-y-8">
                            {sortedMilestones.map((milestone) => (
                                <MilestoneCard
                                    key={milestone._id}
                                    milestone={milestone}
                                    onDelete={() => handleDeletePhase(milestone._id)}
                                    onEdit={() => setEditingMilestone(milestone)}
                                    onToggleComplete={() => handleToggleComplete(milestone._id)}
                                    onSetCurrent={() => handleSetCurrent(milestone._id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Phase Modal */}
            {isAddModalOpen && (
                <PhaseModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddPhase}
                    title="إضافة مرحلة جديدة"
                    submitLabel="إضافة المرحلة"
                />
            )}
            {editingMilestone && (
                <PhaseModal
                    onClose={() => setEditingMilestone(null)}
                    onSubmit={handleEditPhase}
                    title="تعديل المرحلة"
                    submitLabel="حفظ التعديلات"
                    initialData={editingMilestone}
                />
            )}
        </div>
    );
}

function MilestoneCard({
    milestone,
    onDelete,
    onEdit,
    onToggleComplete,
    onSetCurrent,
}: {
    milestone: Milestone;
    onDelete: () => void;
    onEdit: () => void;
    onToggleComplete: () => void;
    onSetCurrent: () => void;
}) {
    const getStatusIcon = () => {
        if (milestone.isComplete) {
            return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
        } else if (milestone.isCurrent) {
            return <Clock className="w-6 h-6 text-blue-600" />;
        } else {
            return <Circle className="w-6 h-6 text-gray-400" />;
        }
    };

    const getCardStyle = () => {
        if (milestone.isComplete) {
            return "border-emerald-300 bg-emerald-50";
        } else if (milestone.isCurrent) {
            return "border-blue-300 bg-blue-50 shadow-md transform scale-[1.02] transition-transform";
        } else {
            return "border-gray-200 bg-white hover:border-gray-300";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="relative flex gap-6 items-start group">
            {/* Icon Circle */}
            <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                {getStatusIcon()}
            </div>

            {/* Content Card */}
            <div className={`flex-1 rounded-xl border-2 p-6 transition-all ${getCardStyle()}`}>
                <div className="flex items-start justify-between mb-3 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                            {milestone.phase}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {/* Action Buttons (visible on hover or if active) */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEdit}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="تعديل المرحلة"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onDelete}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="حذف المرحلة"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {milestone.isCurrent && (
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
                                    الحالية
                                </span>
                            )}
                            {milestone.isComplete && (
                                <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-sm">
                                    مكتملة
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm leading-relaxed">{milestone.description}</p>

                {/* Quick Actions Footer */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-200/50 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-emerald-700 transition-colors select-none">
                        <input
                            type="checkbox"
                            checked={milestone.isComplete}
                            onChange={onToggleComplete}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>تمييز كمكتملة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-blue-700 transition-colors select-none">
                        <input
                            type="checkbox"
                            checked={milestone.isCurrent}
                            onChange={onSetCurrent}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>تعيين كحالية</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

function PhaseModal({
    onClose,
    onSubmit,
    title,
    submitLabel,
    initialData,
}: {
    onClose: () => void;
    onSubmit: (p: Omit<Milestone, "_id" | "id" | "isComplete" | "isCurrent">) => void;
    title: string;
    submitLabel: string;
    initialData?: Milestone;
}) {
    const [formData, setFormData] = useState({
        phase: initialData?.phase ?? "",
        description: initialData?.description ?? "",
        startDate: initialData?.startDate ?? "",
        endDate: initialData?.endDate ?? ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.phase || !formData.startDate || !formData.endDate) return;

        onSubmit({
            ...formData,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المرحلة</label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.phase}
                            onChange={e => setFormData({ ...formData, phase: e.target.value })}
                            placeholder="مثال: المرحلة 4: التوسع"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="اكتب وصفاً مختصراً لأهداف هذه المرحلة..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                            <input
                                required
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                            <input
                                required
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            {submitLabel}
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
