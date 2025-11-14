# 🗺️ NAVIGATION FLOW DIAGRAM - 360° РАБОТА

## VISUAL NAVIGATION MAP

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            APP ENTRY POINT                              │
│                              App.tsx                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   ErrorBoundary         │
                    │   GestureHandler        │
                    │   SafeAreaProvider      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  NavigationContainer    │
                    │  (RootNavigator)        │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
        ┌────────▼─────┐  ┌─────▼──────┐  ┌────▼──────────┐
        │ Onboarding   │  │   Main     │  │  Auth Group   │
        │ (conditional)│  │ (dynamic)  │  │  (modals)     │
        └──────────────┘  └─────┬──────┘  └───────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              ┌─────▼──┐   ┌───▼────┐  ┌──▼─────┐
              │ Guest  │   │JobSeek │  │Employer│  ┌─────┐
              │ Mode   │   │  er    │  │        │  │Admin│
              └────────┘   └────────┘  └────────┘  └─────┘
```

---

## DETAILED FLOW: GUEST → REGISTRATION → MAIN

```
┌──────────────────────────────────────────────────────────────────────┐
│                         GUEST MODE FLOW                              │
└──────────────────────────────────────────────────────────────────────┘

    App Start
        ↓
    First Launch?
        ├── YES → Onboarding (3 slides)
        │           ↓
        │         Skip / Complete
        │           ↓
        └── NO ──→ Main (Guest Mode)
                    ↓
            ┌───────────────────┐
            │ JobSeekerNavigator│  ⚠️ ПРОБЛЕМА: Гость видит все экраны!
            │ (LIMITED ACCESS)  │
            └─────────┬─────────┘
                      │
            ┌─────────▼─────────┐
            │  VacancyFeedScreen│
            │  (TikTok-style)   │
            └─────────┬─────────┘
                      │
                Swipe Up/Down
                View 1-20 videos
                      │
                      ├─── Video 1-19 ──→ Continue Feed
                      │
                      └─── Video 20 ────→ RegistrationRequired Modal
                                              ↓
                                   ┌──────────┴──────────┐
                                   │                     │
                            Register Button      Login Button
                                   │                     │
                                   ↓                     ↓
                          PhoneInput Screen      Login Screen
                                   ↓                     ↓
                          SMSVerification        Check User
                                   ↓                     ↓
                          RoleSelection          WelcomeBack
                                   │                     │
                     ┌─────────────┼─────────────────────┘
                     │             │
              ┌──────▼─────┐  ┌───▼────────┐
              │ JobSeeker  │  │  Employer  │
              │Registration│  │Registration│
              └──────┬─────┘  └───┬────────┘
                     │            │
                     └──────┬─────┘
                            │
                    ┌───────▼────────┐
                    │  AUTHENTICATED │
                    │      MAIN      │
                    └────────────────┘
```

---

## JOBSEEKER NAVIGATOR STRUCTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│                     JOBSEEKER NAVIGATOR                              │
└──────────────────────────────────────────────────────────────────────┘

JobSeekerNavigator (Stack)
│
├─ Tabs (Bottom Tab Navigator) ⭐ INITIAL ROUTE
│  │
│  ├─ 🏠 Home
│  │   └─ MainFeedScreen
│  │       ├─ TikTok-style vertical swipe
│  │       ├─ Video autoplay
│  │       ├─ Like/Comment/Share buttons
│  │       └─ Apply button → Application screen
│  │
│  ├─ 🔍 Search
│  │   └─ SearchScreen
│  │       ├─ Filter by: profession, city, salary
│  │       └─ Results → VacancyCard
│  │
│  ├─ ❤️ Favorites
│  │   └─ FavoritesScreen
│  │       └─ Saved vacancies list
│  │
│  ├─ 💼 Applications
│  │   └─ ApplicationsScreen
│  │       └─ My applications + status
│  │
│  └─ 👤 Profile
│      └─ ProfileScreen
│          ├─ User info
│          ├─ Resume video (if uploaded)
│          └─ Settings button → Settings screen
│
└─ Stack Screens (Push Navigation)
   │
   ├─ Feed ⚠️ ПРОБЛЕМА: Дублирование!
   │   └─ VacancyFeedScreen (аналог MainFeedScreen)
   │
   ├─ VacancyDetail
   │   └─ VacancyDetailScreen
   │       ├─ Full vacancy info
   │       ├─ Company info → CompanyDetail
   │       └─ Apply button → Application
   │
   ├─ CompanyDetail
   │   └─ CompanyDetailScreen
   │       └─ Company profile + vacancies
   │
   ├─ Application
   │   └─ ApplicationScreen
   │       └─ Apply form + resume video
   │
   ├─ CreateResume
   │   └─ CreateResumeScreen
   │       └─ Resume builder + video record
   │
   ├─ VideoRecord ⚠️ ДУБЛИРОВАНИЕ с Employer
   │   └─ VideoRecordScreen
   │
   ├─ VideoPreview
   │   └─ VideoPreviewScreen
   │
   ├─ VideoPlayer ⚠️ ДУБЛИРОВАНИЕ с Employer
   │   └─ VideoPlayerScreen
   │
   ├─ Chat
   │   └─ ChatScreen
   │       └─ 1-on-1 chat with employer
   │
   ├─ Notifications ⚠️ Разное расположение с Employer!
   │   └─ NotificationsScreen
   │
   └─ Settings ⚠️ ДУБЛИРОВАНИЕ
       └─ SettingsScreen
```

