# AUTH + TASKS VERIFICATION & COMPLETION CHECKLIST

**Status**: Ready for implementation verification  
**Priority**: Phases 1-2 (Critical path)

---

## Part 1: AUTHENTICATION VERIFICATION

### Current Implementation Status
- ✅ AuthContext.tsx created
- ✅ Login/signup screens created
- ✅ Token storage in SecureStore
- ✅ axios interceptor with auto token attach
- ✅ 401 handling with re-authentication

### Phase: Verification (Confirm Backend Contract Alignment)

#### Task 1.1: Verify Login Endpoint Contract ✓

**Backend Endpoint**: `POST /auth/login`

**Request Structure**:
```javascript
{
  email: "user@example.com",
  password: "password123"
}
```

**Response Structure**:
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: {
    _id: "60d5ec49f1d2c4a4f0e0e0e0",
    fullName: "John Doe",
    email: "user@example.com",
    avatar: "https://...",
    role: "user" | "hr" | "trainee" | "personal",
    workspaceMode: "company" | "personal",
    isActive: true,
    specialization: "Frontend" | "Backend" | "AI" | "QA" | "DevOps" | "UI/UX" | "General",
    skills: ["JavaScript", "React"],
    createdAt: "2024-01-01T00:00:00Z"
  }
}
```

**Mobile Implementation File**: [src/api/auth.ts](src/api/auth.ts)

**Checklist**:
- ✅ login() function sends POST to /auth/login with email & password
- ✅ Token stored in SecureStore under 'authToken'
- ✅ User object stored in AuthContext
- ✅ Error handling for invalid credentials
- [ ] Verify response format matches above (especially user object structure)

---

#### Task 1.2: Verify Signup Endpoint Contract ✓

**Backend Endpoint**: `POST /auth/signup`

**Request Structure**:
```javascript
{
  fullName: "John Doe",
  email: "user@example.com",
  password: "password123",
  workspaceMode: "company" | "personal"  // Required
}
```

**Response Structure**:
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: {
    _id: "60d5ec49f1d2c4a4f0e0e0e0",
    fullName: "John Doe",
    email: "user@example.com",
    avatar: "",
    role: "user",  // Default role for new users
    workspaceMode: "company",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z"
  }
}
```

**Mobile Implementation File**: [src/api/auth.ts](src/api/auth.ts)

**Checklist**:
- ✅ signup() function sends POST to /auth/signup
- ✅ Accepts fullName, email, password, workspaceMode
- ✅ Returns token and user object
- ✅ Token stored in SecureStore
- [ ] Verify workspaceMode field is accepted (company/personal)
- [ ] Verify role defaults to "user" for new accounts
- [ ] Handle validation errors for all fields

---

#### Task 1.3: Verify Auth/Me Endpoint Contract ✓

**Backend Endpoint**: `GET /auth/me` (requires Bearer token)

**Request**:
```javascript
// Header: Authorization: Bearer <token>
GET /auth/me
```

**Response Structure**:
```javascript
{
  _id: "60d5ec49f1d2c4a4f0e0e0e0",
  fullName: "John Doe",
  email: "user@example.com",
  avatar: "https://...",
  role: "user" | "hr" | "trainee" | "personal",
  workspaceMode: "company" | "personal",
  isActive: true,
  specialization: "Frontend" | "Backend" | "AI" | "QA" | "DevOps" | "UI/UX" | "General",
  skills: ["JavaScript", "React"],
  createdAt: "2024-01-01T00:00:00Z"
}
```

**Mobile Implementation File**: [src/api/auth.ts](src/api/auth.ts)

**Checklist**:
- ✅ me() function sends GET to /auth/me
- ✅ axiosInstance auto-attaches Bearer token
- ✅ On app startup, call me() to verify token validity
- ✅ If 401 returned, clear token and redirect to login
- [ ] Verify token refresh works on 401
- [ ] Verify me() called on app launch to restore session

---

#### Task 1.4: Authentication Error Scenarios

