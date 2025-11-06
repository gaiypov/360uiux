'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Play,
  X,
  Plus,
  DollarSign,
  MapPin,
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

type VacancyFormData = {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary: {
    min: string;
    max: string;
    currency: string;
  };
  location: string;
  employmentType: string;
  experience: string;
  skills: string[];
  benefits: string[];
  video: File | null;
  videoPreview: string | null;
};

const EMPLOYMENT_TYPES = [
  'Полная занятость',
  'Частичная занятость',
  'Проектная работа',
  'Стажировка',
];

const EXPERIENCE_LEVELS = [
  'Без опыта',
  '1-3 года',
  '3-5 лет',
  '5+ лет',
];

const POPULAR_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'Docker',
  'AWS',
  'Figma',
  'Git',
  'REST API',
];

const POPULAR_BENEFITS = [
  'ДМС',
  'Удаленная работа',
  'Гибкий график',
  'Обучение',
  'Фитнес',
  'Бесплатные обеды',
  'Корпоративные мероприятия',
  'Оплачиваемый отпуск',
];

export default function CreateVacancyPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<VacancyFormData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary: {
      min: '',
      max: '',
      currency: '₽',
    },
    location: '',
    employmentType: EMPLOYMENT_TYPES[0],
    experience: EXPERIENCE_LEVELS[1],
    skills: [],
    benefits: [],
    video: null,
    videoPreview: null,
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalaryChange = (field: 'min' | 'max', value: string) => {
    setFormData((prev) => ({
      ...prev,
      salary: { ...prev.salary, [field]: value },
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addBenefit = (benefit: string) => {
    if (benefit && !formData.benefits.includes(benefit)) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, benefit],
      }));
      setCurrentBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b !== benefit),
    }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        video: file,
        videoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handlePublish = () => {
    console.log('Publishing vacancy:', formData);
    alert('Вакансия успешно опубликована!');
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Создать вакансию
        </h1>
        <p className="text-gray-400">
          Заполните информацию о вакансии и загрузите видео
        </p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {[
            { number: 1, label: 'Основная информация' },
            { number: 2, label: 'Требования' },
            { number: 3, label: 'Видео' },
            { number: 4, label: 'Публикация' },
          ].map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s.number
                    ? 'bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]'
                    : 'bg-[#1A1A23]'
                }`}
              >
                {step > s.number ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">{s.number}</span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    step >= s.number ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </p>
              </div>
              {index < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    step > s.number ? 'bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]' : 'bg-[#1A1A23]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#121218] border-[#1A1A23] p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название вакансии *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Например: Senior Frontend Developer"
                  className="bg-[#0A0A0F] border-[#1A1A23] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание вакансии *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Расскажите о вакансии, компании и команде..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1A1A23] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#8E7FFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Город *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange('location', e.target.value)
                      }
                      placeholder="Москва"
                      className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Тип занятости
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) =>
                      handleInputChange('employmentType', e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1A1A23] rounded-xl text-white focus:outline-none focus:border-[#8E7FFF]"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Зарплата *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.salary.min}
                      onChange={(e) => handleSalaryChange('min', e.target.value)}
                      placeholder="От"
                      className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.salary.max}
                      onChange={(e) => handleSalaryChange('max', e.target.value)}
                      placeholder="До"
                      className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Требования *
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange('requirements', e.target.value)
                  }
                  placeholder="Опишите требования к кандидату..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1A1A23] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#8E7FFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Обязанности *
                </label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) =>
                    handleInputChange('responsibilities', e.target.value)
                  }
                  placeholder="Что будет делать сотрудник..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1A1A23] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#8E7FFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Опыт работы
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange('experience', e.target.value)
                  }
                  className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1A1A23] rounded-xl text-white focus:outline-none focus:border-[#8E7FFF]"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Навыки *
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(currentSkill);
                      }
                    }}
                    placeholder="Добавить навык..."
                    className="bg-[#0A0A0F] border-[#1A1A23] text-white"
                  />
                  <Button
                    onClick={() => addSkill(currentSkill)}
                    className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                {/* Popular Skills */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Популярные:</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="px-3 py-1.5 bg-[#0A0A0F] border border-[#1A1A23] rounded-full text-sm text-gray-300 hover:border-[#8E7FFF] transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#8E7FFF]/20 to-[#39E0F8]/20 border border-[#8E7FFF]/40 rounded-full text-sm text-white flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Бонусы и льготы
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={currentBenefit}
                    onChange={(e) => setCurrentBenefit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addBenefit(currentBenefit);
                      }
                    }}
                    placeholder="Добавить бонус..."
                    className="bg-[#0A0A0F] border-[#1A1A23] text-white"
                  />
                  <Button
                    onClick={() => addBenefit(currentBenefit)}
                    className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                {/* Popular Benefits */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Популярные:</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_BENEFITS.map((benefit) => (
                      <button
                        key={benefit}
                        onClick={() => addBenefit(benefit)}
                        className="px-3 py-1.5 bg-[#0A0A0F] border border-[#1A1A23] rounded-full text-sm text-gray-300 hover:border-[#8E7FFF] transition-colors"
                      >
                        + {benefit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Benefits */}
                {formData.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full text-sm text-green-300 flex items-center gap-2"
                      >
                        {benefit}
                        <button
                          onClick={() => removeBenefit(benefit)}
                          className="hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Video Upload */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Загрузите видео о вакансии
                </h3>
                <p className="text-gray-400 mb-8">
                  Расскажите о компании, команде и задачах (макс. 60 секунд)
                </p>

                {formData.videoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black max-w-md mx-auto aspect-[9/16]">
                    <video
                      src={formData.videoPreview}
                      controls
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          video: null,
                          videoPreview: null,
                        }))
                      }
                      className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-500 rounded-full"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-[#1A1A23] rounded-2xl p-12 hover:border-[#8E7FFF] transition-colors">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#8E7FFF]/20 to-[#39E0F8]/20 flex items-center justify-center mb-4">
                          <Upload className="w-10 h-10 text-[#8E7FFF]" />
                        </div>
                        <p className="text-white font-semibold mb-2">
                          Нажмите для загрузки видео
                        </p>
                        <p className="text-gray-400 text-sm">
                          MP4, MOV до 100MB
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="bg-[#0A0A0F] p-6 rounded-xl">
                <h4 className="text-white font-semibold mb-4">
                  Советы для видео:
                </h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Расскажите о компании и команде
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Опишите задачи и проекты
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Покажите офис или рабочее место
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    Говорите искренне и естественно
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Готово к публикации!
                </h3>
                <p className="text-gray-400">
                  Проверьте информацию перед публикацией
                </p>
              </div>

              {/* Summary */}
              <div className="bg-[#0A0A0F] p-6 rounded-xl space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Название:</p>
                  <p className="text-white font-semibold text-lg">
                    {formData.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Зарплата:</p>
                    <p className="text-white font-semibold">
                      {formData.salary.min} - {formData.salary.max}{' '}
                      {formData.salary.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Город:</p>
                    <p className="text-white font-semibold">
                      {formData.location}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Навыки:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-[#121218] border border-[#1A1A23] rounded-full text-sm text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {formData.video && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Видео:</p>
                    <p className="text-green-400 font-semibold">
                      ✓ Загружено
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handlePublish}
                className="w-full bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8] hover:opacity-90 text-white font-semibold py-4 rounded-xl text-lg"
              >
                Опубликовать вакансию
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#1A1A23]">
            <Button
              onClick={prevStep}
              disabled={step === 1}
              variant="outline"
              className="border-[#1A1A23] text-white hover:bg-[#1A1A23] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад
            </Button>

            {step < 4 && (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8] hover:opacity-90 text-white"
              >
                Далее
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
