# Feature Mapping: Web Frontend → Mobile Implementation

**Date Created**: 2024
**Status**: Mapping phase complete - Ready for Auth + Tasks implementation

---

## 1. Overview

This document maps each Kira feature from the web frontend to its backend API contract. The mobile implementation will use these endpoints and data shapes WITHOUT copying web UI code.

## 2. Feature Mapping Table

| Feature | Web Page | Backend Endpoint | Data Model | Mobile Route | Priority |
|---------|----------|------------------|------------|--------------|----------|
| **Authentication** | Auth/LoginPage.jsx | POST /auth/login, /auth/signup, GET /auth/me | User object | /(auth)/login, /(auth)/signup | 1 - CRITICAL |
| **Personal Tasks** | Personal/PersonalTasks.jsx | GET /personal/tasks, POST /personal/tasks, PATCH /personal/tasks/{id}, DELETE /personal/tasks/{id} | Task object | /(app)/(tabs)/tasks | 2 - HIGH |
| **Personal Calendar** | Personal/PersonalCalendar.jsx | GET /personal/calendar?from=&to=, POST /personal/calendar, PATCH /personal/calendar/{id} | CalendarEvent object | /(app)/(tabs)/calendar | 3 - HIGH |
| **Personal Planner** | Personal/PersonalPlanner.jsx | GET /personal/planner?date=, PATCH /personal/planner/block/{id} | DayPlan object | /(app)/(tabs)/calendar | 3 - HIGH |
| **Personal Inbox** | Personal/PersonalInbox.jsx | GET /personal/emails, POST /personal/gmail/status, POST /personal/gmail/sync | PersonalEmail object | /(app)/(tabs)/inbox | 4 - MEDIUM |
| **Chat** | Chat/ChatPage.jsx | GET /chat/conversations, GET /chat/conversation/{userModel}/{userId}, POST /chat/send | Message object | /(app)/(tabs)/chat | 2 - HIGH |

---

## 3. Detailed Feature Specifications

### 3.1 Authentication

**Web Implementation**: Auth/LoginPage.jsx, Auth/SignupPage.jsx  
**Status**: ✅ ALREADY IMPLEMENTED IN MOBILE

#### Endpoints
```
POST   /auth/signup        - Register new user
POST   /auth/login         - Login (returns JWT token)
GET    /auth/me           - Get current user profile
```

#### Data Shape: User Object

```typescript
{
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: "user" | "hr" | "trainee" | "personal";
  workspaceMode: "company" | "personal";
  isActive: boolean;
  specialization?: "Frontend" | "Backend" | "AI" | "QA" | "DevOps" | "UI/UX" | "General";
  skills?: string[];
  createdAt: ISO8601 string;
}
```

#### Request/Response Examples

**Login Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { /* User object above */ }
}
```

#### Mobile Implementation Notes
- ✅ AuthContext.tsx manages auth state
- ✅ Token stored in expo-secure-store
- ✅ axiosInstance auto-attaches Bearer token
- ✅ 401 responses trigger re-authentication
- **Next**: Verify signup accepts all required fields, ensure avatar handling if needed

---

### 3.2 Personal Tasks

**Web Implementation**: Personal/PersonalTasks.jsx  
**Status**: ✅ PARTIALLY IMPLEMENTED - Needs refinement

#### Endpoints

```
GET    /personal/tasks                    - List tasks with filters (search, status, priority, sort)
POST   /personal/tasks                    - Create new task
GET    /personal/tasks/{id}               - Get single task details
PATCH  /personal/tasks/{id}               - Update task
DELETE /personal/tasks/{id}               - Delete task
```

#### Query Parameters

```
GET /personal/tasks?
  search=<string>              # Search in title/description
  status=<pending|in-progress|submitted|reviewed|completed>
  priority=<low|medium|high>
  sort=<newest|dueDate|priority>
  page=<number>               # Optional pagination
  limit=<number>              # Optional, default 20
