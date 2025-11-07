'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Users,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Play,
  ChevronDown,
} from 'lucide-react';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { GlassInput } from '@/components/ui/glass-input';
import { api, type Vacancy } from '@/lib/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type TabValue = 'all' | 'active' | 'pending' | 'rejected' | 'closed';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Stats for tabs
  const [stats, setStats] = useState({
    all: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    closed: 0,
  });

  useEffect(() => {
    loadVacancies();
  }, [activeTab, searchQuery]);

  const loadVacancies = async () => {
    try {
      setLoading(true);

      const params: any = {
        limit: 50,
        sortBy: 'newest',
      };

      if (searchQuery) {
        params.query = searchQuery;
      }

      if (activeTab !== 'all') {
        if (activeTab === 'active') {
          params.status = 'ACTIVE';
        } else if (activeTab === 'pending') {
          params.status = 'PENDING';
        } else if (activeTab === 'rejected') {
          params.status = 'REJECTED';
        } else if (activeTab === 'closed') {
          params.status = 'CLOSED';
        }
      }

      const response = await api.getVacancies(params);
      setVacancies(response.vacancies);

      // Calculate stats
      setStats({
        all: response.pagination?.total || 0,
        active: response.vacancies.filter((v) => v.status === 'ACTIVE').length,
        pending: response.vacancies.filter((v) => v.moderationStatus === 'PENDING').length,
        rejected: response.vacancies.filter((v) => v.moderationStatus === 'REJECTED').length,
        closed: response.vacancies.filter((v) => v.status === 'CLOSED').length,
      });
    } catch (error) {
      console.error('Failed to load vacancies:', error);
      // Set mock data for demo
      setVacancies([]);
      setStats({ all: 0, active: 0, pending: 0, rejected: 0, closed: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return;

    try {
      await api.deleteVacancy(id);
      setVacancies((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Failed to delete vacancy:', error);
      alert('Не удалось удалить вакансию');
    }
  };

  const tabs = [
    { name: 'Все', value: 'all' as TabValue, count: stats.all },
    { name: 'Активные', value: 'active' as TabValue, count: stats.active },
    { name: 'На модерации', value: 'pending' as TabValue, count: stats.pending },
    { name: 'Отклоненные', value: 'rejected' as TabValue, count: stats.rejected },
    { name: 'Архив', value: 'closed' as TabValue, count: stats.closed },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg font-bold bg-gradient-neon bg-clip-text text-transparent">
            Вакансии
          </h1>
          <p className="mt-2 text-foreground-secondary">Управление вашими вакансиями</p>
        </div>
        <Link href="/vacancies/new">
          <NeonButton variant="neon" size="lg" glow>
            <Plus className="h-5 w-5" />
            Создать вакансию
          </NeonButton>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <GlassInput
            type="search"
            placeholder="Поиск по названию, профессии..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <NeonButton
          variant="glass"
          size="default"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && 'border-primary')}
        >
          <Filter className="h-4 w-4" />
          Фильтры
          {showFilters && <X className="h-4 w-4" />}
        </NeonButton>
      </div>

      {/* Filters Panel (collapsible) */}
      {showFilters && (
        <GlassCard className="animate-slide-up">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-secondary">
                Город
              </label>
              <select className="w-full h-11 rounded-lg px-4 bg-glass-bg border border-glass-border text-foreground focus:border-primary focus:outline-none">
                <option>Все города</option>
                <option>Москва</option>
                <option>Санкт-Петербург</option>
                <option>Казань</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-secondary">
                Опыт
              </label>
              <select className="w-full h-11 rounded-lg px-4 bg-glass-bg border border-glass-border text-foreground focus:border-primary focus:outline-none">
                <option>Любой</option>
                <option>Без опыта</option>
                <option>1-3 года</option>
                <option>3+ лет</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-secondary">
                Зарплата от
              </label>
              <GlassInput type="number" placeholder="0" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-secondary">
                Зарплата до
              </label>
              <GlassInput type="number" placeholder="200000" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <NeonButton variant="ghost" onClick={() => setShowFilters(false)}>
              Отмена
            </NeonButton>
            <NeonButton variant="neon">Применить</NeonButton>
          </div>
        </GlassCard>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-glass-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'relative px-6 py-3 text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.value
                ? 'text-foreground'
                : 'text-foreground-secondary hover:text-foreground'
            )}
          >
            {tab.name}
            <span
              className={cn(
                'ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                activeTab === tab.value
                  ? 'bg-gradient-neon text-white'
                  : 'bg-glass-bg text-foreground-secondary'
              )}
            >
              {tab.count}
            </span>
            {activeTab === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-neon"></div>
            )}
          </button>
        ))}
      </div>

      {/* Vacancies Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-glass-bg" />
          ))}
        </div>
      ) : vacancies.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((vacancy) => (
            <GlassCard key={vacancy.id} variant="hover" className="overflow-hidden group">
              {/* Video thumbnail */}
              <div className="relative aspect-video w-full bg-gradient-to-br from-graphite to-dark-gray overflow-hidden">
                {vacancy.videoUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-glass-bg backdrop-blur-glass border border-glass-border group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-foreground-muted">
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Нет видео</p>
                    </div>
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-ultra-black/80 to-transparent" />
              </div>

              <GlassCardContent>
                {/* Title and profession */}
                <div className="mb-3">
                  <h3 className="text-display-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {vacancy.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary">{vacancy.profession}</p>
                </div>

                {/* Salary */}
                {(vacancy.salaryMin || vacancy.salaryMax) && (
                  <div className="mb-3 font-semibold text-success-green">
                    {vacancy.salaryMin && vacancy.salaryMax
                      ? `${vacancy.salaryMin.toLocaleString('ru-RU')} - ${vacancy.salaryMax.toLocaleString('ru-RU')} ₽`
                      : vacancy.salaryMin
                      ? `от ${vacancy.salaryMin.toLocaleString('ru-RU')} ₽`
                      : `до ${vacancy.salaryMax?.toLocaleString('ru-RU')} ₽`}
                  </div>
                )}

                {/* Stats */}
                <div className="mb-4 flex gap-4 text-sm text-foreground-secondary">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{vacancy.viewsCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{vacancy.applicationsCount || 0}</span>
                  </div>
                </div>

                {/* Status badges */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <StatusBadge variant={vacancy.status === 'ACTIVE' ? 'active' : 'closed'}>
                    {vacancy.status === 'ACTIVE' ? 'Активна' : 'Закрыта'}
                  </StatusBadge>
                  <StatusBadge
                    variant={
                      vacancy.moderationStatus === 'APPROVED'
                        ? 'approved'
                        : vacancy.moderationStatus === 'PENDING'
                        ? 'moderating'
                        : 'rejected'
                    }
                  >
                    {vacancy.moderationStatus === 'APPROVED' && 'Одобрена'}
                    {vacancy.moderationStatus === 'PENDING' && 'Модерация'}
                    {vacancy.moderationStatus === 'REJECTED' && 'Отклонена'}
                  </StatusBadge>
                </div>

                {/* Moderation comment */}
                {vacancy.moderationStatus === 'REJECTED' && vacancy.moderationComment && (
                  <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                    <p className="text-xs text-destructive">{vacancy.moderationComment}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/vacancies/${vacancy.id}/edit`} className="flex-1">
                    <NeonButton variant="glass" size="sm" className="w-full gap-2">
                      <Edit className="h-4 w-4" />
                      Редактировать
                    </NeonButton>
                  </Link>
                  <NeonButton
                    variant="glass"
                    size="sm"
                    onClick={() => handleDeleteVacancy(vacancy.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </NeonButton>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-neon/10">
              <Plus className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mb-2 text-display-sm font-semibold text-foreground">
              Нет вакансий
            </h3>
            <p className="mb-6 text-foreground-secondary max-w-md">
              {searchQuery
                ? 'По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.'
                : 'Создайте свою первую вакансию, чтобы начать получать отклики от кандидатов.'}
            </p>
            {!searchQuery && (
              <Link href="/vacancies/new">
                <NeonButton variant="neon" size="lg" glow>
                  <Plus className="h-5 w-5" />
                  Создать вакансию
                </NeonButton>
              </Link>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
