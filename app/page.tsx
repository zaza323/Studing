"use client";

import { useState, useEffect } from "react";
import MetricCard from "@/components/MetricCard";
import ActivityFeed from "@/components/ActivityFeed";
import {
  DollarSign,
  CheckSquare,
  Calendar,
  TrendingUp,
  Package,
  Users,
  Plus,
  Loader2,
  Pencil
} from "lucide-react";

type Asset = {
  _id: string;
  id?: string;
  price: number;
};

type Task = {
  _id: string;
  id?: string;
  status: "قيد الانتظار" | "قيد التنفيذ" | "مكتملة";
};

const getTodayDateInput = () => new Date().toISOString().slice(0, 10);

const getDaysUntilLaunch = (launchDateString: string, now: Date) => {
  const launchDate = new Date(launchDateString);
  if (Number.isNaN(launchDate.getTime())) {
    return 0;
  }
  const diffTime = launchDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [launchDate, setLaunchDate] = useState(getTodayDateInput);
  const [now, setNow] = useState(() => new Date());
  const [totalBudget, setTotalBudget] = useState(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetValue, setNewBudgetValue] = useState(0);
  const [stats, setStats] = useState({
    budgetSpent: 0,
    activeTasks: 0,
    totalTasks: 0,
    completedTasks: 0
  });

  useEffect(() => {
    const storedLaunchDate = localStorage.getItem("launchDate");
    if (storedLaunchDate) {
      setLaunchDate(storedLaunchDate);
    }
    const storedTotalBudget = localStorage.getItem("totalBudget");
    if (storedTotalBudget) {
      const parsedBudget = Number(storedTotalBudget);
      if (!Number.isNaN(parsedBudget)) {
        setTotalBudget(parsedBudget);
        setNewBudgetValue(parsedBudget);
      }
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, tasksRes] = await Promise.all([
          fetch("/api/assets"),
          fetch("/api/tasks")
        ]);

        if (assetsRes.ok && tasksRes.ok) {
          const assets: Asset[] = await assetsRes.json();
          const tasks: Task[] = await tasksRes.json();

          const budgetSpent = assets.reduce((sum, asset) => sum + asset.price, 0);
          const activeTasks = tasks.filter((task) => task.status !== "مكتملة").length;
          const completedTasks = tasks.filter((task) => task.status === "مكتملة").length;

          setStats({
            budgetSpent,
            activeTasks,
            totalTasks: tasks.length,
            completedTasks
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const budgetRemaining = totalBudget - stats.budgetSpent;
  const daysUntilLaunch = getDaysUntilLaunch(launchDate, now);

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
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-1">
          مرحباً بك! إليك نظرة عامة على فريقك.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
          <button
            onClick={() => setIsEditingBudget(true)}
            className="absolute bottom-4 left-4 p-1.5 bg-white/70 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الميزانية</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${totalBudget.toLocaleString()}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-1 text-sm text-gray-500">
                <div>المستخدمة: ${stats.budgetSpent.toLocaleString()}</div>
                <div>المتبقية: ${budgetRemaining.toLocaleString()}</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        <MetricCard
          title="المهام النشطة"
          value={stats.activeTasks}
          subtitle={`${stats.totalTasks} إجمالي المهام`}
          icon={CheckSquare}
          iconColor="text-blue-600"
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">أيام حتى الإطلاق</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{daysUntilLaunch}</p>
              <div className="mt-2">
                <p className="text-xs text-gray-500">تاريخ الإطلاق</p>
                <input
                  type="date"
                  value={launchDate}
                  onChange={(event) => {
                    setLaunchDate(event.target.value);
                    localStorage.setItem("launchDate", event.target.value);
                  }}
                  className="mt-1 w-full max-w-[180px] rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700"
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            icon={Package}
            label="إضافة أصل"
            href="/assets"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">حالة المشروع</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusItem
              label="ميزانية المعدات"
              percentage={totalBudget > 0 ? Math.round((stats.budgetSpent / totalBudget) * 100) : 0}
              color="emerald"
            />
            <StatusItem
              label="المهام المكتملة"
              percentage={stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}
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
        <ActivityFeed />
      </div>

      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">تعديل الميزانية</h3>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newBudgetValue}
              onChange={(e) => setNewBudgetValue(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="أدخل الميزانية الجديدة"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditingBudget(false);
                  setNewBudgetValue(totalBudget);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setTotalBudget(newBudgetValue);
                  localStorage.setItem("totalBudget", String(newBudgetValue));
                  setIsEditingBudget(false);
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
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