```

#### Data Shape: Task Object

```typescript
{
  _id: string;
  title: string;                  // Required, non-empty
  description: string;            // Required, non-empty
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "submitted" | "reviewed" | "completed";
  dueDate?: Date | null;          // Optional, can be null
  checklist: [
    {
      text: string;               // Checklist item text
      done: boolean;              // Completion status
    }
  ];
  attachments?: [
    {
      url: string;
      name: string;
    }
  ];
  createdAt: ISO8601 string;
  updatedAt: ISO8601 string;
}
```

#### Request Examples

**Create Task**:
```json
{
  "title": "Implement login API",
  "description": "Create login endpoint with JWT",
  "priority": "high",
  "dueDate": "2024-12-31",
  "checklist": []
}
```

**Update Task** (PATCH):
```json
{
  "title": "Updated title",
  "status": "in-progress",
  "checklist": [
    {"text": "Setup database", "done": true},
    {"text": "Create routes", "done": false}
  ]
}
```

#### Web Component Patterns
- **Filtering**: Client-side with server-side support for: search, status, priority, sort
- **Sorting**: By newest (default), due date, priority
- **Checklist**: Interactive - toggle items, updates immediately to UI, then syncs to server
- **Optimistic Updates**: Web app updates UI before server confirms (rollback on error)
- **Loading States**: Show loading skeleton while fetching

#### Mobile Implementation Plan

**Already Done** (Phase 3):
- ✅ TaskCard component displaying task with progress bar
- ✅ Task list screen with pull-to-refresh
- ✅ Task details screen with checklist
- ✅ Optimistic updates for checklist toggle

**Needs Completion**:
- [ ] Verify task creation form accepts all required fields (title, description, priority, dueDate, checklist items)
- [ ] Add filtering by status/priority (already in code, verify all statuses match backend)
- [ ] Add search functionality
- [ ] Verify checklist toggle sends correct PATCH request format
- [ ] Add task update form (edit title, description, priority, due date)
- [ ] Add delete confirmation dialog
- [ ] Handle date picker for due dates (currently may be missing)
- [ ] Add attachment display/upload if needed

---

### 3.3 Personal Calendar

**Web Implementation**: Personal/PersonalCalendar.jsx  
**Status**: ⏳ NOT YET IMPLEMENTED IN MOBILE

#### Endpoints

```
GET    /personal/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD    - List events in date range
POST   /personal/calendar                                   - Create event
GET    /personal/calendar/{id}                              - Get event details
PATCH  /personal/calendar/{id}                              - Update event
DELETE /personal/calendar/{id}                              - Delete event
```

#### Data Shape: CalendarEvent Object

```typescript
{
  _id: string;
  title: string;                              // Required
  description?: string;                       // Optional
  location?: string;                          // Optional
  start: ISO8601 Date;                        // Required - event start time
  end: ISO8601 Date;                          // Required - event end time
  allDay: boolean;                            // Default: false
  color: "blue" | "purple" | "green" | "orange" | "red" | "gray";
  reminderMinutes?: number;                   // 5, 10, 30, 60, 1440 (1 day), or null
  reminderMethod: "in_app" | "browser" | "none";
  repeat: "none" | "daily" | "weekly" | "monthly";
  repeatUntil?: Date;                         // Only if repeat != "none"
  attendees?: [{
    email: string;
    name: string;
    status: "pending" | "accepted" | "declined";
  }];
  createdAt: ISO8601 string;
  updatedAt: ISO8601 string;
}
```

#### Request Examples

**Create Calendar Event**:
```json
{
  "title": "Team Meeting",
  "description": "Quarterly planning meeting",
  "location": "Conference Room A",
  "start": "2024-12-20T14:00:00Z",
  "end": "2024-12-20T15:00:00Z",
  "allDay": false,
  "color": "blue",
  "reminderMinutes": 30,
  "reminderMethod": "in_app",
  "repeat": "none"
}
```

#### Web Component Patterns
- **Views**: Month, Week, Day views (toggle between them)
- **Navigation**: Previous/Next buttons, Today button to jump to current date
- **Event Creation**: Modal form, date/time pickers
- **Event Display**: Color-coded events, hover to see details
- **Reminders**: Support for in-app, browser, or no reminders
- **Recurrence**: Support for repeating events (daily, weekly, monthly with end date)

#### Mobile Implementation Plan

**Phase**: LOW PRIORITY (Future)

**Minimal Mobile Version**:
- Month view only (swipe to change month)
- Tap date to create event
- Tap event to view/edit details
- Basic form: title, start/end date-time, color
- Optional: reminder, repeat, description

---

### 3.4 Personal Planner

**Web Implementation**: Personal/PersonalPlanner.jsx  
**Status**: ⏳ NOT YET IMPLEMENTED IN MOBILE

#### Endpoints

```
GET    /personal/planner?date=YYYY-MM-DD         - Get day plan (time blocks)
PUT    /personal/planner?date=YYYY-MM-DD         - Update day plan (all blocks at once)
PATCH  /personal/planner/block/{blockId}         - Update single time block
```

#### Data Shape: DayPlan Object

```typescript
{
  _id: string;
  ownerUserId: string;
  date: "YYYY-MM-DD";                         // The date this plan is for
  blocks: [
    {
      _id: string;
      startTime: "HH:MM";                     // e.g., "09:00"
      endTime: "HH:MM";                       // e.g., "10:00"
      title: string;                          // What to do in this block
      category: "work" | "break" | "personal" | "learning";
      notes?: string;
      completed: boolean;
    }
  ];
  summary?: {
    totalWorkTime: number;                    // in minutes
    totalBreakTime: number;                   // in minutes
    completionRate: number;                   // 0-100%
  };
  createdAt: ISO8601 string;
  updatedAt: ISO8601 string;
}
```

#### Request Examples

**Get Day Plan**:
```
GET /personal/planner?date=2024-12-20

