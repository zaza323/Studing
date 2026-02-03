"use client";

import { useState } from "react";
import {
    initialIdeas,
    initialCompetitors,
    initialCategories
} from "@/lib/store";
import type { Idea, Competitor } from "@/lib/store";
import { Plus, Trash2, ExternalLink, Lightbulb, Target, X, Edit2, Check, GripVertical } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function StrategyPage() {
    const [activeTab, setActiveTab] = useState<'ideas' | 'competitors'>('competitors');

    // Local State for Data
    const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);

    // Modal State
    const [ideaModal, setIdeaModal] = useState<{ isOpen: boolean, editingId: string | null }>({ isOpen: false, editingId: null });
    const [competitorModal, setCompetitorModal] = useState<{ isOpen: boolean, editingId: string | null }>({ isOpen: false, editingId: null });

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handlers
    const handleDragEnd = (event: DragEndEvent, type: 'ideas' | 'competitors') => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            if (type === 'ideas') {
                setIdeas((items) => {
                    const oldIndex = items.findIndex((i) => i.id === active.id);
                    const newIndex = items.findIndex((i) => i.id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            } else if (type === 'competitors') {
                setCompetitors((items) => {
                    const oldIndex = items.findIndex((i) => i.id === active.id);
                    const newIndex = items.findIndex((i) => i.id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };

    // --- Idea Logic ---
    const handleSaveIdea = (idea: Omit<Idea, "id" | "createdAt">) => {
        if (ideaModal.editingId) {
            setIdeas(ideas.map(i => i.id === ideaModal.editingId ? { ...i, ...idea } : i));
        } else {
            const newIdea = {
                ...idea,
                id: Date.now().toString(),
                createdAt: new Date().toISOString().split('T')[0]
            };
            setIdeas([...ideas, newIdea]);
        }
        setIdeaModal({ isOpen: false, editingId: null });
    };

    const handleDeleteIdea = (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذه الفكرة؟")) setIdeas(ideas.filter(i => i.id !== id));
    };

    const handleAddCategory = (newCategory: string) => {
        if (!categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
        }
    };

    // --- Competitor Logic ---
    const handleSaveCompetitor = (competitor: Omit<Competitor, "id">) => {
        if (competitorModal.editingId) {
            setCompetitors(competitors.map(c => c.id === competitorModal.editingId ? { ...c, ...competitor } : c));
        } else {
            setCompetitors([...competitors, { ...competitor, id: Date.now().toString() }]);
        }
        setCompetitorModal({ isOpen: false, editingId: null });
    };

    const handleDeleteCompetitor = (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا المنافس؟")) setCompetitors(competitors.filter(c => c.id !== id));
    };


    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">الاستراتيجية</h1>
                <p className="text-gray-600 mt-1">عقل الشركة: الأفكار والمنافسون</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
                <TabButton
                    active={activeTab === 'competitors'}
                    onClick={() => setActiveTab('competitors')}
                    icon={Target}
                    label="المنافسون"
                />
                <TabButton
                    active={activeTab === 'ideas'}
                    onClick={() => setActiveTab('ideas')}
                    icon={Lightbulb}
                    label="بنك الأفكار"
                />
            </div>

            {/* Content Areas */}
            <div className="min-h-[400px]">
                {/* 1. Idea Board */}
                {activeTab === 'ideas' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">جدار الأفكار</h2>
                                <p className="text-sm text-gray-500">أضف ونظم أفكارك الإبداعية (اسحب لإعادة الترتيب)</p>
                            </div>
                            <button
                                onClick={() => setIdeaModal({ isOpen: true, editingId: null })}
                                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                <Plus className="w-5 h-5" /> فكرة جديدة
                            </button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'ideas')}
                        >
                            <SortableContext
                                items={ideas.map(i => i.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {ideas.map(idea => (
                                        <SortableIdeaCard
                                            key={idea.id}
                                            idea={idea}
                                            onEdit={(id) => setIdeaModal({ isOpen: true, editingId: id })}
                                            onDelete={handleDeleteIdea}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {ideas.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">لا توجد أفكار بعد</h3>
                                <p className="text-gray-500">ابدأ بإضافة فكرتك الأولى!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Competitors Board */}
                {activeTab === 'competitors' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">المشهد التنافسي</h2>
                                <p className="text-sm text-gray-500">تحليل نقاط القوة والضعف للمنافسين (اسحب لإعادة الترتيب)</p>
                            </div>
                            <button
                                onClick={() => setCompetitorModal({ isOpen: true, editingId: null })}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                <Plus className="w-5 h-5" /> منافس جديد
                            </button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'competitors')}
                        >
                            <SortableContext
                                items={competitors.map(c => c.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    {competitors.map(comp => (
                                        <SortableCompetitorCard
                                            key={comp.id}
                                            comp={comp}
                                            onEdit={(id) => setCompetitorModal({ isOpen: true, editingId: id })}
                                            onDelete={handleDeleteCompetitor}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {competitors.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">لا يوجد منافسين مسجلين</h3>
                                <p className="text-gray-500">ابدأ بتحليل السوق والمنافسين!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {ideaModal.isOpen && (
                <IdeaDialog
                    isOpen={ideaModal.isOpen}
                    onClose={() => setIdeaModal({ isOpen: false, editingId: null })}
                    onSave={handleSaveIdea}
                    editingIdea={ideas.find(i => i.id === ideaModal.editingId)}
                    availableCategories={categories}
                    onAddCategory={handleAddCategory}
                />
            )}

            {competitorModal.isOpen && (
                <CompetitorDialog
                    isOpen={competitorModal.isOpen}
                    onClose={() => setCompetitorModal({ isOpen: false, editingId: null })}
                    onSave={handleSaveCompetitor}
                    editingComp={competitors.find(c => c.id === competitorModal.editingId)}
                />
            )}
        </div>
    );
}

// === Sortable Components ===

function SortableIdeaCard({ idea, onEdit, onDelete }: { idea: Idea, onEdit: (id: string) => void, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: idea.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.8 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${idea.color} p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative border border-black/5 flex flex-col h-full`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 p-1.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 opacity-60 hover:opacity-100 transition-opacity"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Actions */}
            <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(idea.id); }}
                    className="p-1.5 bg-white/60 hover:bg-white rounded-full text-gray-700 transition-colors"
                    title="تعديل"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(idea.id); }}
                    className="p-1.5 bg-white/60 hover:bg-red-50 rounded-full text-gray-700 hover:text-red-600 transition-colors"
                    title="حذف"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-2 mb-3 mt-4">
                <span className="px-2 py-1 bg-white/50 rounded-lg text-xs font-bold text-gray-800 backdrop-blur-sm">
                    {idea.category}
                </span>
            </div>

            <h3 className="font-bold text-gray-900 text-xl mb-2 leading-tight">{idea.title}</h3>
            <p className="text-gray-800/80 leading-relaxed whitespace-pre-wrap flex-grow">{idea.content}</p>

            <div className="mt-4 pt-4 border-t border-black/5 flex justify-end">
                <span className="text-xs text-gray-500 font-medium">
                    {idea.createdAt}
                </span>
            </div>
        </div>
    );
}

function SortableCompetitorCard({ comp, onEdit, onDelete }: { comp: Competitor, onEdit: (id: string) => void, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: comp.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.9 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative group"
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 left-4 p-1.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 opacity-60 hover:opacity-100 transition-opacity"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Actions */}
            <div className="absolute top-4 left-12 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(comp.id); }}
                    className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
                    title="تعديل"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(comp.id); }}
                    className="p-1.5 bg-gray-50 hover:bg-red-50 rounded-md text-gray-600 hover:text-red-600 transition-colors"
                    title="حذف"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl ${comp.logo} flex items-center justify-center text-white text-2xl font-bold shadow-sm`}>
                    {comp.name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{comp.name}</h3>
                    <a href={`https://${comp.url}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        {comp.url} <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div className="mr-auto text-center">
                    <span className="block text-2xl font-bold text-gray-800">{comp.pricePoint}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">السعر</span>
                </div>
            </div>

            {/* SWOT Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-700 text-sm mb-3 uppercase flex items-center gap-2">
                        <Check className="w-4 h-4" /> نقاط القوة
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {comp.strengths.map((s, idx) => (
                            <span key={idx} className="bg-white text-green-800 px-3 py-1.5 rounded-lg text-sm font-semibold border border-green-200 shadow-sm">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-700 text-sm mb-3 uppercase flex items-center gap-2">
                        <X className="w-4 h-4" /> نقاط الضعف
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {comp.weaknesses.map((w, idx) => (
                            <span key={idx} className="bg-white text-red-800 px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-200 shadow-sm">
                                {w}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


// === Modals ===

function IdeaDialog({ isOpen, onClose, onSave, editingIdea, availableCategories, onAddCategory }: any) {
    const [title, setTitle] = useState(editingIdea?.title || "");
    const [content, setContent] = useState(editingIdea?.content || "");
    const [category, setCategory] = useState(editingIdea?.category || "General");
    const [color, setColor] = useState(editingIdea?.color || "bg-yellow-100");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const colors = [
        { class: "bg-yellow-100", label: "أصفر" },
        { class: "bg-blue-100", label: "أزرق" },
        { class: "bg-green-100", label: "أخضر" },
        { class: "bg-purple-100", label: "بنفسجي" },
        { class: "bg-pink-100", label: "وردي" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, content, category, color });
    };

    const handleCreateCategory = () => {
        if (newCategoryName.trim()) {
            onAddCategory(newCategoryName);
            setCategory(newCategoryName);
            setIsCreatingCategory(false);
            setNewCategoryName("");
        }
    };

    return (
        <ModalLayout title={editingIdea ? "تعديل الفكرة" : "إضافة فكرة جديدة"} onClose={onClose} color={color}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <input
                        required
                        type="text"
                        className="w-full bg-transparent text-xl font-bold placeholder-gray-500 text-gray-900 border-none focus:ring-0 p-0"
                        placeholder="عنوان الفكرة..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <textarea
                        required
                        className="w-full bg-white/40 min-h-[120px] rounded-xl border-none focus:ring-0 p-4 placeholder-gray-500 text-gray-800 text-lg leading-relaxed resize-none"
                        placeholder="اكتب تفاصيل فكرتك هنا..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">التصنيف</label>
                        {isCreatingCategory ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    className="flex-1 bg-white/60 rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-black/10"
                                    placeholder="اسم التصنيف..."
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                                />
                                <button type="button" onClick={handleCreateCategory} className="p-2 bg-black text-white rounded-lg hover:bg-gray-800">
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <select
                                className="w-full bg-white/60 rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-black/10 cursor-pointer"
                                value={category}
                                onChange={e => e.target.value === "NEW" ? setIsCreatingCategory(true) : setCategory(e.target.value)}
                            >
                                {availableCategories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                                <option value="NEW" className="font-bold text-indigo-600">+ إنشاء تصنيف جديد...</option>
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">لون البطاقة</label>
                        <div className="flex gap-3">
                            {colors.map(c => (
                                <button
                                    type="button"
                                    key={c.class}
                                    className={`w-8 h-8 rounded-full ${c.class} border-2 transition-transform hover:scale-110 ${color === c.class ? 'border-black scale-110 shadow-sm' : 'border-transparent'}`}
                                    onClick={() => setColor(c.class)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold shadow-lg transition-all mt-4">
                    {editingIdea ? "حفظ التعديلات" : "إضافة الفكرة"}
                </button>
            </form>
        </ModalLayout>
    );
}

function CompetitorDialog({ isOpen, onClose, onSave, editingComp }: any) {
    const [name, setName] = useState(editingComp?.name || "");
    const [pricePoint, setPricePoint] = useState(editingComp?.pricePoint || "$$");
    const [url, setUrl] = useState(editingComp?.url || "");
    const [color, setColor] = useState(editingComp?.logo || "bg-indigo-500");

    // Tags State
    const [strengths, setStrengths] = useState<string[]>(editingComp?.strengths || []);
    const [weaknesses, setWeaknesses] = useState<string[]>(editingComp?.weaknesses || []);
    const [sInput, setSInput] = useState("");
    const [wInput, setWInput] = useState("");

    const bgColors = ["bg-indigo-500", "bg-blue-600", "bg-emerald-500", "bg-purple-600", "bg-rose-500", "bg-orange-500"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            pricePoint,
            url,
            logo: color,
            strengths,
            weaknesses
        });
    };

    const addTag = (type: 's' | 'w') => {
        if (type === 's' && sInput.trim()) {
            setStrengths([...strengths, sInput.trim()]);
            setSInput("");
        } else if (type === 'w' && wInput.trim()) {
            setWeaknesses([...weaknesses, wInput.trim()]);
            setWInput("");
        }
    };

    return (
        <ModalLayout title={editingComp ? "تعديل المنافس" : "إضافة منافس جديد"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="label">اسم المنافس</label>
                            <input required className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="اسم الشركة" />
                        </div>
                        <div>
                            <label className="label">الموقع الإلكتروني</label>
                            <input className="input-field" value={url} onChange={e => setUrl(e.target.value)} placeholder="example.com" />
                        </div>
                    </div>
                    <div>
                        <label className="label mb-2 block text-center">لون الشعار</label>
                        <div className="grid grid-cols-2 gap-2">
                            {bgColors.map(c => (
                                <button
                                    type="button"
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="label">السعر</label>
                    <select className="input-field" value={pricePoint} onChange={e => setPricePoint(e.target.value)}>
                        <option value="Free">مجاني</option>
                        <option value="$">$ (اقتصادي)</option>
                        <option value="$$">$$ (متوسط)</option>
                        <option value="$$$">$$$ (غالي)</option>
                    </select>
                </div>

                {/* Tags Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label text-green-700">نقاط القوة</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                className="input-field text-sm"
                                placeholder="اكتب واضغط Enter..."
                                value={sInput}
                                onChange={e => setSInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('s'))}
                            />
                            <button type="button" onClick={() => addTag('s')} className="px-3 bg-green-100 text-green-700 rounded-lg text-lg hover:bg-green-200">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {strengths.map((s, i) => (
                                <span key={i} className="bg-green-50 text-green-800 text-sm px-2 py-1 rounded border border-green-100 flex items-center gap-1 font-medium">
                                    {s}
                                    <button type="button" onClick={() => setStrengths(strengths.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="label text-red-700">نقاط الضعف</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                className="input-field text-sm"
                                placeholder="اكتب واضغط Enter..."
                                value={wInput}
                                onChange={e => setWInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('w'))}
                            />
                            <button type="button" onClick={() => addTag('w')} className="px-3 bg-red-100 text-red-700 rounded-lg text-lg hover:bg-red-200">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {weaknesses.map((w, i) => (
                                <span key={i} className="bg-red-50 text-red-800 text-sm px-2 py-1 rounded border border-red-100 flex items-center gap-1 font-medium">
                                    {w}
                                    <button type="button" onClick={() => setWeaknesses(weaknesses.filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full">حفظ البيانات</button>
            </form>
        </ModalLayout>
    );
}

function ModalLayout({ title, onClose, children, color }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 bg-white ${color ? color : ''}`}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 bg-white max-h-[85vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative top-[1px] ${active
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
