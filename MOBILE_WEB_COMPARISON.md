# Mobile App vs Web Frontend - Feature Comparison & Implementation Guide

## Executive Summary

This document outlines all features present in the **Web Frontend** that need to be implemented or updated in the **Mobile App** to achieve feature parity.

---

## 🎯 Core Architecture Differences

### Web Frontend
- **Mode Selection System**: Users choose between "Company" and "Personal" modes
- **Role-based Navigation**: Different layouts and features based on user role (admin, hr, user, trainee, personal)
- **Multiple Context Providers**: AuthContext, ModeContext, ThemeContext, AssistantContext

### Mobile App (Current)
- **Single Mode**: No mode selection - assumes single mode
- **Basic Tab Navigation**: Tasks, Chat, Calendar, Inbox, Profile
- **Limited Context**: Only AuthContext implemented

---

## 📋 Feature Comparison Matrix

| Feature Category | Web Frontend | Mobile App | Status | Priority |
|-----------------|--------------|------------|--------|----------|
| **Authentication** | ✅ Login, Signup | ✅ Login, Signup | ✅ Complete | - |
| **Mode Selection** | ✅ ChooseMode page | ❌ Missing | 🔴 Critical | P0 |
| **Personal Dashboard** | ✅ Full dashboard with stats | ❌ Missing | 🔴 Critical | P0 |
| **Personal Tasks** | ✅ Full CRUD with filters | ⚠️ Basic list only | 🟡 Partial | P0 |
| **Personal Calendar** | ✅ Full calendar with events | ❌ Placeholder | 🔴 Critical | P0 |
| **Personal Planner** | ✅ Day planner with blocks | ❌ Missing | 🔴 Critical | P0 |
| **Personal Inbox (Gmail)** | ✅ Full Gmail integration | ❌ Placeholder | 🔴 Critical | P1 |
| **Personal Reports** | ✅ Reports page | ❌ Missing | 🟡 Medium | P2 |
| **Personal Assistant** | ✅ Assistant page | ❌ Missing | 🟡 Medium | P2 |
| **Admin Dashboard** | ✅ Full admin dashboard | ❌ Missing | 🔴 Critical | P0 |
| **Admin Tasks** | ✅ Task management | ❌ Missing | 🔴 Critical | P0 |
| **Admin Users** | ✅ User management | ❌ Missing | 🔴 Critical | P0 |
| **Admin Reports** | ✅ Reports | ❌ Missing | 🟡 Medium | P2 |
| **HR Dashboard** | ✅ HR dashboard | ❌ Missing | 🔴 Critical | P0 |
| **HR Applicants** | ✅ Applicant management | ❌ Missing | 🔴 Critical | P0 |
| **HR Inbox (Gmail)** | ✅ HR Gmail integration | ❌ Missing | 🔴 Critical | P1 |
| **HR Trainees** | ✅ Trainee management | ❌ Missing | 🔴 Critical | P0 |
| **User Dashboard** | ✅ User dashboard | ❌ Missing | 🟡 Medium | P1 |
| **Trainee Dashboard** | ✅ Trainee dashboard | ❌ Missing | 🟡 Medium | P1 |
| **Trainee Tasks** | ✅ Trainee tasks | ❌ Missing | 🟡 Medium | P1 |
| **Chat** | ✅ Full chat system | ✅ Implemented | ✅ Complete | - |
| **Profile** | ✅ Profile page | ⚠️ Basic profile | 🟡 Partial | P1 |
| **Settings** | ✅ Settings page | ❌ Missing | 🟡 Medium | P1 |
| **Assistant (Global)** | ✅ Assistant drawer | ❌ Missing | 🟡 Medium | P2 |

---

## 🔴 CRITICAL FEATURES TO IMPLEMENT (P0)

### 1. Mode Selection System

**Web Implementation**: `src/pages/Landing/ChooseMode.jsx`

