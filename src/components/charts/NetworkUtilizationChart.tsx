import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

interface NetworkUtilizationChartProps {
  data: Array<{
    timestamp: Date | string;
    utilization: number;
    throughput: number;
  }>;
  height?: number;
  showThroughput?: boolean;
}

export const NetworkUtilizationChart: React.FC<NetworkUtilizationChartProps> = ({
  data,
  height = 300,
  showThroughput = true,
}) => {
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'HH:mm');
  };

  const formatTooltipDate = (date: Date | string) => {
    return format(new Date(date), 'PPpp');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatTooltipDate(label)}
          </p>
          <div className="mt-1 space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Utilization: <span className="font-medium">{(payload[0].value * 100).toFixed(1)}%</span>
            </p>
            {showThroughput && (
              <p className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Throughput: <span className="font-medium">{payload[1]?.value?.toFixed(2)} Gbps</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            {showThroughput && (
              <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDate}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="utilization"
            orientation="left"
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            domain={[0, 1]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          {showThroughput && (
            <YAxis
              yAxisId="throughput"
              orientation="right"
              tickFormatter={(value) => `${value} Gbps`}
              domain={[0, 10]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="utilization"
            type="monotone"
            dataKey="utilization"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#utilizationGradient)"
            strokeWidth={2}
            activeDot={{ r: 4 }}
          />
          {showThroughput && (
            <Area
              yAxisId="throughput"
              type="monotone"
              dataKey="throughput"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#throughputGradient)"
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetworkUtilizationChart;
