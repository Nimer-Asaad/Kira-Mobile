# API Layer Quick Reference

## Quick Start

### 1. Configure Environment
```bash
# .env file
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 2. Import and Use
```typescript
import axiosInstance from '../../src/api/axiosInstance';
import { API_PATHS } from '../../src/api/apiPaths';

// GET request
const tasks = await axiosInstance.get(API_PATHS.TASKS.MY_TASKS);

// POST request
await axiosInstance.post(API_PATHS.TASKS.CREATE, { name: 'New Task' });

// With parameter
await axiosInstance.get(API_PATHS.TASKS.BY_ID('123'));
```

### 3. Test Connectivity
Navigate to: `yourapp://dev/api-test`

---

## Common Endpoints

### Authentication
```javascript
// Login
POST /auth/login
Body: { email, password }

// Get current user
GET /auth/me

// Update profile
PUT /auth/me
Body: { name, email, ... }
```

### Tasks
```javascript
// My tasks
GET /tasks/my

// Get single task
GET /tasks/:id

// Create task (admin)
POST /tasks
Body: { title, description, assignedTo, dueDate, ... }

// Update task
PATCH /tasks/:id
Body: { status, ... }

// Update checklist item
PATCH /tasks/:id/checklist
Body: { itemId, completed }
```

### Chat
```javascript
// Get all conversations
GET /chat/conversations

// Get conversation with user
GET /chat/conversation/Trainer/:userId

// Send message
POST /chat/send
Body: { recipientId, message, recipientModel }

// Mark as read
POST /chat/mark-read
Body: { conversationId }
```

### Personal Tasks
```javascript
// List
GET /personal/tasks

// Create
POST /personal/tasks
Body: { title, description, dueDate, priority }

// Get
GET /personal/tasks/:id

// Update
PATCH /personal/tasks/:id
Body: { title, status, ... }

// Delete
DELETE /personal/tasks/:id
```

### Personal Calendar
```javascript
// List events
GET /personal/calendar?from=2024-01-01&to=2024-12-31

// Create event
POST /personal/calendar
Body: { title, startDate, endDate, notes }

// Get event
GET /personal/calendar/:id

// Update event
PATCH /personal/calendar/:id
Body: { title, startDate, ... }

// Delete event
DELETE /personal/calendar/:id
```

### Personal Planner
```javascript
// Get day plan
GET /personal/planner?date=2024-01-15

// Update day plan
PUT /personal/planner?date=2024-01-15
Body: { blocks: [...] }

// Update single block
PATCH /personal/planner/block/:blockId
Body: { startTime, endTime, title, completed }
```

---

## Error Handling Template

```typescript
try {
  const response = await axiosInstance.get(endpoint);
  // Success
} catch (error) {
  if (error.isNetworkError) {
    Alert.alert('Network Error', 'Cannot connect to server');
  } else if (error.response?.status === 401) {
    // Auto-logout handled by interceptor
    await logout();
    router.replace('/auth/login');
  } else if (error.response?.status === 403) {
    Alert.alert('Forbidden', 'You do not have permission');
  } else if (error.response?.status === 404) {
    Alert.alert('Not Found', 'Resource does not exist');
  } else if (error.response?.status === 400) {
    Alert.alert('Validation Error', error.response.data.message);
  } else if (error.response?.status >= 500) {
    Alert.alert('Server Error', 'Please try again later');
  }
}
```

---

## Environment URLs

| Platform | URL |
|----------|-----|
| iOS Simulator | `http://localhost:8000/api` |
| Android Emulator | `http://10.0.2.2:8000/api` |
| Physical Device | `http://192.168.x.x:8000/api` |
| Production | `https://api.example.com/api` |

Get device IP:
```bash
# Mac
ipconfig getifaddr en0

# Windows
ipconfig
```

---

## Token Management

Tokens are automatically managed:
- ✅ Read from secure store on each request
- ✅ Attached to Authorization header
- ✅ Removed on 401 response
- ✅ Persists across app restarts

No manual token handling needed!

---

## API Test Screen Features

**Location:** `/app/dev/api-test`

**Features:**
- Quick test buttons for common endpoints
- Manual endpoint/method selector
- Request body editor
- Response viewer
- Error display
- API configuration info

**Quick Tests:**
- GET /auth/me
- GET /tasks/my
- GET /chat/conversations
- GET /personal/tasks

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Network error" | Check backend is running, verify API URL in .env |
| "401 Unauthorized" | User not logged in, logout and login again |
| "Android emulator timeout" | Use `10.0.2.2` instead of `localhost` |
| "Physical device unreachable" | Use machine IP, ensure same WiFi network |
| "CORS error" | Check backend CORS config in server.js |

---

## Files Location

| File | Purpose |
|------|---------|
| `src/api/axiosInstance.js` | HTTP client with auth |
| `src/api/apiPaths.js` | Endpoint mapping |
| `app/dev/api-test.tsx` | Testing screen |
| `.env` | Environment variables |
| `.env.example` | Configuration template |

See `API_LAYER_SETUP.md` for detailed documentation.
