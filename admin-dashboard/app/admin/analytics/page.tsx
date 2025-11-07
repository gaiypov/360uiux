'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Users,
  Briefcase,
  Video,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: Array<{ date: string; jobseekers: number; employers: number }>;
  vacancyStats: Array<{ date: string; posted: number; approved: number; rejected: number }>;
  videoViews: Array<{ date: string; views: number; uniqueUsers: number }>;
  applicationStats: Array<{ date: string; applications: number; responses: number }>;
  userActivity: Array<{ hour: string; active: number }>;
  platformStats: {
    totalUsers: number;
    totalVacancies: number;
    totalApplications: number;
    totalVideoViews: number;
    growthRate: number;
  };
  roleDistribution: Array<{ name: string; value: number }>;
  vacancyCategories: Array<{ category: string; count: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;

    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Date,Jobseekers,Employers,Vacancies,Applications\n' +
      data.userGrowth.map(row =>
        `${row.date},${row.jobseekers},${row.employers},0,0`
      ).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `analytics_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Загрузка аналитики...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Аналитика платформы
            </h1>
            <p className="text-gray-600">
              Статистика и метрики работы платформы
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">7 дней</option>
              <option value="30d">30 дней</option>
              <option value="90d">90 дней</option>
              <option value="1y">1 год</option>
            </select>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Экспорт
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Пользователей</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.platformStats.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  +{data.platformStats.growthRate}%
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Вакансий</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.platformStats.totalVacancies.toLocaleString()}
                </p>
              </div>
              <Briefcase className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Откликов</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.platformStats.totalApplications.toLocaleString()}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Просмотров видео</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.platformStats.totalVideoViews.toLocaleString()}
                </p>
              </div>
              <Video className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Рост пользователей
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.userGrowth}>
              <defs>
                <linearGradient id="colorJobseekers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEmployers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="jobseekers"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorJobseekers)"
                name="Соискатели"
              />
              <Area
                type="monotone"
                dataKey="employers"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorEmployers)"
                name="Работодатели"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Vacancy Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Статистика вакансий
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.vacancyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="posted"
                  stroke="#3b82f6"
                  name="Создано"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#10b981"
                  name="Одобрено"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke="#ef4444"
                  name="Отклонено"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Video Views */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Просмотры видео
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.videoViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#f59e0b" name="Всего просмотров" />
                <Bar dataKey="uniqueUsers" fill="#8b5cf6" name="Уникальных пользователей" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Отклики и отклики работодателей
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.applicationStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" fill="#3b82f6" name="Отклики" />
              <Bar dataKey="responses" fill="#10b981" name="Ответы работодателей" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column: Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* User Role Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Распределение по ролям
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Vacancy Categories */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Популярные категории вакансий
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.vacancyCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity by Hour */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Активность пользователей по часам
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.userActivity}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorActive)"
                name="Активных пользователей"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-8 mt-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Ключевые метрики</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">Средний отклик</p>
              <p className="text-3xl font-bold">
                {data.applicationStats.length > 0
                  ? (data.applicationStats.reduce((sum, stat) => sum + stat.responses, 0) /
                     data.applicationStats.reduce((sum, stat) => sum + stat.applications, 0) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Конверсия модерации</p>
              <p className="text-3xl font-bold">
                {data.vacancyStats.length > 0
                  ? (data.vacancyStats.reduce((sum, stat) => sum + stat.approved, 0) /
                     data.vacancyStats.reduce((sum, stat) => sum + stat.posted, 0) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Просмотров на вакансию</p>
              <p className="text-3xl font-bold">
                {data.platformStats.totalVacancies > 0
                  ? (data.platformStats.totalVideoViews / data.platformStats.totalVacancies).toFixed(1)
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Активность</p>
              <p className="text-3xl font-bold">
                {data.userActivity.length > 0
                  ? Math.max(...data.userActivity.map(h => h.active))
                  : 0}
              </p>
              <p className="text-blue-100 text-xs">пик активности</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
