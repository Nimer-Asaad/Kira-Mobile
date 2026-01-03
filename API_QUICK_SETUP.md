# API Layer - Quick Setup (5 Minutes)

## 1. Configuration (1 min)
Edit `.env`:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

For Android emulator:
```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api
```

For physical device:
```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000/api  # Use your machine IP
```

## 2. Start Backend (1 min)
```bash
cd Kira-Backend
npm start
```

Backend runs on: `http://localhost:8000`

## 3. Test Connection (2 min)
Navigate to: `yourapp://dev/api-test`

Click "GET /auth/me" quick test button.

**Expected**: 
- If logged in: Current user data
- If not logged in: 401 Unauthorized

## 4. Use in Code (1 min)
```typescript
import axiosInstance from '../../src/api/axiosInstance';
import { API_PATHS } from '../../src/api/apiPaths';

// Get current user
const user = await axiosInstance.get(API_PATHS.AUTH.ME);

// Get tasks
const tasks = await axiosInstance.get(API_PATHS.TASKS.MY);

// Create task
await axiosInstance.post(API_PATHS.TASKS.CREATE, {
  title: 'New Task'
});

// Get specific task
await axiosInstance.get(API_PATHS.TASKS.BY_ID('task-123'));
```

## Common Endpoints Reference

| Action | Code |
|--------|------|
| Get current user | `API_PATHS.AUTH.ME` |
| Get my tasks | `API_PATHS.TASKS.MY` |
| Get task by ID | `API_PATHS.TASKS.BY_ID(id)` |
| Send message | `API_PATHS.CHAT.SEND` |
| Get conversations | `API_PATHS.CHAT.CONVERSATIONS` |
| Get personal tasks | `API_PATHS.PERSONAL.TASKS.LIST` |
| Get calendar events | `API_PATHS.PERSONAL.CALENDAR.LIST` |
| Get day plan | `API_PATHS.PERSONAL.PLANNER.GET_DAY` |

## Error Handling Template
```typescript
try {
  const response = await axiosInstance.get(endpoint);
  // Success - use response.data
} catch (error) {
  if (error.isNetworkError) {
    console.log('Network error');
  } else if (error.response?.status === 401) {
    console.log('Unauthorized - logout');
  } else if (error.response?.status === 404) {
    console.log('Not found');
  } else {
    console.log(error.message);
  }
}
```

## Important Notes

✅ **Token is automatic** - No manual token handling needed
✅ **CORS is enabled** - Backend allows requests
✅ **Errors are caught** - 401 removes token automatically
✅ **Works offline** - Network errors detected

## Troubleshooting

**"Cannot connect"**: Backend not running - `npm start` in Kira-Backend
**"Android emulator timeout"**: Use `10.0.2.2` instead of `localhost`
**"Physical device unreachable"**: Use machine IP, same WiFi network
**"401 Unauthorized"**: Login first, then try endpoint

## Files
- `src/api/axiosInstance.js` - HTTP client
- `src/api/apiPaths.ts` - Endpoints
- `app/dev/api-test.tsx` - Test screen
- `.env` - Configuration
- `API_LAYER_SETUP.md` - Full documentation

Done! API layer is ready to use. 🚀
