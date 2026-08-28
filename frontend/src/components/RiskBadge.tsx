interface RiskBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
};

const sizeMap: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export default function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorMap[level] || 'bg-gray-100 text-gray-800'} ${sizeMap[size]}`}>
      {level}
    </span>
  );
}
