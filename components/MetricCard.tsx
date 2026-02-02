import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    iconColor?: string;
}

export default function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = "text-emerald-600",
}: MetricCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-emerald-50 ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
