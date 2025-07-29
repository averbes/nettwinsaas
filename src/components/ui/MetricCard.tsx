import React from 'react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  className?: string;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  className = '',
  description,
}) => {
  const changeColor = {
    increase: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    decrease: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    neutral: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50',
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700',
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <span
                className={cn(
                  'ml-2 text-sm font-medium inline-flex items-center px-1.5 py-0.5 rounded',
                  changeColor[changeType]
                )}
              >
                {changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : '→'} {change}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
