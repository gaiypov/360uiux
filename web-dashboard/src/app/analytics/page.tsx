'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  DollarSign,
  Calendar,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import DonutChart from '@/components/dashboard/DonutChart';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Расширенная аналитика
          </h1>
          <p className="text-gray-400">
            Детальная статистика и отчеты по всем вакансиям
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-[#1A1A23] text-white hover:bg-[#1A1A23]"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Выбрать период
          </Button>
          <Button
            variant="outline"
            className="border-[#1A1A23] text-white hover:bg-[#1A1A23]"
          >
            <Filter className="w-5 h-5 mr-2" />
            Фильтры
          </Button>
          <Button className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]">
            <Download className="w-5 h-5 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#121218] border-[#1A1A23] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8E7FFF] to-[#39E0F8] flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUp className="w-4 h-4 mr-1" />
              +12.5%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Просмотры вакансий</h3>
          <p className="text-3xl font-bold text-white">12,458</p>
          <p className="text-xs text-gray-500 mt-1">За последние 30 дней</p>
        </Card>

        <Card className="bg-[#121218] border-[#1A1A23] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUp className="w-4 h-4 mr-1" />
              +8.2%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Всего откликов</h3>
          <p className="text-3xl font-bold text-white">856</p>
          <p className="text-xs text-gray-500 mt-1">За последние 30 дней</p>
        </Card>

        <Card className="bg-[#121218] border-[#1A1A23] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center text-red-400 text-sm">
              <ArrowDown className="w-4 h-4 mr-1" />
              -3.1%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Конверсия</h3>
          <p className="text-3xl font-bold text-white">6.8%</p>
          <p className="text-xs text-gray-500 mt-1">Просмотры → Отклики</p>
        </Card>

        <Card className="bg-[#121218] border-[#1A1A23] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUp className="w-4 h-4 mr-1" />
              +15.3%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Стоимость отклика</h3>
          <p className="text-3xl font-bold text-white">₽ 245</p>
          <p className="text-xs text-gray-500 mt-1">Средняя за месяц</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card className="bg-[#121218] border-[#1A1A23] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Просмотры вакансий
          </h3>
          <PerformanceChart />
        </Card>

        <Card className="bg-[#121218] border-[#1A1A23] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Распределение откликов
          </h3>
          <DonutChart />
        </Card>
      </div>

      {/* Top Vacancies Table */}
      <Card className="bg-[#121218] border-[#1A1A23] p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          Топ вакансий по откликам
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A23]">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Вакансия
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Просмотры
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Отклики
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Конверсия
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  title: 'Senior Frontend Developer',
                  views: 1234,
                  applications: 87,
                  conversion: '7.0%',
                  status: 'Активна',
                },
                {
                  title: 'Backend Developer',
                  views: 982,
                  applications: 65,
                  conversion: '6.6%',
                  status: 'Активна',
                },
                {
                  title: 'UI/UX Designer',
                  views: 856,
                  applications: 54,
                  conversion: '6.3%',
                  status: 'Активна',
                },
                {
                  title: 'Product Manager',
                  views: 743,
                  applications: 42,
                  conversion: '5.7%',
                  status: 'Активна',
                },
                {
                  title: 'DevOps Engineer',
                  views: 625,
                  applications: 38,
                  conversion: '6.1%',
                  status: 'На модерации',
                },
              ].map((vacancy, index) => (
                <tr
                  key={index}
                  className="border-b border-[#1A1A23] hover:bg-[#0A0A0F] transition-colors"
                >
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{vacancy.title}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300">{vacancy.views.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300">{vacancy.applications}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-green-400 font-semibold">
                      {vacancy.conversion}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vacancy.status === 'Активна'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {vacancy.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