---

## EMPLOYER NAVIGATOR STRUCTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│                      EMPLOYER NAVIGATOR                              │
└──────────────────────────────────────────────────────────────────────┘

EmployerNavigator (Stack)
│
├─ Tabs (Bottom Tab Navigator) ⭐ INITIAL ROUTE
│  │
│  ├─ 💼 Vacancies
│  │   └─ EmployerVacanciesListScreen
│  │       ├─ My vacancies list
│  │       └─ + Create Vacancy button
│  │
│  ├─ 👥 Candidates
│  │   └─ CandidatesScreen
│  │       ├─ Applications list
│  │       ├─ Filter by status
│  │       └─ View resume video (2-view limit!)
│  │
│  ├─ 📊 Analytics
│  │   └─ AnalyticsScreen
│  │       ├─ Vacancy performance
│  │       ├─ Views, applications, conversions
│  │       └─ Detailed Analytics button
│  │
│  ├─ 🔔 Notifications ⚠️ В ТАБАХ! У JobSeeker - в Stack
│  │   └─ NotificationsScreen
│  │
│  └─ 👤 Profile
│      └─ EmployerProfileScreen
│          ├─ Company info
│          ├─ Wallet balance
│          └─ Settings
│
└─ Stack Screens (Push Navigation)
   │
   ├─ CreateVacancy ⚠️ Две версии!
   │   └─ CreateVacancyScreen (V1)
   │
   ├─ CreateVacancyV2 ⚠️ Дублирование!
   │   └─ CreateVacancyScreenV2
   │       ├─ Form (title, salary, city, etc.)
   │       └─ Video record → VideoRecord
   │
   ├─ VideoRecord ⚠️ ДУБЛИРОВАНИЕ с JobSeeker
   │   └─ VideoRecordScreen
   │
   ├─ VideoPlayer ⚠️ ДУБЛИРОВАНИЕ с JobSeeker
   │   └─ VideoPlayerScreen
   │
   ├─ MassMailing
   │   └─ MassMailingScreen
   │
   ├─ Automation
   │   └─ AutomationScreen
   │
   ├─ ABTesting
   │   └─ ABTestingScreen
   │
   ├─ DetailedAnalytics
   │   └─ DetailedAnalyticsScreen
   │
   ├─ Chat
   │   └─ ChatScreen
   │
   ├─ Wallet ⚠️ ДУБЛИРОВАНИЕ!
   │   └─ WalletScreen
   │
   ├─ EmployerWallet ⚠️ ДУБЛИРОВАНИЕ того же WalletScreen!
   │   └─ WalletScreen
   │
   ├─ EmployerPricing
   │   └─ EmployerPricingScreen
   │
   └─ TopUpModal (Transparent Modal)
       └─ TopUpModal
```

---

## ADMIN NAVIGATOR STRUCTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│                       ADMIN NAVIGATOR                                │
└──────────────────────────────────────────────────────────────────────┘

AdminNavigator (Stack)
│
├─ AdminTabs (Bottom Tab Navigator) ⭐ INITIAL ROUTE
│  │
│  ├─ 📊 Dashboard
│  │   └─ AdminDashboardScreen
│  │       ├─ Platform metrics
│  │       └─ Overview
│  │
│  ├─ 👥 Users
│  │   └─ AdminUsersScreen
│  │       ├─ User management
│  │       └─ Ban/Verify users
│  │
│  ├─ 🏢 Employers
│  │   └─ AdminEmployersScreen
│  │       ├─ Company verification
│  │       └─ Premium features
│  │
│  ├─ 💼 Vacancies
│  │   └─ AdminVacanciesScreen
│  │       ├─ Moderate vacancies
│  │       └─ Approve/Reject
│  │
│  ├─ 🚩 Reports
│  │   └─ AdminReportsScreen
│  │       └─ User complaints
│  │
│  └─ ⚙️ Settings
│      └─ AdminSettingsScreen
│
└─ Stack Screens
   │
   ├─ AdminTransactions
   │   └─ AdminTransactionsScreen
   │
   ├─ AdminInvoices
   │   └─ AdminInvoicesScreen
   │
   └─ AdminPricing
       └─ AdminPricingScreen
```

