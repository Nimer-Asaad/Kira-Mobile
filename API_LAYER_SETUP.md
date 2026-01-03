# API Layer Implementation Guide

## Overview

The API layer has been implemented with three main components:

1. **axiosInstance.js** - Axios HTTP client with auth interceptors
2. **apiPaths.js** - Centralized endpoint mapping (mirrors backend)
3. **API Test Screen** - `/app/dev/api-test.tsx` for testing connectivity

## 1. Axios Instance (`src/api/axiosInstance.js`)

### Features
- ✅ Reads `EXPO_PUBLIC_API_BASE_URL` from environment (`.env` or `app.config.ts`)
- ✅ Automatically attaches `Authorization: Bearer <token>` header
- ✅ Handles 401 errors by removing invalid tokens
- ✅ Network error detection
- ✅ Request/response interceptors

### Setup
The instance is configured with:
```javascript
- Base URL: process.env.EXPO_PUBLIC_API_BASE_URL (defaults to http://localhost:8000/api)
- Timeout: 15 seconds
- Content-Type: application/json
```

### Token Management
- Reads token from `expo-secure-store` on each request
- Automatically adds to `Authorization` header
- Removes token on 401 response
- Gracefully handles missing token

### Error Handling
```javascript
// 401 Unauthorized
if (response?.status === 401) {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  // User needs to log in again
}

// Network error
if (!response) {
  error.isNetworkError = true;
}
```

## 2. API Paths (`src/api/apiPaths.js`)

### Structure
Endpoints are organized by feature and match the backend routes exactly:

```javascript
API_PATHS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    UPDATE_ME: '/auth/me',
  },
  TASKS: {
    CREATE: '/tasks',
    ADMIN_LIST: '/tasks/admin',
    MY_TASKS: '/tasks/my',
    BY_ID: (id) => `/tasks/${id}`,
    // ... more endpoints
  },
  CHAT: { ... },
  PERSONAL_TASKS: { ... },
  PERSONAL_CALENDAR: { ... },
  PERSONAL_PLANNER: { ... },
  USERS: { ... },
}
```

### Usage Examples

**Static endpoints:**
```javascript
import { API_PATHS } from './apiPaths';

// GET /auth/me
const response = await axiosInstance.get(API_PATHS.AUTH.ME);
```

**Dynamic endpoints (with parameters):**
```javascript
// GET /tasks/123
const taskId = '123';
const response = await axiosInstance.get(API_PATHS.TASKS.BY_ID(taskId));

// GET /chat/conversation/Trainer/456
const response = await axiosInstance.get(
  API_PATHS.CHAT.GET_CONVERSATION('Trainer', userId)
);
```

### Endpoint Reference

| Category | Endpoints |
|----------|-----------|
| **Auth** | signup, login, me (get/update) |
| **Tasks** | create, admin list, import PDF, auto-distribute, stats, my tasks, get/update/delete by ID |
| **Chat** | send message, get conversation, get conversations, unread count, mark read, available users |
| **Personal Tasks** | list, create, get/update/delete by ID |
| **Personal Calendar** | list, create, get/update/delete by ID |
| **Personal Planner** | get day plan, upsert day plan, update block |
| **Users** | list, get/update/delete by ID |

## 3. API Test Screen (`/app/dev/api-test.tsx`)

### Access
Navigate to: `yourapp://dev/api-test` or add a link in dev menu

### Features
- ✅ Quick test buttons for common endpoints
- ✅ Manual endpoint tester with method selector (GET, POST, PUT, PATCH, DELETE)
- ✅ Request body editor (for POST/PUT/PATCH)
- ✅ Response/error display with JSON formatting
- ✅ API configuration display
- ✅ Auth status indicator

### Testing Workflow

1. **Select method** (GET, POST, PUT, PATCH, DELETE)
2. **Enter endpoint** or use quick test button
3. **Add request body** if needed (for POST/PUT/PATCH)
4. **Click "Send Request"**
5. **View response** or error details

### Example Tests

**Test Authentication:**
```
GET /auth/me
Expected: Current user data (401 if not authenticated)
```

**Test Task Retrieval:**
```
GET /tasks/my
Expected: Array of user's tasks
```

**Test Chat:**
```
GET /chat/conversations
Expected: Array of conversations
```

## Environment Configuration

### Files
- **`.env`** - Local configuration (git-ignored)
- **`.env.example`** - Template for developers

### Configuration Variables
```bash
# Required
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Optional
EXPO_PUBLIC_APP_NAME=Kira
EXPO_PUBLIC_APP_ENV=development
```

### Platform-Specific URLs

