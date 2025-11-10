/**
 * 360° РАБОТА - Share Utility
 * Share content via native share dialog
 */

import Share from 'react-native-share';
import { Platform } from 'react-native';
import { haptics } from './haptics';

interface ShareVacancyParams {
  vacancyId: string;
  title: string;
  companyName: string;
  salary?: string;
}

interface ShareOptions {
  title: string;
  message: string;
  url?: string;
}

class ShareService {
  /**
   * Share vacancy with friends
   */
  async shareVacancy(params: ShareVacancyParams): Promise<boolean> {
    try {
      const { vacancyId, title, companyName, salary } = params;
      const url = `https://360rabota.ru/vacancy/${vacancyId}`;

      let message = `🔥 Крутая вакансия!\n\n`;
      message += `📌 ${title}\n`;
      message += `🏢 ${companyName}\n`;
      if (salary) {
        message += `💰 ${salary}\n`;
      }
      message += `\n👉 Смотри здесь: ${url}`;

      haptics.light();

      const result = await Share.open({
        title: `Поделиться: ${title}`,
        message,
        url,
      });

      if (result && result.success) {
        haptics.success();
        return true;
      }

      return false;
    } catch (error: any) {
      // User cancelled
      if (error.message === 'User did not share') {
        return false;
      }
      console.error('Share error:', error);
      haptics.error();
      return false;
    }
  }

  /**
   * Share resume/profile
   */
  async shareProfile(userId: string, name: string): Promise<boolean> {
    try {
      const url = `https://360rabota.ru/profile/${userId}`;
      const message = `Смотри профиль ${name} на 360° РАБОТА!\n\n${url}`;

      haptics.light();

      const result = await Share.open({
        title: `Поделиться профилем`,
        message,
        url,
      });

      if (result && result.success) {
        haptics.success();
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.message === 'User did not share') {
        return false;
      }
      console.error('Share error:', error);
      return false;
    }
  }

  /**
   * Share app with friends (invite)
   */
  async shareAppInvite(): Promise<boolean> {
    try {
      const appUrl =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/360rabota'
          : 'https://play.google.com/store/apps/details?id=ru.360rabota';

      const message = `🚀 Попробуй 360° РАБОТА - крутое приложение для поиска работы!\n\nЭто как TikTok, но для вакансий! Видео-резюме, свайп влево/вправо, чаты с работодателями.\n\n📲 Скачай здесь: ${appUrl}`;

      haptics.light();

      const result = await Share.open({
        title: 'Пригласить друга',
        message,
        url: appUrl,
      });

      if (result && result.success) {
        haptics.success();
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.message === 'User did not share') {
        return false;
      }
      console.error('Share error:', error);
      return false;
    }
  }

  /**
   * Generic share method
   */
  async share(options: ShareOptions): Promise<boolean> {
    try {
      haptics.light();

      const result = await Share.open({
        title: options.title,
        message: options.message,
        url: options.url,
      });

      if (result && result.success) {
        haptics.success();
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.message === 'User did not share') {
        return false;
      }
      console.error('Share error:', error);
      return false;
    }
  }

  /**
   * Share to specific social media
   */
  async shareToSocial(
    platform: 'whatsapp' | 'telegram' | 'instagram' | 'vk',
    message: string,
    url?: string
  ): Promise<boolean> {
    try {
      haptics.light();

      const socialUrls = {
        whatsapp: `whatsapp://send?text=${encodeURIComponent(message + (url ? ` ${url}` : ''))}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url || '')}&text=${encodeURIComponent(message)}`,
        instagram: 'instagram://app', // Instagram doesn't support direct sharing via URL
        vk: `https://vk.com/share.php?url=${encodeURIComponent(url || '')}&title=${encodeURIComponent(message)}`,
      };

      const result = await Share.shareSingle({
        social: Share.Social[platform.toUpperCase() as keyof typeof Share.Social],
        message,
        url,
      });

      if (result) {
        haptics.success();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Social share error:', error);
      haptics.error();
      return false;
    }
  }
}

export const shareService = new ShareService();
