'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  X,
  Upload,
  Video,
  Check,
  AlertCircle,
  FileVideo,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VideoFile {
  file: File;
  url: string;
  duration: number;
  size: number;
}

export default function CreateVacancyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState({
    title: '',
    salaryMin: '',
    salaryMax: '',
    city: '',
    metro: '',
    description: '',
    requirements: '',
    benefits: '',
    experience: 'any',
    schedule: 'full_time',
  });

  const [priorityModeration, setPriorityModeration] = useState(false);

  // Validation
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  const MAX_VIDEO_DURATION = 180; // 3 minutes
  const MIN_VIDEO_DURATION = 10; // 10 seconds
  const ALLOWED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];

  const updateForm = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const validateVideo = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
    // Check file type
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return {
        isValid: false,
        error: 'Неподдерживаемый формат. Разрешены: MP4, MOV, AVI, MKV',
      };
    }

    // Check file size
    if (file.size > MAX_VIDEO_SIZE) {
      return {
        isValid: false,
        error: `Файл слишком большой. Максимум ${MAX_VIDEO_SIZE / (1024 * 1024)} МБ`,
      };
    }

    // Check video duration
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.floor(video.duration);

        if (duration < MIN_VIDEO_DURATION) {
          resolve({
            isValid: false,
            error: `Видео слишком короткое. Минимум ${MIN_VIDEO_DURATION} сек.`,
          });
        } else if (duration > MAX_VIDEO_DURATION) {
          resolve({
            isValid: false,
            error: `Видео слишком длинное. Максимум ${MAX_VIDEO_DURATION / 60} мин.`,
          });
        } else {
          resolve({ isValid: true });
        }
      };

      video.onerror = () => {
        resolve({
          isValid: false,
          error: 'Не удалось прочитать видео файл',
        });
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoSelect = async (file: File) => {
    setVideoError(null);
    setLoading(true);

    try {
      const validation = await validateVideo(file);

      if (!validation.isValid) {
        setVideoError(validation.error || 'Ошибка валидации видео');
        setLoading(false);
        return;
      }

      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        setVideoFile({
          file,
          url: URL.createObjectURL(file),
          duration,
          size: file.size,
        });
        window.URL.revokeObjectURL(video.src);
        setLoading(false);
      };
      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error handling video:', error);
      setVideoError('Ошибка при обработке видео');
      setLoading(false);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleVideoSelect(file);
    } else {
      setVideoError('Пожалуйста, загрузите видео файл');
    }
  };

  const handleRemoveVideo = () => {
    if (videoFile?.url) {
      URL.revokeObjectURL(videoFile.url);
    }
    setVideoFile(null);
    setVideoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.title || !form.salaryMin || !form.city) {
        alert('Заполните обязательные поля');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!videoFile) {
        alert('Загрузите видео вакансии');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2);
    } else {
      router.push('/vacancies');
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      // TODO: API call to create vacancy with video upload
      // const formData = new FormData();
      // formData.append('video', videoFile!.file);
      // formData.append('data', JSON.stringify({ ...form, priorityModeration }));
      // await fetch('/api/vacancies', { method: 'POST', body: formData });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(priorityModeration ? '🚀 Вакансия опубликована с приоритетной модерацией!' : '🎉 Вакансия отправлена на модерацию!');
      router.push('/vacancies');
    } catch (error) {
      console.error('Error publishing vacancy:', error);
      alert('Ошибка при публикации вакансии');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Информация' },
      { number: 2, label: 'Видео' },
      { number: 3, label: 'Публикация' },
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, index) => (
          <div key={s.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  step >= s.number
                    ? 'border-primary bg-primary text-background'
                    : 'border-border bg-background-elevated text-foreground-muted'
                )}
              >
                {step > s.number ? <Check className="h-5 w-5" /> : s.number}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  step >= s.number ? 'text-foreground' : 'text-foreground-muted'
                )}
              >
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-0.5 flex-1 transition-colors',
                  step > s.number ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Название вакансии *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-border bg-background-elevated px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Официант"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Зарплата от *
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-border bg-background-elevated px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="65000"
                value={form.salaryMin}
                onChange={(e) => updateForm('salaryMin', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                До
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-border bg-background-elevated px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="85000"
                value={form.salaryMax}
                onChange={(e) => updateForm('salaryMax', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Город *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-border bg-background-elevated px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Москва"
              value={form.city}
              onChange={(e) => updateForm('city', e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Метро
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-border bg-background-elevated px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Площадь Революции"
              value={form.metro}
              onChange={(e) => updateForm('metro', e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Опыт работы
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'any', label: 'Любой' },
                { key: 'no_experience', label: 'Без опыта' },
                { key: '1-3', label: '1-3 года' },
                { key: '3-6', label: '3-6 лет' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => updateForm('experience', item.key)}
                  className={cn(
                    'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    form.experience === item.key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background-elevated text-foreground-secondary hover:border-primary/50'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              График работы
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'full_time', label: 'Полный день' },
                { key: 'part_time', label: 'Частичная' },
                { key: 'remote', label: 'Удаленка' },
                { key: 'flexible', label: 'Гибкий' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => updateForm('schedule', item.key)}
                  className={cn(
                    'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    form.schedule === item.key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background-elevated text-foreground-secondary hover:border-primary/50'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Видео-вакансия</CardTitle>
          <p className="text-sm text-foreground-secondary">
            Загрузите видео о вакансии (10-180 сек, макс. 100 МБ)
          </p>
        </CardHeader>
        <CardContent>
          {!videoFile ? (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background-elevated hover:border-primary/50'
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {loading ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-foreground-muted" />
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      Перетащите видео сюда
                    </h3>
                    <p className="mb-4 text-sm text-foreground-secondary">
                      или нажмите для выбора файла
                    </p>
                    <div className="text-xs text-foreground-muted">
                      MP4, MOV, AVI, MKV • до 100 МБ • 10-180 сек
                    </div>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                onChange={handleFileInput}
                className="hidden"
              />

              {videoError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error">
                  <AlertCircle className="h-5 w-5" />
                  {videoError}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg border border-success/50 bg-success/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-success/20">
                    <FileVideo className="h-8 w-8 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {videoFile.file.name}
                        </h3>
                        <div className="mt-1 flex gap-4 text-sm text-foreground-secondary">
                          <span>Длительность: {formatDuration(videoFile.duration)}</span>
                          <span>Размер: {formatFileSize(videoFile.size)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveVideo}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Video preview */}
                <div className="mt-4">
                  <video
                    src={videoFile.url}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background-elevated p-4">
                <h4 className="mb-2 font-semibold text-foreground">💡 Советы для видео:</h4>
                <ul className="space-y-1 text-sm text-foreground-secondary">
                  <li>• Расскажите о вакансии и условиях работы</li>
                  <li>• Покажите офис или рабочее место</li>
                  <li>• Будьте дружелюбны и открыты</li>
                  <li>• Опишите, что ждет нового сотрудника</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Предпросмотр</CardTitle>
          <p className="text-sm text-foreground-secondary">
            Проверьте данные перед публикацией
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="text-foreground-muted">Вакансия:</div>
              <div className="font-semibold text-foreground">{form.title}</div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="text-foreground-muted">Зарплата:</div>
              <div className="font-semibold text-foreground">
                {form.salaryMin}
                {form.salaryMax ? ` - ${form.salaryMax}` : '+'} ₽
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="text-foreground-muted">Город:</div>
              <div className="font-semibold text-foreground">{form.city}</div>
            </div>

            {form.metro && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="text-foreground-muted">Метро:</div>
                <div className="font-semibold text-foreground">{form.metro}</div>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="text-foreground-muted">Видео:</div>
              <div className="font-semibold text-foreground">
                {videoFile && formatDuration(videoFile.duration)}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-warning/30 bg-warning/5 p-4 transition-colors hover:border-warning/50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                  <Video className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    Приоритетная модерация
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    Ускоренная проверка за 500 ₽ • SLA: &lt; 30 минут
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={priorityModeration}
                onChange={(e) => setPriorityModeration(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-warning"
              />
            </label>

            <div className="mt-4 rounded-lg border border-border bg-background-elevated p-4">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-foreground">
                    {priorityModeration ? '⚡ Приоритетная модерация' : '⏳ Стандартная модерация'}
                  </div>
                  <div className="mt-1 text-sm text-foreground-secondary">
                    {priorityModeration
                      ? 'Ваша вакансия будет проверена в течение 30 минут'
                      : 'После публикации вакансия пройдёт модерацию. Обычно это занимает 1-2 часа в рабочее время.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg font-bold text-foreground">Новая вакансия</h1>
          <p className="mt-2 text-foreground-secondary">
            Создайте видео-вакансию для привлечения кандидатов
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Footer Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          {step === 1 ? 'Отмена' : 'Назад'}
        </Button>
        {step < 3 ? (
          <Button variant="gradient" onClick={handleNext} className="flex-1">
            Далее →
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={handlePublish}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Публикация...
              </>
            ) : (
              '🚀 Опубликовать'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
