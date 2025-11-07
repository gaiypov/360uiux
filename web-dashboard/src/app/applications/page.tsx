'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  Users,
  Calendar,
  Heart,
  Clock,
  Filter,
  Search,
  ChevronRight,
  UserCheck,
  Ban,
  Play,
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { GlassInput } from '@/components/ui/glass-input';
import { ApplicationModal } from '@/components/ApplicationModal';
import { api, type Application } from '@/lib/api';
import { cn } from '@/lib/utils';

type KanbanColumn = {
  id: string;
  title: string;
  status: string;
  color: string;
  icon: React.ReactNode;
};

const columns: KanbanColumn[] = [
  {
    id: 'NEW',
    title: 'Новые',
    status: 'NEW',
    color: 'primary',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: 'VIEWED',
    title: 'Просмотрено',
    status: 'VIEWED',
    color: 'secondary',
    icon: <Eye className="h-5 w-5" />,
  },
  {
    id: 'INTERVIEW',
    title: 'Собеседование',
    status: 'INTERVIEW',
    color: 'warning',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: 'HIRED',
    title: 'Приняты',
    status: 'HIRED',
    color: 'success',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    id: 'REJECTED',
    title: 'Отклонены',
    status: 'REJECTED',
    color: 'destructive',
    icon: <Ban className="h-5 w-5" />,
  },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState<Application | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [searchQuery]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await api.getApplications({ limit: 100 });
      setApplications(response.applications);
    } catch (error) {
      console.error('Failed to load applications:', error);
      // Mock data for demo
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  const handleDragStart = (e: React.DragEvent, application: Application) => {
    setDraggedItem(application);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.status === targetStatus) {
      setDraggedItem(null);
      return;
    }

    try {
      // Optimistically update UI
      setApplications((prev) =>
        prev.map((app) =>
          app.id === draggedItem.id ? { ...app, status: targetStatus as any } : app
        )
      );

      // Update via API
      await api.updateApplicationStatus(draggedItem.id, { status: targetStatus });
    } catch (error) {
      console.error('Failed to update application status:', error);
      // Revert on error
      loadApplications();
    } finally {
      setDraggedItem(null);
    }
  };

  const handleStatusChange = async (applicationId: string, status: string, message?: string) => {
    try {
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: status as any } : app))
      );

      await api.updateApplicationStatus(applicationId, { status, message });
    } catch (error) {
      console.error('Failed to update application status:', error);
      loadApplications();
    }
  };

  const handleCardClick = (application: Application) => {
    setSelectedApplication(application);
    setModalOpen(true);
  };

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === 'NEW').length,
    interview: applications.filter((a) => a.status === 'INTERVIEW').length,
    hired: applications.filter((a) => a.status === 'HIRED').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display-lg font-bold bg-gradient-neon bg-clip-text text-transparent">
          Отклики на вакансии
        </h1>
        <p className="mt-2 text-foreground-secondary">
          {stats.total} кандидатов ожидают рассмотрения
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard glow>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary mb-1">Всего откликов</p>
              <p className="text-number-md font-bold bg-gradient-neon bg-clip-text text-transparent">
                {stats.total}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-neon">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary mb-1">Новые</p>
              <p className="text-number-md font-bold text-primary">{stats.new}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary mb-1">На собеседовании</p>
              <p className="text-number-md font-bold text-warning">{stats.interview}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/20">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary mb-1">Приняты</p>
              <p className="text-number-md font-bold text-success">{stats.hired}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20">
              <Heart className="h-6 w-6 text-success" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <GlassInput
            type="search"
            placeholder="Поиск по имени кандидата..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <NeonButton variant="glass">
          <Filter className="h-4 w-4" />
          Фильтры
        </NeonButton>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {columns.map((column) => {
          const columnApplications = getApplicationsByStatus(column.status);

          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
              className={cn(
                'flex flex-col rounded-xl border-2 border-dashed transition-colors',
                draggedItem && draggedItem.status !== column.status
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-glass-border bg-transparent'
              )}
            >
              {/* Column Header */}
              <GlassCard variant="elevated" className="mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        column.color === 'primary' && 'bg-primary/20 text-primary',
                        column.color === 'secondary' && 'bg-secondary/20 text-secondary',
                        column.color === 'warning' && 'bg-warning/20 text-warning',
                        column.color === 'success' && 'bg-success/20 text-success',
                        column.color === 'destructive' && 'bg-destructive/20 text-destructive'
                      )}
                    >
                      {column.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                  </div>
                  <StatusBadge
                    variant={column.color as any}
                    className="text-xs px-2 py-0.5"
                  >
                    {columnApplications.length}
                  </StatusBadge>
                </div>
              </GlassCard>

              {/* Cards */}
              <div className="flex-1 space-y-3 p-2 min-h-[400px]">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-40 animate-pulse rounded-lg bg-glass-bg" />
                    ))}
                  </>
                ) : columnApplications.length > 0 ? (
                  columnApplications.map((application) => (
                    <div
                      key={application.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, application)}
                      onClick={() => handleCardClick(application)}
                      className="group cursor-move"
                    >
                      <GlassCard
                        variant="hover"
                        className={cn(
                          'transition-all duration-200',
                          draggedItem?.id === application.id && 'opacity-50 scale-95'
                        )}
                      >
                        {/* Video Thumbnail */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-graphite to-dark-gray mb-3">
                          {application.videoUrl ? (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-t from-ultra-black/60 to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-glass-bg backdrop-blur-glass border border-glass-border group-hover:scale-110 transition-transform">
                                  <Play className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <UserCheck className="h-8 w-8 text-foreground-muted opacity-50" />
                            </div>
                          )}

                          {/* View count badge */}
                          {application.videoViewCount > 0 && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-ultra-black/60 backdrop-blur-glass text-xs text-foreground-secondary">
                              👁️ {application.videoViewCount}
                            </div>
                          )}
                        </div>

                        {/* Candidate Info */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-neon text-white text-sm font-bold">
                                {application.user?.name?.[0] || 'K'}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm line-clamp-1">
                                  {application.user?.name || 'Кандидат'}
                                </p>
                                <p className="text-xs text-foreground-muted">
                                  {application.vacancy?.profession || 'Вакансия'}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-primary transition-colors" />
                          </div>

                          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(application.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                    <div className="h-12 w-12 rounded-full bg-glass-bg flex items-center justify-center mb-2">
                      {column.icon}
                    </div>
                    <p className="text-sm text-foreground-muted">Нет откликов</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Detail Modal */}
      <ApplicationModal
        application={selectedApplication}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedApplication(null);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
