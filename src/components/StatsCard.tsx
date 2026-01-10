import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor }: StatsCardProps) {
  const getChangeColor = () => {
    if (changeType === "positive") return "text-green";
    if (changeType === "negative") return "text-red";
    return "text-muted";
  };

  return (
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-card-title">{title}</div>
        <div className="stats-card-value">{value}</div>
        {change && (
          <div className={`stats-card-change ${getChangeColor()}`}>
            {change}
          </div>
        )}
      </div>
      <div className={`stats-card-icon ${iconColor}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
