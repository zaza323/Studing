import { equipment, budget, getEquipmentBudgetUsed, getTotalEquipmentCost } from "@/lib/store";
import { Package } from "lucide-react";

export default function InventoryPage() {
    const budgetUsed = getEquipmentBudgetUsed();
    const totalEquipmentCost = getTotalEquipmentCost();
    const budgetPercentage = Math.round((budgetUsed / budget.totalBudget) * 100);

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">المعدات</h1>
                <p className="text-gray-600 mt-1">
                    تتبع معدات الاستوديو وإدارة الميزانية
                </p>
            </div>

            {/* Budget Progress Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900">ميزانية المعدات</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                        <p className="text-sm text-gray-600">الميزانية المستخدمة</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${budgetUsed.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">إجمالي تكلفة المعدات</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${totalEquipmentCost.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">من الميزانية الكلية</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {budgetPercentage}%
                        </p>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                        style={{ width: `${budgetPercentage}%` }}
                    />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    ${(budget.totalBudget - budgetUsed).toLocaleString()} متبقية من الميزانية الكلية
                </p>
            </div>

            {/* Equipment Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    اسم العنصر
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الفئة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    السعر
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    المالك
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {equipment.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{item.category}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">
                                            ${item.price.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{item.owner}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        "للشراء": "bg-gray-100 text-gray-700 border-gray-300",
        "تم الطلب": "bg-yellow-100 text-yellow-700 border-yellow-300",
        "تم الاستلام": "bg-emerald-100 text-emerald-700 border-emerald-300",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]
                }`}
        >
            {status}
        </span>
    );
}
