# 360° РАБОТА - Employer Dashboard Implementation Plan

## 🎯 Overview

Create comprehensive employer dashboard for both **Web** (web-dashboard) and **Mobile** (React Native) with:
- **Revolut Ultra Design**: Black theme, glass morphism, neon accents
- **Real-time Sync**: WebSocket synchronization between web and mobile
- **Complete Feature Set**: Vacancies, applications, analytics, wallet, chats
- **Responsive UI**: Optimized for desktop and mobile

---

## 📊 Current Status

### Web Dashboard (web-dashboard/)
**Existing Files**:
- ✅ `/app/page.tsx` - Main dashboard
- ✅ `/app/vacancies/page.tsx` - Vacancies list
- ✅ `/app/vacancies/new/page.tsx` - Create vacancy
- ✅ `/app/applications/page.tsx` - Applications
- ✅ `/app/analytics/page.tsx` - Analytics
- ✅ `/app/wallet/page.tsx` - Wallet
- ✅ `/app/chats/page.tsx` - Chats
- ✅ `/app/company/page.tsx` - Company profile
- ✅ `/app/settings/page.tsx` - Settings

**Components**:
- ✅ Sidebar, Header, StatCard
- ✅ DonutChart, PerformanceChart
- ✅ ChatWindow, ResumeVideoViewer

**Status**: Basic structure exists, needs **API integration** and **Revolut design**

### React Native Employer Screens (src/screens/employer/)
**Existing Screens**:
- ✅ ApplicationsScreen.tsx
- ✅ AnalyticsScreen.tsx
- ✅ CreateVacancyScreen.tsx
- ✅ CreateVacancyScreenV2.tsx
- ✅ CandidatesScreen.tsx
- ✅ ABTestingScreen.tsx
- ✅ AutomationScreen.tsx
- ✅ MassMailingScreen.tsx

**Status**: Screens exist, need **API integration** and **design updates**

---

## 🎨 Revolut Ultra Design System

### Colors:
```css
--ultra-black: #000000
--graphite: #1C1C1E
--dark-gray: #2C2C2E
--neon-purple: #8E7FFF
--cyber-blue: #39E0F8
--success-green: #30D158
--warning-orange: #FF9F0A
--error-red: #FF453A
--text-primary: #FFFFFF
--text-secondary: #98989D
--glass-bg: rgba(255, 255, 255, 0.08)
--glass-border: rgba(255, 255, 255, 0.12)
```

### Components Style:
- **Glass Cards**: `backdrop-filter: blur(20px)`, border with opacity
- **Neon Buttons**: Gradient purple→blue with glow
- **Metal Icons**: Silver gradient with shadow
- **Smooth Animations**: `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 🏗️ Implementation Plan

### Phase 1: Backend API Integration (Already Complete ✅)

**Employer Endpoints Available**:
```typescript
// Vacancies
GET    /api/v1/vacancies              # List employer vacancies
POST   /api/v1/vacancies              # Create vacancy
PUT    /api/v1/vacancies/:id          # Update vacancy
DELETE /api/v1/vacancies/:id          # Delete vacancy
GET    /api/v1/vacancies/:id          # Get vacancy details

// Applications
GET    /api/v1/applications           # Get applications by status
GET    /api/v1/applications/vacancy/:id # Get vacancy applications
PATCH  /api/v1/applications/:id/status # Update application status

// Profile
GET    /api/v1/users/profile          # Get employer profile
PUT    /api/v1/users/profile          # Update profile
POST   /api/v1/users/profile/avatar   # Upload logo

// Wallet
GET    /api/v1/billing/wallet/balance
GET    /api/v1/billing/wallet/transactions
POST   /api/v1/billing/payment/init

