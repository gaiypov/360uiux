# 360° РАБОТА - Phase 2 Implementation Status & Plan

## Current Status Summary

### ✅ Already Implemented

#### Backend API:
1. **Vacancy Interactions** (COMPLETE)
   - ✅ POST `/api/v1/vacancies/:id/like` - Like vacancy
   - ✅ DELETE `/api/v1/vacancies/:id/like` - Unlike vacancy
   - ✅ POST `/api/v1/vacancies/:id/favorite` - Favorite vacancy
   - ✅ DELETE `/api/v1/vacancies/:id/favorite` - Unfavorite vacancy
   - ✅ POST `/api/v1/vacancies/:id/comments` - Add comment
   - ✅ GET `/api/v1/vacancies/:id/comments` - Get comments
   - ✅ GET `/api/v1/favorites` - Get user favorites with pagination

2. **Admin Dashboard** (COMPLETE)
   - ✅ Complaints management (list, resolve, reject)
   - ✅ Moderation (list, approve, reject)
   - ✅ Analytics with charts
   - ✅ Video 2-view limit tracking
   - ✅ NotificationService integration
   - ✅ Database migrations (001, 002, 003)

#### Frontend (React Native):
1. **Screens Created**:
   - ✅ SearchScreen (with FilterModal)
   - ✅ FavoritesScreen
   - ✅ ApplicationsScreen (jobseeker & employer)
   - ✅ ProfileScreen
   - ✅ NotificationsScreen
   - ✅ SettingsScreen
   - ✅ ChatScreen
   - ✅ VacancyFeedScreen
   - ✅ VacancyDetailScreen

### ❌ Not Implemented (Phase 2 Gaps)

#### Backend APIs - Missing:
1. **Vacancy CRUD Operations**:
   - ❌ POST `/api/v1/vacancies` - Create vacancy
   - ❌ GET `/api/v1/vacancies` - List vacancies with search/filters
   - ❌ GET `/api/v1/vacancies/:id` - Get vacancy by ID
   - ❌ PUT `/api/v1/vacancies/:id` - Update vacancy
   - ❌ DELETE `/api/v1/vacancies/:id` - Delete vacancy

2. **Search & Filters**:
   - ❌ GET `/api/v1/vacancies/search` - Advanced search with:
     * Query text (title, profession, company)
     * Cities filter
     * Experience filter
     * Employment type filter
     * Schedule filter
     * Salary range (min/max)
   - ❌ GET `/api/v1/vacancies/filters` - Get available filter options

3. **User Profile**:
   - ❌ GET `/api/v1/profile` - Get current user profile
   - ❌ PUT `/api/v1/profile` - Update profile
   - ❌ POST `/api/v1/profile/avatar` - Upload avatar

4. **Applications History**:
   - ❌ GET `/api/v1/applications` - Get user applications with status
   - ❌ GET `/api/v1/applications/:id` - Get application details

#### Frontend - Integration Needed:
1. **SearchScreen**:
   - ❌ Connect to real search API
   - ❌ Implement real-time search results
   - ❌ Connect filters to backend

2. **FavoritesScreen**:
   - ✅ API exists but needs frontend integration
   - ❌ Remove from mock data

3. **ApplicationsScreen**:
   - ❌ Connect to applications API
   - ❌ Show real application status

4. **ProfileScreen**:
   - ❌ Connect to profile API
   - ❌ Implement profile editing

5. **Push Notifications**:
   - ❌ Integrate with NotificationService
   - ❌ Set up FCM/APNs
   - ❌ Handle notification permissions

---

## Phase 2 Implementation Plan

### Priority 1: Core Vacancy Operations

#### Task 1.1: Vacancy Controller
Create `/backend/src/controllers/VacancyController.ts`:

```typescript
class VacancyController {
  // Create vacancy with video
  static async createVacancy(req, res)

  // Get vacancies with pagination, search, filters
  static async getVacancies(req, res)

  // Get single vacancy by ID
  static async getVacancy(req, res)

  // Update vacancy
  static async updateVacancy(req, res)

  // Delete vacancy
  static async deleteVacancy(req, res)

  // Get available filter options
  static async getFilterOptions(req, res)
}
```

**Features:**
- Full-text search on title, profession, company
- Multi-select filters (cities, experience, employment, schedule)
- Salary range filtering
- Pagination (limit, offset)
- Sorting (newest, salary_high, salary_low, most_views)
- Include employer data and video URLs
- Check moderation status (only approved for jobseekers)

#### Task 1.2: Update Vacancy Routes
Update `/backend/src/routes/vacancy.routes.ts`:
- Replace "Coming soon" placeholders with VacancyController methods
- Add search endpoint: `GET /api/v1/vacancies/search`
- Add filters endpoint: `GET /api/v1/vacancies/filters`

### Priority 2: User Profile

#### Task 2.1: User Controller
Create `/backend/src/controllers/UserController.ts`:

