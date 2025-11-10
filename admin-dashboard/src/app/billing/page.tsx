'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Transaction {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  payment_system?: string;
  payment_id?: string;
  created_at: string;
  completed_at?: string;
  employer_id: string;
  company_name?: string;
  email?: string;
  phone?: string;
}

interface Stats {
  total_count: number;
  total_deposits: number;
  total_payments: number;
  pending_amount: number;
}

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type?: string;
    status?: string;
  }>({});

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);

      const response = await fetch(`http://localhost:5000/api/v1/billing/admin/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      cancelled: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'success' | 'error' | 'default'> = {
      deposit: 'success',
      payment: 'error',
      refund: 'default',
    };
    const labels: Record<string, string> = {
      deposit: 'Пополнение',
      payment: 'Оплата',
      refund: 'Возврат',
    };
    return <Badge variant={variants[type] || 'default'}>{labels[type] || type}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">💰 Биллинг и транзакции</h1>
        <p className="text-gray-600 mt-2">Управление финансами платформы</p>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Всего транзакций</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_count}</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Пополнения</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.total_deposits.toLocaleString('ru-RU')} ₽
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Оплаты</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.total_payments.toLocaleString('ru-RU')} ₽
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">В ожидании</div>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending_amount.toLocaleString('ru-RU')} ₽
            </div>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card className="p-6 mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter({ ...filter, type: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option value="deposit">Пополнение</option>
              <option value="payment">Оплата</option>
              <option value="refund">Возврат</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option value="completed">Завершено</option>
              <option value="pending">В ожидании</option>
              <option value="failed">Ошибка</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Список транзакций */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Компания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Загрузка...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Транзакции не найдены
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {transaction.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.company_name || 'Неизвестно'}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.email}</div>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(transaction.type)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          transaction.type === 'deposit'
                            ? 'text-green-600'
                            : transaction.type === 'payment'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {transaction.type === 'deposit' ? '+' : '-'}
                        {transaction.amount.toLocaleString('ru-RU')} ₽
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transaction.description}</div>
                      {transaction.payment_system && (
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.payment_system.toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleString('ru-RU')}
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
