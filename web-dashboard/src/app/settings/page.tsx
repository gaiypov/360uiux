'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'security', label: 'Безопасность', icon: Shield },
    { id: 'billing', label: 'Оплата', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Настройки</h1>
        <p className="text-gray-400">
          Управление аккаунтом и настройками системы
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="bg-[#121218] border-[#1A1A23] p-4 h-fit">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#8E7FFF]/20 to-[#39E0F8]/20 border border-[#8E7FFF]/40 text-white'
                      : 'text-gray-400 hover:bg-[#0A0A0F] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <div className="col-span-3">
          {activeTab === 'profile' && (
            <Card className="bg-[#121218] border-[#1A1A23] p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Личная информация
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Имя
                    </label>
                    <Input
                      defaultValue="Иван"
                      className="bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Фамилия
                    </label>
                    <Input
                      defaultValue="Иванов"
                      className="bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      defaultValue="ivan@company.com"
                      className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Телефон
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      defaultValue="+7 (999) 123-45-67"
                      className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]">
                  <Save className="w-5 h-5 mr-2" />
                  Сохранить изменения
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-[#121218] border-[#1A1A23] p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Уведомления
              </h2>

              <div className="space-y-6">
                {[
                  {
                    title: 'Новые отклики',
                    description: 'Получать уведомления о новых откликах',
                    enabled: true,
                  },
                  {
                    title: 'Сообщения в чате',
                    description: 'Уведомления о новых сообщениях',
                    enabled: true,
                  },
                  {
                    title: 'Статус вакансий',
                    description: 'Изменения статуса публикации',
                    enabled: false,
                  },
                  {
                    title: 'Email рассылка',
                    description: 'Еженедельный отчет по статистике',
                    enabled: true,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#0A0A0F] rounded-xl"
                  >
                    <div>
                      <h3 className="text-white font-medium mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.enabled
                          ? 'bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]'
                          : 'bg-[#1A1A23]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-[#121218] border-[#1A1A23] p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Безопасность
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Текущий пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Повторите новый пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]">
                  Изменить пароль
                </Button>

                <div className="border-t border-[#1A1A23] pt-6 mt-8">
                  <h3 className="text-white font-semibold mb-4">
                    Двухфакторная аутентификация
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Добавьте дополнительный уровень защиты вашего аккаунта
                  </p>
                  <Button variant="outline" className="border-[#1A1A23] text-white">
                    Включить 2FA
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card className="bg-[#121218] border-[#1A1A23] p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Оплата и баланс
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#8E7FFF]/20 to-[#39E0F8]/20 border border-[#8E7FFF]/40 rounded-2xl p-6">
                  <p className="text-gray-300 mb-2">Текущий баланс</p>
                  <p className="text-4xl font-bold text-white mb-4">
                    ₽ 12,450
                  </p>
                  <Button className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]">
                    Пополнить баланс
                  </Button>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">
                    История транзакций
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        type: 'Пополнение',
                        amount: '+10,000 ₽',
                        date: '15 марта 2025',
                        positive: true,
                      },
                      {
                        type: 'Публикация вакансии',
                        amount: '-500 ₽',
                        date: '14 марта 2025',
                        positive: false,
                      },
                      {
                        type: 'Пополнение',
                        amount: '+5,000 ₽',
                        date: '10 марта 2025',
                        positive: true,
                      },
                    ].map((transaction, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-[#0A0A0F] rounded-xl"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {transaction.type}
                          </p>
                          <p className="text-sm text-gray-400">
                            {transaction.date}
                          </p>
                        </div>
                        <p
                          className={`font-semibold ${
                            transaction.positive
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {transaction.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
