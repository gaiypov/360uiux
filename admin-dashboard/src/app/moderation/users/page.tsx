'use client';

import { useEffect, useState } from 'react';
import { Users, Mail, Phone, Calendar, Shield, Check, X, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: 'jobseeker' | 'employer';
  created_at: string;
  company_name?: string;
  inn?: string;
}

export default function UserModeration() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.getPendingUsers(20);
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessing(userId);
    try {
      const response = await api.approveUser(userId);
      if (!response.error) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Причина отклонения:');
    if (!reason) return;

    setProcessing(userId);
    try {
      const response = await api.rejectUser(userId, reason);
      if (!response.error) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to reject user:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleBan = async (userId: string) => {
    const reason = prompt('Причина блокировки:');
    if (!reason) return;

    setProcessing(userId);
    try {
      const response = await api.banUser(userId, reason);
      if (!response.error) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-foreground-muted">Загрузка пользователей...</p>
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
            Модерация пользователей
          </h1>
          <p className="mt-2 text-foreground-secondary">
            Проверка новых пользователей на платформе
          </p>
        </div>
        <Badge variant="error" className="text-base px-4 py-2">
          {users.length} на проверке
        </Badge>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-16 w-16 text-foreground-muted" />
            <p className="mt-4 text-lg font-medium text-foreground">
              Нет пользователей на модерации
            </p>
            <p className="mt-2 text-foreground-muted">
              Все пользователи проверены
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {users.map((user) => (
            <Card key={user.id} className="glass-card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
                      <span className="text-2xl font-bold text-background">
                        {user.full_name[0]}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{user.full_name}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant={user.role === 'employer' ? 'info' : 'default'}
                        >
                          {user.role === 'employer'
                            ? 'Работодатель'
                            : 'Соискатель'}
                        </Badge>
                        {user.company_name && (
                          <span className="text-sm text-foreground-secondary">
                            {user.company_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="error">На проверке</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-foreground-muted" />
                    <span className="text-foreground-secondary">
                      {user.phone}
                    </span>
                  </div>
                  {user.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground-secondary">
                        {user.email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-foreground-muted" />
                    <span className="text-foreground-secondary">
                      Регистрация: {formatDate(user.created_at)}
                    </span>
                  </div>
                  {user.inn && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground-secondary">
                        ИНН: {user.inn}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="success"
                    onClick={() => handleApprove(user.id)}
                    disabled={processing === user.id}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Одобрить
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(user.id)}
                    disabled={processing === user.id}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Отклонить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleBan(user.id)}
                    disabled={processing === user.id}
                  >
                    <Ban className="h-4 w-4" />
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