**Checklist**:
- [ ] Invalid email/password → Show "Invalid credentials" message
- [ ] User not found → Show "User does not exist" message
- [ ] Token expired → Auto-refresh token
- [ ] Token invalid → Clear storage and redirect to login
- [ ] Network error → Show "Connection error" message with retry button
- [ ] Server error (500) → Show generic error message

---

## Part 2: PERSONAL TASKS VERIFICATION & COMPLETION

### Current Implementation Status
- ✅ TaskCard component created
- ✅ Badge component created
- ✅ ChecklistItem component created
- ✅ Task list screen created
- ✅ Task details screen created
- ✅ Optimistic updates implemented
- ✅ Error handling implemented

### Phase: Verification & Completion (Confirm Backend Contract + Add Missing Features)

#### Task 2.1: Verify Task List Endpoint Contract

**Backend Endpoint**: `GET /personal/tasks`

**Query Parameters**:
```
?search=<string>              # Optional - search in title/description
&status=<string>              # Optional - pending, in-progress, submitted, reviewed, completed
&priority=<string>            # Optional - low, medium, high
&sort=<string>               # Optional - newest (default), dueDate, priority
&page=<number>               # Optional - page number (default 1)
&limit=<number>              # Optional - per page (default 20)
```

**Response Structure**:
```javascript
{
  tasks: [
    {
      _id: "task123",
      title: "Implement login API",
      description: "Create login endpoint with JWT",
      priority: "high",
      status: "pending",
      dueDate: "2024-12-31T00:00:00Z" | null,
      checklist: [
        { text: "Setup database", done: true },
        { text: "Create routes", done: false }
      ],
      attachments: [
        { url: "https://...", name: "requirements.pdf" }
      ],
      createdAt: "2024-12-20T10:30:00Z",
      updatedAt: "2024-12-20T10:30:00Z"
    }
  ],
  pagination?: {
    page: 1,
    limit: 20,
    total: 50,
    pages: 3
  }
}
```

**Mobile Implementation File**: [app/(app)/(tabs)/tasks/index.tsx](app/(app)/(tabs)/tasks/index.tsx)

**Checklist**:
- ✅ Fetch tasks on screen load
- ✅ Display tasks in list with TaskCard component
- ✅ Show loading state while fetching
- ✅ Pull-to-refresh functionality
- [ ] Implement search functionality (send ?search=<query>)
- [ ] Implement status filter (send ?status=<status>)
- [ ] Implement priority filter (send ?priority=<priority>)
- [ ] Implement sorting (send ?sort=<field>)
- [ ] Handle pagination if total > 20 items

---

#### Task 2.2: Verify Task Details Endpoint Contract

**Backend Endpoint**: `GET /personal/tasks/{id}`

**Response Structure**:
```javascript
{
  _id: "task123",
  title: "Implement login API",
  description: "Create login endpoint with JWT",
  priority: "high",
  status: "pending",
  dueDate: "2024-12-31T00:00:00Z" | null,
  checklist: [
    { text: "Setup database", done: true },
    { text: "Create routes", done: false }
  ],
  attachments: [
    { url: "https://...", name: "requirements.pdf" }
  ],
  createdAt: "2024-12-20T10:30:00Z",
  updatedAt: "2024-12-20T10:30:00Z"
}
```

**Mobile Implementation File**: [app/(app)/(tabs)/tasks/[id].tsx](app/(app)/(tabs)/tasks/[id].tsx)

**Checklist**:
- ✅ Load task details when screen opens
- ✅ Display all task fields
- ✅ Show checklist with progress bar
- ✅ Show loading state while fetching
- [ ] Verify task ID comes from route params correctly
- [ ] Handle 404 (task not found) gracefully

---

#### Task 2.3: Verify Task Create Endpoint Contract

**Backend Endpoint**: `POST /personal/tasks`

**Request Structure**:
```javascript
{
  title: "Implement login API",        // Required, non-empty string
  description: "Create login endpoint with JWT",  // Required, non-empty string
  priority: "high",                    // Optional, default: "medium"
  dueDate: "2024-12-31T00:00:00Z",    // Optional, can be null
  checklist: [
    { text: "Setup database", done: false }  // Optional, array of items
  ]
}
```

