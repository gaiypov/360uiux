'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Mon', value: 57 },
  { name: 'Tue', value: 44 },
  { name: 'Wed', value: -81 },
  { name: 'Thu', value: -37 },
  { name: 'Fri', value: 53 },
  { name: 'Sat', value: 46 },
  { name: 'Sun', value: 77 },
];

export function PerformanceChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Performance Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8E7FFF" />
                <stop offset="100%" stopColor="#39E0F8" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.4)"
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.4)"
              tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A23',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#FAFAFA',
              }}
              formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'Change']}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value > 0 ? 'url(#colorBar)' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
