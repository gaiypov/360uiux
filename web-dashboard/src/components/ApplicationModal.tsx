'use client';

import { X, Star, MapPin, Briefcase, DollarSign, Clock, Calendar, Heart, MessageCircle, Ban, Play } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { NeonButton } from './ui/neon-button';
import { StatusBadge } from './ui/status-badge';
import type { Application } from '@/lib/api';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ApplicationModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (applicationId: string, status: string, message?: string) => void;
}

export function ApplicationModal({
  application,
  isOpen,
  onClose,
  onStatusChange,
}: ApplicationModalProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [rejectMessage, setRejectMessage] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !application) return null;

  const handleStatusChange = (status: string) => {
    if (status === 'REJECTED' && !showRejectForm) {
      setShowRejectForm(true);
      return;
    }

    onStatusChange(application.id, status, status === 'REJECTED' ? rejectMessage : undefined);
    onClose();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'new';
      case 'VIEWED':
        return 'viewed';
      case 'INTERVIEW':
        return 'interview';
      case 'HIRED':
        return 'hired';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'Новый';
      case 'VIEWED':
        return 'Просмотрен';
      case 'INTERVIEW':
        return 'Собеседование';
      case 'HIRED':
        return 'Принят';
      case 'REJECTED':
        return 'Отклонен';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ultra-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <GlassCard className="p-8" glow>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-glass-bg hover:bg-glass-hover transition-colors"
          >
            <X className="h-5 w-5 text-foreground-secondary" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Video & Basic Info */}
            <div className="space-y-6">
              {/* Video Resume */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-graphite to-dark-gray aspect-[9/16]">
                {application.videoUrl ? (
                  <>
                    {!videoPlaying ? (
                      <div
                        className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                        onClick={() => setVideoPlaying(true)}
                      >
                        <img
                          src={application.user?.avatarUrl || 'https://i.pravatar.cc/300'}
                          alt={application.user?.name || 'Кандидат'}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ultra-black/80 to-transparent" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-neon shadow-neon group-hover:scale-110 transition-transform">
                          <Play className="h-10 w-10 text-white ml-1" />
                        </div>
                      </div>
                    ) : (
                      <video
                        src={application.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-foreground-muted">
                      <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Нет видео</p>
                    </div>
                  </div>
                )}

                {/* View Count Badge */}
                {application.videoViewCount > 0 && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-ultra-black/60 backdrop-blur-glass border border-glass-border">
                    <span className="text-xs text-foreground-secondary">
                      👁️ {application.videoViewCount} просмотров
                    </span>
                  </div>
                )}
              </div>

              {/* Candidate Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <GlassCard variant="elevated" className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neon">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-muted">Опыт</p>
                      <p className="font-semibold text-foreground">
                        {application.user?.name ? '3 года' : 'Не указан'}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard variant="elevated" className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-blue to-neon-purple">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-muted">Город</p>
                      <p className="font-semibold text-foreground">Москва</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard variant="elevated" className="p-4 col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-green/20">
                      <DollarSign className="h-5 w-5 text-success-green" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-muted">Ожидаемая зарплата</p>
                      <p className="font-semibold text-lg text-success-green">
                        {application.vacancy?.salaryMin
                          ? `${application.vacancy.salaryMin.toLocaleString('ru-RU')} ₽`
                          : 'Не указана'}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Right: Detailed Info */}
            <div className="space-y-6">
              {/* Header with Avatar and Name */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-neon text-white font-bold text-xl shadow-neon">
                  {application.user?.name?.[0] || 'K'}
                </div>
                <div className="flex-1">
                  <h2 className="text-display-md font-bold text-foreground mb-1">
                    {application.user?.name || 'Кандидат'}
                  </h2>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge variant={getStatusVariant(application.status)}>
                      {getStatusLabel(application.status)}
                    </StatusBadge>
                    <div className="flex items-center gap-1 text-warning">
                      <Star className="h-4 w-4 fill-warning" />
                      <span className="text-sm font-semibold">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <Clock className="h-4 w-4" />
                    <span>Откликнулся {new Date(application.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>

              {/* Vacancy Info */}
              <GlassCard variant="elevated">
                <h4 className="text-sm font-medium text-foreground-secondary mb-2">
                  Откликнулся на:
                </h4>
                <h3 className="text-foreground font-semibold mb-1">
                  {application.vacancy?.title || 'Вакансия'}
                </h3>
                <p className="text-foreground-secondary text-sm">
                  {application.vacancy?.profession || ''}
                </p>
              </GlassCard>

              {/* Cover Letter */}
              {application.coverLetter && (
                <GlassCard variant="elevated">
                  <h4 className="text-sm font-medium text-foreground-secondary mb-2">
                    Сопроводительное письмо:
                  </h4>
                  <p className="text-foreground-secondary text-sm leading-relaxed">
                    {application.coverLetter}
                  </p>
                </GlassCard>
              )}

              {/* Resume Link */}
              {application.resumeUrl && (
                <GlassCard variant="elevated">
                  <h4 className="text-sm font-medium text-foreground-secondary mb-2">Резюме:</h4>
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary transition-colors text-sm underline"
                  >
                    Открыть резюме
                  </a>
                </GlassCard>
              )}

              {/* Reject Form */}
              {showRejectForm && (
                <GlassCard variant="elevated" className="border-destructive/30">
                  <h4 className="text-sm font-medium text-destructive mb-2">Причина отклонения:</h4>
                  <textarea
                    value={rejectMessage}
                    onChange={(e) => setRejectMessage(e.target.value)}
                    placeholder="Укажите причину отклонения (опционально)..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-glass-bg border border-glass-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive transition-all"
                  />
                </GlassCard>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {application.status !== 'HIRED' && (
                  <NeonButton
                    variant="success"
                    size="lg"
                    onClick={() => handleStatusChange('HIRED')}
                    className="w-full bg-success-green hover:bg-success-green/90"
                  >
                    <Heart className="h-5 w-5" />
                    Принять кандидата
                  </NeonButton>
                )}

                {application.status !== 'INTERVIEW' && application.status !== 'HIRED' && (
                  <NeonButton
                    variant="neon"
                    size="lg"
                    onClick={() => handleStatusChange('INTERVIEW')}
                    className="w-full"
                  >
                    <Calendar className="h-5 w-5" />
                    Пригласить на собеседование
                  </NeonButton>
                )}

                {application.status !== 'REJECTED' && (
                  <NeonButton
                    variant="destructive"
                    size="lg"
                    onClick={() => handleStatusChange('REJECTED')}
                    className="w-full"
                  >
                    <Ban className="h-5 w-5" />
                    {showRejectForm ? 'Подтвердить отклонение' : 'Отклонить'}
                  </NeonButton>
                )}

                <NeonButton variant="glass" size="lg" className="w-full">
                  <MessageCircle className="h-5 w-5" />
                  Написать сообщение
                </NeonButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
