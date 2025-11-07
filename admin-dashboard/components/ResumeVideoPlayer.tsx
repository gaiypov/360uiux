'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  videoId: string;
  applicationId: string;
  onViewLimitReached?: () => void;
}

/**
 * Resume Video Player with 2-View Limit
 *
 * CRITICAL FEATURE:
 * - Employers can only view a video resume 2 times
 * - After 2 views, the video is permanently locked
 * - View is tracked when video starts playing
 * - Shows remaining views counter
 */
export default function ResumeVideoPlayer({
  videoId,
  applicationId,
  onViewLimitReached
}: Props) {
  const [viewCount, setViewCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasTrackedView = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchViewCount();
  }, [videoId, applicationId]);

  const fetchViewCount = async () => {
    try {
      const response = await fetch(
        `/api/video/track-view?videoId=${videoId}&applicationId=${applicationId}`
      );
      const data = await response.json();

      setViewCount(data.viewCount);
      setIsLocked(data.isLocked);
    } catch (error) {
      console.error('Error fetching view count:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    if (hasTrackedView.current || isLocked) return;

    hasTrackedView.current = true;

    try {
      const response = await fetch('/api/video/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          applicationId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // View limit reached
          setIsLocked(true);
          if (onViewLimitReached) {
            onViewLimitReached();
          }
        }
        throw new Error(data.error || 'Failed to track view');
      }

      setViewCount(data.viewCount);
      setIsLocked(data.isLocked);

      if (data.viewCount === 2) {
        // Last view
        setTimeout(() => {
          alert('⚠️ Это был последний просмотр. Видео больше недоступно.');
          setIsLocked(true);
          if (onViewLimitReached) {
            onViewLimitReached();
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handlePlay = () => {
    // Track view when video starts playing
    if (!hasTrackedView.current && !isLocked) {
      trackView();
    }
  };

  if (loading) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white p-8">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-2xl font-bold mb-2">Лимит просмотров исчерпан</h3>
        <p className="text-gray-400 text-center">
          Вы уже посмотрели это видео 2 раза.<br />
          Видео больше недоступно для просмотра.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* View Counter Badge */}
      <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm font-medium">
        {viewCount === 0 && '👀 Не просмотрено (2 просмотра доступно)'}
        {viewCount === 1 && '⚠️ Осталось 1 просмотр'}
        {viewCount >= 2 && '🔒 Лимит исчерпан'}
      </div>

      {/* Warning for first view */}
      {viewCount === 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-yellow-500 bg-opacity-90 text-black px-4 py-3 rounded-lg text-sm">
          <strong>⚠️ Внимание:</strong> Это видео можно посмотреть только 2 раза!
        </div>
      )}

      {/* Video Player */}
      <video
        ref={videoRef}
        controls
        onPlay={handlePlay}
        className="w-full aspect-video bg-black rounded-lg"
        poster="/video-placeholder.jpg"
      >
        <source src={`/api/videos/${videoId}`} type="video/mp4" />
        Ваш браузер не поддерживает воспроизведение видео
      </video>
    </div>
  );
}
