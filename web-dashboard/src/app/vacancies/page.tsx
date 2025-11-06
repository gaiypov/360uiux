import { Plus, Eye, MessageSquare, Users, Edit, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const vacancies = [
  {
    id: 1,
    title: 'Официант',
    salary: '65 000 - 85 000 ₽',
    views: 1234,
    messages: 24,
    applications: 12,
    status: 'active' as const,
  },
  {
    id: 2,
    title: 'Бармен',
    salary: '55 000 - 75 000 ₽',
    views: 892,
    messages: 18,
    applications: 8,
    status: 'active' as const,
  },
  {
    id: 3,
    title: 'Повар',
    salary: '70 000 - 95 000 ₽',
    views: 645,
    messages: 15,
    applications: 7,
    status: 'moderation' as const,
  },
];

const tabs = [
  { name: 'Все', value: 'all', count: 12 },
  { name: 'Активные', value: 'active', count: 10 },
  { name: 'На модерации', value: 'moderation', count: 1 },
  { name: 'Архив', value: 'archive', count: 1 },
];

export default function VacanciesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg font-bold text-foreground">Вакансии</h1>
          <p className="mt-2 text-foreground-secondary">Управление вашими вакансиями</p>
        </div>
        <Button variant="gradient" className="gap-2">
          <Plus className="h-5 w-5" />
          Создать вакансию
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab.value}
            className={cn(
              'relative px-4 py-2 text-sm font-medium transition-colors',
              i === 0
                ? 'text-foreground'
                : 'text-foreground-secondary hover:text-foreground'
            )}
          >
            {tab.name}
            <span className="ml-2 rounded-full bg-background-elevated px-2 py-0.5 text-xs">
              {tab.count}
            </span>
            {i === 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary"></div>
            )}
          </button>
        ))}
      </div>

      {/* Vacancies Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vacancies.map((vacancy) => (
          <Card key={vacancy.id} className="overflow-hidden">
            {/* Video thumbnail */}
            <div className="aspect-video w-full bg-gradient-primary"></div>

            <CardContent className="p-4">
              {/* Title and salary */}
              <h3 className="mb-1 text-display-sm font-semibold text-foreground">
                {vacancy.title}
              </h3>
              <p className="mb-4 text-sm font-medium text-foreground-secondary">
                {vacancy.salary}
              </p>

              {/* Stats */}
              <div className="mb-4 flex gap-4 text-sm text-foreground-secondary">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{vacancy.views}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>{vacancy.messages}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{vacancy.applications}</span>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4 flex items-center gap-2">
                {vacancy.status === 'active' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Активна</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-warning">На модерации</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