```typescript
class UserController {
  // Get current user profile
  static async getProfile(req, res)

  // Update profile
  static async updateProfile(req, res)

  // Upload avatar
  static async uploadAvatar(req, res)

  // Delete account
  static async deleteAccount(req, res)
}
```

#### Task 2.2: User Routes
Update `/backend/src/routes/user.routes.ts`:
- Add profile endpoints
- Add avatar upload with multer middleware

### Priority 3: Applications History

#### Task 3.1: Application Controller Enhancement
Update `/backend/src/controllers/ApplicationController.ts`:

```typescript
// Already exists, add:
static async getUserApplications(req, res) {
  // Get jobseeker's applications with:
  // - Vacancy details
  // - Status (pending, viewed, rejected, accepted)
  // - Timestamps
  // - Employer info
  // - Video view count
}

static async getApplicationDetails(req, res) {
  // Get full application info including:
  // - Cover letter
  // - Resume video
  // - Status history
  // - Messages from employer
}
```

### Priority 4: Push Notifications

#### Task 4.1: Notification Setup
1. Add Firebase Cloud Messaging credentials
2. Add APNs certificates
3. Create device registration endpoints:
   - `POST /api/v1/devices/register` - Register FCM/APNs token
   - `DELETE /api/v1/devices/unregister` - Remove token

#### Task 4.2: Notification Events
Integrate NotificationService for:
- New application received (to employer)
- Application status changed (to jobseeker)
- Vacancy approved/rejected (to employer)
- Video viewed (to jobseeker)
- New message in chat
- Favorite vacancy updated

### Priority 5: Frontend Integration

#### Task 5.1: API Service
Create `/src/services/api.ts` with methods:
```typescript
class API {
  // Vacancies
  searchVacancies(query, filters, pagination)
  getVacancy(id)
  createVacancy(data)

  // Favorites (already connected)
  getFavorites(pagination)
  addFavorite(vacancyId)
  removeFavorite(vacancyId)

  // Profile
  getProfile()
  updateProfile(data)
  uploadAvatar(file)

  // Applications
  getApplications(pagination)
  getApplication(id)

  // Notifications
  registerDevice(token)
  getNotifications(pagination)
}
```

#### Task 5.2: Update Screens
1. **SearchScreen**: Connect to `searchVacancies` API
2. **FavoritesScreen**: Connect to `getFavorites` API (already exists)
3. **ApplicationsScreen**: Connect to `getApplications` API
4. **ProfileScreen**: Connect to profile APIs
5. **NotificationsScreen**: Connect to notifications API

#### Task 5.3: Push Notifications
1. Set up react-native-firebase
2. Request permissions on app start
3. Register device token
4. Handle notification events
5. Display in-app notifications

---

## Implementation Order

### Week 1: Backend Core
- Day 1-2: VacancyController (CRUD + search)
- Day 3: UserController (profile management)
- Day 4: ApplicationController enhancements
- Day 5: Testing & documentation

### Week 2: Notifications & Integration
- Day 1-2: NotificationService setup (FCM/APNs)
- Day 3: Device registration endpoints
- Day 4: Notification events integration
- Day 5: Testing push notifications

### Week 3: Frontend Integration
- Day 1-2: API service layer
- Day 3: Update all screens with real APIs
- Day 4: Push notification handling
- Day 5: End-to-end testing

---

## Database Schema Requirements

### Already Created (from migrations):
- ✅ users
- ✅ vacancies
- ✅ applications
- ✅ favorites
- ✅ vacancy_likes
- ✅ vacancy_comments
- ✅ video_views
- ✅ complaints
- ✅ admins
- ✅ admin_actions

### Need to Add:
- ❌ user_devices (for push tokens)
- ❌ user_notification_preferences
- ❌ notification_logs
- ❌ application_status_history

---

## Testing Checklist

### Backend API Tests:
- [ ] Vacancy CRUD operations
- [ ] Search with various filters
- [ ] Pagination works correctly
- [ ] User profile CRUD
- [ ] Applications history with filtering
- [ ] Push notification delivery
- [ ] Device registration/unregistration

### Frontend Integration Tests:
- [ ] Search returns real results
- [ ] Filters work and update results
- [ ] Favorites sync with backend
- [ ] Profile editing persists
- [ ] Applications show correct status
- [ ] Push notifications received and displayed
- [ ] Offline handling (cached data)

### E2E Scenarios:
- [ ] Jobseeker searches and finds job
- [ ] Jobseeker adds to favorites
- [ ] Jobseeker applies to vacancy
- [ ] Employer receives notification
- [ ] Employer views application
- [ ] Jobseeker gets notification about view
- [ ] Video 2-view limit enforced

---

## Next Immediate Steps

1. **Start with VacancyController** - Most critical for Phase 2
2. **Implement search/filters** - Core feature
3. **Connect SearchScreen** - Show immediate value
4. **Add profile management** - Complete user experience
5. **Set up push notifications** - Engagement feature

Would you like me to start implementing any specific part?
