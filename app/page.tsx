import MetricCard from "@/components/MetricCard";
import {
  DollarSign,
  CheckSquare,
  Calendar,
  TrendingUp,
  Package,
  Users,
  Plus,
} from "lucide-react";
import {
  budget,
  getTotalOneTimeCosts,
  getTotalMonthlyCosts,
  tasks,
  getDaysUntilLaunch,
} from "@/lib/store";

export default function Home() {
  const totalOneTime = getTotalOneTimeCosts();
  const budgetSpent = totalOneTime;
  const budgetRemaining = budget.totalBudget - budgetSpent;
  const activeTasks = tasks.filter((task) => task.status !== "مكتملة").length;
  const daysUntilLaunch = getDaysUntilLaunch();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-1">
          مرحباً بك! إليك نظرة عامة على فريقك.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="الميزانية المستخدمة"
          value={`$${budgetSpent.toLocaleString()}`}
          subtitle={`$${budgetRemaining.toLocaleString()} متبقية`}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="المهام النشطة"
          value={activeTasks}
          subtitle={`${tasks.length} إجمالي المهام`}
          icon={CheckSquare}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="أيام حتى الإطلاق"
          value={daysUntilLaunch}
          subtitle="هدف المرحلة 3"
          icon={Calendar}
          iconColor="text-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            icon={Package}
            label="إضافة معدات"
            href="/inventory"
          />
          <QuickActionButton
            icon={Plus}
            label="إنشاء مهمة"
            href="/tasks"
          />
          <QuickActionButton
            icon={Calendar}
            label="عرض الجدول الزمني"
            href="/timeline"
          />
          <QuickActionButton
            icon={TrendingUp}
            label="تحليل الميزانية"
            href="/budget"
          />
        </div>
      </div>

      {/* Team Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">حالة المشروع</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusItem
            label="ميزانية المعدات"
            percentage={Math.round((budgetSpent / budget.totalBudget) * 100)}
            color="emerald"
          />
          <StatusItem
            label="المهام المكتملة"
            percentage={Math.round(
              (tasks.filter((t) => t.status === "مكتملة").length / tasks.length) *
              100
            )}
            color="blue"
          />
          <StatusItem
            label="تقدم المشروع"
            percentage={40}
            color="purple"
            subtitle="المرحلة 2 من 3"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group"
    >
      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-medium text-gray-700 group-hover:text-gray-900">
        {label}
      </span>
    </a>
  );
}

function StatusItem({
  label,
  percentage,
  color,
  subtitle,
}: {
  label: string;
  percentage: number;
  color: string;
  subtitle?: string;
}) {
  const colorClasses = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-sm font-bold text-gray-900">{percentage}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
