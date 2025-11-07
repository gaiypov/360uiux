import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Moderation API
 *
 * List vacancies for moderation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';

    // TODO: Replace with actual database query
    // Mock data for demonstration
    let vacancies = [
      {
        id: 'vacancy-1',
        title: 'Менеджер по продажам',
        employerName: 'ООО "Технологии будущего"',
        employerId: 'employer-1',
        videoUrl: '/api/videos/vacancy-1.mp4',
        description: 'Ищем активного менеджера по продажам в отдел корпоративных продаж. Зарплата от 80,000 руб + бонусы.',
        salary: '80,000 - 150,000 руб',
        location: 'Москва',
        category: 'Продажи',
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        aiCheck: {
          videoQuality: 'good',
          audioQuality: 'good',
          contentMatch: 'high',
          flags: [],
          confidence: 0.92
        }
      },
      {
        id: 'vacancy-2',
        title: 'React разработчик',
        employerName: 'Стартап "Инновации"',
        employerId: 'employer-2',
        videoUrl: '/api/videos/vacancy-2.mp4',
        description: 'Требуется опытный React разработчик для работы над интересным проектом.',
        salary: '150,000 - 250,000 руб',
        location: 'Санкт-Петербург',
        category: 'IT',
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        aiCheck: {
          videoQuality: 'excellent',
          audioQuality: 'good',
          contentMatch: 'high',
          flags: [],
          confidence: 0.95
        }
      },
      {
        id: 'vacancy-3',
        title: 'Курьер',
        employerName: 'ИП Петров',
        employerId: 'employer-3',
        videoUrl: '/api/videos/vacancy-3.mp4',
        description: 'Требуется курьер для доставки товаров по городу.',
        salary: '40,000 - 60,000 руб',
        location: 'Казань',
        category: 'Логистика',
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        aiCheck: {
          videoQuality: 'poor',
          audioQuality: 'medium',
          contentMatch: 'medium',
          flags: ['low_video_quality'],
          confidence: 0.65
        }
      },
      {
        id: 'vacancy-4',
        title: 'Официант',
        employerName: 'Ресторан "Вкусно"',
        employerId: 'employer-4',
        videoUrl: '/api/videos/vacancy-4.mp4',
        description: 'Ищем дружелюбного официанта в команду ресторана.',
        salary: '50,000 - 70,000 руб',
        location: 'Москва',
        category: 'HoReCa',
        status: 'approved' as const,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Иван Петров',
        aiCheck: {
          videoQuality: 'good',
          audioQuality: 'excellent',
          contentMatch: 'high',
          flags: [],
          confidence: 0.89
        }
      },
      {
        id: 'vacancy-5',
        title: 'Программист Python',
        employerName: 'ООО "Данные и Аналитика"',
        employerId: 'employer-5',
        videoUrl: '/api/videos/vacancy-5.mp4',
        description: 'Backend разработчик для работы с большими данными.',
        salary: '120,000 - 200,000 руб',
        location: 'Удаленно',
        category: 'IT',
        status: 'rejected' as const,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        rejectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        rejectedBy: 'Мария Сидорова',
        rejectionReason: 'Низкое качество видео',
        rejectionComment: 'Видео слишком темное, звук прерывается. Пожалуйста, перезапишите.',
        aiCheck: {
          videoQuality: 'poor',
          audioQuality: 'poor',
          contentMatch: 'low',
          flags: ['low_video_quality', 'low_audio_quality'],
          confidence: 0.45
        }
      }
    ];

    // Apply status filter
    if (status !== 'all') {
      vacancies = vacancies.filter(v => v.status === status);
    }

    return NextResponse.json({ vacancies });

  } catch (error) {
    console.error('Error fetching vacancies for moderation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
