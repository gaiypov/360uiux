/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Vacancy Feed Hook
 */

import { useState, useEffect } from 'react';
import { Vacancy } from '@/types';

// Mock data для демонстрации
const MOCK_VACANCIES: Vacancy[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    employer: {
      id: 'e1',
      companyName: 'Yandex',
      rating: 4.8,
      verified: true,
      industry: 'IT',
    },
    salaryMin: 250000,
    salaryMax: 350000,
    city: 'Москва',
    metro: 'Красные ворота',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    benefits: ['ДМС', 'Удаленка', 'Гибкий график'],
    applications: 128,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Product Designer',
    employer: {
      id: 'e2',
      companyName: 'VK',
      rating: 4.6,
      verified: true,
      industry: 'IT',
    },
    salaryMin: 200000,
    salaryMax: 280000,
    city: 'Санкт-Петербург',
    metro: 'Площадь Восстания',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    benefits: ['ДМС', 'Обучение', 'Офис в центре'],
    applications: 89,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'React Native Developer',
    employer: {
      id: 'e3',
      companyName: 'Avito',
      rating: 4.7,
      verified: true,
      industry: 'IT',
    },
    salaryMin: 220000,
    salaryMax: 300000,
    city: 'Москва',
    metro: 'Автозаводская',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    benefits: ['ДМС', 'Опционы', 'Спортзал'],
    applications: 156,
    createdAt: new Date().toISOString(),
  },
];

export function useVacancyFeed() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setVacancies(MOCK_VACANCIES);
      setLoading(false);
    }, 1000);
  }, []);

  const fetchMore = () => {
    if (!hasMore || loading) return;

    setLoading(true);
    // Имитация подгрузки новых данных
    setTimeout(() => {
      setVacancies((prev) => [...prev, ...MOCK_VACANCIES]);
      setLoading(false);
    }, 1000);
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setVacancies(MOCK_VACANCIES);
      setLoading(false);
    }, 1000);
  };

  return {
    vacancies,
    loading,
    hasMore,
    fetchMore,
    refresh,
  };
}
