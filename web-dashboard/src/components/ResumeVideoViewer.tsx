/**
 * 360° РАБОТА - Web Dashboard
 * Resume Video Viewer Component
 * Architecture v3: View private resume videos with 2-view limit
 */

'use client';

import { useState, useEffect } from 'react';
import { Lock, Play, Eye, AlertCircle } from 'lucide-react';

interface ResumeVideoViewerProps {
  videoId: string;
  applicationId: string;
  thumbnailUrl?: string;
}

interface ViewStatus {
  can_view: boolean;
  views_left: number;
  total_views: number;
}

interface SecureUrlResponse {
  url: string;
  expires_at: string;
  views_remaining: number;
}

export function ResumeVideoViewer({
  videoId,
  applicationId,
  thumbnailUrl,
}: ResumeVideoViewerProps) {
  const [loading, setLoading] = useState(false);
  const [viewStatus, setViewStatus] = useState<ViewStatus | null>(null);
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlExpiresAt, setUrlExpiresAt] = useState<Date | null>(null);

  // Check view limit on mount
  useEffect(() => {
    checkViewLimit();
  }, [videoId, applicationId]);

  // Auto-refresh URL before expiry
  useEffect(() => {
    if (secureUrl && urlExpiresAt) {
      const timeUntilExpiry = urlExpiresAt.getTime() - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 60000, 30000); // Refresh 1 min before

      const timer = setTimeout(() => {
        if (viewStatus && viewStatus.can_view) {
          loadSecureUrl();
        }
      }, refreshTime);

      return () => clearTimeout(timer);
    }
  }, [secureUrl, urlExpiresAt]);

  async function checkViewLimit() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/videos/resume/${videoId}/check-view-limit?applicationId=${applicationId}`
      );

      if (!response.ok) {
        throw new Error('Failed to check view limit');
      }

      const data: ViewStatus = await response.json();
      setViewStatus(data);

      if (!data.can_view) {
        setLimitReached(true);
      }
    } catch (err: any) {
      console.error('Error checking view limit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSecureUrl() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/videos/resume/${videoId}/secure-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          setLimitReached(true);
          throw new Error('View limit exceeded');
        }
        throw new Error('Failed to load video');
      }

      const data: SecureUrlResponse = await response.json();

      setSecureUrl(data.url);
      setUrlExpiresAt(new Date(data.expires_at));

      // Update view status
      if (viewStatus) {
        setViewStatus({
          ...viewStatus,
          views_left: data.views_remaining,
          total_views: viewStatus.total_views + 1,
        });
      }
    } catch (err: any) {
      console.error('Error loading secure URL:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading && !secureUrl) {
    return (
      <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-400">Загрузка видео...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !limitReached) {
    return (
      <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border-2 border-red-500/30">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-gray-300 font-semibold mb-2">Ошибка загрузки</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => {
              setError(null);
              checkViewLimit();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Limit exceeded state
  if (limitReached || (viewStatus && !viewStatus.can_view)) {
    return (
      <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-xl bg-black/50 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-bold text-gray-200 mb-2">
              Видео недоступно
            </h3>
            <p className="text-gray-400 mb-4">
              Лимит просмотров исчерпан (2/2)
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>Просмотрено: {viewStatus?.total_views || 2}/2</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview state (before first play)
  if (!secureUrl) {
    return (
      <button
        onClick={loadSecureUrl}
        disabled={loading}
        className="group relative w-full h-64 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700 hover:border-blue-500 transition overflow-hidden"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition"
          />
        ) : null}

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-transparent via-black/50 to-black/70">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4">
              <Play className="w-12 h-12 text-white" fill="white" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Посмотреть видео-резюме
            </h3>
            {viewStatus && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-2">
                <Eye className="w-4 h-4" />
                <span>
                  Осталось просмотров: {viewStatus.views_left}/2
                </span>
              </div>
            )}
            <p className="text-xs text-amber-400 mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              После {viewStatus?.views_left || 2}{' '}
              {viewStatus?.views_left === 1 ? 'просмотра' : 'просмотров'} видео
              исчезнет
            </p>
          </div>
        </div>
      </button>
    );
  }

  // Video player state
  const timeRemaining = urlExpiresAt
    ? Math.max(0, Math.floor((urlExpiresAt.getTime() - Date.now()) / 1000 / 60))
    : 5;

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          src={secureUrl}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="w-full rounded-lg"
          autoPlay
          poster={thumbnailUrl}
        />

        {/* View counter overlay */}
        {viewStatus && (
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">
              {viewStatus.views_left}{' '}
              {viewStatus.views_left === 1 ? 'просмотр' : 'просмотра'} остался
            </span>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-amber-500">
          <AlertCircle className="w-4 h-4" />
          <span>
            ⚠️ Осталось {viewStatus?.views_left || 0} просмотр(а)
          </span>
        </div>
        <span className="text-gray-500">
          Ссылка истекает через {timeRemaining} мин
        </span>
      </div>

      {/* Privacy notice */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-xs text-gray-400">
          Приватное видео • Защищено от скачивания • Исчезнет после{' '}
          {viewStatus?.views_left || 0} просмотр(ов)
        </p>
      </div>
    </div>
  );
}
