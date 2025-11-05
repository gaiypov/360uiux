/**
 * 360° РАБОТА - TypeScript Type Definitions
 */

// ===================================
// USER TYPES
// ===================================

export type UserRole = 'jobseeker' | 'employer';

export interface User {
  id: string;
  phone: string;
  email?: string;
  role: UserRole;

  // Jobseeker fields
  name?: string;
  avatar_url?: string;
  profession?: string;
  city?: string;
  salary_expected?: number;
  resume_video_url?: string;

  // Employer fields
  company_name?: string;
  inn?: string;
  kpp?: string;
  legal_address?: string;
  actual_address?: string;
  verified?: boolean;
  rating?: number;

  refresh_token?: string;

  created_at: Date;
  updated_at: Date;
}

export interface JobSeekerProfile extends User {
  role: 'jobseeker';
  name: string;
}

export interface EmployerProfile extends User {
  role: 'employer';
  company_name: string;
  inn: string;
}

// ===================================
// SMS VERIFICATION
// ===================================

export interface SMSCode {
  id: string;
  phone: string;
  code: string;
  expires_at: Date;
  verified: boolean;
  attempts: number;
  created_at: Date;
}

// ===================================
// WALLET & TRANSACTIONS
// ===================================

export interface Wallet {
  id: string;
  employer_id: string;
  balance: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentSystem = 'tinkoff' | 'alfabank' | 'internal';
export type CardType = 'business' | 'mir' | 'regular';

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_system?: PaymentSystem;
  payment_id?: string;
  card_type?: CardType;
  description?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  completed_at?: Date;
}

// ===================================
// INVOICES
// ===================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  employer_id: string;
  amount: number;
  vat: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  description?: string;
  items: InvoiceItem[];
  issue_date: Date;
  due_date?: Date;
  paid_date?: Date;
  pdf_url?: string;
  created_at: Date;
  updated_at: Date;
}

// ===================================
// PRICING
// ===================================

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  vacancy_post_price: number;
  vacancy_top_price: number;
  vacancy_boost_price: number;
  application_view_price: number;
  is_active: boolean;
  created_at: Date;
}

// ===================================
// VACANCIES
// ===================================

export type VacancySchedule = 'full_time' | 'part_time' | 'remote' | 'flexible' | 'shift';
export type VacancyStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived';

export interface Vacancy {
  id: string;
  employer_id: string;
  title: string;
  profession: string;
  video_url: string;
  thumbnail_url?: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  city: string;
  metro?: string;
  schedule?: VacancySchedule;
  requires_experience: boolean;
  benefits?: string[];
  requirements?: string[];
  tags?: string[];
  views: number;
  applications_count: number;
  status: VacancyStatus;
  is_top: boolean;
  top_until?: Date;
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
}

// ===================================
// APPLICATIONS
// ===================================

export type ApplicationStatus = 'pending' | 'viewed' | 'accepted' | 'rejected' | 'archived';

export interface Application {
  id: string;
  vacancy_id: string;
  jobseeker_id: string;
  message?: string;
  resume_video_url?: string;
  status: ApplicationStatus;
  viewed_at?: Date;
  responded_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ===================================
// CHATS & MESSAGES
// ===================================

export interface Chat {
  id: string;
  application_id: string;
  employer_id: string;
  jobseeker_id: string;
  last_message?: string;
  last_message_at?: Date;
  employer_unread: number;
  jobseeker_unread: number;
  created_at: Date;
  updated_at: Date;
}

export type MessageType = 'text' | 'image' | 'video' | 'file';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  file_url?: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

// ===================================
// FAVORITES
// ===================================

export interface Favorite {
  id: string;
  user_id: string;
  vacancy_id: string;
  created_at: Date;
}

// ===================================
// NOTIFICATIONS
// ===================================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

// ===================================
// API REQUEST/RESPONSE TYPES
// ===================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  phone: string;
}

export interface VerifyCodeRequest {
  phone: string;
  code: string;
}

export interface RegisterJobSeekerRequest {
  phone: string;
  name: string;
  profession: string;
  city: string;
}

export interface RegisterEmployerRequest {
  phone: string;
  email: string;
  company_name: string;
  inn: string;
  legal_address?: string;
}

export interface InitPaymentRequest {
  amount: number;
  paymentSystem: PaymentSystem;
  cardType?: CardType;
}

export interface InitPaymentResponse {
  transactionId: string;
  paymentUrl: string;
  amount: number;
}

// ===================================
// JWT PAYLOAD
// ===================================

export interface JWTPayload {
  userId: string;
  phone: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ===================================
// VIDEO TYPES
// ===================================

export type VideoType = 'vacancy' | 'resume';
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface Video {
  id: string;
  video_id: string; // ID от провайдера (api.video или Yandex)
  type: VideoType;
  user_id: string;
  vacancy_id?: string; // Для видео вакансий
  title: string;
  description?: string;
  player_url: string;
  hls_url: string;
  thumbnail_url: string;
  duration?: number;
  status: VideoStatus;
  views: number;
  provider: 'api.video' | 'yandex'; // Какой провайдер использовался
  created_at: Date;
  updated_at: Date;
}

export interface UploadVideoRequest {
  title: string;
  description?: string;
  vacancy_id?: string; // Для employer видео вакансий
}

export interface UploadVideoResponse {
  video: Video;
  uploadUrl?: string; // Для клиента, если нужен прямой upload
}

export interface VideoStatsResponse {
  views: number;
  duration: number;
  completion: number;
}

// ===================================
// EXPRESS REQUEST EXTENSION
// ===================================

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
