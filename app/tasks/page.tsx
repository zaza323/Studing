"use client";

import { useState, useEffect } from "react";
import { Filter, Plus, Trash2, X, Loader2 } from "lucide-react";

type TaskStatus = "قيد الانتظار" | "قيد التنفيذ" | "مكتملة";
type Priority = "عالية" | "متوسطة" | "منخفضة";

interface Task {
    _id: string;
    id?: string;
    title: string;
    description: string;
    status: TaskStatus;
    assignee: string;
    priority: Priority;
}

type AssigneeInfo = {
    name: string;
    avatar?: string;
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<string>("all");
    const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
    const assigneeOptions = ["مريم الملي", "محمد ظاظا"];
    const assigneeLookup: Record<string, AssigneeInfo> = {
        "مريم الملي": { name: "مريم الملي", avatar: "#06b6d4" },
        "محمد ظاظا": { name: "محمد ظاظا", avatar: "#10b981" },
    };

    // Fetch Tasks
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/tasks");
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setIsLoading(false);
        }
    };

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
    const handleCreateTask = async (newTask: Omit<Task, "_id" | "id">) => {
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });
            if (res.ok) {
                const savedTask = await res.json();
                setTasks([...tasks, savedTask]);
                setIsNewTaskDialogOpen(false);
            }
        } catch (error) {
            console.error("Failed to create task", error);
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId: string) => {
        if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
            try {
                const res = await fetch(`/api/tasks/${taskId}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    setTasks(tasks.filter((task) => task._id !== taskId));
                }
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }
    };

    // Update task status
    const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                const updatedTask = await res.json();
                setTasks(
                    tasks.map((task) =>
                        task._id === taskId ? updatedTask : task
                    )
                );
            }
        } catch (error) {
            console.error("Failed to update task status", error);
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
                        {assigneeOptions.map((assignee) => (
                            <option key={assignee} value={assignee}>
                                {assigneeLookup[assignee]?.name ?? assignee}
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
                        assigneeLookup={assigneeLookup}
                    />
                ))}
            </div>

            {/* New Task Dialog */}
            {isNewTaskDialogOpen && (
                <NewTaskDialog
                    onClose={() => setIsNewTaskDialogOpen(false)}
                    onCreate={handleCreateTask}
                    assigneeOptions={assigneeOptions}
                    assigneeLookup={assigneeLookup}
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
    assigneeLookup,
}: {
    title: TaskStatus;
    tasks: Task[];
    count: number;
    onDeleteTask: (taskId: string) => void;
    onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
    assigneeLookup: Record<string, AssigneeInfo>;
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
                        key={task._id}
                        task={task}
                        onDelete={onDeleteTask}
                        onUpdateStatus={onUpdateTaskStatus}
                        assigneeLookup={assigneeLookup}
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
    assigneeLookup,
}: {
    task: Task;
    onDelete: (taskId: string) => void;
    onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
    assigneeLookup: Record<string, AssigneeInfo>;
}) {
    const assignee = task.assignee
        ? assigneeLookup[task.assignee] ?? { name: task.assignee }
        : undefined;
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
                onClick={() => onDelete(task._id)}
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
                            style={{ backgroundColor: assignee.avatar ?? "#9ca3af" }}
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
                                    onUpdateStatus(task._id, status);
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
    assigneeOptions,
    assigneeLookup,
}: {
    onClose: () => void;
    onCreate: (task: Omit<Task, "_id" | "id">) => void;
    assigneeOptions: string[];
    assigneeLookup: Record<string, AssigneeInfo>;
}) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assignee: assigneeOptions[0] ?? "",
        priority: "متوسطة" as Priority,
    });
    const effectiveAssignee = formData.assignee || assigneeOptions[0] || "";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("يرجى إدخال عنوان المهمة");
            return;
        }

        onCreate({
            ...formData,
            assignee: effectiveAssignee,
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
                        {assigneeOptions.length > 0 ? (
                            <select
                                value={effectiveAssignee}
                                onChange={(e) =>
                                    setFormData({ ...formData, assignee: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {assigneeOptions.map((assignee) => (
                                    <option key={assignee} value={assignee}>
                                        {assigneeLookup[assignee]?.name ?? assignee}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={formData.assignee}
                                onChange={(e) =>
                                    setFormData({ ...formData, assignee: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="اسم المكلف"
                            />
                        )}
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