**⚠️ ПРОБЛЕМЫ:**
- Нет VideoPlayer → Админ не может просматривать видео для модерации!
- Нет Chat → Админ не может общаться с пользователями

---

## AUTH FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│                        AUTH FLOW (MODALS)                            │
└──────────────────────────────────────────────────────────────────────┘

Entry Point: RegistrationRequired / Login / PhoneInput

┌─────────────────────────┐
│ RegistrationRequired    │ ← Показывается после 20 видео (guest)
│ (Modal)                 │
└───────┬─────────────────┘
        │
        ├─── Register ───┐
        │                │
        └─── Login ──────┼────→ ┌──────────────┐
                         │      │ LoginScreen  │
                         │      └──────┬───────┘
                         │             │
                         │        Check User
                         │             │
                         │      ┌──────▼────────┐
                         │      │ WelcomeBack   │
                         │      │ (if exists)   │
                         │      └───────────────┘
                         │
                    ┌────▼───────────┐
                    │ PhoneInput     │
                    │ (SMS code)     │
                    └────┬───────────┘
                         │
                    ┌────▼────────────┐
                    │ SMSVerification │
                    │ (enter code)    │
                    └────┬────────────┘
                         │
                         ├─── User Exists ───→ WelcomeBack
                         │
                         └─── New User ──→ ┌─────────────────┐
                                           │ RoleSelection   │
                                           └────┬────────────┘
                                                │
                               ┌────────────────┼────────────────┐
                               │                                 │
                    ┌──────────▼────────┐           ┌───────────▼──────────┐
                    │ Registration       │           │ EmployerRegistration │
                    │ (JobSeeker)        │           │ (Employer)           │
                    └──────────┬─────────┘           └───────────┬──────────┘
                               │                                 │
                               └────────────┬────────────────────┘
                                            │
                                    ┌───────▼────────┐
                                    │ AUTHENTICATED  │
                                    │ Navigate to    │
                                    │ Main (role)    │
                                    └────────────────┘
```

---

## NAVIGATION TRANSITIONS & ANIMATIONS

```
┌──────────────────────────────────────────────────────────────────────┐
│                    TRANSITION TYPES BY SCREEN                        │
└──────────────────────────────────────────────────────────────────────┘

Root Stack:
├─ Onboarding           → fade
├─ Main                 → fade
└─ Auth Group (Modals)  → slide_from_bottom (iOS gesture enabled)

JobSeeker/Employer/Admin Stacks:
└─ All screens          → slide_from_right

Tab Navigator:
└─ Tab switches         → fade (built-in)

Special:
├─ TopUpModal           → transparentModal + fade
├─ CommentsModal        → fade
└─ SearchModal          → fade
```

---

## DEEP LINKING STRUCTURE (CURRENT - LIMITED!)

```
360rabota://
├─ onboarding
├─ auth/
│  ├─ required
│  ├─ login
│  ├─ phone
│  ├─ sms
│  ├─ role
│  ├─ register
│  ├─ register/employer
│  └─ welcome
│
└─ ⚠️ ОТСУТСТВУЮТ:
   ├─ vacancy/:id
   ├─ company/:id
   ├─ chat/:applicationId
   ├─ profile
   └─ feed
