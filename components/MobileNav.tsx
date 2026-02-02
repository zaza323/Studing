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
        name: "الرئيسية",
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
        name: "الجدول",
        href: "/timeline",
        icon: Calendar,
    },
    {
        name: "الميزانية",
        href: "/budget",
        icon: DollarSign,
    },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium transition-colors",
                                isActive
                                    ? "text-emerald-600"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px]">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
