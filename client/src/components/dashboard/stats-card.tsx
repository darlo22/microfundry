import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  subtitle?: string;
  trend?: {
    value: string;
    color: string;
  };
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  subtitle,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={iconColor} size={20} />
          </div>
        </div>
        {(trend || subtitle) && (
          <div className="mt-4 flex items-center">
            {trend && (
              <span className={`text-sm font-medium ${trend.color}`}>
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-gray-500 text-sm ml-2">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