```

---

## NAVIGATION PATTERNS USED

### 1. Stack Navigator
- **Используется для:** Push/pop navigation
- **Локации:** RootNavigator, JobSeeker, Employer, Admin
- **Анимации:** slide_from_right, fade

### 2. Bottom Tab Navigator
- **Используется для:** Main navigation between sections
- **Локации:** JobSeekerTabs, EmployerTabs, AdminTabs
- **Features:** Blur background (iOS), Glass morphism

### 3. Modal Presentation
- **Используется для:** Auth flow, TopUpModal
- **Анимации:** slide_from_bottom, fade
- **Gesture:** iOS swipe down to dismiss

### 4. Conditional Rendering
- **Используется для:** Onboarding (first launch only)
- **Logic:** AsyncStorage flag

### 5. Dynamic Navigator Selection
- **Используется для:** Role-based navigation (JobSeeker/Employer/Admin)
- **Logic:** useAuthStore → user.role

---

## MEMORY MANAGEMENT

### FlatList Optimization (VacancyFeedScreen)

```
FlatList Props:
├─ removeClippedSubviews: true        ✅ Removes off-screen views
├─ maxToRenderPerBatch: 3             ✅ Render 3 items per batch
├─ windowSize: 3                      ✅ Keep 3 screens in memory
├─ initialNumToRender: 2              ✅ Start with 2 items
├─ updateCellsBatchingPeriod: 100     ✅ Batch updates every 100ms
├─ getItemLayout                      ✅ Fixed height optimization
└─ pagingEnabled: true                ✅ TikTok-style paging
```

### Custom Window Rendering

```javascript
const RENDER_WINDOW_SIZE = 1;  // Only render current +/- 1

shouldRenderVideo(index):
  return Math.abs(index - currentIndex) <= 1;
  // Only N-1, N, N+1 rendered
```

---

## CRITICAL NAVIGATION BUGS - VISUAL MAP

```
┌──────────────────────────────────────────────────────────────────────┐
│                    🔴 CRITICAL DUPLICATION MAP                       │
└──────────────────────────────────────────────────────────────────────┘

VideoRecordScreen:
├─ JobSeekerNavigator   → line 144  ⚠️ DUPLICATE
└─ EmployerNavigator    → line 141  ⚠️ DUPLICATE

VideoPlayerScreen:
├─ JobSeekerNavigator   → line 146  ⚠️ DUPLICATE
└─ EmployerNavigator    → line 142  ⚠️ DUPLICATE

ChatScreen:
├─ JobSeekerNavigator   → line 147  ⚠️ DUPLICATE
└─ EmployerNavigator    → line 147  ⚠️ DUPLICATE

NotificationsScreen:
├─ JobSeekerNavigator   → Stack → line 148        ⚠️ STACK
└─ EmployerNavigator    → Tabs → line 99          ⚠️ TABS (inconsistent!)

SettingsScreen:
├─ JobSeekerNavigator   → line 149  ⚠️ DUPLICATE
└─ (Missing in Employer)

WalletScreen:
├─ EmployerNavigator → "Wallet"         line 148  ⚠️ DUPLICATE
└─ EmployerNavigator → "EmployerWallet" line 150  ⚠️ DUPLICATE (same component!)

CreateVacancyScreen:
├─ CreateVacancyScreen    → line 139  ⚠️ V1
└─ CreateVacancyScreenV2  → line 140  ⚠️ V2 (which one is active?)

VacancyFeedScreen vs MainFeedScreen:
├─ MainFeedScreen     → JobSeekerTabs.Home (simple version)
└─ VacancyFeedScreen  → JobSeeker Stack (optimized v4)
   ⚠️ ПОЧЕМУ ДВА FEED ЭКРАНА?
```

---

## RECOMMENDED ARCHITECTURE (AFTER REFACTORING)

```
NavigationContainer
│
└── Root Stack
    │
    ├── Onboarding (conditional)
    │
    ├── Main (dynamic by role)
    │   ├── GuestNavigator     ← NEW! Только Feed
    │   ├── JobSeekerNavigator
    │   ├── EmployerNavigator
    │   └── AdminNavigator
    │
    ├── SharedNavigator        ← NEW! Общие экраны
    │   ├── VideoRecord
    │   ├── VideoPlayer
    │   ├── Chat
    │   ├── Notifications
    │   └── Settings
    │
    └── Auth Group (modals)
        ├── RegistrationRequired
        ├── PhoneInput
        ├── SMSVerification
        ├── RoleSelection
        ├── Registration
        └── EmployerRegistration
```

---

## NAVIGATION PERFORMANCE METRICS

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Screen transition time | ~300ms | <200ms | 🟡 OK |
| Tab switch time | ~100ms | <100ms | ✅ GOOD |
| Modal open time | ~200ms | <150ms | 🟡 OK |
| Deep link resolution | N/A | <500ms | 🔴 MISSING |
| Navigation tree depth | 3 levels | ≤3 | ✅ GOOD |
| Duplicate screens | 5 | 0 | 🔴 BAD |
| Memory usage (Feed) | Optimized | TikTok-level | ✅ GOOD |

---

**Created:** 2025-11-14
**Version:** 1.0
**Next:** Implement SharedNavigator + fix duplications
