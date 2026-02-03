"use client";

import { useState } from "react";
import { tasks as initialTasks, teamMembers, getTeamMemberById } from "@/lib/store";
import type { Task, TaskStatus, Priority } from "@/lib/store";
import { Filter, Plus, Trash2, X } from "lucide-react";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedMember, setSelectedMember] = useState<string>("all");
    const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

    const filteredTasks =
        selectedMember === "all"
            ? tasks
            : tasks.filter((task) => task.assignee === selectedMember);

    const tasksByStatus = {
        "قيد الانتظار": filteredTasks.filter((t) => t.status === "قيد الانتظار"),
        "قيد التنفيذ": filteredTasks.filter((t) => t.status === "قيد التنفيذ"),
        مكتملة: filteredTasks.filter((t) => t.status === "مكتملة"),
    };

    // Create new task
    const handleCreateTask = (newTask: Omit<Task, "id">) => {
        const taskWithId: Task = {
            ...newTask,
            id: Date.now().toString(), // Simple unique ID
        };
        setTasks([...tasks, taskWithId]);
        setIsNewTaskDialogOpen(false);
    };

    // Delete task
    const handleDeleteTask = (taskId: string) => {
        if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
            setTasks(tasks.filter((task) => task.id !== taskId));
        }
    };

    // Update task status
    const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
        setTasks(
            tasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">المهام</h1>
                <p className="text-gray-600 mt-1">تنظيم وتتبع مهام الفريق</p>
            </div>

            {/* Filter & Add Button */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                {/* Filter */}
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">جميع الأعضاء</option>
                        {teamMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Add Task Button */}
                <button
                    onClick={() => setIsNewTaskDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    مهمة جديدة
                </button>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                    <TaskColumn
                        key={status}
                        title={status as TaskStatus}
                        tasks={statusTasks}
                        count={statusTasks.length}
                        onDeleteTask={handleDeleteTask}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                    />
                ))}
            </div>

            {/* New Task Dialog */}
            {isNewTaskDialogOpen && (
                <NewTaskDialog
                    onClose={() => setIsNewTaskDialogOpen(false)}
                    onCreate={handleCreateTask}
                />
            )}
        </div>
    );
}

// Task Column Component
function TaskColumn({
    title,
    tasks,
    count,
    onDeleteTask,
    onUpdateTaskStatus,
}: {
    title: TaskStatus;
    tasks: Task[];
    count: number;
    onDeleteTask: (taskId: string) => void;
    onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}) {
    const statusColors = {
        "قيد الانتظار": "bg-gray-100 border-gray-300",
        "قيد التنفيذ": "bg-blue-50 border-blue-300",
        مكتملة: "bg-emerald-50 border-emerald-300",
    };

    return (
        <div className="flex flex-col">
            <div
                className={`rounded-xl border-2 p-4 mb-3 ${statusColors[title]}`}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <span className="px-2.5 py-1 bg-white rounded-full text-sm font-semibold text-gray-700">
                        {count}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={onDeleteTask}
                        onUpdateStatus={onUpdateTaskStatus}
                    />
                ))}
            </div>
        </div>
    );
}

// Task Card Component
function TaskCard({
    task,
    onDelete,
    onUpdateStatus,
}: {
    task: Task;
    onDelete: (taskId: string) => void;
    onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}) {
    const assignee = getTeamMemberById(task.assignee);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const priorityStyles = {
        عالية: "bg-red-100 text-red-700 border-red-300",
        متوسطة: "bg-yellow-100 text-yellow-700 border-yellow-300",
        منخفضة: "bg-green-100 text-green-700 border-green-300",
    };

    const statuses: TaskStatus[] = ["قيد الانتظار", "قيد التنفيذ", "مكتملة"];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow relative group">
            {/* Delete Button */}
            <button
                onClick={() => onDelete(task.id)}
                className="absolute top-2 left-2 p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                title="حذف المهمة"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <h3 className="font-semibold text-gray-900 mb-2 pr-6">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>

            <div className="flex items-center justify-between">
                {/* Assignee */}
                {assignee && (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: assignee.avatar }}
                        >
                            {assignee.name.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-600">{assignee.name}</span>
                    </div>
                )}

                {/* Priority Badge */}
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityStyles[task.priority]
                        }`}
                >
                    {task.priority}
                </span>
            </div>

            {/* Status Change Dropdown */}
            <div className="mt-3 pt-3 border-t border-gray-100 relative">
                <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="w-full text-right text-xs text-gray-500 hover:text-emerald-600 font-medium flex items-center justify-between"
                >
                    <span>نقل إلى...</span>
                    <span className="text-emerald-600">{task.status}</span>
                </button>

                {/* Dropdown Menu */}
                {showStatusMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    onUpdateStatus(task.id, status);
                                    setShowStatusMenu(false);
                                }}
                                className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${task.status === status
                                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                                        : "text-gray-700"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// New Task Dialog Component
function NewTaskDialog({
    onClose,
    onCreate,
}: {
    onClose: () => void;
    onCreate: (task: Omit<Task, "id">) => void;
}) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assignee: teamMembers[0]?.id || "",
        priority: "متوسطة" as Priority,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("يرجى إدخال عنوان المهمة");
            return;
        }

        onCreate({
            ...formData,
            status: "قيد الانتظار",
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">مهمة جديدة</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            عنوان المهمة <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="مثال: تسجيل الدرس الجديد"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الوصف
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            placeholder="وصف تفصيلي للمهمة..."
                        />
                    </div>

                    {/* Assignee */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            المكلف بالمهمة
                        </label>
                        <select
                            value={formData.assignee}
                            onChange={(e) =>
                                setFormData({ ...formData, assignee: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {teamMembers.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name} - {member.role}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الأولوية
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) =>
                                setFormData({ ...formData, priority: e.target.value as Priority })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="عالية">عالية</option>
                            <option value="متوسطة">متوسطة</option>
                            <option value="منخفضة">منخفضة</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                        >
                            إضافة المهمة
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
