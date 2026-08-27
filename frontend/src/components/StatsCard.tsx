import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
};

export default function StatsCard({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  subtitle,
  color = 'blue',
}: StatsCardProps) {
  const colors = colorMap[color] || colorMap.blue;

  const changeColor =
    changeType === 'positive'
      ? 'text-emerald-600 bg-emerald-50'
      : changeType === 'negative'
        ? 'text-red-600 bg-red-50'
        : 'text-gray-500 bg-gray-50';

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          )}
          {change && (
            <span
              className={`mt-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${changeColor}`}
            >
              {change}
            </span>
          )}
        </div>
        {icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg} transition-colors group-hover:scale-105`}
          >
            <div className={colors.icon}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}
