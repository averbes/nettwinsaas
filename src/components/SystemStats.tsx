import React from 'react';
import { Cpu, HardDrive, Database, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface SystemStat {
  name: string;
  value: string | number;
  icon: React.ElementType;
  status: 'low' | 'medium' | 'high';
  description?: string;
}
interface SystemStatsProps {
  stats: SystemStat[];
  className?: string;
}

export const SystemStats: React.FC<SystemStatsProps> = ({ stats, className = '' }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700', className)}>
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Resources</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={cn(
                    'h-12 w-12 rounded-full flex items-center justify-center',
                    getStatusColor(stat.status)
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <span className={cn(
                      'ml-2 text-xs font-medium px-2 py-0.5 rounded-full',
                      getStatusColor(stat.status)
                    )}>
                      {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
                    </span>
                  </div>
                  {stat.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {stat.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemStats;
