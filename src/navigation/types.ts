/**
 * 360° РАБОТА - Navigation Types
 * ✅ P0-5 FIX: Type-safe navigation with full TypeScript support
 *
 * Usage:
 * ```tsx
 * import { NativeStackScreenProps } from '@react-navigation/native-stack';
 * import { RootStackParamList } from '@/navigation/types';
 *
 * type Props = NativeStackScreenProps<RootStackParamList, 'VacancyDetail'>;
 *
 * export function VacancyDetailScreen({ route, navigation }: Props) {
 *   const { vacancyId } = route.params; // ✅ Type-safe!
 *   navigation.navigate('Application', { vacancyId }); // ✅ Type-safe!
 * }
 * ```
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ===========================
// Root Stack (App-level navigation)
// ===========================
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  RegistrationRequired: undefined;
  Login: undefined;
  PhoneInput: undefined;
  SMSVerification: {
    phoneNumber: string;
    verificationId?: string;
  };
  Registration: {
    phoneNumber: string;
  };
  WelcomeBack: {
    phoneNumber: string;
    userId: string;
  };
};

// ===========================
// Job Seeker Tab Navigation
// ===========================
export type JobSeekerTabParamList = {
  Home: undefined;
  Search: {
    query?: string;
    filters?: {
      city?: string;
      salaryMin?: number;
      salaryMax?: number;
      employmentType?: string;
    };
  };
  Favorites: undefined;
  Applications: undefined;
  Profile: undefined;
};

// ===========================
// Job Seeker Stack Navigation
// ===========================
export type JobSeekerStackParamList = {
  Tabs: NavigatorScreenParams<JobSeekerTabParamList>;
  Feed: undefined;
  VacancyDetail: {
    vacancyId: string;
  };
  CompanyDetail: {
    companyId: string;
  };
  Application: {
    vacancyId: string;
    resumeId?: string;
  };
  CreateResume: {
    editMode?: boolean;
    resumeId?: string;
  };
  VideoRecord: {
    mode: 'resume' | 'vacancy' | 'story';
    maxDuration?: number;
  };
  VideoPreview: {
    videoUri: string;
    mode: 'resume' | 'vacancy' | 'story';
  };
  VideoPlayer: {
    videoUrl: string;
    title?: string;
  };
  Chat: {
    chatId: string;
    recipientId: string;
    recipientName: string;
  };
  Notifications: undefined;
  Settings: undefined;
};

// ===========================
// Employer Tab Navigation
// ===========================
export type EmployerTabParamList = {
  Vacancies: undefined;
  Candidates: {
    vacancyId?: string;
    status?: 'pending' | 'accepted' | 'rejected';
  };
  Analytics: undefined;
  Notifications: undefined;
  Settings: undefined;
};

// ===========================
// Employer Stack Navigation
// ===========================
export type EmployerStackParamList = {
  Tabs: NavigatorScreenParams<EmployerTabParamList>;
  CreateVacancy: {
    editMode?: boolean;
    vacancyId?: string;
  };
  CreateVacancyV2: {
    editMode?: boolean;
    vacancyId?: string;
  };
  VideoRecord: {
    mode: 'resume' | 'vacancy' | 'story';
    maxDuration?: number;
  };
  VideoPlayer: {
    videoUrl: string;
    title?: string;
  };
  MassMailing: {
    vacancyId?: string;
  };
  Automation: undefined;
  ABTesting: {
    vacancyId: string;
  };
  DetailedAnalytics: {
    vacancyId?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  };
  Chat: {
    chatId: string;
    recipientId: string;
    recipientName: string;
  };
  Wallet: undefined;
  TopUpModal: {
    amount?: number;
  };
};

// ===========================
// Navigation Prop Types (Helpers)
// ===========================

// Root Stack Navigation Props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Job Seeker Tab Navigation Props
export type JobSeekerTabScreenProps<T extends keyof JobSeekerTabParamList> =
  BottomTabScreenProps<JobSeekerTabParamList, T>;

// Job Seeker Stack Navigation Props
export type JobSeekerStackScreenProps<T extends keyof JobSeekerStackParamList> =
  NativeStackScreenProps<JobSeekerStackParamList, T>;

// Employer Tab Navigation Props
export type EmployerTabScreenProps<T extends keyof EmployerTabParamList> =
  BottomTabScreenProps<EmployerTabParamList, T>;

// Employer Stack Navigation Props
export type EmployerStackScreenProps<T extends keyof EmployerStackParamList> =
  NativeStackScreenProps<EmployerStackParamList, T>;

// ===========================
// Type Guards
// ===========================

/**
 * Type guard to check if a screen is in JobSeeker navigation
 */
export function isJobSeekerScreen(screen: string): screen is keyof JobSeekerStackParamList {
  const screens: Array<keyof JobSeekerStackParamList> = [
    'Tabs', 'Feed', 'VacancyDetail', 'CompanyDetail', 'Application',
    'CreateResume', 'VideoRecord', 'VideoPreview', 'VideoPlayer',
    'Chat', 'Notifications', 'Settings'
  ];
  return screens.includes(screen as keyof JobSeekerStackParamList);
}

/**
 * Type guard to check if a screen is in Employer navigation
 */
export function isEmployerScreen(screen: string): screen is keyof EmployerStackParamList {
  const screens: Array<keyof EmployerStackParamList> = [
    'Tabs', 'CreateVacancy', 'CreateVacancyV2', 'VideoRecord', 'VideoPlayer',
    'MassMailing', 'Automation', 'ABTesting', 'DetailedAnalytics',
    'Chat', 'Wallet', 'TopUpModal'
  ];
  return screens.includes(screen as keyof EmployerStackParamList);
}

// ===========================
// Global Navigation Declaration
// ===========================

/**
 * Declare global types for React Navigation
 * This enables type checking in useNavigation() hook without explicitly passing types
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
