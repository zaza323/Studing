"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ActivityItem {
    _id?: string;
    action: string;
    entity: string;
    description: string;
    user: string;
    createdAt: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async (showLoading: boolean) => {
            if (showLoading) {
                setIsLoading(true);
            }
            try {
                const response = await fetch("/api/activities");
                if (response.ok) {
                    const data: ActivityItem[] = await response.json();
                    setActivities(data);
                } else {
                    setActivities([]);
                }
            } catch {
                setActivities([]);
            } finally {
                if (showLoading) {
                    setIsLoading(false);
                }
            }
        };

        fetchActivities(true);
        const intervalId = setInterval(() => fetchActivities(false), 15000);
        const handleFocus = () => fetchActivities(false);
        window.addEventListener("focus", handleFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
        };
    }, []);

    const formatDate = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleString("ar-EG");
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">آخر الأنشطة</h2>
            </div>
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="text-sm text-gray-500">لا توجد أنشطة بعد</div>
            ) : (
                <ul className="space-y-3">
                    {activities.map((activity) => (
                        <li
                            key={activity._id ?? `${activity.entity}-${activity.createdAt}`}
                            className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                            <div className="text-sm font-semibold text-gray-800">
                                {activity.description}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span>{activity.entity}</span>
                                <span>•</span>
                                <span>{activity.action}</span>
                                <span>•</span>
                                <span>{activity.user}</span>
                                <span>•</span>
                                <span>{formatDate(activity.createdAt)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
