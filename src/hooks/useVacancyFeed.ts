/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Vacancy Feed Hook
 * Architecture v4: Connected to real API with graceful fallback
 */

import { useState, useEffect } from 'react';
import { Vacancy } from '@/types';
import { api } from '@/services/api';

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
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [offset, setOffset] = useState(0);

  const LIMIT = 10; // Load 10 vacancies per request

  /**
   * Load vacancies from API or fallback to mock data
   */
  const loadVacancies = async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;

      // Try to fetch from real API first
      const response = await api.getVacancies({
        limit: LIMIT,
        offset: currentOffset,
      });

      const newVacancies = response.vacancies;

      if (reset) {
        setVacancies(newVacancies);
      } else {
        setVacancies((prev) => [...prev, ...newVacancies]);
      }

      setHasMore(response.hasMore);
      setOffset(currentOffset + newVacancies.length);
      setUseMockData(false);

      console.log('✅ Loaded vacancies from API:', newVacancies.length);
    } catch (err: any) {
      // Graceful fallback to mock data if API not implemented
      if (err.message === 'VACANCY_API_NOT_IMPLEMENTED') {
        console.warn('⚠️ Using mock data - API not implemented yet');
        setUseMockData(true);

        if (reset) {
          setVacancies(MOCK_VACANCIES);
        } else {
          setVacancies((prev) => [...prev, ...MOCK_VACANCIES]);
        }

        setHasMore(true); // Mock data can be loaded infinitely
      } else {
        // Real error - show to user
        console.error('❌ Error loading vacancies:', err);
        setError(err.message || 'Failed to load vacancies');

        // Fallback to mock data on any error for demo purposes
        if (vacancies.length === 0) {
          console.warn('⚠️ Falling back to mock data due to error');
          setVacancies(MOCK_VACANCIES);
          setUseMockData(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadVacancies(true);
  }, []);

  /**
   * Fetch more vacancies (infinite scroll)
   */
  const fetchMore = () => {
    if (!hasMore || loading) {
      console.log('⏸️ FetchMore skipped:', { hasMore, loading });
      return;
    }

    console.log('📥 Fetching more vacancies...');
    loadVacancies(false);
  };

  /**
   * Refresh feed (pull-to-refresh)
   */
  const refresh = async () => {
    console.log('🔄 Refreshing feed...');
    setOffset(0);
    await loadVacancies(true);
  };

  return {
    vacancies,
    loading,
    hasMore,
    error,
    useMockData, // Flag to show warning in UI
    fetchMore,
    refresh,
  };
}
