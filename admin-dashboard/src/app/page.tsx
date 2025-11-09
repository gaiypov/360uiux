'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface Stats {
  totalVacancies: number;
  totalUsers: number;
  pendingVacancies: number;
  pendingUsers: number;
  todayRegistrations: number;
  todayVacancies: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalVacancies: 0,
    totalUsers: 0,
    pendingVacancies: 0,
    pendingUsers: 0,
    todayRegistrations: 0,
    todayVacancies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'На модерации',
      value: stats.pendingVacancies,
      icon: Clock,
      color: 'warning',
      subtitle: 'вакансий',
    },
    {
      label: 'Пользователей на проверке',
      value: stats.pendingUsers,
      icon: AlertTriangle,
      color: 'error',
      subtitle: 'требуют внимания',
    },
    {
      label: 'Всего вакансий',
      value: formatNumber(stats.totalVacancies),
      icon: FileText,
      color: 'info',
      subtitle: `+${stats.todayVacancies} сегодня`,
    },
    {
      label: 'Всего пользователей',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      color: 'success',
      subtitle: `+${stats.todayRegistrations} сегодня`,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-foreground-muted">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-lg font-bold text-foreground">
          Панель модератора
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Управление платформой 360° РАБОТА
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground-secondary">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-3 ${
                      stat.color === 'warning'
                        ? 'bg-warning/20'
                        : stat.color === 'error'
                        ? 'bg-error/20'
                        : stat.color === 'info'
                        ? 'bg-info/20'
                        : 'bg-success/20'
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        stat.color === 'warning'
                          ? 'text-warning'
                          : stat.color === 'error'
                          ? 'text-error'
                          : stat.color === 'info'
                          ? 'text-info'
                          : 'text-success'
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Vacancies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Вакансии на модерации</CardTitle>
              <Badge variant="warning">{stats.pendingVacancies}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pendingVacancies === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-success" />
                  <p className="mt-4 text-foreground-muted">
                    Нет вакансий на проверке
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <a
                    href="/moderation/vacancies"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-medium text-background shadow-glow transition-opacity hover:opacity-90"
                  >
                    <FileText className="h-4 w-4" />
                    Перейти к модерации
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Пользователи на проверке</CardTitle>
              <Badge variant="error">{stats.pendingUsers}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pendingUsers === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-success" />
                  <p className="mt-4 text-foreground-muted">
                    Нет пользователей на проверке
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <a
                    href="/moderation/users"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-medium text-background shadow-glow transition-opacity hover:opacity-90"
                  >
                    <Users className="h-4 w-4" />
                    Перейти к модерации
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Активность за сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl border border-border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.todayVacancies}
                </p>
                <p className="text-sm text-foreground-muted">
                  Новых вакансий
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/20">
                <Users className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.todayRegistrations}
                </p>
                <p className="text-sm text-foreground-muted">
                  Новых регистраций
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
