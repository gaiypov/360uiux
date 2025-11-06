'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  FileText,
  MessageSquare,
  Wallet,
  FileBarChart,
  TrendingUp,
  Settings,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Обзор', href: '/', icon: LayoutDashboard },
  { name: 'Вакансии', href: '/vacancies', icon: Video },
  { name: 'Отклики', href: '/applications', icon: FileText },
  { name: 'Чаты', href: '/chats', icon: MessageSquare },
  { name: 'Кошелек', href: '/wallet', icon: Wallet },
  { name: 'Счета', href: '/invoices', icon: FileBarChart },
  { name: 'Аналитика', href: '/analytics', icon: TrendingUp },
  { name: 'Настройки', href: '/settings', icon: Settings },
  { name: 'Компания', href: '/company', icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background-secondary">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <h1 className="bg-gradient-primary bg-clip-text text-xl font-bold text-transparent">
            360° РАБОТА
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'hover:bg-background-elevated',
                  isActive
                    ? 'bg-background-elevated text-foreground border-l-2 border-primary'
                    : 'text-foreground-secondary hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-primary' : 'text-foreground-muted group-hover:text-foreground'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Balance Widget */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-gradient-primary p-4">
            <div className="mb-2 text-xs font-medium text-background/80">Баланс кошелька</div>
            <div className="mb-3 text-2xl font-bold text-background">15 350 ₽</div>
            <Button
              size="sm"
              className="w-full bg-background/20 text-background hover:bg-background/30"
            >
              Пополнить
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
