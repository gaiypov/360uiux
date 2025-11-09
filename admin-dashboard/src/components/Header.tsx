'use client';

import { Bell, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Поиск..."
            className="w-full rounded-xl border border-border bg-glass-light py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* User actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-xl p-2 text-foreground-secondary transition-colors hover:bg-glass-light hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-error"></span>
          </span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-glass-light px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="text-sm font-semibold text-background">M</span>
          </div>
          <div className="text-sm">
            <div className="font-medium text-foreground">Модератор</div>
            <div className="text-xs text-foreground-muted">admin@360rabota.ru</div>
          </div>
          <Badge variant="info" className="ml-2">
            Moderator
          </Badge>
        </div>
      </div>
    </header>
  );
}
