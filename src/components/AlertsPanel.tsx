import React from 'react';
import { AlertTriangle, XCircle, Info, CheckCircle, BellRing } from 'lucide-react';
import { cn } from '../lib/utils';

export interface AlertItem {
  id: string | number;
  title: string;
  description: string;
  timestamp: Date | string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  acknowledged: boolean;
  source?: string;
}

interface AlertsPanelProps {
  alerts: AlertItem[];
  maxItems?: number;
  onAcknowledge?: (id: string | number) => void;
  className?: string;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return XCircle;
    case 'high':
    case 'medium':
      return AlertTriangle;
    case 'low':
      return Info;
    default:
      return BellRing;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  maxItems = 5,
  onAcknowledge,
  className = '',
}) => {
  const displayedAlerts = alerts.slice(0, maxItems);

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700', className)}>
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Alerts</h3>
        <div className="flex items-center">
          <BellRing className="h-5 w-5 text-gray-400" />
          {alerts.length > 0 && (
            <span className="ml-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
              {alerts.length}
            </span>
          )}
        </div>
      </div>
      
      {displayedAlerts.length > 0 ? (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {displayedAlerts.map((alert) => {
            const Icon = getSeverityIcon(alert.severity);
            
            return (
              <li key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center',
                      getSeverityColor(alert.severity)
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {alert.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getSeverityColor(alert.severity)
                      )}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                      {onAcknowledge && !alert.acknowledged && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.acknowledged && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="p-6 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No alerts</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All systems are functioning normally.
          </p>
        </div>
      )}
      
      {alerts.length > maxItems && (
        <div className="px-6 py-3 text-center border-t border-gray-100 dark:border-gray-700">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            View all alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
