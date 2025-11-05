'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Sales', value: 80.8 },
  { name: 'Remaining', value: 19.2 },
];

const COLORS = ['#8E7FFF', '#1A1A23'];

export function DonutChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <defs>
                <linearGradient id="donutGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8E7FFF" />
                  <stop offset="100%" stopColor="#39E0F8" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? 'url(#donutGradient)' : COLORS[index]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-number-display font-bold">80.8%</div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 space-y-3 border-t border-border pt-4">
          <div className="flex justify-between">
            <span className="text-sm text-foreground-secondary">Total sales</span>
            <span className="font-semibold text-foreground">2,987</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-foreground-secondary">Revenue</span>
            <span className="font-semibold text-foreground">$11.3k</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
