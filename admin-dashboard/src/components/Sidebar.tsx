'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Обзор', href: '/', icon: LayoutDashboard },
  { name: 'Модерация вакансий', href: '/moderation/vacancies', icon: FileText },
  { name: 'Модерация пользователей', href: '/moderation/users', icon: Users },
  { name: 'Безопасность', href: '/security', icon: Shield },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
            <Shield className="h-6 w-6 text-background" />
          </div>
          <div>
            <div className="text-sm font-bold gradient-text">360° РАБОТА</div>
            <div className="text-xs text-foreground-muted">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-primary text-background shadow-glow'
                  : 'text-foreground-secondary hover:bg-glass-light hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
        <button
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground-secondary transition-all hover:bg-glass-light hover:text-error"
          onClick={() => {
            // Handle logout
            console.log('Logout');
          }}
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </div>
  );
}
