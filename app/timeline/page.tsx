"use client";

import { useState } from "react";
import { milestones as initialMilestones } from "@/lib/store";
import type { Milestone } from "@/lib/store";
import { Calendar, CheckCircle2, Clock, Circle, Plus, Trash2, X, ToggleRight, ToggleLeft } from "lucide-react";

export default function TimelinePage() {
    const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Sorting: Ensure milestones are sorted by start date
    const sortedMilestones = [...milestones].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Handlers
    const handleAddPhase = (newPhase: Omit<Milestone, "id">) => {
        const phase: Milestone = {
            ...newPhase,
            id: Date.now().toString(),
        };
        setMilestones([...milestones, phase]);
        setIsAddModalOpen(false);
    };

    const handleDeletePhase = (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذه المرحلة؟")) {
            setMilestones(milestones.filter(m => m.id !== id));
        }
    };

    const handleToggleComplete = (id: string) => {
        setMilestones(milestones.map(m =>
            m.id === id ? { ...m, isComplete: !m.isComplete } : m
        ));
    };

    const handleSetCurrent = (id: string) => {
        // Only one phase can be current, or toggle off if same clicked
        setMilestones(milestones.map(m =>
            m.id === id
                ? { ...m, isCurrent: !m.isCurrent }
                : { ...m, isCurrent: false } // Reset others if we are setting a new current
        ));
    };

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
                            {sortedMilestones.map((milestone, index) => (
                                <MilestoneCard
                                    key={milestone.id}
                                    milestone={milestone}
                                    onDelete={() => handleDeletePhase(milestone.id)}
                                    onToggleComplete={() => handleToggleComplete(milestone.id)}
                                    onSetCurrent={() => handleSetCurrent(milestone.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Phase Modal */}
            {isAddModalOpen && (
                <AddPhaseModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddPhase}
                />
            )}
        </div>
    );
}

function MilestoneCard({
    milestone,
    onDelete,
    onToggleComplete,
    onSetCurrent,
}: {
    milestone: Milestone;
    onDelete: () => void;
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

function AddPhaseModal({ onClose, onAdd }: { onClose: () => void, onAdd: (p: Omit<Milestone, "id">) => void }) {
    const [formData, setFormData] = useState({
        phase: "",
        description: "",
        startDate: "",
        endDate: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.phase || !formData.startDate || !formData.endDate) return;

        onAdd({
            ...formData,
            isComplete: false,
            isCurrent: false
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">إضافة مرحلة جديدة</h3>
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
                            إضافة المرحلة
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