**Response**: Created task object (same as GET /personal/tasks/{id})

**Mobile Implementation File**: [app/(app)/(tabs)/tasks/index.tsx](app/(app)/(tabs)/tasks/index.tsx)

**Checklist**:
- [ ] Create form for new task with fields: title, description, priority, dueDate
- [ ] Allow adding checklist items to task during creation
- [ ] Validate title and description are non-empty
- [ ] Show loading state while creating
- [ ] On success: add task to list and show success message
- [ ] On error: show error message and allow retry
- [ ] Close form/modal after successful creation

---

#### Task 2.4: Verify Task Update Endpoint Contract

**Backend Endpoint**: `PATCH /personal/tasks/{id}`

**Request Structure** (send only fields to update):
```javascript
{
  title: "Updated title",              // Optional
  description: "Updated description",  // Optional
  priority: "medium",                  // Optional - low, medium, high
  status: "in-progress",              // Optional - pending, in-progress, submitted, reviewed, completed
  dueDate: "2024-12-31T00:00:00Z",   // Optional
  checklist: [                         // Optional - full replacement
    { text: "Setup database", done: true },
    { text: "Create routes", done: false }
  ]
}
```

**Response**: Updated task object

**Mobile Implementation File**: [app/(app)/(tabs)/tasks/[id].tsx](app/(app)/(tabs)/tasks/[id].tsx)

**Checklist**:
- ✅ Checklist toggle sends PATCH request to update status
- [ ] Implement edit form for task details (title, description, priority, dueDate)
- [ ] Implement status update from details screen
- [ ] Optimize: Send only changed fields (not full task)
- [ ] On error: Show error message and rollback UI changes
- [ ] Support optimistic updates (update UI before server confirms)

---

#### Task 2.5: Verify Task Checklist Toggle Endpoint

**Backend Endpoint**: `PATCH /personal/tasks/{id}` with checklist update

**Request Structure**:
```javascript
{
  checklist: [
    { text: "Setup database", done: true },       // Item 1 - TOGGLED
    { text: "Create routes", done: false }        // Item 2 - unchanged
  ]
}
```

**Response**: Updated task object

**Mobile Implementation File**: [src/components/ChecklistItem.tsx](src/components/ChecklistItem.tsx)

**Checklist**:
- ✅ Checklist item has tap/press handler to toggle done status
- ✅ Sends PATCH to /personal/tasks/{id} with updated checklist array
- ✅ Shows optimistic update (UI updates immediately)
- ✅ Handles error with rollback (reverts UI if server fails)
- ✅ Loading indicator shows while request in flight
- [ ] Verify entire checklist array sent (not just changed item)
- [ ] Verify progress bar updates correctly after toggle

---

#### Task 2.6: Verify Task Delete Endpoint

**Backend Endpoint**: `DELETE /personal/tasks/{id}`

**Response**: 
```javascript
{ success: true } or { message: "Task deleted successfully" }
```

**Mobile Implementation File**: [app/(app)/(tabs)/tasks/[id].tsx](app/(app)/(tabs)/tasks/[id].tsx)

**Checklist**:
- [ ] Add delete button to task details screen
- [ ] Show confirmation dialog before deleting
- [ ] Send DELETE request to /personal/tasks/{id}
- [ ] On success: navigate back to task list and show success message
- [ ] On error: show error message and allow retry
- [ ] Remove task from list immediately (optimistic delete)

---

#### Task 2.7: Task Status & Priority Validation

**Valid Status Values** (from backend):
```
"pending"      - Task not started
"in-progress"  - Task being worked on
"submitted"    - Task submitted for review
"reviewed"     - Task reviewed by someone
"completed"    - Task finished
```

**Valid Priority Values**:
```
"low"      - Low priority
"medium"   - Medium priority (default)
"high"     - High priority
```

**Mobile Implementation Checklist**:
- [ ] Status filter dropdown only shows valid statuses
- [ ] Priority filter dropdown only shows valid priorities
- [ ] Status update form only allows valid statuses
- [ ] Priority update form only allows valid priorities
- [ ] Display status/priority with appropriate colors in UI

---

## Part 3: DATA STRUCTURE ALIGNMENT