Response:
{
  "_id": "...",
  "date": "2024-12-20",
  "blocks": [
    {
      "_id": "block1",
      "startTime": "09:00",
      "endTime": "10:00",
      "title": "Morning standup",
      "category": "work",
      "completed": true
    },
    {
      "_id": "block2",
      "startTime": "10:00",
      "endTime": "10:15",
      "title": "Coffee break",
      "category": "break",
      "completed": false
    }
  ]
}
```

**Update Day Plan** (PUT - replace all blocks):
```json
{
  "blocks": [
    {"startTime": "09:00", "endTime": "10:00", "title": "Standup", "category": "work", "completed": true},
    {"startTime": "10:00", "endTime": "12:00", "title": "Development", "category": "work", "completed": false},
    {"startTime": "12:00", "endTime": "13:00", "title": "Lunch", "category": "break", "completed": false}
  ]
}
```

#### Web Component Patterns
- **Timeline View**: Horizontal timeline showing time blocks for the day
- **Block Editing**: Click block to edit time, title, category, notes
- **Drag & Drop**: Resize blocks to change duration, reorder blocks
- **Completion Tracking**: Mark blocks done/incomplete
- **Summary**: Show total work time, break time, completion percentage
- **Date Navigation**: Select different dates to plan

#### Mobile Implementation Plan

**Phase**: LOWER PRIORITY (Future)

**Minimal Mobile Version**:
- List view of time blocks for selected date
- Swipe left/right to change date
- Tap to create new block (simple time + title picker)
- Swipe block left to delete, tap to mark complete
- Show summary (completion %)

---

### 3.5 Personal Inbox (Gmail Integration)

**Web Implementation**: Personal/PersonalInbox.jsx  
**Status**: ⏳ NOT YET IMPLEMENTED IN MOBILE

#### Endpoints

```
GET    /personal/gmail/status                              - Check Gmail connection status
POST   /personal/gmail/connect                             - Connect Gmail account (OAuth)
POST   /personal/gmail/disconnect                          - Disconnect Gmail
POST   /personal/gmail/sync                                - Force sync Gmail emails
GET    /personal/emails                                    - List emails with filters
GET    /personal/emails/{id}                               - Get email details
POST   /personal/emails/{id}/mark-read                     - Mark email as read
POST   /personal/emails/{id}/summarize                     - Get AI summary of email
```

#### Query Parameters for GET /personal/emails

```
?page=<number>                    # Default 1
&limit=<number>                   # Default 20
&search=<string>                  # Search in subject/from/body
&category=<all|work|personal|...> # Email category
&importance=<all|high|normal|low> # Email importance
&from=<YYYY-MM-DD>               # Date range start
&to=<YYYY-MM-DD>                 # Date range end
```

#### Data Shape: PersonalEmail Object

```typescript
{
  _id: string;
  from: {
    email: string;
    name: string;
  };
  to: [
    {
      email: string;
      name: string;
    }
  ];
  subject: string;
  body: string;                           // HTML body
  snippet: string;                        // First 100 chars of body
  category: "work" | "personal" | "promotions" | "social";
  importance: "high" | "normal" | "low";
  labels?: string[];                      // Gmail labels
  isRead: boolean;
  hasAttachments: boolean;
  attachments?: [
    {
      filename: string;
      mimeType: string;
      data?: string;                      // Base64 encoded
    }
  ];
  receivedAt: ISO8601 string;
  createdAt: ISO8601 string;
}
```

#### Gmail Connection Status

```typescript
{
  connected: boolean;
  status: "not_connected" | "connected" | "error";
  email?: string;                   // Connected Gmail address
  lastSyncAt?: ISO8601 string;
  nextSyncAt?: ISO8601 string;
}
```

#### Web Component Patterns
- **Gmail Connection**: Button to connect/disconnect Gmail account
- **Email List**: Show sender, subject, snippet, date
- **Filtering**: By search, category, importance, date range
- **Pagination**: Show pages of emails
- **Email Details**: Full body, attachments, mark as read
- **Auto-Sync**: Button to force sync, shows last sync time
- **Summary**: AI-generated summary of long emails

#### Mobile Implementation Plan

**Phase**: LOWER PRIORITY (Future)

**Minimal Mobile Version**:
- Icon button to open Gmail connection status
- If connected: show email list (sender, subject, snippet, date)
- Tap to view email full text
- Swipe to mark as read/unread
- Pull to refresh
- Note: Full Gmail OAuth on mobile is complex; may use web login or simplified OAuth flow

---

### 3.6 Chat

**Web Implementation**: Chat/ChatPage.jsx  
**Status**: ✅ FULLY IMPLEMENTED IN MOBILE

#### Endpoints

```
GET    /chat/conversations                                     - List all conversations
GET    /chat/conversation/{userModel}/{userId}                - Get messages in conversation
POST   /chat/send                                              - Send message
GET    /chat/unread-count                                      - Get unread message count
POST   /chat/mark-read/{conversationId}                        - Mark conversation as read
```

#### Data Shape: Message Object

```typescript
{
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    fullName: string;
    avatar?: string;
    userModel: "User" | "Admin" | "Trainee";
  };
  receiver: {
    _id: string;
    fullName: string;
    avatar?: string;
    userModel: "User" | "Admin" | "Trainee";
  };
  body: string;                           // Message text
  isRead: boolean;
  attachments?: [
    {
      type: "image" | "file";
      url: string;
      name: string;
    }
  ];
  createdAt: ISO8601 string;
  updatedAt: ISO8601 string;
}
```

#### Data Shape: Conversation Object

```typescript
{
  _id: string;
  participants: [
    {
      _id: string;
      fullName: string;
      avatar?: string;
      userModel: "User" | "Admin" | "Trainee";
    }
  ];
  lastMessage: Message;                   // Last message in conversation
  unreadCount: number;                    // For current user
  createdAt: ISO8601 string;
  updatedAt: ISO8601 string;
}
```

#### Request Examples

**Send Message**:
```json
{
  "receiverId": "user123",
  "receiverModel": "User",              // "User", "Admin", or "Trainee"
  "body": "Hello, how are you?"
}
```

#### Response: Sent Message Object

```json
{
  "_id": "msg123",
  "conversationId": "conv123",
  "sender": { /* current user */ },
  "receiver": { /* recipient */ },
  "body": "Hello, how are you?",
  "isRead": false,
  "createdAt": "2024-12-20T10:30:00Z"
}
```

#### Mobile Implementation Plan

**Status**: ✅ COMPLETE

**Implemented**:
- ✅ Conversation list with unread badge
- ✅ Messages screen with message bubbles
- ✅ Send message functionality
- ✅ Unread count polling (every 5 seconds, background-aware)
- ✅ Auto mark-as-read on opening conversation
- ✅ Tab badge showing unread count (shows "99+" if > 99)

---

## 4. Implementation Priority & Roadmap

### Phase 1: Verification (Current)
- ✅ Verify Authentication matches backend contract
- ✅ Verify Tasks implementation matches backend contract

### Phase 2: Enhancement
- [ ] Complete Task creation form (all fields)
- [ ] Add Task filtering and search
- [ ] Add Task editing form
- [ ] Add due date picker

### Phase 3: Calendar (Future)
- [ ] Implement Calendar list view
- [ ] Implement event creation/editing
- [ ] Implement reminders
- [ ] Implement recurring events

### Phase 4: Planner (Future)
- [ ] Implement day plan view
- [ ] Implement time block management

### Phase 5: Inbox (Future)
- [ ] Implement Gmail connection
- [ ] Implement email list
- [ ] Implement email details
- [ ] Implement email search/filters

---

## 5. Data Shape Validation Notes

### Auth Data
- **Required Fields**: email, password (login), fullName (signup)
- **Optional Fields**: avatar
- **Token Storage**: SecureStore (already implemented)
- **Token Auto-Attach**: axios interceptor (already implemented)

### Task Data
- **Required**: title, description
- **Optional**: dueDate, checklist items, attachments, priority
- **Statuses**: pending, in-progress, submitted, reviewed, completed
- **Priorities**: low, medium, high
- **Checklist Items**: Simple text + boolean done flag

### Calendar Data
- **Required**: title, start, end
- **Optional**: description, location, color, reminder, repeat
- **Colors**: blue, purple, green, orange, red, gray
- **Reminders**: 5, 10, 30, 60, 1440 minutes (or none)
- **Repeat**: none, daily, weekly, monthly

### Planner Data
- **Structure**: DayPlan contains array of time blocks
- **Block Fields**: startTime, endTime, title, category, completed
- **Categories**: work, break, personal, learning

### Email Data
- **From/To**: Email address + name
- **Categories**: work, personal, promotions, social
- **Importance**: high, normal, low
- **Attachments**: filename, mimeType, optional data

### Chat Data
- **Message**: sender, receiver, body, isRead
- **Conversation**: participants, lastMessage, unreadCount
- **User Models**: "User", "Admin", "Trainee"

---

## 6. Notes for Mobile Implementation

### API Error Handling
- All endpoints return error in format: `{ message: "Error description" }`
- 401 Unauthorized → Trigger login refresh
- 400 Bad Request → Show field validation errors
- 500 Server Error → Show generic "Please try again" message

### Data Synchronization
- Chat: Poll every 5 seconds (stop when backgrounded)
- Tasks: Pull-to-refresh, load on screen focus
- Calendar: Load date range when navigating
- Inbox: Pull-to-refresh, load when connected
- Planner: Load for selected date

### Mobile-Specific Considerations
- **Date/Time Pickers**: Use react-native-date-picker or native pickers
- **File Uploads**: Use expo-document-picker for attachments
- **Gmail Login**: Consider simplified OAuth or web-based flow
- **Offline Support**: Queue messages if offline, sync when reconnected (optional)
- **Performance**: Limit calendar events to ±3 months, email pagination to 20 per page

---

## 7. Summary: What Each Screen Should Show

| Feature | Essential Fields | Optional Fields | Actions |
|---------|------------------|-----------------|---------|
| **Task List** | Title, Priority, Status, DueDate | Description, Checklist % | Tap for details, Filter, Search, Create |
| **Task Details** | Title, Description, Status, Priority, Checklist | DueDate, Attachments | Toggle items, Edit, Delete |
| **Calendar** | Title, Date, Time | Description, Color, Location | Tap for details, Create, Edit |
| **Planner** | Time, Title, Category | Notes | Mark complete, Edit |
| **Email List** | From, Subject, Snippet, Date | Category, Importance | Tap for details |
| **Email Details** | From, Subject, Full Body | Attachments, Category | Mark read, Archive |
| **Chat List** | Contact Name, Last Message, Date | Unread badge | Tap to open |
| **Chat Messages** | Message text, Sender, Time | Attachments | Send reply |

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-20
