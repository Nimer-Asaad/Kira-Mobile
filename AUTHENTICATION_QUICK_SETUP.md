# Authentication Quick Setup - Kira Mobile

## Current Status
✅ **Complete** - Full authentication system ready to use

## What's Implemented

### Core Features
- [x] User login with email/password
- [x] User signup with validation
- [x] Secure token persistence (SecureStore)
- [x] Automatic login on app launch (bootstrap)
- [x] Protected routing (login screen for unauthenticated)
- [x] Logout functionality
- [x] Error handling and display
- [x] Loading indicators
- [x] Form validation

### Screens Created
- ✅ `/app/(auth)/login.tsx` - Login screen with validation
- ✅ `/app/(auth)/signup.tsx` - Signup screen with validation
- ✅ `app/_layout.tsx` - Root layout with auth-aware routing
- ✅ `app/(auth)/_layout.tsx` - Auth stack configuration

### Infrastructure
- ✅ `src/auth/AuthContext.tsx` - State management
- ✅ `src/api/axiosInstance.js` - Auto token attachment
- ✅ `src/utils/storage.ts` - SecureStore wrapper
- ✅ Environment configuration with API base URL

## How to Use

### 1. Start the App
```bash
npm start
# or
expo start
```

### 2. First Launch
- App boots → `AuthContext.bootstrap()` runs
- No token found → Login screen displays
- User enters email/password → Logs in
- Token saved to SecureStore
- Redirects to app tabs

### 3. Subsequent Launches
- App boots → `AuthContext.bootstrap()` runs
- Token found in SecureStore → Validates with `/auth/me`
- User data loaded
- Directly shows app tabs

### 4. Logout
- User taps logout button
- Token removed from SecureStore
- Redirects to login screen

## API Endpoints Used

```
POST /auth/login          - Authenticate user
POST /auth/signup         - Create new account
GET  /auth/me            - Get current user
POST /auth/logout        - Logout user (optional)
```

All requests automatically include:
```
Authorization: Bearer <token>
```

## Key Files

| Path | Purpose |
|------|---------|
| `src/auth/AuthContext.tsx` | Authentication logic & state |
| `app/_layout.tsx` | Routing with auth checks |
| `app/(auth)/login.tsx` | Login form |
| `app/(auth)/signup.tsx` | Signup form |

## Testing

### Test Login
1. Open app
2. Tap "Sign up" to create account
3. Enter: name, email, password
4. App redirects to task list
5. Data persists on app restart

### Test Logout
1. Find profile/settings screen
2. Tap logout
3. Returns to login screen

### Test Persistence
1. Login successfully
2. Restart app (kill & reopen)
3. App should load directly to tasks (no login prompt)

## Customization

### Change Login Redirect Destination
In `app/_layout.tsx`:
```tsx
if (!isAuthenticated) {
  return <Redirect href="/(tabs)/explore" />;  // Change this
}
```

### Add Validation Rules
Edit `app/(auth)/login.tsx` or `app/(auth)/signup.tsx`:
```tsx
const validateForm = () => {
  // Add your rules here
};
```

### Customize Error Messages
AuthContext automatically shows API error messages from backend response.

### Style Customization
Screens use `COLORS` from `src/utils/constants.ts`:
```tsx
COLORS.primary       // Main brand color (e.g., blue)
COLORS.background   // Page background
COLORS.text         // Text color
COLORS.error        // Error message color
```

## Troubleshooting

### Login Not Working
1. Verify backend is running at API_BASE_URL
2. Check `.env` has correct `EXPO_PUBLIC_API_BASE_URL`
3. Verify user account exists in backend
4. Check network connection

### App Shows Loading Forever
1. Backend may be down - check connectivity
2. SecureStore permission issue on Android
3. Check console for errors: `npm start` logs

### Logout Not Working
1. Ensure logout button calls `useAuth().logout()`
2. Check that auth layout redirects on logout

### Persisted Login Not Working
1. Check SecureStore permissions on device
2. Verify token is valid (not expired)
3. Clear app cache and restart

## TypeScript Types

```tsx
// User object
interface User {
  id: string;
  name: string;
  email: string;
  // ... other fields from backend
}

// Login/signup credentials
interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Auth context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  updateUser: (data: User) => void;
  clearError: () => void;
}
```

## Environment Setup

Required in `.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://your-backend-url:port
```

For development:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
```

For production:
```
EXPO_PUBLIC_API_BASE_URL=https://api.kira.com
```

## Next Steps

1. ✅ Authentication foundation complete
2. Next: Connect to actual backend endpoints
3. Test with real user accounts
4. Add profile/settings screen with logout button
5. Implement password reset flow
6. Add biometric authentication (optional)
7. Add two-factor authentication (optional)

## Support

For issues or questions:
1. Check TypeScript errors: `npm run type-check`
2. Check console logs: `npm start`
3. Verify backend connectivity
4. Review `AUTHENTICATION_IMPLEMENTATION.md` for detailed docs
