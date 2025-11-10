'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RevenueByPeriod {
  period: string;
  deposits: number;
  payments: number;
  transactions_count: number;
}

interface TopSpender {
  id: string;
  company_name: string;
  email: string;
  total_spent: number;
  transactions_count: number;
}

export default function RevenueStatsPage() {
  const [revenueData, setRevenueData] = useState<RevenueByPeriod[]>([]);
  const [topSpenders, setTopSpenders] = useState<TopSpender[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadRevenueStats();
  }, [period]);

  const loadRevenueStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/v1/billing/admin/revenue-stats?period=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRevenueData(data.revenue_by_period || []);
        setTopSpenders(data.top_spenders || []);
      }
    } catch (error) {
      console.error('Failed to load revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return revenueData.reduce((sum, item) => sum + parseFloat(item.payments as any), 0);
  };

  const getTotalDeposits = () => {
    return revenueData.reduce((sum, item) => sum + parseFloat(item.deposits as any), 0);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Статистика доходов</h1>
          <p className="text-gray-600 mt-2">Аналитика финансовых поступлений</p>
        </div>

        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">За день</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="year">За год</option>
          </select>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Общий доход</div>
          <div className="text-3xl font-bold text-blue-600">
            {getTotalRevenue().toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-xs text-gray-500 mt-2">Оплаты за период</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Пополнения</div>
          <div className="text-3xl font-bold text-green-600">
            {getTotalDeposits().toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-xs text-gray-500 mt-2">Депозиты за период</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Средний чек</div>
          <div className="text-3xl font-bold text-purple-600">
            {revenueData.length > 0
              ? (getTotalRevenue() / revenueData.reduce((sum, item) => sum + parseInt(item.transactions_count as any), 0) || 0).toFixed(0)
              : 0}{' '}
            ₽
          </div>
          <div className="text-xs text-gray-500 mt-2">На транзакцию</div>
        </Card>
      </div>

      {/* График доходов (простая таблица) */}
      <Card className="mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">График доходов по периодам</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Период
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Пополнения
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Оплаты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Транзакций
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Баланс
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Загрузка...
                  </td>
                </tr>
              ) : revenueData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Нет данных за выбранный период
                  </td>
                </tr>
              ) : (
                revenueData.map((item) => {
                  const deposits = parseFloat(item.deposits as any);
                  const payments = parseFloat(item.payments as any);
                  const balance = deposits - payments;

                  return (
                    <tr key={item.period} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.period}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        +{deposits.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        -{payments.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.transactions_count}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {balance >= 0 ? '+' : ''}
                          {balance.toLocaleString('ru-RU')} ₽
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Топ работодателей */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">🏆 Топ-10 работодателей по тратам</h2>
          <p className="text-sm text-gray-600 mt-1">За последние 30 дней</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Компания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Потрачено
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Транзакций
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topSpenders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Нет данных
                  </td>
                </tr>
              ) : (
                topSpenders.map((spender, index) => (
                  <tr key={spender.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {spender.company_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{spender.email}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {parseFloat(spender.total_spent as any).toLocaleString('ru-RU')} ₽
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {spender.transactions_count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
