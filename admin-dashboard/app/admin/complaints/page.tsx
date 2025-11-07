'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  Calendar,
  Flag
} from 'lucide-react';

// API Response interface
interface ComplaintAPIResponse {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_phone: string | null;
  reported_id: string;
  reported_name: string;
  reported_type: 'user' | 'vacancy' | 'application';
  type: 'user_behavior' | 'content_violation' | 'technical_issue' | 'fraud' | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  resolved_at: string | null;
  resolved_by_name: string | null;
  resolution: string | null;
  notes: string | null;
}

interface Complaint {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reportedRole: 'jobseeker' | 'employer' | 'vacancy';
  type: 'user_behavior' | 'content_violation' | 'technical_issue' | 'fraud' | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  notes?: string;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, typeFilter, priorityFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/complaints?status=${statusFilter}&type=${typeFilter}&priority=${priorityFilter}`
      );
      const data = await response.json();

      // Map API response to component interface
      const mappedComplaints: Complaint[] = (data.complaints || []).map((c: ComplaintAPIResponse) => ({
        id: c.id,
        reporterId: c.reporter_id,
        reporterName: c.reporter_name,
        reportedId: c.reported_id,
        reportedName: c.reported_name,
        reportedRole: c.reported_type === 'user' ? 'jobseeker' : c.reported_type === 'vacancy' ? 'vacancy' : 'employer',
        type: c.type,
        description: c.description,
        status: c.status,
        priority: c.priority,
        createdAt: c.created_at,
        resolvedAt: c.resolved_at || undefined,
        resolvedBy: c.resolved_by_name || undefined,
        resolution: c.resolution || undefined,
        notes: c.notes || undefined
      }));

      setComplaints(mappedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolution.trim()) {
      alert('Пожалуйста, укажите решение');
      return;
    }

    try {
      const response = await fetch('/api/admin/complaints/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          resolution,
          notes
        })
      });

      if (response.ok) {
        alert('Жалоба успешно обработана');
        setShowResolveModal(false);
        setSelectedComplaint(null);
        setResolution('');
        setNotes('');
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Ошибка при обработке жалобы');
    }
  };

  const handleReject = async (complaintId: string) => {
    if (!confirm('Вы уверены, что хотите отклонить эту жалобу?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/complaints/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId })
      });

      if (response.ok) {
        alert('Жалоба отклонена');
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error rejecting complaint:', error);
      alert('Ошибка при отклонении жалобы');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      user_behavior: 'Поведение пользователя',
      content_violation: 'Нарушение контента',
      technical_issue: 'Техническая проблема',
      fraud: 'Мошенничество',
      other: 'Другое'
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      critical: 'Критический',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий'
    };
    return labels[priority] || priority;
  };

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const rejectedCount = complaints.filter(c => c.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление жалобами
          </h1>
          <p className="text-gray-600">
            Рассмотрение и обработка жалоб пользователей
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Всего жалоб</p>
                <p className="text-3xl font-bold text-gray-900">{complaints.length}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ожидают</p>
                <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Решено</p>
                <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Отклонено</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все статусы</option>
              <option value="pending">Ожидают</option>
              <option value="resolved">Решено</option>
              <option value="rejected">Отклонено</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все типы</option>
              <option value="user_behavior">Поведение пользователя</option>
              <option value="content_violation">Нарушение контента</option>
              <option value="technical_issue">Техническая проблема</option>
              <option value="fraud">Мошенничество</option>
              <option value="other">Другое</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все приоритеты</option>
              <option value="critical">Критический</option>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">Загрузка жалоб...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">Жалобы не найдены</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        <Flag className="w-3 h-3 inline mr-1" />
                        {getPriorityLabel(complaint.priority)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        complaint.status === 'pending'
                          ? 'bg-orange-100 text-orange-800'
                          : complaint.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {complaint.status === 'pending' && 'Ожидает'}
                        {complaint.status === 'resolved' && 'Решено'}
                        {complaint.status === 'rejected' && 'Отклонено'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getTypeLabel(complaint.type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>От: <strong>{complaint.reporterName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>На: <strong>{complaint.reportedName}</strong> ({complaint.reportedRole === 'jobseeker' ? 'Соискатель' : complaint.reportedRole === 'employer' ? 'Работодатель' : 'Вакансия'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(complaint.createdAt).toLocaleString('ru-RU')}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{complaint.description}</p>

                    {complaint.resolution && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-green-900 mb-1">
                          Решение:
                        </p>
                        <p className="text-sm text-green-800">{complaint.resolution}</p>
                        {complaint.resolvedBy && (
                          <p className="text-xs text-green-600 mt-1">
                            Решено: {complaint.resolvedBy} • {new Date(complaint.resolvedAt!).toLocaleString('ru-RU')}
                          </p>
                        )}
                      </div>
                    )}

                    {complaint.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          Заметки:
                        </p>
                        <p className="text-sm text-blue-800">{complaint.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {complaint.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowResolveModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Решить
                    </button>
                    <button
                      onClick={() => handleReject(complaint.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Отклонить
                    </button>
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Подробнее
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Resolve Modal */}
        {showResolveModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Решение жалобы
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Жалоба от: {selectedComplaint.reporterName}
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedComplaint.description}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Решение <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Опишите принятое решение..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дополнительные заметки
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Дополнительная информация (необязательно)..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowResolveModal(false);
                    setResolution('');
                    setNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleResolve}
                  disabled={!resolution.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Сохранить решение
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
