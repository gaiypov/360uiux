'use client';

import { useEffect, useState } from 'react';
import { Video, Eye, FileText, TrendingUp, MessageSquare, Users, Plus, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { api, type Vacancy, type Application } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  stats: {
    activeVacancies: number;
    totalViews: number;
    totalApplications: number;
    conversionRate: number;
  };
  recentApplications: Application[];
  topVacancies: Vacancy[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data in parallel
      const [vacanciesRes, applicationsRes] = await Promise.all([
        api.getVacancies({ limit: 5, sortBy: 'most_views' }),
        api.getApplications({ limit: 5 }),
      ]);

      // Calculate stats
      const activeVacancies = vacanciesRes.vacancies.filter((v) => v.status === 'ACTIVE').length;
      const totalViews = vacanciesRes.vacancies.reduce((sum, v) => sum + v.viewsCount, 0);
      const totalApplications = vacanciesRes.vacancies.reduce(
        (sum, v) => sum + (v.applicationsCount || 0),
        0
      );
      const conversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

      setData({
        stats: {
          activeVacancies,
          totalViews,
          totalApplications,
          conversionRate,
        },
        recentApplications: applicationsRes.applications.slice(0, 5),
        topVacancies: vacanciesRes.vacancies.slice(0, 3),
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set mock data for demo
      setData({
        stats: {
          activeVacancies: 12,
          totalViews: 15200,
          totalApplications: 847,
          conversionRate: 5.6,
        },
        recentApplications: [],
        topVacancies: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg font-bold bg-gradient-neon bg-clip-text text-transparent">
            Обзор
          </h1>
          <p className="mt-2 text-foreground-secondary">
            Добро пожаловать в личный кабинет работодателя
          </p>
        </div>

        {/* Quick action button */}
        <Link href="/vacancies/new">
          <NeonButton variant="neon" size="lg" glow>
            <Plus className="h-5 w-5" />
            Создать вакансию
          </NeonButton>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Активные вакансии"
          value={data?.stats.activeVacancies || 0}
          icon={Video}
          trend={{ value: 7, isPositive: true }}
          loading={loading}
        />
        <StatCard
          label="Просмотров за месяц"
          value={
            data?.stats.totalViews
              ? data.stats.totalViews > 1000
                ? `${(data.stats.totalViews / 1000).toFixed(1)}K`
                : data.stats.totalViews
              : 0
          }
          icon={Eye}
          trend={{ value: 23, isPositive: true }}
          loading={loading}
        />
        <StatCard
          label="Откликов всего"
          value={data?.stats.totalApplications || 0}
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
          loading={loading}
        />
        <StatCard
          label="Конверсия"
          value={`${data?.stats.conversionRate.toFixed(1) || 0}%`}
          icon={TrendingUp}
          trend={{ value: 2.1, isPositive: true }}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-display-sm font-semibold text-foreground">Быстрые действия</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/vacancies/new">
            <GlassCard variant="hover" className="cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-neon">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Создать вакансию</div>
                  <div className="text-sm text-foreground-secondary">Опубликовать новую вакансию</div>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground-muted group-hover:text-primary transition-colors" />
              </div>
            </GlassCard>
          </Link>

          <Link href="/applications">
            <GlassCard variant="hover" className="cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-blue to-neon-purple">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Отклики</div>
                  <div className="text-sm text-foreground-secondary">Просмотреть отклики</div>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground-muted group-hover:text-secondary transition-colors" />
              </div>
            </GlassCard>
          </Link>

          <Link href="/analytics">
            <GlassCard variant="hover" className="cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-warning-orange to-success-green">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Аналитика</div>
                  <div className="text-sm text-foreground-secondary">Посмотреть статистику</div>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground-muted group-hover:text-warning transition-colors" />
              </div>
            </GlassCard>
          </Link>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <PerformanceChart />
        <DonutChart />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>Последние отклики</GlassCardTitle>
              <Link href="/applications">
                <NeonButton variant="ghost" size="sm">
                  Все отклики
                  <ArrowRight className="h-4 w-4" />
                </NeonButton>
              </Link>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-glass-bg" />
                ))}
              </div>
            ) : data?.recentApplications && data.recentApplications.length > 0 ? (
              <div className="space-y-3">
                {data.recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center gap-4 rounded-lg border border-glass-border p-3 transition-all hover:border-primary/50 hover:bg-glass-hover group cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-neon">
                      <span className="text-sm font-semibold text-white">
                        {application.user?.name?.[0] || 'A'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {application.user?.name || 'Соискатель'}
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {application.vacancy?.profession || 'Вакансия'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge variant={application.status.toLowerCase() as any}>
                        {application.status === 'NEW' && 'Новый'}
                        {application.status === 'VIEWED' && 'Просмотрен'}
                        {application.status === 'INTERVIEW' && 'Собеседование'}
                        {application.status === 'REJECTED' && 'Отклонен'}
                        {application.status === 'HIRED' && 'Принят'}
                      </StatusBadge>
                      <div className="text-xs text-foreground-secondary">
                        {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-foreground-muted mb-3 opacity-50" />
                <p className="text-foreground-secondary">Откликов пока нет</p>
                <p className="text-sm text-foreground-muted">
                  Создайте вакансию, чтобы начать получать отклики
                </p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Top Vacancies */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>Топ вакансий</GlassCardTitle>
              <Link href="/vacancies">
                <NeonButton variant="ghost" size="sm">
                  Все вакансии
                  <ArrowRight className="h-4 w-4" />
                </NeonButton>
              </Link>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-glass-bg" />
                ))}
              </div>
            ) : data?.topVacancies && data.topVacancies.length > 0 ? (
              <div className="space-y-3">
                {data.topVacancies.map((vacancy) => (
                  <Link key={vacancy.id} href={`/vacancies/${vacancy.id}`}>
                    <div className="rounded-lg border border-glass-border p-4 transition-all hover:border-primary/50 hover:bg-glass-hover group cursor-pointer">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {vacancy.title}
                        </div>
                        <StatusBadge variant={vacancy.status === 'ACTIVE' ? 'active' : 'closed'}>
                          {vacancy.status === 'ACTIVE' ? 'Активна' : 'Закрыта'}
                        </StatusBadge>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-foreground-secondary">
                          <Eye className="h-4 w-4" />
                          <span>{vacancy.viewsCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground-secondary">
                          <Users className="h-4 w-4" />
                          <span>{vacancy.applicationsCount || 0}</span>
                        </div>
                        {vacancy.salaryMin && (
                          <div className="flex items-center gap-1.5 text-success-green font-medium">
                            <span>от {vacancy.salaryMin.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Video className="h-12 w-12 text-foreground-muted mb-3 opacity-50" />
                <p className="text-foreground-secondary">Вакансий пока нет</p>
                <Link href="/vacancies/new" className="mt-4">
                  <NeonButton variant="neon" size="sm">
                    <Plus className="h-4 w-4" />
                    Создать первую вакансию
                  </NeonButton>
                </Link>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