// Analytics (if needed - to be added)
GET    /api/v1/analytics/employer     # Employer analytics
```

### Phase 2: Web Dashboard Enhancement

#### 2.1 Main Dashboard (`/app/page.tsx`)

**Features**:
- [ ] Overview statistics cards:
  - Active vacancies
  - Total applications
  - New applications today
  - Response rate
- [ ] Quick actions (glass cards):
  - Create vacancy
  - View applications
  - Check analytics
- [ ] Recent applications feed
- [ ] Activity timeline
- [ ] Performance chart (last 30 days)

**Design**: Dark background, glass cards, neon accents

#### 2.2 Vacancies Page (`/app/vacancies/page.tsx`)

**Features**:
- [ ] List all vacancies with filters:
  - Status (active, pending moderation, rejected, closed)
  - Date range
  - Profession
- [ ] Vacancy cards showing:
  - Title, profession, salary
  - Applications count
  - Views count
  - Status badge (moderation pending/approved)
  - Quick actions (edit, delete, view applications)
- [ ] Create vacancy button (floating action)
- [ ] Bulk actions (activate, deactivate, delete)

**Design**: Grid layout with glass cards, status badges with neon glow

#### 2.3 Create/Edit Vacancy (`/app/vacancies/new/page.tsx`)

**Features**:
- [ ] Multi-step form:
  1. Basic info (title, profession, city)
  2. Salary & benefits
  3. Description & requirements
  4. Video upload (optional)
- [ ] Real-time preview
- [ ] Auto-save draft
- [ ] Validation with helpful errors
- [ ] Submit for moderation

**Design**: Glass form fields, neon submit button, preview panel

#### 2.4 Applications Page (`/app/applications/page.tsx`)

**Features**:
- [ ] Kanban board view:
  - New applications
  - Viewed
  - Interview
  - Rejected
  - Hired
- [ ] Drag & drop to change status
- [ ] Filter by vacancy, date, status
- [ ] Application card:
  - Candidate name, profession
  - Applied date
  - Video resume thumbnail
  - Quick view button
- [ ] Bulk actions (reject, schedule interview)

**Design**: Kanban columns with glass cards, drag & drop animations

#### 2.5 Application Detail Modal

**Features**:
- [ ] Candidate information
- [ ] Resume video player (2-view limit)
- [ ] Cover letter
- [ ] Resume attachments
- [ ] Status history timeline
- [ ] Quick actions:
  - View/reject/accept
  - Schedule interview
  - Open chat
- [ ] Notes section

**Design**: Full-screen modal with glass background, video player centered

#### 2.6 Analytics Page (`/app/analytics/page.tsx`)

**Features**:
- [ ] Key metrics cards:
  - Total views
  - Total applications
  - Conversion rate
  - Avg. time to hire
- [ ] Charts:
  - Applications over time (line chart)
  - Applications by source (donut chart)
  - Vacancy performance (bar chart)
  - Candidate demographics
- [ ] Date range selector
- [ ] Export to CSV/PDF

**Design**: Dark charts with neon gradients, glass metric cards

#### 2.7 Wallet Page (`/app/wallet/page.tsx`)

**Features**:
- [ ] Balance display (large, centered)
- [ ] Top-up button (neon glow)
- [ ] Transaction history:
  - Type (deposit, payment, refund)
  - Amount, date, status
  - Filter by type, date range
- [ ] Payment methods (cards)
- [ ] Invoices download

**Design**: Premium wallet UI, glass transaction cards

#### 2.8 Chats Page (`/app/chats/page.tsx`)

**Features**:
- [ ] Chat list (sidebar):
  - Candidate name, last message
  - Unread count badge
  - Last active time
- [ ] Chat window:
  - Message history
  - Video message player
  - Send message input
  - File attachments
- [ ] Real-time updates (WebSocket)

**Design**: Split view, glass chat bubbles, neon send button

#### 2.9 Company Profile (`/app/company/page.tsx`)

**Features**:
- [ ] Company information form:
  - Company name, logo
  - Description, website
  - Industry, size
  - Location, address
- [ ] Verification status
- [ ] Public profile preview
- [ ] Save button

**Design**: Form with glass inputs, preview panel

#### 2.10 Settings Page (`/app/settings/page.tsx`)

**Features**:
- [ ] Notification preferences
- [ ] Email settings
- [ ] Password change
- [ ] Two-factor authentication
- [ ] API keys (if applicable)
- [ ] Danger zone (delete account)

**Design**: Tabbed interface, glass sections

### Phase 3: React Native Employer Screens

#### 3.1 Update ApplicationsScreen

**File**: `src/screens/employer/ApplicationsScreen.tsx`

**Changes**:
- [ ] Connect to `api.getApplicationsByStatus()`
- [ ] Add pull-to-refresh
- [ ] Add pagination
- [ ] Integrate status update
- [ ] Add application detail modal
- [ ] Apply Revolut design

#### 3.2 Update AnalyticsScreen

**File**: `src/screens/employer/AnalyticsScreen.tsx`

**Changes**:
- [ ] Connect to employer analytics API
- [ ] Add real charts (react-native-chart-kit)
- [ ] Add date range picker
- [ ] Apply Revolut design

#### 3.3 Update CreateVacancyScreenV2

**File**: `src/screens/employer/CreateVacancyScreenV2.tsx`

**Changes**:
- [ ] Connect to `api.createVacancy()`
- [ ] Add image/video picker
- [ ] Add validation
- [ ] Add draft save
- [ ] Apply Revolut design

#### 3.4 Create VacanciesListScreen

**New File**: `src/screens/employer/VacanciesScreen.tsx`

**Features**:
- [ ] List vacancies with filters
- [ ] Vacancy cards with quick actions
- [ ] Pull-to-refresh
- [ ] Pagination
- [ ] Search

#### 3.5 Create WalletScreen

**File**: Already exists at `src/screens/wallet/WalletScreen.tsx`

**Changes**:
- [ ] Connect to billing APIs
- [ ] Add top-up flow
- [ ] Add transaction history
- [ ] Apply Revolut design

### Phase 4: Real-time Synchronization

#### 4.1 WebSocket Integration

**Backend** (Already exists):
```typescript
// WebSocketService already implemented
// Events: application_new, application_status_changed, message_received
```

**Web Dashboard**:
```typescript
// Create /web-dashboard/src/lib/websocket.ts
- Connect to WebSocket server
- Listen for employer events
- Update UI in real-time
- Reconnection logic
```

**React Native**:
```typescript
// Create /src/services/websocket.ts
- Connect to WebSocket
- Handle push notifications
- Update screens in real-time
```

#### 4.2 State Management

**Web**:
- Option 1: React Context + useReducer
- Option 2: Zustand (lightweight)
- Option 3: Redux Toolkit

**Mobile**:
- Already using Zustand (`src/stores/`)

### Phase 5: Design System Implementation

#### 5.1 Web Design System

**Create**: `/web-dashboard/src/lib/design-system.ts`

```typescript
export const colors = {
  ultraBlack: '#000000',
  graphite: '#1C1C1E',
  // ... all colors
};

