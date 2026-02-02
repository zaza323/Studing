"use client";

import {
    budget,
    getTotalOneTimeCosts,
    getTotalMonthlyCosts,
    getBreakEvenStudents,
} from "@/lib/store";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function BudgetPage() {
    const totalOneTime = getTotalOneTimeCosts();
    const totalMonthly = getTotalMonthlyCosts();
    const breakEvenStudents = getBreakEvenStudents();

    // بيانات الرسم البياني
    const chartData = budget.oneTimeCosts.map((cost) => ({
        name: cost.category,
        value: cost.amount,
    }));

    const COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899"];

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">الميزانية</h1>
                <p className="text-gray-600 mt-1">
                    حاسبة الميزانية وتحليل التكاليف
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard
                    title="إجمالي التكاليف لمرة واحدة"
                    value={`$${totalOneTime.toLocaleString()}`}
                    subtitle="معدات الاستوديو"
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                />
                <SummaryCard
                    title="التكاليف الشهرية"
                    value={`$${totalMonthly.toLocaleString()}`}
                    subtitle="التكاليف التشغيلية"
                    icon={TrendingUp}
                    iconColor="text-blue-600"
                />
                <SummaryCard
                    title="نقطة التعادل"
                    value={`${breakEvenStudents}`}
                    subtitle="طالب شهرياً"
                    icon={Users}
                    iconColor="text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* One-Time Costs Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        تفصيل التكاليف لمرة واحدة
                    </h2>
                    <div className="space-y-3">
                        {budget.oneTimeCosts.map((cost, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <span className="text-gray-700">{cost.category}</span>
                                <span className="font-semibold text-gray-900">
                                    ${cost.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                        <div className="border-t-2 border-gray-200 pt-3 mt-3">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                <span className="font-bold text-gray-900">الإجمالي</span>
                                <span className="font-bold text-emerald-600 text-lg">
                                    ${totalOneTime.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Costs Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        تفصيل التكاليف الشهرية
                    </h2>
                    <div className="space-y-3">
                        {budget.monthlyCosts.map((cost, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <span className="text-gray-700">{cost.category}</span>
                                <span className="font-semibold text-gray-900">
                                    ${cost.amount.toLocaleString()}/شهر
                                </span>
                            </div>
                        ))}
                        <div className="border-t-2 border-gray-200 pt-3 mt-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <span className="font-bold text-gray-900">الإجمالي الشهري</span>
                                <span className="font-bold text-blue-600 text-lg">
                                    ${totalMonthly.toLocaleString()}/شهر
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expense Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        توزيع نفقات المعدات
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `$${value.toLocaleString()}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Break-Even Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        تحليل نقطة التعادل
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">الإيرادات لكل طالب</p>
                            <p className="text-2xl font-bold text-purple-600">
                                ${budget.revenuePerStudent}/شهر
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">
                                التكاليف الشهرية الإجمالية
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                ${totalMonthly}/شهر
                            </p>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-300">
                            <p className="text-sm text-gray-600 mb-1">
                                عدد الطلاب المطلوب لتغطية التكاليف
                            </p>
                            <p className="text-3xl font-bold text-emerald-600">
                                {breakEvenStudents} طالب
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">الأهداف المحتملة:</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>20 طالب:</span>
                                    <span className="font-semibold text-emerald-600">
                                        $
                                        {(20 * budget.revenuePerStudent - totalMonthly).toLocaleString()}
                                        /شهر
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>50 طالب:</span>
                                    <span className="font-semibold text-emerald-600">
                                        $
                                        {(50 * budget.revenuePerStudent - totalMonthly).toLocaleString()}
                                        /شهر
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>100 طالب:</span>
                                    <span className="font-semibold text-emerald-600">
                                        $
                                        {(100 * budget.revenuePerStudent - totalMonthly).toLocaleString()}
                                        /شهر
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    );
}
