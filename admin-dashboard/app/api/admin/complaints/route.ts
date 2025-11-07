import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Complaints API
 *
 * List and filter complaints
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const priority = searchParams.get('priority') || 'all';

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';

    // TODO: Replace with actual database query
    // Mock data for demonstration
    let complaints = [
      {
        id: 'complaint-1',
        reporterId: 'user-10',
        reporterName: 'Анна Сергеева',
        reportedId: 'user-20',
        reportedName: 'ООО "Сомнительная Компания"',
        reportedRole: 'employer' as const,
        type: 'fraud' as const,
        description: 'Компания требует предоплату за рассмотрение резюме. Подозрение на мошенничество.',
        status: 'pending' as const,
        priority: 'high' as const,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'complaint-2',
        reporterId: 'user-11',
        reporterName: 'Иван Кузнецов',
        reportedId: 'user-21',
        reportedName: 'Елена Волкова',
        reportedRole: 'jobseeker' as const,
        type: 'user_behavior' as const,
        description: 'Пользователь отправляет неприличные сообщения в чате.',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'complaint-3',
        reporterId: 'user-12',
        reporterName: 'ИП Смирнов',
        reportedId: 'vacancy-100',
        reportedName: 'Вакансия "Менеджер по продажам"',
        reportedRole: 'vacancy' as const,
        type: 'content_violation' as const,
        description: 'В описании вакансии содержится дискриминационный контент по возрасту.',
        status: 'resolved' as const,
        priority: 'high' as const,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 'Иван Петров',
        resolution: 'Вакансия удалена. Работодатель получил предупреждение.',
        notes: 'Первое нарушение. Работодатель уведомлен о правилах.'
      },
      {
        id: 'complaint-4',
        reporterId: 'user-13',
        reporterName: 'Мария Новикова',
        reportedId: 'user-22',
        reportedName: 'ООО "Рога и Копыта"',
        reportedRole: 'employer' as const,
        type: 'technical_issue' as const,
        description: 'Не могу посмотреть видео вакансии, постоянно выдает ошибку 404.',
        status: 'resolved' as const,
        priority: 'low' as const,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 'Мария Сидорова',
        resolution: 'Техническая проблема устранена. Файл восстановлен из резервной копии.'
      },
      {
        id: 'complaint-5',
        reporterId: 'user-14',
        reporterName: 'Петр Соколов',
        reportedId: 'user-23',
        reportedName: 'Александра Морозова',
        reportedRole: 'jobseeker' as const,
        type: 'other' as const,
        description: 'Подозрительная активность - множественные отклики на все вакансии подряд без разбора.',
        status: 'rejected' as const,
        priority: 'low' as const,
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 'Алексей Козлов',
        resolution: 'Жалоба отклонена. Активность пользователя не нарушает правила платформы.'
      },
      {
        id: 'complaint-6',
        reporterId: 'user-15',
        reporterName: 'Ольга Белова',
        reportedId: 'vacancy-101',
        reportedName: 'Вакансия "Курьер"',
        reportedRole: 'vacancy' as const,
        type: 'content_violation' as const,
        description: 'В видео вакансии присутствует ненормативная лексика.',
        status: 'pending' as const,
        priority: 'critical' as const,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Apply filters
    if (status !== 'all') {
      complaints = complaints.filter(c => c.status === status);
    }
    if (type !== 'all') {
      complaints = complaints.filter(c => c.type === type);
    }
    if (priority !== 'all') {
      complaints = complaints.filter(c => c.priority === priority);
    }

    return NextResponse.json({ complaints });

  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