### Task Object Structure (Backend → Mobile)

**Expected Backend Response**:
```typescript
{
  _id: string;                         // Task ID
  title: string;                       // Task title
  description: string;                 // Task description
  priority: "low" | "medium" | "high"; // Task priority
  status: "pending" | "in-progress" | "submitted" | "reviewed" | "completed";
  dueDate?: Date | null;               // Optional due date
  checklist: Array<{
    text: string;                      // Checklist item text
    done: boolean;                     // Is item complete?
  }>;
  attachments?: Array<{
    url: string;                       // File URL
    name: string;                      // File name
  }>;
  createdAt: string;                   // ISO 8601 timestamp
  updatedAt: string;                   // ISO 8601 timestamp
}
```

**Mobile Usage**: [src/types/task.ts](src/types/task.ts) or inline

**Checklist**:
- [ ] Create TypeScript interface for Task object
- [ ] Create TypeScript interface for Checklist item
- [ ] Ensure all API responses match interfaces
- [ ] Use strict typing in all screens/components

---

## Part 4: REMAINING IMPLEMENTATION TASKS

### Priority: HIGH - Do These Now

#### ⚠️ Missing: Task Creation Form
**File**: Create [app/(app)/(tabs)/tasks/create.tsx](app/(app)/(tabs)/tasks/create.tsx)  
**Status**: Not yet created  
**Required Fields**: title, description, priority, dueDate, checklist items  
**Time Estimate**: 1-2 hours

**Implementation Checklist**:
- [ ] Form with title input (text field)
- [ ] Form with description input (text area)
- [ ] Priority selector (radio buttons or dropdown: low, medium, high)
- [ ] Date picker for dueDate (optional)
- [ ] Checklist items section (add multiple items)
- [ ] Create button with loading state
- [ ] Validation before submit
- [ ] Error handling with user feedback
- [ ] Navigation back on success

---

#### ⚠️ Missing: Task Edit Form
**File**: Update [app/(app)/(tabs)/tasks/[id].tsx](app/(app)/(tabs)/tasks/[id].tsx)  
**Status**: Partially done (details display only)  
**Required**: Edit button, edit form, update logic  
**Time Estimate**: 1-2 hours

**Implementation Checklist**:
- [ ] Edit button on task details screen
- [ ] Toggle between view/edit mode
- [ ] Editable form fields: title, description, priority, dueDate, status
- [ ] Save button with validation
- [ ] Cancel button to discard changes
- [ ] Success/error feedback
- [ ] Optimistic updates

---

#### ⚠️ Missing: Task Filters & Search
**File**: Update [app/(app)/(tabs)/tasks/index.tsx](app/(app)/(tabs)/tasks/index.tsx)  
**Status**: Not yet implemented  
**Required**: Search input, filter buttons/dropdowns  
**Time Estimate**: 1 hour

**Implementation Checklist**:
- [ ] Search input field for title/description search
- [ ] Status filter (all, pending, in-progress, completed, etc.)
- [ ] Priority filter (all, low, medium, high)
- [ ] Sort selector (newest, dueDate, priority)
- [ ] Apply filters on user interaction
- [ ] Show "no results" when filtered list is empty
- [ ] Remember filter selections (optional)

---