export const components = {
  GlassCard: 'backdrop-blur-md bg-white/[0.08] border border-white/[0.12]',
  NeonButton: 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-neon',
  // ... all component styles
};
```

**Create**: `/web-dashboard/src/components/ui/` components:
- GlassCard.tsx
- NeonButton.tsx
- MetalIcon.tsx
- GlassInput.tsx
- StatusBadge.tsx

#### 5.2 Mobile Design System

**Update**: Existing components in `src/components/ui/`
- Use existing GlassButton, GlassCard
- Ensure consistent styling

---

## 🚀 Implementation Order

### Week 1: Web Dashboard Core
- [ ] Day 1-2: Main Dashboard + Vacancies List
- [ ] Day 3: Create Vacancy Form
- [ ] Day 4: Applications Kanban
- [ ] Day 5: Application Detail Modal

### Week 2: Web Dashboard Features
- [ ] Day 1: Analytics Page
- [ ] Day 2: Wallet Integration
- [ ] Day 3: Chats Integration
- [ ] Day 4-5: Company Profile + Settings

### Week 3: Mobile Integration
- [ ] Day 1-2: Update Applications & Analytics
- [ ] Day 3: Update Create Vacancy
- [ ] Day 4: Add Vacancies List
- [ ] Day 5: Wallet Integration

### Week 4: Real-time & Polish
- [ ] Day 1-2: WebSocket integration
- [ ] Day 3: Design polish
- [ ] Day 4: Testing
- [ ] Day 5: Bug fixes

---

## 📋 Checklist

### Backend:
- [x] VacancyController
- [x] ApplicationController
- [x] UserController
- [x] BillingController
- [x] WebSocketService

### Web Dashboard:
- [ ] Main Dashboard
- [ ] Vacancies CRUD
- [ ] Applications Management
- [ ] Analytics
- [ ] Wallet
- [ ] Chats
- [ ] Profile
- [ ] Settings
- [ ] WebSocket integration
- [ ] Revolut design applied

### React Native:
- [ ] ApplicationsScreen integrated
- [ ] AnalyticsScreen integrated
- [ ] CreateVacancyScreen integrated
- [ ] VacanciesScreen created
- [ ] WalletScreen integrated
- [ ] ChatScreen integrated
- [ ] ProfileScreen integrated
- [ ] SettingsScreen integrated
- [ ] WebSocket integration
- [ ] Revolut design applied

### Testing:
- [ ] Web E2E tests
- [ ] Mobile E2E tests
- [ ] WebSocket sync testing
- [ ] Cross-platform testing

---

## 🎯 Success Criteria

1. **Functional Parity**: Web and mobile have same features
2. **Real-time Sync**: Changes reflect immediately across platforms
3. **Revolut Design**: Consistent premium UI/UX
4. **Performance**: < 2s page load, < 100ms interactions
5. **Mobile Optimized**: Smooth 60fps animations
6. **Accessibility**: WCAG 2.1 AA compliant

---

## 📊 Metrics to Track

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **WebSocket Latency**: < 100ms
- **User Engagement**: Time spent per session
- **Conversion Rate**: Applications per vacancy

---

**Total Estimated Time**: 4 weeks
**Priority**: High
**Status**: Planning Complete, Ready to Implement

Next: Start with Web Dashboard Main Page and Vacancies
