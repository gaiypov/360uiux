'use client';

import { useEffect, useState } from 'react';
import { FileText, MapPin, Briefcase, DollarSign, Calendar, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Vacancy {
  id: string;
  title: string;
  description: string;
  city: string;
  salary_min: number;
  salary_max: number;
  employment_type: string;
  experience: string;
  created_at: string;
  employer: {
    id: string;
    company_name: string;
  };
}

export default function VacancyModeration() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadVacancies();
  }, []);

  const loadVacancies = async () => {
    try {
      const response = await api.getPendingVacancies(20);
      if (response.data) {
        setVacancies(response.data);
      }
    } catch (error) {
      console.error('Failed to load vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vacancyId: string) => {
    setProcessing(vacancyId);
    try {
      const response = await api.approveVacancy(vacancyId);
      if (!response.error) {
        setVacancies((prev) => prev.filter((v) => v.id !== vacancyId));
      }
    } catch (error) {
      console.error('Failed to approve vacancy:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (vacancyId: string) => {
    const reason = prompt('Причина отклонения:');
    if (!reason) return;

    setProcessing(vacancyId);
    try {
      const response = await api.rejectVacancy(vacancyId, reason);
      if (!response.error) {
        setVacancies((prev) => prev.filter((v) => v.id !== vacancyId));
      }
    } catch (error) {
      console.error('Failed to reject vacancy:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-foreground-muted">Загрузка вакансий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md font-bold text-foreground">
            Модерация вакансий
          </h1>
          <p className="mt-2 text-foreground-secondary">
            Проверка новых вакансий на платформе
          </p>
        </div>
        <Badge variant="warning" className="text-base px-4 py-2">
          {vacancies.length} на проверке
        </Badge>
      </div>

      {/* Vacancies List */}
      {vacancies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-foreground-muted" />
            <p className="mt-4 text-lg font-medium text-foreground">
              Нет вакансий на модерации
            </p>
            <p className="mt-2 text-foreground-muted">
              Все вакансии проверены
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {vacancies.map((vacancy) => (
            <Card key={vacancy.id} className="glass-card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{vacancy.title}</CardTitle>
                    <p className="mt-2 text-foreground-secondary">
                      {vacancy.employer.company_name}
                    </p>
                  </div>
                  <Badge variant="warning">На модерации</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Details Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <MapPin className="h-4 w-4" />
                    <span>{vacancy.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {vacancy.salary_min.toLocaleString()} -{' '}
                      {vacancy.salary_max.toLocaleString()} ₽
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <Briefcase className="h-4 w-4" />
                    <span>{vacancy.employment_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(vacancy.created_at)}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-xl border border-border bg-glass-light p-4">
                  <p className="text-sm text-foreground-secondary">
                    {vacancy.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => handleApprove(vacancy.id)}
                    disabled={processing === vacancy.id}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Одобрить
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => handleReject(vacancy.id)}
                    disabled={processing === vacancy.id}
                    className="flex-1"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Отклонить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
