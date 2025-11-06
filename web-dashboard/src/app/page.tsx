import { Video, Eye, FileText, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-lg font-bold text-foreground">Обзор</h1>
        <p className="mt-2 text-foreground-secondary">
          Добро пожаловать, ООО "Рога и Копыта"
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Активные вакансии"
          value={12}
          icon={Video}
          trend={{ value: 7, isPositive: true }}
        />
        <StatCard
          label="Просмотров за месяц"
          value="15.2K"
          icon={Eye}
          trend={{ value: 23, isPositive: true }}
        />
        <StatCard
          label="Откликов всего"
          value={847}
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Конверсия"
          value="5.6%"
          icon={TrendingUp}
          trend={{ value: 2.1, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <PerformanceChart />
        <DonutChart />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Последние отклики</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Иван Петров', position: 'Официант', time: '5 мин назад' },
                { name: 'Мария Сидорова', position: 'Бармен', time: '15 мин назад' },
                { name: 'Алексей Иванов', position: 'Повар', time: '1 час назад' },
              ].map((applicant, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 transition-all hover:border-primary/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary">
                    <span className="text-sm font-semibold text-background">
                      {applicant.name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{applicant.name}</div>
                    <div className="text-sm text-foreground-muted">{applicant.position}</div>
                  </div>
                  <div className="text-sm text-foreground-secondary">{applicant.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Vacancies */}
        <Card>
          <CardHeader>
            <CardTitle>Топ вакансий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Официант', views: 1234, messages: 24, applications: 12 },
                { title: 'Бармен', views: 892, messages: 18, applications: 8 },
                { title: 'Повар', views: 645, messages: 15, applications: 7 },
              ].map((vacancy, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border p-4 transition-all hover:border-primary/50"
                >
                  <div className="mb-3 font-semibold text-foreground">{vacancy.title}</div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-foreground-secondary">
                      <Eye className="h-4 w-4" />
                      <span>{vacancy.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground-secondary">
                      <MessageSquare className="h-4 w-4" />
                      <span>{vacancy.messages}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground-secondary">
                      <Users className="h-4 w-4" />
                      <span>{vacancy.applications}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