**iOS Simulator:**
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

**Android Emulator:**
```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api
```

**Physical Device (on same network):**
```bash
# Get your machine's IP:
# Mac: ipconfig getifaddr en0
# Windows: ipconfig
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000/api
```

**Production:**
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.kira.example.com/api
```

## Using the API in Components

### Import Example
```typescript
import axiosInstance from '../../src/api/axiosInstance';
import { API_PATHS } from '../../src/api/apiPaths';

// In component
const loadTasks = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.TASKS.MY_TASKS);
    setTasks(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // Handle logout
      await logout();
    } else {
      Alert.alert('Error', error.message);
    }
  }
};
```

### Available Methods
```javascript
// GET request
axiosInstance.get(endpoint)

// POST request
axiosInstance.post(endpoint, data)

// PUT request
axiosInstance.put(endpoint, data)

// PATCH request
axiosInstance.patch(endpoint, data)

// DELETE request
axiosInstance.delete(endpoint)

// All methods return axios Response object
// response.data - response body
// response.status - HTTP status code
// response.headers - response headers
```

### Error Handling
```javascript
try {
  const response = await axiosInstance.get(endpoint);
  // Handle success
} catch (error) {
  if (error.isNetworkError) {
    console.error('Network error:', error.message);
  } else if (error.response?.status === 401) {
    console.error('Unauthorized - token invalid');
  } else if (error.response?.status === 403) {
    console.error('Forbidden - insufficient permissions');
  } else if (error.response?.status === 404) {
    console.error('Resource not found');
  } else if (error.response?.status >= 500) {
    console.error('Server error:', error.response?.data?.message);
  } else {
    console.error('Request failed:', error.message);
  }
}
```

## Security Features

1. **Token Storage**
   - Uses `expo-secure-store` for iOS Keychain / Android Keystore
   - Tokens never stored in AsyncStorage or plain text

2. **Auto-logout on 401**
   - Invalid tokens are automatically removed
   - User is redirected to login on next app restart

3. **CORS Headers**
   - Backend configured to accept requests from mobile app
   - Authorization header included in CORS allowlist

4. **HTTPS Ready**
   - Supports both HTTP (dev) and HTTPS (prod)
   - Change `EXPO_PUBLIC_API_BASE_URL` to `https://` URL in production

## Troubleshooting

### "Network error - could not connect to server"
- ✅ Backend is running: `npm start` in Kira-Backend
- ✅ API URL is correct in `.env`
- ✅ For simulator: localhost works
- ✅ For Android emulator: use `10.0.2.2` instead of `localhost`
- ✅ For physical device: use machine IP (same WiFi network)

### "401 Unauthorized"
- ✅ User is not logged in - direct to login screen
- ✅ Token is expired - logout and login again
- ✅ Token stored but endpoint is public - verify auth middleware

### "Network timeout"
- ✅ Backend taking too long (default 15s timeout)
- ✅ Network latency too high
- ✅ Request parameters incorrect

### "CORS Error"
- ✅ Backend CORS configuration allows mobile domain
- ✅ Check Kira-Backend CORS setup in server.js

## Testing Checklist

- [ ] Backend running: `npm start` in Kira-Backend
- [ ] API test screen loads: `/app/dev/api-test`
- [ ] GET /auth/me returns current user
- [ ] GET /tasks/my returns user's tasks
- [ ] POST request with body works
- [ ] 401 error handling works
- [ ] Network error detected properly
- [ ] Token persists across app restart

## Next Steps

1. **Integrate into Components**
   - Update existing screens to use axiosInstance + API_PATHS
   - Replace hardcoded endpoints with centralized paths

2. **Add Request Loading States**
   - Loading spinner during requests
   - Disable buttons while loading

3. **Add Response Caching**
   - Cache GET responses locally
   - Invalidate on mutations

4. **Add Offline Support**
   - Queue requests when offline
   - Sync when connection restored

5. **Add Request Retry Logic**
   - Retry failed requests with exponential backoff
   - Skip retry for 4xx errors (except 429)

## Files Created/Modified

### New Files
- `src/api/axiosInstance.js` - HTTP client with interceptors
- `src/api/apiPaths.js` - Centralized endpoint mapping
- `app/dev/api-test.tsx` - API testing screen
- `.env` - Environment variables
- `.env.example` - Template for .env

### Related Files
- `.gitignore` - Should exclude `.env`

## Documentation References

- Kira-Backend API: See `Kira-Backend/API_RESPONSES_REFERENCE.md`
- Axios Documentation: https://axios-http.com/
- Expo SecureStore: https://docs.expo.dev/modules/expo-secure-store/
