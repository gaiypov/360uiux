import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Users API
 *
 * List and manage platform users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';

    // TODO: Replace with actual database query
    // Mock data for demonstration
    let users = [
      {
        id: 'user-1',
        name: 'Алексей Иванов',
        email: 'aleksey.ivanov@example.com',
        phone: '+7 (999) 123-45-67',
        role: 'jobseeker' as const,
        status: 'active' as const,
        registeredAt: '2024-01-15T10:00:00Z',
        lastActive: '2024-02-01T15:30:00Z',
        stats: {
          applicationsCount: 12
        }
      },
      {
        id: 'user-2',
        name: 'ООО "Технологии будущего"',
        email: 'hr@tech-future.com',
        phone: '+7 (495) 000-11-22',
        role: 'employer' as const,
        status: 'active' as const,
        registeredAt: '2024-01-10T09:00:00Z',
        lastActive: '2024-02-01T14:20:00Z',
        stats: {
          vacanciesCount: 8
        }
      },
      {
        id: 'user-3',
        name: 'Мария Петрова',
        email: 'maria.petrova@example.com',
        phone: '+7 (999) 234-56-78',
        role: 'jobseeker' as const,
        status: 'blocked' as const,
        registeredAt: '2024-01-20T11:00:00Z',
        lastActive: '2024-01-28T16:45:00Z',
        stats: {
          applicationsCount: 5
        }
      },
      {
        id: 'user-4',
        name: 'ИП Сидоров',
        email: 'sidorov@business.com',
        phone: '+7 (499) 111-22-33',
        role: 'employer' as const,
        status: 'active' as const,
        registeredAt: '2024-01-12T08:30:00Z',
        lastActive: '2024-02-01T10:15:00Z',
        stats: {
          vacanciesCount: 3
        }
      },
      {
        id: 'user-5',
        name: 'Дмитрий Козлов',
        email: 'dmitry.kozlov@example.com',
        phone: '+7 (999) 345-67-89',
        role: 'jobseeker' as const,
        status: 'active' as const,
        registeredAt: '2024-01-25T14:00:00Z',
        lastActive: '2024-02-01T17:00:00Z',
        stats: {
          applicationsCount: 8
        }
      }
    ];

    // Apply filters
    if (role !== 'all') {
      users = users.filter(u => u.role === role);
    }
    if (status !== 'all') {
      users = users.filter(u => u.status === status);
    }

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
