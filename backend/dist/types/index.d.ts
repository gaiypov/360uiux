/**
 * 360° РАБОТА - TypeScript Type Definitions
 */
export type UserRole = 'jobseeker' | 'employer' | 'moderator' | 'admin';
export interface User {
    id: string;
    phone: string;
    email?: string;
    role: UserRole;
    name?: string;
    avatar_url?: string;
    profession?: string;
    city?: string;
    salary_expected?: number;
    resume_video_url?: string;
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
export interface SMSCode {
    id: string;
    phone: string;
    code: string;
    expires_at: Date;
    verified: boolean;
    attempts: number;
    created_at: Date;
}
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
    resume_video_id?: string;
    chat_room_id?: string;
    employer_status?: string;
    employer_notes?: string;
    created_at: Date;
    updated_at: Date;
}
export interface Resume {
    id: string;
    jobseeker_id: string;
    title?: string;
    profession?: string;
    city?: string;
    salary_expected?: number;
    description?: string;
    skills?: string[];
    video_id?: string;
    video_status?: string;
    created_at: Date;
    updated_at: Date;
}
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
export type ChatSenderType = 'jobseeker' | 'employer' | 'system';
export type ChatMessageType = 'text' | 'video' | 'system';
export interface ChatMessage {
    id: string;
    application_id: string;
    sender_id: string;
    sender_type: ChatSenderType;
    message_type: ChatMessageType;
    content?: string;
    video_id?: string;
    is_read: boolean;
    read_at?: Date;
    created_at: Date;
    updated_at: Date;
}
export interface Favorite {
    id: string;
    user_id: string;
    vacancy_id: string;
    created_at: Date;
}
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
export interface JWTPayload {
    userId: string;
    phone: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export type VideoType = 'vacancy' | 'resume';
export type VideoStatus = 'uploading' | 'transcoding' | 'auto_moderation' | 'pending_moderation' | 'approved' | 'rejected' | 'flagged' | 'blocked';
export type ModerationStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export interface Video {
    id: string;
    video_id: string;
    type: VideoType;
    user_id: string;
    vacancy_id?: string;
    title: string;
    description?: string;
    player_url: string;
    hls_url: string;
    thumbnail_url: string;
    duration?: number;
    status: VideoStatus;
    views: number;
    provider: 'api.video' | 'yandex';
    is_public: boolean;
    download_protected: boolean;
    moderation_status: ModerationStatus;
    moderated_by?: string;
    moderated_at?: Date;
    ai_check_passed: boolean;
    ai_check_results?: Record<string, any>;
    rejection_reason?: string;
    complaints_count: number;
    priority_moderation: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface ResumeVideoView {
    id: string;
    video_id: string;
    application_id: string;
    employer_id: string;
    view_count: number;
    max_views: number;
    first_viewed_at?: Date;
    last_viewed_at?: Date;
    auto_delete_after_views: boolean;
    deleted_at?: Date;
    created_at: Date;
    updated_at: Date;
}
export interface ViewLimitCheckResponse {
    can_view: boolean;
    views_left: number;
    total_views: number;
}
export interface SecureVideoUrlResponse {
    url: string;
    expires_at: Date;
    views_remaining: number;
}
export type ComplaintReason = 'inappropriate_content' | 'misleading_info' | 'spam' | 'violence' | 'harassment' | 'copyright' | 'other';
export type ComplaintStatus = 'pending' | 'in_review' | 'confirmed' | 'dismissed' | 'resolved';
export interface VideoComplaint {
    id: string;
    video_id: string;
    user_id: string;
    reason: ComplaintReason;
    description?: string;
    status: ComplaintStatus;
    reviewed_by?: string;
    reviewed_at?: Date;
    moderator_comment?: string;
    created_at: Date;
    updated_at: Date;
}
export type ModerationAction = 'ai_check_started' | 'ai_check_completed' | 'ai_check_failed' | 'manual_review_started' | 'manual_review_completed' | 'approved' | 'rejected' | 'flagged' | 'blocked' | 'unblocked' | 'complaint_received' | 'complaint_resolved';
export interface ModerationLog {
    id: string;
    video_id: string;
    action: ModerationAction;
    performed_by?: string;
    details?: Record<string, any>;
    comment?: string;
    created_at: Date;
}
export interface UploadVideoRequest {
    title: string;
    description?: string;
    vacancy_id?: string;
}
export interface UploadVideoResponse {
    video: Video;
    uploadUrl?: string;
}
export interface VideoStatsResponse {
    views: number;
    duration: number;
    completion: number;
}
export interface SubmitComplaintRequest {
    video_id: string;
    reason: ComplaintReason;
    description?: string;
}
export interface ReviewComplaintRequest {
    complaint_id: string;
    status: ComplaintStatus;
    comment?: string;
}
export interface ModerateVideoRequest {
    video_id: string;
    action: 'approve' | 'reject' | 'flag' | 'block';
    reason?: string;
    comment?: string;
}
export interface GetPendingVideosResponse {
    videos: Video[];
    total: number;
    page: number;
    limit: number;
}
export interface AICheckResult {
    passed: boolean;
    confidence: number;
    labels?: string[];
    issues?: string[];
    details?: Record<string, any>;
}
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
            file?: Express.Multer.File;
            files?: Express.Multer.File[];
        }
    }
}
//# sourceMappingURL=index.d.ts.map