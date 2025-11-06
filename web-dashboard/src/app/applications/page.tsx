'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heart,
  X,
  Calendar,
  MessageCircle,
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import ResumeVideoViewer from '@/components/ResumeVideoViewer';

// Mock data
const mockApplications = [
  {
    id: 1,
    jobseeker: {
      name: 'Анна Иванова',
      photo: 'https://i.pravatar.cc/300?img=1',
      profession: 'Frontend Developer',
      experience: '3 года',
      city: 'Москва',
      expectedSalary: '150,000 ₽',
      rating: 4.8,
    },
    vacancy: {
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
    },
    videoResume: 'https://storage.yandex.net/videos/resume1.mp4',
    coverLetter:
      'Здравствуйте! Я Frontend разработчик с 3-летним опытом работы с React, TypeScript и Next.js. Имею опыт создания масштабируемых веб-приложений...',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    status: 'pending',
    appliedAt: '2 часа назад',
  },
  {
    id: 2,
    jobseeker: {
      name: 'Дмитрий Петров',
      photo: 'https://i.pravatar.cc/300?img=12',
      profession: 'Backend Developer',
      experience: '5 лет',
      city: 'Санкт-Петербург',
      expectedSalary: '200,000 ₽',
      rating: 4.9,
    },
    vacancy: {
      title: 'Senior Backend Developer',
      company: 'Tech Corp',
    },
    videoResume: 'https://storage.yandex.net/videos/resume2.mp4',
    coverLetter:
      'Добрый день! Backend разработчик с опытом работы над высоконагруженными системами...',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    status: 'pending',
    appliedAt: '5 часов назад',
  },
  {
    id: 3,
    jobseeker: {
      name: 'Елена Смирнова',
      photo: 'https://i.pravatar.cc/300?img=5',
      profession: 'UI/UX Designer',
      experience: '4 года',
      city: 'Москва',
      expectedSalary: '120,000 ₽',
      rating: 4.7,
    },
    vacancy: {
      title: 'UI/UX Designer',
      company: 'Tech Corp',
    },
    videoResume: 'https://storage.yandex.net/videos/resume3.mp4',
    coverLetter:
      'Привет! Я UI/UX дизайнер с опытом создания премиальных интерфейсов...',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    status: 'pending',
    appliedAt: '1 день назад',
  },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(mockApplications);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentApplication =
    applications.length > 0 ? applications[currentIndex] : null;

  const handleAccept = () => {
    if (currentApplication) {
      console.log('Accepted:', currentApplication.id);
      nextCard();
    }
  };

  const handleReject = () => {
    if (currentApplication) {
      console.log('Rejected:', currentApplication.id);
      nextCard();
    }
  };

  const handleInterview = () => {
    if (currentApplication) {
      console.log('Interview scheduled:', currentApplication.id);
      nextCard();
    }
  };

  const nextCard = () => {
    if (currentIndex < applications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentApplication) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl text-gray-400">Нет откликов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Отклики на вакансии
            </h1>
            <p className="text-gray-400">
              {applications.length} кандидатов ожидают рассмотрения
            </p>
          </div>

          <div className="flex gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по имени..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#121218] border border-[#1A1A23] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#8E7FFF]"
              />
            </div>

            {/* Filter */}
            <Button className="bg-[#121218] hover:bg-[#1A1A23] text-white border border-[#1A1A23]">
              <Filter className="w-5 h-5 mr-2" />
              Фильтры
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#121218] border-[#1A1A23] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего</p>
                <p className="text-2xl font-bold text-white">
                  {applications.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8E7FFF] to-[#39E0F8] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-[#121218] border-[#1A1A23] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Новые</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-[#121218] border-[#1A1A23] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">На собеседовании</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-[#121218] border-[#1A1A23] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Принято</p>
                <p className="text-2xl font-bold text-white">23</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Swipe Card */}
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {applications.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-12 bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]'
                    : 'w-8 bg-[#1A1A23]'
                }`}
              />
            ))}
          </div>

          <Card className="bg-[#121218] border-[#1A1A23] overflow-hidden">
            <div className="grid grid-cols-2 gap-6 p-8">
              {/* Left: Video & Basic Info */}
              <div className="space-y-6">
                {/* Video Resume */}
                <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0F] aspect-[9/16]">
                  <ResumeVideoViewer
                    videoUrl={currentApplication.videoResume}
                    thumbnailUrl={currentApplication.jobseeker.photo}
                  />

                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={currentApplication.jobseeker.photo}
                        alt={currentApplication.jobseeker.name}
                        className="w-16 h-16 rounded-full border-2 border-white/20"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {currentApplication.jobseeker.name}
                        </h3>
                        <p className="text-gray-300">
                          {currentApplication.jobseeker.profession}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">
                        {currentApplication.jobseeker.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0A0A0F] p-4 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Briefcase className="w-5 h-5 text-[#8E7FFF]" />
                      <div>
                        <p className="text-xs text-gray-500">Опыт</p>
                        <p className="font-semibold">
                          {currentApplication.jobseeker.experience}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0F] p-4 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin className="w-5 h-5 text-[#39E0F8]" />
                      <div>
                        <p className="text-xs text-gray-500">Город</p>
                        <p className="font-semibold">
                          {currentApplication.jobseeker.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0F] p-4 rounded-xl col-span-2">
                    <div className="flex items-center gap-3 text-gray-300">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-xs text-gray-500">
                          Ожидаемая зарплата
                        </p>
                        <p className="font-semibold text-lg">
                          {currentApplication.jobseeker.expectedSalary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Detailed Info */}
              <div className="space-y-6">
                {/* Vacancy Info */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">
                    Откликнулся на:
                  </h4>
                  <div className="bg-[#0A0A0F] p-4 rounded-xl">
                    <h3 className="text-white font-semibold mb-1">
                      {currentApplication.vacancy.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {currentApplication.vacancy.company}
                    </p>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">
                    Сопроводительное письмо:
                  </h4>
                  <div className="bg-[#0A0A0F] p-4 rounded-xl">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {currentApplication.coverLetter}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Навыки:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentApplication.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#8E7FFF]/10 to-[#39E0F8]/10 border border-[#8E7FFF]/20 rounded-full text-sm text-white"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Applied Time */}
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Откликнулся {currentApplication.appliedAt}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {/* Accept */}
                  <Button
                    onClick={handleAccept}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Принять кандидата
                  </Button>

                  {/* Interview */}
                  <Button
                    onClick={handleInterview}
                    className="w-full bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8] hover:opacity-90 text-white font-semibold py-3 rounded-xl"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Пригласить на собеседование
                  </Button>

                  {/* Reject */}
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold py-3 rounded-xl"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Отклонить
                  </Button>

                  {/* Message */}
                  <Button
                    variant="outline"
                    className="w-full border-[#1A1A23] text-white hover:bg-[#1A1A23] py-3 rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Написать сообщение
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={previousCard}
              disabled={currentIndex === 0}
              className="bg-[#121218] hover:bg-[#1A1A23] text-white border border-[#1A1A23] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Назад
            </Button>

            <span className="flex items-center text-gray-400 text-sm">
              {currentIndex + 1} из {applications.length}
            </span>

            <Button
              onClick={nextCard}
              disabled={currentIndex === applications.length - 1}
              className="bg-[#121218] hover:bg-[#1A1A23] text-white border border-[#1A1A23] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперед →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
