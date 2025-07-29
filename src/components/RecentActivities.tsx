import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ActivityItem {
  id: string | number;
  type: 'simulation' | 'alert' | 'config' | 'system';
  title: string;
  description?: string;
  timestamp: Date | string;
  status: 'success' | 'warning' | 'error' | 'info' | 'running';
}

interface RecentActivitiesProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Activity,
  running: Clock,
};

const statusColors = {
  success: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  warning: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  error: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  running: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
};

const typeLabels = {
  simulation: 'Simulation',
  alert: 'Alert',
  config: 'Configuration',
  system: 'System',};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  maxItems = 5,
  className = '',
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 
          ? `1 ${unit} ago` 
          : `${interval} ${unit}s ago`;
      }
    }
    
    return 'just now';
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700', className)}>
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activities</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {displayedActivities.length > 0 ? (
          displayedActivities.map((activity) => {
            const StatusIcon = statusIcons[activity.status] || Activity;
            
            return (
              <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center',
                      statusColors[activity.status]
                    )}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {activity.description}
                      </p>
                    )}
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {typeLabels[activity.type]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activities</p>
          </div>
        )}
      </div>
      {activities.length > maxItems && (
        <div className="px-6 py-3 text-center border-t border-gray-100 dark:border-gray-700">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            View all activities
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
