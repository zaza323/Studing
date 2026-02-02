import { milestones } from "@/lib/store";
import { Calendar, CheckCircle2, Clock, Circle } from "lucide-react";

export default function TimelinePage() {
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">الجدول الزمني</h1>
                <p className="text-gray-600 mt-1">خارطة طريق المشروع والمعالم الرئيسية</p>
            </div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-gray-200" />

                    {/* Milestones */}
                    <div className="space-y-8">
                        {milestones.map((milestone, index) => (
                            <MilestoneCard
                                key={milestone.id}
                                milestone={milestone}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MilestoneCard({
    milestone,
    index,
}: {
    milestone: any;
    index: number;
}) {
    const getStatusIcon = () => {
        if (milestone.isComplete) {
            return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
        } else if (milestone.isCurrent) {
            return <Clock className="w-6 h-6 text-blue-600" />;
        } else {
            return <Circle className="w-6 h-6 text-gray-400" />;
        }
    };

    const getCardStyle = () => {
        if (milestone.isComplete) {
            return "border-emerald-300 bg-emerald-50";
        } else if (milestone.isCurrent) {
            return "border-blue-300 bg-blue-50 shadow-md";
        } else {
            return "border-gray-200 bg-white";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="relative flex gap-6 items-start">
            {/* Icon Circle */}
            <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                {getStatusIcon()}
            </div>

            {/* Content Card */}
            <div className={`flex-1 rounded-xl border-2 p-6 ${getCardStyle()}`}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {milestone.phase}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}
                            </span>
                        </div>
                    </div>

                    {milestone.isCurrent && (
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                            المرحلة الحالية
                        </span>
                    )}
                    {milestone.isComplete && (
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                            مكتملة
                        </span>
                    )}
                </div>

                <p className="text-gray-700">{milestone.description}</p>
            </div>
        </div>
    );
}
