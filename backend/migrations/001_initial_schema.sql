-- 360° РАБОТА - Initial Database Schema
-- Created: 2025-01-05

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- USERS TABLE
-- ===================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),

  role VARCHAR(20) NOT NULL CHECK (role IN ('jobseeker', 'employer')),

  -- Для соискателей
  name VARCHAR(255),
  avatar_url TEXT,
  profession VARCHAR(100),
  city VARCHAR(100),
  salary_expected INTEGER,
  resume_video_url TEXT,

  -- Для работодателей
  company_name VARCHAR(255),
  inn VARCHAR(12),
  kpp VARCHAR(9),
  legal_address TEXT,
  actual_address TEXT,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),

  -- Пароль не нужен (только SMS авторизация)
  -- Но сохраняем refresh token
  refresh_token TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_inn ON users(inn);

-- ===================================
-- SMS VERIFICATION CODES
-- ===================================
CREATE TABLE sms_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sms_codes_phone ON sms_codes(phone);
CREATE INDEX idx_sms_codes_expires ON sms_codes(expires_at);

-- ===================================
-- COMPANY WALLETS
-- ===================================
CREATE TABLE company_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'RUB',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_employer ON company_wallets(employer_id);

-- ===================================
-- TRANSACTIONS
-- ===================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES company_wallets(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund')),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',

  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),

  -- Платежная система
  payment_system VARCHAR(20) CHECK (payment_system IN ('tinkoff', 'alfabank', 'internal')),
  payment_id VARCHAR(100),
  card_type VARCHAR(20) CHECK (card_type IN ('business', 'mir', 'regular')),

  description TEXT,
  metadata JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ===================================
-- INVOICES
-- ===================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,

  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,

  amount DECIMAL(12, 2) NOT NULL,
  vat DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',

  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),

  description TEXT,
  items JSONB NOT NULL,

  issue_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,

  pdf_url TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_employer ON invoices(employer_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ===================================
-- PRICING PLANS
-- ===================================
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Цены за действия (в рублях)
  vacancy_post_price DECIMAL(10, 2) DEFAULT 0,
  vacancy_top_price DECIMAL(10, 2) DEFAULT 0,
  vacancy_boost_price DECIMAL(10, 2) DEFAULT 0,
  application_view_price DECIMAL(10, 2) DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем базовый тариф
INSERT INTO pricing_plans (name, description, vacancy_post_price, vacancy_top_price, vacancy_boost_price, application_view_price)
VALUES (
  'Стандартный',
  'Базовый тариф для всех работодателей',
  1000.00,
  500.00,
  300.00,
  50.00
);

-- ===================================
-- VACANCIES
-- ===================================
CREATE TABLE vacancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  profession VARCHAR(100) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,

  salary_min INTEGER,
  salary_max INTEGER,
  currency VARCHAR(3) DEFAULT 'RUB',

  city VARCHAR(100) NOT NULL,
  metro VARCHAR(100),

  schedule VARCHAR(20) CHECK (schedule IN ('full_time', 'part_time', 'remote', 'flexible', 'shift')),
  requires_experience BOOLEAN DEFAULT false,

  benefits TEXT[],
  requirements TEXT[],
  tags TEXT[],

  views INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),

  -- Для поднятия в топ
  is_top BOOLEAN DEFAULT false,
  top_until TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX idx_vacancies_employer ON vacancies(employer_id);
CREATE INDEX idx_vacancies_status ON vacancies(status);
CREATE INDEX idx_vacancies_city ON vacancies(city);
CREATE INDEX idx_vacancies_profession ON vacancies(profession);
CREATE INDEX idx_vacancies_created ON vacancies(created_at DESC);
CREATE INDEX idx_vacancies_top ON vacancies(is_top, top_until);

-- ===================================
-- APPLICATIONS (Отклики)
-- ===================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id UUID REFERENCES vacancies(id) ON DELETE CASCADE,
  jobseeker_id UUID REFERENCES users(id) ON DELETE CASCADE,

  message TEXT,
  resume_video_url TEXT,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'archived')),

  viewed_at TIMESTAMP,
  responded_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(vacancy_id, jobseeker_id)
);

CREATE INDEX idx_applications_vacancy ON applications(vacancy_id);
CREATE INDEX idx_applications_jobseeker ON applications(jobseeker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created ON applications(created_at DESC);

-- ===================================
-- CHATS (Переписка)
-- ===================================
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  jobseeker_id UUID REFERENCES users(id) ON DELETE CASCADE,

  last_message TEXT,
  last_message_at TIMESTAMP,

  employer_unread INTEGER DEFAULT 0,
  jobseeker_unread INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chats_application ON chats(application_id);
CREATE INDEX idx_chats_employer ON chats(employer_id);
CREATE INDEX idx_chats_jobseeker ON chats(jobseeker_id);

-- ===================================
-- MESSAGES
-- ===================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'file')),
  file_url TEXT,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- ===================================
-- FAVORITES (Избранное)
-- ===================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vacancy_id UUID REFERENCES vacancies(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, vacancy_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_vacancy ON favorites(vacancy_id);

-- ===================================
-- NOTIFICATIONS
-- ===================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ===================================
-- TRIGGERS для updated_at
-- ===================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON company_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vacancies_updated_at BEFORE UPDATE ON vacancies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- ФУНКЦИЯ для генерации номера счета
-- ===================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0')
    INTO sequence_part
    FROM invoices
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

    RETURN 'INV-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- КОММЕНТАРИИ к таблицам
-- ===================================

COMMENT ON TABLE users IS 'Пользователи системы (соискатели и работодатели)';
COMMENT ON TABLE sms_codes IS 'Коды подтверждения для SMS авторизации';
COMMENT ON TABLE company_wallets IS 'Кошельки работодателей';
COMMENT ON TABLE transactions IS 'Транзакции пополнения и списания';
COMMENT ON TABLE invoices IS 'Счета для оплаты';
COMMENT ON TABLE pricing_plans IS 'Тарифные планы';
COMMENT ON TABLE vacancies IS 'Вакансии';
COMMENT ON TABLE applications IS 'Отклики соискателей на вакансии';
COMMENT ON TABLE chats IS 'Чаты между работодателями и соискателями';
COMMENT ON TABLE messages IS 'Сообщения в чатах';
COMMENT ON TABLE favorites IS 'Избранные вакансии';
COMMENT ON TABLE notifications IS 'Уведомления пользователей';
