import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    color: string;
  };
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-blue-500/20",
  iconColor = "text-blue-400",
  trend,
  subtitle,
}: StatsCardProps) {
  return (
    <Card className="bg-fundry-navy border-fundry-navy hover:shadow-xl transition-all duration-300 shadow-lg group hover:scale-105">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-slate-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">{title}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-fundry-orange transition-colors duration-300">{value}</p>
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBgColor} rounded-xl flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            <Icon size={20} className="sm:w-6 sm:h-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 sm:mt-4 flex items-center flex-wrap gap-1">
            <span className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${trend.color} bg-opacity-10`}>
              {trend.value}
            </span>
            {subtitle && (
              <span className="text-slate-400 text-xs sm:text-sm">
                {subtitle}
              </span>
            )}
          </div>
        )}
        {subtitle && !trend && (
          <div className="mt-3 sm:mt-4">
            <span className="text-slate-400 text-xs sm:text-sm font-medium">
              {subtitle}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
