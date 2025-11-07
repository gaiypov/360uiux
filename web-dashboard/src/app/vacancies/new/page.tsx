'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Video as VideoIcon,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { GlassInput } from '@/components/ui/glass-input';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type VacancyFormData = {
  title: string;
  profession: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  salaryMin: string;
  salaryMax: string;
  city: string;
  employmentType: string;
  schedule: string;
  experience: number;
  skills: string[];
  video: File | null;
  videoPreview: string | null;
};

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Полная занятость' },
  { value: 'PART_TIME', label: 'Частичная занятость' },
  { value: 'CONTRACT', label: 'Проектная работа' },
  { value: 'INTERNSHIP', label: 'Стажировка' },
];

const SCHEDULE_TYPES = [
  { value: 'FULL_DAY', label: 'Полный день' },
  { value: 'SHIFT', label: 'Сменный график' },
  { value: 'FLEXIBLE', label: 'Гибкий график' },
  { value: 'REMOTE', label: 'Удаленная работа' },
];

const EXPERIENCE_LEVELS = [
  { value: 0, label: 'Без опыта' },
  { value: 1, label: '1-3 года' },
  { value: 3, label: '3-5 лет' },
  { value: 5, label: '5+ лет' },
];

const POPULAR_PROFESSIONS = [
  'Официант',
  'Бармен',
  'Повар',
  'Администратор',
  'Менеджер',
  'Продавец',
  'Курьер',
  'Водитель',
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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<VacancyFormData>({
    title: '',
    profession: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    salaryMin: '',
    salaryMax: '',
    city: '',
    employmentType: 'FULL_TIME',
    schedule: 'FULL_DAY',
    experience: 0,
    skills: [],
    video: null,
    videoPreview: null,
  });

  const [currentSkill, setCurrentSkill] = useState('');

  const handleInputChange = (field: keyof VacancyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: '' }));
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setErrors({ video: 'Файл слишком большой (макс. 100MB)' });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        video: file,
        videoPreview: URL.createObjectURL(file),
      }));
      setErrors((prev) => ({ ...prev, video: '' }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Укажите название вакансии';
      if (!formData.profession.trim()) newErrors.profession = 'Укажите профессию';
      if (!formData.description.trim()) newErrors.description = 'Добавьте описание';
      if (!formData.city.trim()) newErrors.city = 'Укажите город';
      if (!formData.salaryMin) newErrors.salaryMin = 'Укажите зарплату от';
    }

    if (currentStep === 2) {
      if (!formData.requirements.trim())
        newErrors.requirements = 'Укажите требования к кандидату';
      if (!formData.responsibilities.trim())
        newErrors.responsibilities = 'Укажите обязанности';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublish = async () => {
    try {
      setLoading(true);

      // Prepare vacancy data
      const vacancyData = {
        title: formData.title,
        profession: formData.profession,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits,
        salaryMin: parseInt(formData.salaryMin),
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        city: formData.city,
        employment: formData.employmentType,
        schedule: formData.schedule,
        experience: formData.experience,
        // videoUrl would be uploaded separately
      };

      const response = await api.createVacancy(vacancyData);

      // Show success message
      alert('Вакансия успешно создана и отправлена на модерацию!');

      // Redirect to vacancies list
      router.push('/vacancies');
    } catch (error) {
      console.error('Failed to create vacancy:', error);
      alert('Не удалось создать вакансию. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-display-lg font-bold bg-gradient-neon bg-clip-text text-transparent">
          Создать вакансию
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Заполните информацию о вакансии и загрузите видео
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { number: 1, label: 'Основная информация' },
            { number: 2, label: 'Требования' },
            { number: 3, label: 'Видео' },
            { number: 4, label: 'Публикация' },
          ].map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full transition-all',
                  step >= s.number
                    ? 'bg-gradient-neon shadow-neon-sm'
                    : 'bg-glass-bg border border-glass-border'
                )}
              >
                {step > s.number ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-foreground font-semibold">{s.number}</span>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium truncate',
                    step >= s.number ? 'text-foreground' : 'text-foreground-muted'
                  )}
                >
                  {s.label}
                </p>
              </div>
              {index < 3 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-all',
                    step > s.number ? 'bg-gradient-neon' : 'bg-glass-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <GlassCard className="p-8">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Название вакансии *
              </label>
              <GlassInput
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Например: Официант в ресторан"
                error={errors.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Профессия *
              </label>
              <GlassInput
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="Официант"
                error={errors.profession}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <p className="text-xs text-foreground-muted w-full mb-1">Популярные:</p>
                {POPULAR_PROFESSIONS.map((prof) => (
                  <button
                    key={prof}
                    onClick={() => handleInputChange('profession', prof)}
                    className="px-3 py-1.5 bg-glass-bg border border-glass-border rounded-full text-xs text-foreground-secondary hover:border-primary transition-colors"
                  >
                    {prof}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Описание вакансии *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Расскажите о вакансии, компании и команде..."
                rows={6}
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-glass-bg backdrop-blur-glass border text-foreground placeholder:text-foreground-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                  'transition-all duration-300',
                  errors.description ? 'border-destructive' : 'border-glass-border'
                )}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Город *
                </label>
                <GlassInput
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Москва"
                  icon={<MapPin className="h-4 w-4" />}
                  error={errors.city}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Тип занятости
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="w-full h-11 rounded-lg px-4 bg-glass-bg border border-glass-border text-foreground focus:border-primary focus:outline-none transition-all"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  График работы
                </label>
                <select
                  value={formData.schedule}
                  onChange={(e) => handleInputChange('schedule', e.target.value)}
                  className="w-full h-11 rounded-lg px-4 bg-glass-bg border border-glass-border text-foreground focus:border-primary focus:outline-none transition-all"
                >
                  {SCHEDULE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Опыт работы
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                  className="w-full h-11 rounded-lg px-4 bg-glass-bg border border-glass-border text-foreground focus:border-primary focus:outline-none transition-all"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Зарплата *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <GlassInput
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                  placeholder="От"
                  icon={<DollarSign className="h-4 w-4" />}
                  error={errors.salaryMin}
                />
                <GlassInput
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                  placeholder="До (опционально)"
                  icon={<DollarSign className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Требования к кандидату *
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Опишите требования к кандидату..."
                rows={6}
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-glass-bg backdrop-blur-glass border text-foreground placeholder:text-foreground-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                  'transition-all duration-300',
                  errors.requirements ? 'border-destructive' : 'border-glass-border'
                )}
              />
              {errors.requirements && (
                <p className="mt-1.5 text-xs text-destructive">{errors.requirements}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Обязанности *
              </label>
              <textarea
                value={formData.responsibilities}
                onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                placeholder="Что будет делать сотрудник..."
                rows={6}
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-glass-bg backdrop-blur-glass border text-foreground placeholder:text-foreground-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                  'transition-all duration-300',
                  errors.responsibilities ? 'border-destructive' : 'border-glass-border'
                )}
              />
              {errors.responsibilities && (
                <p className="mt-1.5 text-xs text-destructive">{errors.responsibilities}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Бонусы и льготы
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                placeholder="Что вы предлагаете сотруднику..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-glass-bg backdrop-blur-glass border border-glass-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <p className="text-xs text-foreground-muted w-full mb-1">Популярные:</p>
                {POPULAR_BENEFITS.map((benefit) => (
                  <button
                    key={benefit}
                    onClick={() => {
                      const current = formData.benefits;
                      const newValue = current
                        ? `${current}\n• ${benefit}`
                        : `• ${benefit}`;
                      handleInputChange('benefits', newValue);
                    }}
                    className="px-3 py-1.5 bg-glass-bg border border-glass-border rounded-full text-xs text-foreground-secondary hover:border-success transition-colors"
                  >
                    + {benefit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Video Upload */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-display-md font-bold bg-gradient-neon bg-clip-text text-transparent mb-2">
                Загрузите видео о вакансии
              </h3>
              <p className="text-foreground-secondary mb-8">
                Расскажите о компании, команде и задачах (макс. 60 секунд)
              </p>

              {formData.videoPreview ? (
                <div className="relative rounded-xl overflow-hidden bg-ultra-black max-w-md mx-auto aspect-[9/16]">
                  <video src={formData.videoPreview} controls className="w-full h-full object-cover" />
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        video: null,
                        videoPreview: null,
                      }))
                    }
                    className="absolute top-4 right-4 p-2 bg-destructive hover:bg-destructive/90 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-glass-border rounded-xl p-12 hover:border-primary transition-colors">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-neon/10 flex items-center justify-center mb-4">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-foreground font-semibold mb-2">Нажмите для загрузки видео</p>
                      <p className="text-foreground-secondary text-sm">MP4, MOV до 100MB</p>
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
              {errors.video && <p className="mt-2 text-sm text-destructive">{errors.video}</p>}
            </div>

            <GlassCard variant="elevated">
              <h4 className="text-foreground font-semibold mb-4">Советы для видео:</h4>
              <ul className="space-y-2 text-foreground-secondary text-sm">
                {[
                  'Расскажите о компании и команде',
                  'Опишите задачи и проекты',
                  'Покажите офис или рабочее место',
                  'Говорите искренне и естественно',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        )}

        {/* Step 4: Review & Publish */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-neon flex items-center justify-center mx-auto mb-4 shadow-neon">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-display-md font-bold bg-gradient-neon bg-clip-text text-transparent mb-2">
                Готово к публикации!
              </h3>
              <p className="text-foreground-secondary">Проверьте информацию перед публикацией</p>
            </div>

            {/* Summary */}
            <GlassCard variant="elevated" className="space-y-4">
              <div>
                <p className="text-foreground-secondary text-sm mb-1">Название:</p>
                <p className="text-foreground font-semibold text-lg">{formData.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-foreground-secondary text-sm mb-1">Профессия:</p>
                  <p className="text-foreground font-semibold">{formData.profession}</p>
                </div>
                <div>
                  <p className="text-foreground-secondary text-sm mb-1">Город:</p>
                  <p className="text-foreground font-semibold">{formData.city}</p>
                </div>
              </div>

              <div>
                <p className="text-foreground-secondary text-sm mb-1">Зарплата:</p>
                <p className="text-success-green font-semibold text-lg">
                  {formData.salaryMin}
                  {formData.salaryMax ? ` - ${formData.salaryMax}` : '+'} ₽
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-foreground-secondary text-sm mb-1">Занятость:</p>
                  <StatusBadge variant="glass">
                    {EMPLOYMENT_TYPES.find((t) => t.value === formData.employmentType)?.label}
                  </StatusBadge>
                </div>
                <div>
                  <p className="text-foreground-secondary text-sm mb-1">График:</p>
                  <StatusBadge variant="glass">
                    {SCHEDULE_TYPES.find((t) => t.value === formData.schedule)?.label}
                  </StatusBadge>
                </div>
              </div>

              {formData.video && (
                <div>
                  <p className="text-foreground-secondary text-sm mb-1">Видео:</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success-green" />
                    <p className="text-success-green font-semibold">Загружено</p>
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard variant="elevated" className="bg-warning/5 border-warning/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-warning font-semibold mb-1">Модерация</p>
                  <p className="text-foreground-secondary text-sm">
                    Вакансия будет отправлена на модерацию и опубликована после проверки (обычно в течение 24 часов)
                  </p>
                </div>
              </div>
            </GlassCard>

            <NeonButton
              variant="neon"
              size="xl"
              glow
              onClick={handlePublish}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Публикация...' : 'Опубликовать вакансию'}
            </NeonButton>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-glass-border">
          <NeonButton onClick={handlePrev} disabled={step === 1} variant="ghost">
            <ArrowLeft className="w-5 h-5" />
            Назад
          </NeonButton>

          {step < 4 && (
            <NeonButton onClick={handleNext} variant="neon">
              Далее
              <ArrowRight className="w-5 h-5" />
            </NeonButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
