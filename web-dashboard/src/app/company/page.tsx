'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building,
  MapPin,
  Globe,
  Users,
  Upload,
  Save,
  X,
  Plus,
} from 'lucide-react';

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Профиль компании</h1>
        <p className="text-gray-400">
          Управление информацией о вашей компании
        </p>
      </div>

      <div className="max-w-5xl">
        {/* Company Logo & Cover */}
        <Card className="bg-[#121218] border-[#1A1A23] p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Логотип и обложка
          </h2>

          <div className="space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Обложка компании
              </label>
              <div className="relative h-48 rounded-2xl bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="px-6 py-3 bg-black/50 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-black/70 transition-colors">
                    <Upload className="w-5 h-5 inline mr-2" />
                    Загрузить обложку
                  </button>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Логотип компании
              </label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-[#0A0A0F] flex items-center justify-center border-2 border-[#1A1A23]">
                  <Building className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <Button
                    variant="outline"
                    className="border-[#1A1A23] text-white hover:bg-[#1A1A23] mb-2"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Загрузить логотип
                  </Button>
                  <p className="text-sm text-gray-400">PNG или JPG до 2MB</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Company Information */}
        <Card className="bg-[#121218] border-[#1A1A23] p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Основная информация
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название компании
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  defaultValue="Tech Corp"
                  className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Описание компании
              </label>
              <textarea
                defaultValue="Мы — технологическая компания, специализирующаяся на разработке инновационных решений для бизнеса..."
                rows={5}
                className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1A1A23] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#8E7FFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Город
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    defaultValue="Москва"
                    className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Размер компании
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select className="w-full pl-10 px-4 py-3 bg-[#0A0A0F] border border-[#1A1A23] rounded-xl text-white focus:outline-none focus:border-[#8E7FFF]">
                    <option>1-10 сотрудников</option>
                    <option>11-50 сотрудников</option>
                    <option selected>51-200 сотрудников</option>
                    <option>201-500 сотрудников</option>
                    <option>500+ сотрудников</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Веб-сайт
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  defaultValue="https://techcorp.ru"
                  className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Social Media */}
        <Card className="bg-[#121218] border-[#1A1A23] p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Социальные сети</h2>

          <div className="space-y-4">
            {[
              { name: 'VK', placeholder: 'https://vk.com/techcorp' },
              { name: 'Telegram', placeholder: 'https://t.me/techcorp' },
              { name: 'LinkedIn', placeholder: 'https://linkedin.com/company/techcorp' },
              { name: 'YouTube', placeholder: 'https://youtube.com/@techcorp' },
            ].map((social) => (
              <div key={social.name}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {social.name}
                </label>
                <Input
                  placeholder={social.placeholder}
                  className="bg-[#0A0A0F] border-[#1A1A23] text-white"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Industries & Tags */}
        <Card className="bg-[#121218] border-[#1A1A23] p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Отрасль и теги</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Отрасль
              </label>
              <select className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1A1A23] rounded-xl text-white focus:outline-none focus:border-[#8E7FFF]">
                <option>Информационные технологии</option>
                <option>Финансы</option>
                <option>Образование</option>
                <option>Здравоохранение</option>
                <option>Розничная торговля</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Теги (помогают кандидатам найти вас)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {['Стартап', 'Удаленная работа', 'Молодая команда', 'Tech'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gradient-to-r from-[#8E7FFF]/20 to-[#39E0F8]/20 border border-[#8E7FFF]/40 rounded-full text-sm text-white flex items-center gap-2"
                    >
                      {tag}
                      <button className="hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )
                )}
              </div>
              <Button
                variant="outline"
                className="border-[#1A1A23] text-white hover:bg-[#1A1A23]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить тег
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="border-[#1A1A23] text-white hover:bg-[#1A1A23]"
          >
            Отмена
          </Button>
          <Button className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]">
            <Save className="w-5 h-5 mr-2" />
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
}
