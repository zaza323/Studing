"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    CheckSquare,
    Calendar,
    DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        name: "لوحة التحكم",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        name: "المعدات",
        href: "/inventory",
        icon: Package,
    },
    {
        name: "المهام",
        href: "/tasks",
        icon: CheckSquare,
    },
    {
        name: "الجدول الزمني",
        href: "/timeline",
        icon: Calendar,
    },
    {
        name: "الميزانية",
        href: "/budget",
        icon: DollarSign,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-l border-gray-200">
            {/* Logo / Brand */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">ت</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">نظام الفريق</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    لوحة التحكم - الاستوديو التعليمي
                </div>
            </div>
        </aside>
    );
}