#### ⚠️ Missing: Date Picker for Due Dates
**Library**: Use [react-native-date-picker](https://www.npmjs.com/package/react-native-date-picker)  
**Status**: Not yet installed/integrated  
**Required**: For task creation and editing  
**Time Estimate**: 30 minutes

**Implementation Checklist**:
- [ ] Install: `npm install react-native-date-picker`
- [ ] Import in task creation/edit forms
- [ ] Date picker modal for dueDate field
- [ ] Format date display (e.g., "Dec 20, 2024")
- [ ] Handle null/empty dates gracefully

---

#### ⚠️ Missing: Task Deletion with Confirmation
**File**: Update [app/(app)/(tabs)/tasks/[id].tsx](app/(app)/(tabs)/tasks/[id].tsx)  
**Status**: Not implemented  
**Required**: Delete button, confirmation modal, delete API call  
**Time Estimate**: 30 minutes

**Implementation Checklist**:
- [ ] Delete button on task details screen
- [ ] Confirmation dialog (Alert or Modal)
- [ ] DELETE request to /personal/tasks/{id}
- [ ] Navigate back to list on success
- [ ] Show error message on failure
- [ ] Optimistic deletion (remove from list immediately)

---

### Priority: MEDIUM - Do After High Priority

#### Task Attachments Display
**File**: Update [app/(app)/(tabs)/tasks/[id].tsx](app/(app)/(tabs)/tasks/[id].tsx)  
**Status**: Not yet implemented  
**Required**: Show attachment list with download links  
**Time Estimate**: 1 hour

---

#### Task Sorting & Pagination
**File**: Update [app/(app)/(tabs)/tasks/index.tsx](app/(app)/(tabs)/tasks/index.tsx)  
**Status**: Partially done (sort logic exists, pagination not tested)  
**Required**: Handle > 20 items pagination, sorting UI  
**Time Estimate**: 1 hour

---

## Part 5: IMPLEMENTATION ORDER RECOMMENDATION

**Recommended Order** (to unblock user testing):

1. **Task Creation Form** (2 hours)
   - Allows users to create tasks in mobile app
   - Core functionality

2. **Task Edit Form** (2 hours)
   - Allows users to edit existing tasks
   - Core functionality

3. **Delete with Confirmation** (30 min)
   - Completes CRUD operations

4. **Filters & Search** (1 hour)
   - Improves task discovery on mobile

5. **Date Picker Integration** (30 min)
   - Better UX for due dates

6. **Attachments Display** (1 hour)
   - Nice-to-have feature

---

## Part 6: TESTING CHECKLIST

### Authentication Testing

**Test Case 1**: Login with valid credentials
- [ ] Enter correct email and password
- [ ] Press login button
- [ ] Verify token saved to SecureStore
- [ ] Verify user data in AuthContext
- [ ] Verify app navigates to (app) group

**Test Case 2**: Login with invalid email
- [ ] Enter invalid email format
- [ ] Press login button
- [ ] Verify error message shown
- [ ] Verify no navigation

**Test Case 3**: Login with wrong password
- [ ] Enter correct email, wrong password
- [ ] Press login button
- [ ] Verify error message: "Invalid credentials"
- [ ] Verify no token saved

**Test Case 4**: Signup with valid data
- [ ] Fill signup form with all required fields
- [ ] Press signup button
- [ ] Verify token saved to SecureStore
- [ ] Verify user created in backend
- [ ] Verify app navigates to (app) group

---

### Task Testing

**Test Case 1**: Load task list
- [ ] Screen opens and shows loading state
- [ ] Tasks load and display correctly
- [ ] Task cards show title, priority, status

**Test Case 2**: Create new task
- [ ] Press "New Task" button
- [ ] Form opens with title, description, priority, date fields
- [ ] Fill in all fields
- [ ] Press create button
- [ ] Verify task added to list
- [ ] Verify API call sent with correct data

**Test Case 3**: Toggle checklist item
- [ ] Open task details
- [ ] Tap checklist item to toggle
- [ ] Verify UI updates immediately
- [ ] Verify progress bar updates
- [ ] Verify API call sent to backend
- [ ] Verify toggle persists (close and reopen task)

**Test Case 4**: Filter tasks by status
- [ ] Apply status filter (e.g., "in-progress")
- [ ] Verify list shows only matching tasks
- [ ] Verify count decreases appropriately

**Test Case 5**: Search tasks
- [ ] Enter search term in search box
- [ ] Verify list filters by search
- [ ] Verify search works in title and description

---

## Summary

**Current Status**:
- ✅ Authentication: 90% complete (just need verification)
- ✅ Tasks: 60% complete (need creation, editing, deletion forms)

**Next Steps**:
1. Verify Auth endpoints match backend contract
2. Implement Task creation form
3. Implement Task edit form
4. Add delete confirmation
5. Add filters and search

**Estimated Time**: 8-10 hours for full Auth + Tasks implementation

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-20  
**Status**: Ready for implementation
