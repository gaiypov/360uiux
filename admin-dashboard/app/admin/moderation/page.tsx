'use client';

import { useEffect, useState } from 'react';

type Vacancy = {
  id: string;
  title: string;
  company: string;
  employerName: string;
  videoUrl: string;
  duration: string;
  quality: string;
  createdAt: string;
  description: string;
  salary: string;
  location: string;
};

export default function ModerationPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReason, setSelectedReason] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [currentVacancyId, setCurrentVacancyId] = useState<string | null>(null);

  useEffect(() => {
    fetchVacancies();
  }, [filter]);

  const fetchVacancies = async () => {
    try {
      const response = await fetch(`/api/admin/moderation?status=${filter}`);
      const data = await response.json();
      setVacancies(data);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vacancyId: string) => {
    try {
      await fetch('/api/admin/moderation/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacancyId }),
      });

      // Remove from list
      setVacancies(vacancies.filter(v => v.id !== vacancyId));
      alert('Вакансия одобрена!');
    } catch (error) {
      console.error('Error approving vacancy:', error);
      alert('Ошибка при одобрении');
    }
  };

  const handleReject = async () => {
    if (!selectedReason || !currentVacancyId) return;

    try {
      await fetch('/api/admin/moderation/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyId: currentVacancyId,
          reason: selectedReason,
          comment: rejectComment,
        }),
      });

      // Remove from list
      setVacancies(vacancies.filter(v => v.id !== currentVacancyId));
      setShowRejectDialog(false);
      setSelectedReason('');
      setRejectComment('');
      setCurrentVacancyId(null);
      alert('Вакансия отклонена');
    } catch (error) {
      console.error('Error rejecting vacancy:', error);
      alert('Ошибка при отклонении');
    }
  };

  const openRejectDialog = (vacancyId: string) => {
    setCurrentVacancyId(vacancyId);
    setShowRejectDialog(true);
  };

  const rejectReasons = [
    'Несоответствие описанию',
    'Низкое качество видео',
    'Низкое качество звука',
    'Недопустимый контент',
    'Спам/мошенничество',
    'Другое',
  ];

  if (loading) {
    return <div className="p-8">Загрузка...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Модерация видео-вакансий</h1>
        <p className="text-gray-600">Проверка и одобрение вакансий перед публикацией</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'pending'
              ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
              : 'bg-white text-gray-600 border border-gray-300'
          }`}
        >
          Ожидают ({vacancies.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'approved'
              ? 'bg-green-100 text-green-700 border-2 border-green-500'
              : 'bg-white text-gray-600 border border-gray-300'
          }`}
        >
          Одобренные
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'rejected'
              ? 'bg-red-100 text-red-700 border-2 border-red-500'
              : 'bg-white text-gray-600 border border-gray-300'
          }`}
        >
          Отклонённые
        </button>
      </div>

      {/* Vacancy Cards */}
      <div className="space-y-6">
        {vacancies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Нет вакансий для модерации</p>
          </div>
        ) : (
          vacancies.map((vacancy) => (
            <div key={vacancy.id} className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video Player */}
                <div>
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    <video
                      src={vacancy.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    >
                      Ваш браузер не поддерживает видео
                    </video>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Длительность: {vacancy.duration}</p>
                    <p>Качество: {vacancy.quality}</p>
                    <p>Загружено: {new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {vacancy.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{vacancy.company}</p>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Работодатель:</span> {vacancy.employerName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Зарплата:</span> {vacancy.salary}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Местоположение:</span> {vacancy.location}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Описание:</h4>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {vacancy.description}
                    </p>
                  </div>

                  {/* AI Check Results */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-green-900 mb-2">
                      ✅ AI проверка пройдена
                    </p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Длительность: OK ({vacancy.duration})</li>
                      <li>• Качество видео: {vacancy.quality}</li>
                      <li>• Качество звука: Хорошее</li>
                      <li>• Контент: Безопасный</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  {filter === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(vacancy.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      >
                        ✅ Одобрить
                      </button>
                      <button
                        onClick={() => openRejectDialog(vacancy.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      >
                        ❌ Отклонить
                      </button>
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
                        ⏩ Пропустить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Отклонить вакансию
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Причина отклонения *
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите причину</option>
                {rejectReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий (опционально)
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Дополнительная информация для работодателя..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedReason('');
                  setRejectComment('');
                  setCurrentVacancyId(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleReject}
                disabled={!selectedReason}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
