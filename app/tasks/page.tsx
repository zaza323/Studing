"use client";

import { useState } from "react";
import { tasks, teamMembers, getTeamMemberById } from "@/lib/store";
import type { TaskStatus } from "@/lib/store";
import { Filter } from "lucide-react";

export default function TasksPage() {
    const [selectedMember, setSelectedMember] = useState<string>("all");

    const filteredTasks =
        selectedMember === "all"
            ? tasks
            : tasks.filter((task) => task.assignee === selectedMember);

    const tasksByStatus = {
        "قيد الانتظار": filteredTasks.filter((t) => t.status === "قيد الانتظار"),
        "قيد التنفيذ": filteredTasks.filter((t) => t.status === "قيد التنفيذ"),
        مكتملة: filteredTasks.filter((t) => t.status === "مكتملة"),
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">المهام</h1>
                <p className="text-gray-600 mt-1">تنظيم وتتبع مهام الفريق</p>
            </div>

            {/* Filter */}
            <div className="mb-6 flex items-center gap-3">
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

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                    <TaskColumn
                        key={status}
                        title={status}
                        tasks={statusTasks}
                        count={statusTasks.length}
                    />
                ))}
            </div>
        </div>
    );
}

function TaskColumn({
    title,
    tasks,
    count,
}: {
    title: string;
    tasks: any[];
    count: number;
}) {
    const statusColors = {
        "قيد الانتظار": "bg-gray-100 border-gray-300",
        "قيد التنفيذ": "bg-blue-50 border-blue-300",
        مكتملة: "bg-emerald-50 border-emerald-300",
    };

    return (
        <div className="flex flex-col">
            <div
                className={`rounded-xl border-2 p-4 mb-3 ${statusColors[title as keyof typeof statusColors]
                    }`}
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
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}

function TaskCard({ task }: { task: any }) {
    const assignee = getTeamMemberById(task.assignee);

    const priorityStyles = {
        عالية: "bg-red-100 text-red-700 border-red-300",
        متوسطة: "bg-yellow-100 text-yellow-700 border-yellow-300",
        منخفضة: "bg-green-100 text-green-700 border-green-300",
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
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
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityStyles[task.priority as keyof typeof priorityStyles]
                        }`}
                >
                    {task.priority}
                </span>
            </div>
        </div>
    );
}
