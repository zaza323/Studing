"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Package,
    CheckSquare,
    Calendar,
    DollarSign,
    Lightbulb,
    Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset as BaseAsset, MonthlyExpense as BaseMonthlyExpense } from "@/lib/store";

const navItems = [
    {
        name: "لوحة التحكم",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        name: "الأصول والممتلكات",
        href: "/assets",
        icon: Package,
    },
    {
        name: "المصاريف الشهرية",
        href: "/expenses",
        icon: Receipt,
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
    {
        name: "الاستراتيجية",
        href: "/strategy",
        icon: Lightbulb,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [assetTotals, setAssetTotals] = useState<Record<string, number>>({});
    const [expenseTotals, setExpenseTotals] = useState<Record<string, number>>({});
    const formatAmount = (value: number) => value.toLocaleString("ar-EG");

    const categories = [
        { id: "Production", label: "إنتاج وتصوير" },
        { id: "Infrastructure", label: "بنية تحتية" },
        { id: "Electronics", label: "أجهزة إلكترونية" },
        { id: "Licenses", label: "تراخيص" },
        { id: "Furniture", label: "الأثاث" },
    ];

    const expenseCategories = [
        { id: "Software", label: "الخدمات والاشتراكات الرقمية" },
        { id: "Utilities", label: "خدمات أساسية" },
        { id: "Other", label: "رواتب الموظفين" },
    ];

    useEffect(() => {
        const fetchTotals = async () => {
            try {
                const [assetsRes, expensesRes] = await Promise.all([
                    fetch("/api/assets"),
                    fetch("/api/expenses"),
                ]);

                if (assetsRes.ok) {
                    const assets: Array<BaseAsset & { _id?: string }> = await assetsRes.json();
                    const totals = assets.reduce<Record<string, number>>((acc, item) => {
                        acc[item.category] = (acc[item.category] ?? 0) + item.price;
                        return acc;
                    }, {});
                    setAssetTotals(totals);
                }

                if (expensesRes.ok) {
                    const expenses: Array<BaseMonthlyExpense & { _id?: string }> = await expensesRes.json();
                    const totals = expenses.reduce<Record<string, number>>((acc, item) => {
                        acc[item.category] = (acc[item.category] ?? 0) + item.amount;
                        return acc;
                    }, {});
                    setExpenseTotals(totals);
                }
            } catch {
                setAssetTotals({});
                setExpenseTotals({});
            }
        };

        fetchTotals();
    }, []);

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-l border-gray-200">
            {/* Logo / Brand */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-gray-900">نظام الإدارة</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    const isAssets = item.href === "/assets";
                    const isExpenses = item.href === "/expenses";

                    return (
                        <div key={item.href}>
                            <Link
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

                            {/* Smart Sub-menu for Assets */}
                            {isAssets && pathname.startsWith("/assets") && (
                                <div className="mr-9 mt-1 space-y-1 border-r-2 border-gray-100 pr-2">
                                    {categories.map((cat) => {
                                        const total = assetTotals[cat.id] ?? 0;
                                        return (
                                            <Link
                                                key={cat.id}
                                                href={`/assets?category=${cat.id}`}
                                                className="block px-3 py-2 rounded-md hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-xs font-medium text-gray-600 group-hover:text-emerald-700">
                                                        ↳ {cat.label}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium group-hover:text-emerald-600">
                                                        ${formatAmount(total)}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Smart Sub-menu for Expenses */}
                            {isExpenses && pathname.startsWith("/expenses") && (
                                <div className="mr-9 mt-1 space-y-1 border-r-2 border-gray-100 pr-2">
                                    {expenseCategories.map((cat) => {
                                        const total = expenseTotals[cat.id] ?? 0;
                                        return (
                                            <Link
                                                key={cat.id}
                                                href={`/expenses?category=${cat.id}`}
                                                className="block px-3 py-2 rounded-md hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-xs font-medium text-gray-600 group-hover:text-emerald-700">
                                                        ↳ {cat.label}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium group-hover:text-emerald-600">
                                                        ${formatAmount(total)}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
