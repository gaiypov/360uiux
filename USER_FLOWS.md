# 360° РАБОТА - User Flows Documentation

Complete documentation of user journeys for Jobseekers and Employers.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Jobseeker Flow](#jobseeker-flow)
- [Employer Flow](#employer-flow)
- [Guest Mode Flow](#guest-mode-flow)
- [Video Message Flow](#video-message-flow)
- [Chat Flow](#chat-flow)
- [Payment Flow](#payment-flow)
- [Navigation Structure](#navigation-structure)

## 🏗️ Architecture Overview

### Navigation Hierarchy

```
RootNavigator
├── Onboarding (first launch)
├── Auth Screens (modals)
│   ├── PhoneInput
│   ├── SMSVerification
│   ├── Registration
│   ├── Login
│   └── WelcomeBack
└── Main App
    ├── JobSeekerNavigator (soискатель)
    │   └── Tabs
    │       ├── Feed (TikTok-style vacancy feed)
    │       ├── Search (search & filters)
    │       ├── Applications (my applications)
    │       ├── Notifications
    │       └── Settings
    └── EmployerNavigator (работодатель)
        └── Tabs
            ├── Vacancies (my vacancies)
            ├── Candidates (applications)
            ├── Analytics (stats & reports)
            ├── Notifications
            └── Settings
```

### User Roles

1. **Guest** - Неавторизованный пользователь (20 видео лимит)
2. **Jobseeker** - Соискатель (ищет работу)
3. **Employer** - Работодатель (размещает вакансии)

## 👤 Jobseeker Flow

### 1. First Launch (Guest Mode)

```
Launch App
    ↓
Splash Screen (3s)
    ↓
Onboarding (3 screens)
    ↓
Feed Screen (Guest Mode)
    - Swipe vacancies (TikTok-style)
    - Can view 20 videos
    - After 20 videos → Registration Required Modal
```

**Guest Mode Features:**
- ✅ View vacancy feed (20 videos)
- ✅ Watch company videos
- ✅ See vacancy details (salary, benefits, location)
- ❌ Cannot apply to vacancies
- ❌ Cannot send video responses
- ❌ Cannot access applications/chat

**Guest → Registered Flow:**

```
After 20 Videos
    ↓
"Registration Required" Modal
    ↓
[Skip] → Back to Feed (can continue viewing, but no apply)
[Register] → Phone Input Screen
    ↓
Enter Phone Number
    ↓
SMS Verification (6-digit code)
    ↓
Registration Form
    - Name
    - Profession
    - City
    - Experience
    - Salary expectations
    ↓
Registration Complete
    ↓
Welcome Screen
    ↓
Feed Screen (Full Access)
```

### 2. Browsing Vacancies

**Feed Screen (TikTok-style):**

```
Vertical Swipe Feed
    ↑↓ Swipe up/down to browse vacancies

Each Vacancy Card Shows:
├── Company Video (autoplay)
├── Company Name + Verified Badge
├── Vacancy Title
├── Salary Range
├── City
├── Benefits (badges)
└── Action Buttons
    ├── Like (favorite)
    ├── Share
    ├── Apply (main CTA)
    └── More Info
```

**Interaction Flow:**

```
Swipe Vacancy
    ↓
Watch Video (10-60 sec)
    ↓
Like? → [♥] → Add to Favorites
    ↓
Want Details? → [i] → Vacancy Detail Screen
    ↓
Apply? → [Apply] → Application Flow
```

### 3. Application Flow

```
[Apply Button]
    ↓
Check if Resume Exists?
    ├── NO → Create Resume Flow
    │           ↓
    │       Fill Resume Form
    │       Record Video Resume (60s max)
    │           ↓
    │       Review & Submit
    │           ↓
    │       Resume Created
    └── YES → Continue
            ↓
Application Screen
    - Select Resume (if multiple)
    - Add Cover Message (text, optional)
    - Record Video Message (60s max, optional)
        ↓
    [Send Application]
        ↓
    Application Sent ✅
        ↓
    Push Notification to Employer
        ↓
    Redirect to Applications Tab
```

**Video Recording Flow:**

```
[Record Video] Button
    ↓
Request Camera/Microphone Permissions
    ↓
Video Record Screen
    - Camera preview
    - 60 second timer
    - [Cancel] [Record] buttons
    ↓
Recording...
    - Timer counting down
    - [Stop] button
    ↓
Video Preview Screen
    - Play video
    - [Retake] [Use Video] buttons
    ↓
[Use Video] → Video attached to application
```

### 4. Managing Applications

**Applications Screen:**

```
My Applications List
    ↓
Filter by Status:
├── All
├── Pending (⏳)
├── Viewed (👁️)
├── Interview (📅)
├── Hired (✅)
└── Rejected (❌)

Each Application Card:
├── Company Name
├── Vacancy Title
├── Status Badge
├── Applied Date
├── Last Message Preview
├── Unread Count Badge
└── [Telegram] [WhatsApp] Buttons (if enabled)
```

**Application Detail:**

```
Tap Application Card
    ↓
Chat Screen
    ├── Messages (text + video)
    ├── Video Messages (2-view limit)
    │   └── "Employer watched: 1/2 views left"
    ├── Status Changes
    │   └── "Status changed to Interview!"
    └── Send Message
        ├── Text
        └── Video (if jobseeker)
```

### 5. Messenger Integration

```
Application Card → [Telegram Button]
    ↓
Open Telegram
    - Direct link to employer's Telegram
    - Contact employer outside app
```

```
Application Card → [WhatsApp Button]
    ↓
Open WhatsApp
    - Direct link to employer's WhatsApp
    - Contact employer outside app
```

### 6. Jobseeker Tab Navigation

**Feed Tab:**
- Swipe vacancy feed
- Like/favorite vacancies
- Apply to vacancies

**Search Tab:**
- Search by keywords
- Filter by: city, salary, benefits, experience
- Sort by: newest, salary, distance

**Applications Tab:**
- View all applications
- Filter by status
- Quick access to chat
- Messenger buttons

**Notifications Tab:**
- New messages
- Status changes
- Video viewed
- Interview invitations

**Settings Tab:**
- Profile editing
- Resume management
- Notification settings
- Logout

## 🏢 Employer Flow

### 1. Registration & Onboarding

```
Launch App (First Time)
    ↓
Splash Screen
    ↓
Onboarding
    ↓
Phone Input (Registration)
    ↓
SMS Verification
    ↓
Registration Form (Employer)
    - Company Name
    - INN (Tax ID)
    - Contact Person
    - Phone
    - Email
    - City
    ↓
Registration Complete
    ↓
Employer Home Screen
```

### 2. Creating a Vacancy

```
Vacancies Tab → [+ Create Vacancy]
    ↓
Create Vacancy Form
    ├── Basic Info
    │   ├── Title
    │   ├── Description
    │   ├── Requirements
    │   ├── Responsibilities
    │   └── Employment Type
    ├── Compensation
    │   ├── Salary From
    │   ├── Salary To
    │   └── Currency
    ├── Location
    │   ├── City
    │   ├── Address (optional)
    │   └── Remote/Office/Hybrid
    ├── Benefits
    │   └── Select benefits (checkboxes)
    └── Company Video
        ├── [Record New Video]
        └── [Select from Gallery]
            ↓
Video Record Screen
    - Record company pitch (10-60s)
    - Preview & confirm
        ↓
Review Vacancy
    ↓
[Publish] → Payment Screen
    ├── Free Plan (3 days)
    ├── Premium (30 days)
    └── VIP (90 days + top position)
        ↓
Select Plan → Payment
    ├── Tinkoff
    └── Alfabank
        ↓
Payment Success
    ↓
Vacancy Published ✅
    ↓
Appears in Jobseeker Feed
```

### 3. Managing Applications

**Candidates Screen:**

```
Applications List
    ↓
Filter by Status:
├── All
├── New (unread)
├── Viewed
├── Interview
├── Hired
└── Rejected

Each Application Card:
├── Jobseeker Name
├── Profession
├── Resume Title
├── Video Resume Thumbnail
├── Applied Date
├── Status Badge
└── Unread Messages Count
```

**Application Actions:**

```
Tap Application
    ↓
Application Detail
    ├── Jobseeker Info
    │   ├── Name
    │   ├── Phone
    │   ├── City
    │   ├── Experience
    │   └── Salary expectations
    ├── Resume Text
    ├── Video Resume (2-view limit)
    │   └── "Views: 2/2 left"
    └── Actions
        ├── [Watch Video] (if not watched)
        ├── [Open Chat]
        ├── [Change Status]
        │   ├── Viewed
        │   ├── Interview
        │   ├── Hired
        │   └── Rejected
        └── [Schedule Interview]
```

### 4. Chat with Jobseeker

```
Open Chat
    ↓
Chat Screen
    ├── Messages (text + video)
    ├── Video Messages (2-view limit)
    │   └── Jobseeker's video
    │       - Can watch 2 times
    │       - Auto-delete after 2 views
    │       - Push notification to jobseeker
    ├── Send Text Messages
    └── Status Change Notifications
        └── "You changed status to Interview"
```

### 5. Analytics Dashboard

**Analytics Tab:**

```
Dashboard Overview
    ├── Active Vacancies Count
    ├── Total Applications
    ├── New Applications (today)
    ├── Video Views
    └── Conversion Rate

Charts & Graphs:
├── Applications by Status (pie chart)
├── Applications Timeline (line chart)
├── Top Performing Vacancies
└── Average Response Time

Detailed Analytics:
├── Per Vacancy Stats
│   ├── Views
│   ├── Applications
│   ├── Conversion Rate
│   └── Average Time to Apply
└── Candidate Analytics
    ├── Most viewed resumes
    ├── Video completion rate
    └── Response rate
```

### 6. Employer Tab Navigation

**Vacancies Tab:**
- List of all vacancies
- Create new vacancy
- Edit/pause/delete vacancies
- View vacancy stats

**Candidates Tab:**
- All applications
- Filter by status
- Quick actions (status change)
- Open chat

**Analytics Tab:**
- Dashboard overview
- Charts & graphs
- Detailed vacancy analytics
- Export reports

**Notifications Tab:**
- New applications
- New messages
- Payment reminders
- Vacancy expiration

**Settings Tab:**
- Company profile
- Telegram/WhatsApp integration
- Payment methods
- Notification settings
- Logout

## 🎥 Video Message Flow (Architecture v3)

### For Jobseeker (Sender):

```
Application Chat
    ↓
[Attach Video] Button
    ↓
Video Record Screen
    - Record video message (max 60s)
    - Timer countdown
    ↓
Video Preview
    - [Retake] [Send]
    ↓
[Send] → Video Uploaded
    ↓
Video Message in Chat
    - Thumbnail with play button
    - "Sent" status
    - Duration shown
    ↓
Employer Watches Video (view #1)
    ↓
Push Notification to Jobseeker
    - "Employer watched your video"
    - "1 view remaining"
    ↓
Employer Watches Again (view #2)
    ↓
Push Notification to Jobseeker
    - "Employer watched your video again"
    - "0 views remaining"
    ↓
Video Auto-Deleted
    - Replaced with "Video deleted after 2 views"
```

### For Employer (Viewer):

```
Chat with Jobseeker
    ↓
Receive Video Message
    ↓
Push Notification
    - "New video message from [Name]"
    ↓
Video Message in Chat
    - Thumbnail
    - "2 views available"
    - [Play] button
    ↓
[Play] → Video Player
    - Full screen playback
    - Cannot skip forward/backward
    - Play/pause only
    ↓
Video Watched (view #1)
    - Update: "1 view remaining"
    - Push to jobseeker
    ↓
Watch Again? → [Play]
    ↓
Video Watched (view #2)
    - Update: "0 views remaining"
    - Video auto-deleted
    - Push to jobseeker
    ↓
Video Deleted
    - Replaced with message:
      "This video was deleted after 2 views"
```

## 💬 Chat Flow

### Text Messages:

```
Chat Screen
    ↓
Type Message
    ↓
[Send] Button
    ↓
Message Sent
    ↓
WebSocket Real-time Delivery
    ↓
Push Notification to Recipient
    ↓
Recipient Sees Message
    ↓
[Mark as Read]
    ↓
"Read" Status Updated
```

### Status Changes:

```
Employer Changes Application Status
    ↓
Status Updated in Database
    ↓
System Message in Chat
    - "Status changed to Interview"
    ↓
Push Notification to Jobseeker
    - "Your application status changed!"
    ↓
Jobseeker Opens Chat
    - Sees status change message
```

## 💰 Payment Flow

### For Employers (Vacancy Publishing):

```
Create Vacancy → [Publish]
    ↓
Select Plan
    ├── Free (3 days)
    ├── Premium (30 days, 999₽)
    └── VIP (90 days, 2999₽ + top position)
    ↓
[Pay] → Payment Method
    ├── Tinkoff
    └── Alfabank
    ↓
Redirect to Payment Gateway
    ↓
Enter Card Details
    ↓
Payment Processing...
    ↓
Success → Redirect Back to App
    ↓
Vacancy Published ✅
    ↓
Receipt sent via SMS/Email
```

### Wallet & Top-Up:

```
Wallet Screen
    - Current Balance
    - Transaction History
    ↓
[Top Up] Button
    ↓
Enter Amount (500₽ - 50000₽)
    ↓
Select Payment Method
    ├── Tinkoff
    └── Alfabank
    ↓
Payment Success
    ↓
Balance Updated
    ↓
Can use for vacancy publishing
```

## 🔔 Push Notifications

### Jobseeker Notifications:

1. **New Message**
   - "New message from [Company]"
   - Opens chat

2. **Status Change**
   - "Your application status changed to Interview!"
   - Opens application

3. **Video Viewed**
   - "Employer watched your video (1 view left)"
   - Opens chat

4. **Interview Invite**
   - "You're invited to interview at [Company]"
   - Opens chat with date/time

### Employer Notifications:

1. **New Application**
   - "New application from [Name] for [Vacancy]"
   - Opens application detail

2. **New Message**
   - "New message from [Name]"
   - Opens chat

3. **Payment Reminder**
   - "Your vacancy expires in 3 days"
   - Opens vacancy list

4. **Vacancy Expired**
   - "Your vacancy '[Title]' has expired"
   - Opens vacancy list

## 📊 Summary

### Jobseeker Journey:
1. **Discovery** → Feed (TikTok-style)
2. **Application** → Video resume + text
3. **Communication** → Chat with employer
4. **Status Tracking** → Applications screen
5. **Interview** → Via app or messengers

### Employer Journey:
1. **Vacancy Creation** → Record video + details
2. **Publishing** → Payment
3. **Application Review** → Watch videos (2x limit)
4. **Communication** → Chat with candidates
5. **Hiring Decision** → Status changes
6. **Analytics** → Track performance

### Key Features:
- ✅ TikTok-style vacancy browsing
- ✅ Video messages with 2-view limit
- ✅ Real-time chat (WebSocket)
- ✅ Push notifications (OneSignal)
- ✅ Messenger integration (Telegram/WhatsApp)
- ✅ Payment integration (Tinkoff/Alfabank)
- ✅ Analytics dashboard
- ✅ Guest mode (20 videos)