**What to Add:**
- Create a mode selection screen (similar to ChooseMode.jsx)
- Implement ModeContext for mobile app
- Store selected mode in AsyncStorage
- Redirect to appropriate screens based on mode

**Files to Create:**
- `app/(onboarding)/choose-mode.tsx`
- `src/context/ModeContext.tsx`

**API Endpoints**: None (client-side only)

---

### 2. Personal Dashboard

**Web Implementation**: `src/pages/Personal/PersonalDashboard.jsx`

**Features:**
- Statistics cards (Total Tasks, Completed, Pending, Today's Tasks)
- Donut chart (task distribution by status)
- Bar chart (priority distribution)
- Recent tasks table
- Chat button integration

**What to Add:**
- Create `app/(app)/(tabs)/personal/dashboard.tsx`
- Implement stat cards component
- Add chart components (use `react-native-chart-kit` or `victory-native`)
- Fetch from `/api/personal/tasks` endpoint

**API Endpoints:**
- `GET /api/personal/tasks` (already exists)

**Dependencies to Add:**
```json
{
  "react-native-chart-kit": "^6.12.0",
  "victory-native": "^36.9.0"
}
```

---

### 3. Personal Tasks (Enhanced)

**Web Implementation**: `src/pages/Personal/PersonalTasks.jsx`

**Current Mobile**: Basic task list only

**What to Add:**
- Search functionality
- Status filter (all, pending, in-progress, completed)
- Priority filter (all, low, medium, high)
- Sort options (newest, oldest, priority, due date)
- Create task modal/form
- Edit task functionality
- Delete task functionality
- Task detail view with full information

**Files to Update:**
- `app/(app)/(tabs)/tasks/index.tsx` - Add filters and search
- `app/(app)/(tabs)/tasks/[id].tsx` - Enhance detail view
- Create `src/components/personal/NewTaskModal.tsx`
- Create `src/components/personal/TaskModal.tsx`

**API Endpoints:**
- `GET /api/personal/tasks` (with query params)
- `POST /api/personal/tasks`
- `PATCH /api/personal/tasks/:id`
- `DELETE /api/personal/tasks/:id`

---

### 4. Personal Calendar

**Web Implementation**: `src/pages/Personal/PersonalCalendar.jsx`

**Current Mobile**: Placeholder only

**Features:**
- Month/Week/Day view toggle
- Event creation
- Event editing
- Event deletion
- Recurring events support
- Reminders
- Agenda panel

**What to Add:**
- Create `app/(app)/(tabs)/calendar/index.tsx`
- Implement calendar component (use `react-native-calendars`)
- Event modal for create/edit
- Agenda view component
- Integration with reminder service

**Files to Create:**
- `app/(app)/(tabs)/calendar/index.tsx`
- `src/components/personal/calendar/CalendarView.tsx`
- `src/components/personal/calendar/EventModal.tsx`
- `src/components/personal/calendar/AgendaPanel.tsx`
- `src/hooks/useCalendarEvents.ts`

**API Endpoints:**
- `GET /api/personal/calendar?from=DATE&to=DATE`
- `POST /api/personal/calendar`
- `GET /api/personal/calendar/:id`
- `PATCH /api/personal/calendar/:id`
- `DELETE /api/personal/calendar/:id`

**Dependencies to Add:**
```json
{
  "react-native-calendars": "^1.1301.0",
  "moment": "^2.30.1"
}
```

---

### 5. Personal Planner

**Web Implementation**: `src/pages/Personal/PersonalPlanner.jsx`

**Features:**
- Daily planner with time blocks
- Drag-and-drop time blocks
- Link tasks to time blocks
- Summary panel
- Date navigation
- Auto-save functionality

**What to Add:**
- Create `app/(app)/(tabs)/planner/index.tsx`
- Implement timeline component
- Time block creation/editing modal
- Task linking functionality
- Summary component

**Files to Create:**
- `app/(app)/(tabs)/planner/index.tsx`
- `src/components/personal/planner/PlannerTimeline.tsx`
- `src/components/personal/planner/PlannerBlockModal.tsx`
- `src/components/personal/planner/PlannerSummary.tsx`

**API Endpoints:**
- `GET /api/personal/planner?date=YYYY-MM-DD`
- `PUT /api/personal/planner?date=YYYY-MM-DD`
- `PATCH /api/personal/planner/block/:blockId`

**Dependencies to Add:**
```json
{
  "react-native-gesture-handler": "^2.28.0" // Already installed
}
```

---

### 6. Personal Inbox (Gmail Integration)

**Web Implementation**: `src/pages/Personal/PersonalInbox.jsx`

**Current Mobile**: Placeholder only

**Features:**
- Gmail connection/disconnection
- Email list with pagination
- Email details view
- Search functionality
- Category filter (all, primary, social, promotions, updates, forums)
- Importance filter
- Date range filter
- Email sync
- Mark as read/unread
- Delete email
- Email summarization

**What to Add:**
- Create `app/(app)/(tabs)/inbox/index.tsx`
- Gmail OAuth connection flow
- Email list component
- Email detail component
- Filters component
- Sync functionality

**Files to Create:**
- `app/(app)/(tabs)/inbox/index.tsx`
- `app/(app)/(tabs)/inbox/[id].tsx`
- `src/components/personal/inbox/EmailList.tsx`
- `src/components/personal/inbox/EmailDetails.tsx`
- `src/components/personal/inbox/InboxFilters.tsx`

**API Endpoints:**
- `GET /api/personal/gmail/status`
- `POST /api/personal/gmail/connect`
- `POST /api/personal/gmail/disconnect`
- `POST /api/personal/emails/sync`
- `GET /api/personal/emails` (with query params)
- `GET /api/personal/emails/:id`
- `POST /api/personal/emails/:id/mark-read`
- `DELETE /api/personal/emails/:id`
- `POST /api/personal/emails/:id/summarize`

**Dependencies to Add:**
```json
{
  "expo-web-browser": "^15.0.10" // Already installed
}
```

---

### 7. Admin Dashboard

**Web Implementation**: `src/pages/Admin/Dashboard.jsx`

**Features:**
- Task statistics (pending, in-progress, completed)
- Priority distribution charts
- Recent tasks table
- User management link
- Task management link

**What to Add:**
- Create `app/(app)/admin/dashboard.tsx`
- Role-based navigation guard
- Admin-specific layout
- Statistics components

**Files to Create:**
- `app/(app)/admin/_layout.tsx`
- `app/(app)/admin/dashboard.tsx`
- `src/components/admin/AdminLayout.tsx`

**API Endpoints:**
- `GET /api/tasks/stats`

---

### 8. Admin Tasks Management

**Web Implementation**: `src/pages/Admin/ManagerTasks.jsx`, `CreateTask.jsx`

**Features:**
- View all tasks
- Create tasks
- Assign tasks to users
- Edit tasks
- Delete tasks
- Task filters
- PDF import
- Auto-distribute tasks

**What to Add:**
- Create `app/(app)/admin/tasks/index.tsx`
- Create `app/(app)/admin/tasks/create.tsx`
- Task creation form
- User selection modal
- PDF import functionality

**Files to Create:**
- `app/(app)/admin/tasks/index.tsx`
- `app/(app)/admin/tasks/create.tsx`
- `src/components/admin/CreateTaskModal.tsx`
- `src/components/admin/UserSelectModal.tsx`

**API Endpoints:**
- `GET /api/tasks/admin`
- `POST /api/tasks`
- `POST /api/tasks/import/pdf`
- `POST /api/tasks/auto-distribute`

---

### 9. Admin User Management

**Web Implementation**: `src/pages/Admin/ManageUsers.jsx`

**Features:**
- List all users
- Create users
- Edit user roles
- View user stats
- Delete users

**What to Add:**
- Create `app/(app)/admin/users/index.tsx`
- User list component
- User creation form
- Role update functionality

**Files to Create:**
- `app/(app)/admin/users/index.tsx`
- `src/components/admin/UserList.tsx`
- `src/components/admin/CreateUserModal.tsx`

**API Endpoints:**
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id/role`
- `GET /api/users/:id/stats`
- `DELETE /api/users/:id`

---

### 10. HR Dashboard

**Web Implementation**: `src/pages/HR/HrDashboard.jsx`

**Features:**
- Trainee statistics
- Trainee list with scores
- Trainee evaluation
- Promotion functionality
- Search and filters

**What to Add:**
- Create `app/(app)/hr/dashboard.tsx`
- HR-specific layout
- Trainee list component
- Evaluation modal

**Files to Create:**
- `app/(app)/hr/_layout.tsx`
- `app/(app)/hr/dashboard.tsx`
- `src/components/hr/HrLayout.tsx`
- `src/components/hr/TraineeList.tsx`
- `src/components/hr/EvaluationModal.tsx`

**API Endpoints:**
- `GET /api/hr/trainees/stats`
- `GET /api/hr/dashboard/trainees`
- `POST /api/hr/trainees/:id/evaluate`
- `POST /api/hr/trainees/:id/promote`

---

### 11. HR Applicants Management

**Web Implementation**: `src/pages/HR/Applicants.jsx`

**Features:**
- List applicants
- View applicant details
- View CV
- AI summary
- Convert to trainee
- Filters and search

**What to Add:**
- Create `app/(app)/hr/applicants/index.tsx`
- Applicant list component
- Applicant detail view
- CV viewer

**Files to Create:**
- `app/(app)/hr/applicants/index.tsx`
- `app/(app)/hr/applicants/[id].tsx`
- `src/components/hr/ApplicantList.tsx`
- `src/components/hr/ApplicantDetails.tsx`

**API Endpoints:**
- `GET /api/hr/applicants`
- `GET /api/hr/applicants/:id`
- `GET /api/hr/applicants/:id/cv`
- `GET /api/hr/applicants/:id/ai-summary`
- `POST /api/hr/trainees/from-applicant/:applicantId`

---

### 12. HR Inbox (Gmail)

**Web Implementation**: `src/pages/HR/Inbox.jsx`

**Features:**
- HR Gmail connection
- Email list
- Email details
- CV attachment detection
- AI summarization
- Filters

**What to Add:**
- Create `app/(app)/hr/inbox/index.tsx`
- Similar to Personal Inbox but for HR

**Files to Create:**
- `app/(app)/hr/inbox/index.tsx`
- `app/(app)/hr/inbox/[id].tsx`
- `src/components/hr/inbox/EmailList.tsx`
- `src/components/hr/inbox/EmailDetails.tsx`

**API Endpoints:**
- `GET /api/hr/gmail/status`
- `POST /api/hr/gmail/sync`
- `GET /api/hr/gmail/emails`
- `GET /api/hr/gmail/emails/:id`
- `POST /api/gmail/emails/:id/attach-cv`

---

### 13. HR Trainees Management

**Web Implementation**: `src/pages/HR/Trainees.jsx`

**Features:**
- List trainees
- View trainee details
- Generate tasks
- Task scoring
- Lifecycle management (pause, freeze, resume, cancel)

**What to Add:**
- Create `app/(app)/hr/trainees/index.tsx`
- Trainee detail view
- Task generation UI

**Files to Create:**
- `app/(app)/hr/trainees/index.tsx`
- `app/(app)/hr/trainees/[id].tsx`
- `src/components/hr/TraineeDetails.tsx`

**API Endpoints:**
- `GET /api/hr/trainees`
- `GET /api/hr/trainees/:id/tasks`
- `POST /api/hr/trainees/:id/generate-tasks`
- `POST /api/hr/trainees/:id/pause`
- `POST /api/hr/trainees/:id/freeze`
- `POST /api/hr/trainees/:id/resume`
- `POST /api/hr/trainees/:id/cancel`

---

## 🟡 MEDIUM PRIORITY FEATURES (P1-P2)

### 14. User Dashboard

**Web Implementation**: `src/pages/User/UserDashboard.jsx`

**What to Add:**
- Create `app/(app)/user/dashboard.tsx`
- Basic dashboard for regular users

---

### 15. Trainee Dashboard & Tasks

**Web Implementation**: `src/pages/Trainee/Dashboard.jsx`, `TraineeTasks.jsx`

**What to Add:**
- Create `app/(app)/trainee/dashboard.tsx`
- Create `app/(app)/trainee/tasks/index.tsx`
- Task submission functionality

**API Endpoints:**
- `GET /api/trainee/me/dashboard`
- `GET /api/trainee/me/tasks`
- `POST /api/trainee/tasks/:id/submit`

---

### 16. Profile Page (Enhanced)

**Web Implementation**: `src/pages/Profile.jsx`

**Current Mobile**: Basic profile only

**What to Add:**
- Avatar upload
- Profile editing
- Password change
- Theme settings
- Language settings

**API Endpoints:**
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/me/avatar`

---

### 17. Settings Page

**Web Implementation**: `src/pages/Settings.jsx`

**What to Add:**
- Create `app/(app)/settings.tsx`
- Theme toggle
- Language toggle
- Notification settings
- Privacy settings

---

### 18. Personal Reports

**Web Implementation**: `src/pages/Personal/PersonalReports.jsx`

**What to Add:**
- Create `app/(app)/(tabs)/personal/reports.tsx`
- Weekly/monthly progress reports
- Charts and analytics

---

### 19. Personal Assistant

**Web Implementation**: `src/pages/Personal/PersonalAssistant.jsx`

**What to Add:**
- Create `app/(app)/(tabs)/personal/assistant.tsx`
- AI assistant interface

**API Endpoints:**
- `POST /api/assistant/public`

---

### 20. Global Assistant

**Web Implementation**: `src/pages/AssistantPage.jsx`, `src/components/assistant/AssistantDrawer.jsx`

**What to Add:**
- Floating assistant button
- Assistant drawer/modal
- Context-aware suggestions

---

## 📱 Navigation Structure Updates

### Current Mobile Navigation
```
(app)
  └── (tabs)
      ├── tasks
      ├── chat
      ├── calendar (placeholder)
      ├── inbox (placeholder)
      └── profile
```

### Required Navigation Structure

```
(app)
  ├── (onboarding)
  │   └── choose-mode
  ├── (tabs)
  │   ├── personal
  │   │   ├── dashboard
  │   │   ├── tasks
  │   │   ├── planner
  │   │   ├── calendar
  │   │   ├── inbox
  │   │   ├── reports
  │   │   └── assistant
  │   ├── admin
  │   │   ├── dashboard
  │   │   ├── tasks
  │   │   ├── users
  │   │   └── reports
  │   ├── hr
  │   │   ├── dashboard
  │   │   ├── applicants
  │   │   ├── inbox
  │   │   └── trainees
  │   ├── user
  │   │   ├── dashboard
  │   │   └── my-tasks
  │   ├── trainee
  │   │   ├── dashboard
  │   │   └── tasks
  │   ├── chat
  │   └── profile
  └── settings
```

---

## 🔧 Context Providers to Add

### 1. ModeContext

**Web Implementation**: `src/context/ModeContext.jsx`

**What to Add:**
- Create `src/context/ModeContext.tsx`
- Store mode in AsyncStorage
- Provide mode state to app

### 2. ThemeContext

**Web Implementation**: `src/context/ThemeContext.jsx`

**What to Add:**
- Create `src/context/ThemeContext.tsx`
- Dark/light mode toggle
- Language toggle (EN/AR)

### 3. AssistantContext

**Web Implementation**: `src/context/AssistantContext.jsx`

**What to Add:**
- Create `src/context/AssistantContext.tsx`
- Manage assistant state

---

## 📦 Dependencies to Add

```json
{
  "react-native-chart-kit": "^6.12.0",
  "victory-native": "^36.9.0",
  "react-native-calendars": "^1.1301.0",
  "moment": "^2.30.1",
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

---

## 🔌 API Endpoints to Add to Mobile

Update `src/api/apiPaths.ts` with all endpoints from web frontend's `apiPaths.js`:

### Personal Endpoints
- Gmail integration endpoints
- Planner endpoints
- Calendar endpoints
- Reports endpoints

### Admin Endpoints
- Task management endpoints
- User management endpoints
- Reports endpoints

### HR Endpoints
- Applicant endpoints
- Trainee endpoints
- HR Gmail endpoints

### Trainee Endpoints
- Dashboard endpoints
- Task submission endpoints

---

## 🎨 UI/UX Considerations

### 1. Responsive Design
- Mobile-first approach
- Tablet support (if needed)
- Different layouts for different screen sizes

### 2. Navigation Patterns
- Bottom tabs for main navigation
- Stack navigation for detail views
- Modal navigation for forms

### 3. Component Library
- Reuse web components where possible
- Adapt for mobile (Touch interactions, gestures)
- Use React Native components (ScrollView, FlatList, etc.)

### 4. Theming
- Support dark/light mode
- Support Arabic/English languages
- Consistent color scheme

---

## 📝 Implementation Priority

### Phase 1 (Critical - P0)
1. Mode Selection System
2. Personal Dashboard
3. Personal Tasks (Enhanced)
4. Personal Calendar
5. Personal Planner
6. Personal Inbox (Gmail)
7. Admin Dashboard
8. Admin Tasks Management
9. Admin User Management
10. HR Dashboard
11. HR Applicants Management
12. HR Inbox (Gmail)
13. HR Trainees Management

### Phase 2 (Medium - P1)
14. User Dashboard
15. Trainee Dashboard & Tasks
16. Profile Page (Enhanced)
17. Settings Page

### Phase 3 (Low - P2)
18. Personal Reports
19. Personal Assistant
20. Global Assistant

---

## ✅ Testing Checklist

For each feature:
- [ ] API integration works
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Empty states handled
- [ ] Navigation works correctly
- [ ] Role-based access control
- [ ] Dark mode support
- [ ] Language support (EN/AR)
- [ ] Responsive design

---

## 📚 Reference Files

### Web Frontend Key Files
- `src/App.jsx` - Main routing
- `src/pages/Landing/ChooseMode.jsx` - Mode selection
- `src/pages/Personal/*` - Personal mode pages
- `src/pages/Admin/*` - Admin pages
- `src/pages/HR/*` - HR pages
- `src/context/*` - Context providers
- `src/utils/apiPaths.js` - API endpoints

### Mobile App Key Files (Current)
- `app/_layout.tsx` - Root layout
- `app/(app)/(tabs)/_layout.tsx` - Tab navigation
- `src/api/apiPaths.ts` - API endpoints (partial)
- `src/auth/AuthContext.tsx` - Auth context

---

## 🚀 Quick Start Guide

1. **Start with Mode Selection**
   - Create ChooseMode screen
   - Implement ModeContext
   - Update root navigation

2. **Implement Personal Features**
   - Dashboard
   - Tasks (enhanced)
   - Calendar
   - Planner
   - Inbox

3. **Implement Admin Features**
   - Dashboard
   - Tasks management
   - User management

4. **Implement HR Features**
   - Dashboard
   - Applicants
   - Inbox
   - Trainees

5. **Add Supporting Features**
   - Settings
   - Enhanced Profile
   - Reports
   - Assistant

---

## 📞 Notes

- All API endpoints are already available in the backend
- Web frontend uses React Router, mobile uses Expo Router
- Web uses Tailwind CSS, mobile uses StyleSheet
- Some features may need mobile-specific adaptations (e.g., file uploads, OAuth flows)
- Consider using React Native libraries for charts, calendars, etc.

---

**Last Updated**: 2024
**Status**: Initial Analysis Complete
