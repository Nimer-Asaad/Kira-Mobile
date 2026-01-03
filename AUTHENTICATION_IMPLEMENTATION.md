# Authentication Implementation - Kira Mobile

## Overview
This document outlines the complete authentication system for Kira Mobile, including user login, signup, token persistence, and protected routing.

## Architecture

### Components

#### 1. **AuthContext** (`src/auth/AuthContext.tsx`)
Central state management for authentication.

**State:**
- `user`: Current user object or null
- `token`: JWT token stored in SecureStore
- `isLoading`: Loading state during bootstrap and auth operations
- `isAuthenticated`: Computed boolean (user && token present)
- `error`: Error messages from API calls

**Methods:**
- `bootstrap()`: Runs on app launch, loads persisted token from SecureStore and fetches user profile
- `login(email, password)`: Authenticate user and store token
- `signup(name, email, password)`: Create new account and authenticate
- `logout()`: Clear token and user state
- `updateUser(data)`: Update local user state
- `clearError()`: Clear error message

#### 2. **Login Screen** (`app/(auth)/login.tsx`)
Email/password authentication with validation and error handling.

**Features:**
- Email and password input fields
- Real-time validation with helpful error messages
- Loading indicator during login
- Link to signup screen
- Error display from AuthContext
- Keyboard-aware layout

**Validation Rules:**
- Email is required and must be valid format
- Password is required and minimum 6 characters

#### 3. **Signup Screen** (`app/(auth)/signup.tsx`)
New account creation with form validation.

**Features:**
- Full name, email, password, confirm password fields
- Real-time validation
- Password confirmation matching
- Loading indicator during signup
- Link to login screen
- Error display from AuthContext
- ScrollView for small screens

**Validation Rules:**
- All fields required
- Email must be valid format
- Password minimum 6 characters
- Passwords must match

#### 4. **Root Layout** (`app/_layout.tsx`)
Main router configuration with authentication-aware routing.

**Behavior:**
1. Show loading spinner during bootstrap
2. Unauthenticated users see `(auth)` stack with login/signup
3. Authenticated users see `(tabs)` stack with app interface
4. Automatically switches views when auth state changes

#### 5. **Auth Layout** (`app/(auth)/_layout.tsx`)
Stack navigation for auth screens.

**Routes:**
- `/login` - Login screen
- `/signup` - Signup screen

**Redirect:** If user becomes authenticated, redirects to app tabs

## Data Flow

### Bootstrap Flow (On App Launch)
```
App Launch
    ↓
AuthProvider wraps app
    ↓
AuthContext bootstrap() runs
    ↓
Attempt to load token from SecureStore
    ↓
If token exists:
  - Set token state
  - Call GET /auth/me to validate token
  - If valid: Set user state, show app tabs
  - If invalid: Clear token, show login
    ↓
If no token:
  - Show login screen
```

### Login Flow
```
User enters email/password
    ↓
Validation checks
    ↓
Call authApi.login()
    ↓
Receive token + user data
    ↓
Save token to SecureStore
    ↓
Set token and user state
    ↓
AuthContext automatically redirects to app tabs
```

### Signup Flow
```
User enters name, email, password
    ↓
Validation checks
    ↓
Call authApi.signup()
    ↓
Receive token + user data
    ↓
Save token to SecureStore
    ↓
Set token and user state
    ↓
AuthContext automatically redirects to app tabs
```

### Logout Flow
```
User initiates logout
    ↓
Remove token from SecureStore
    ↓
Clear user state
    ↓
Clear error state
    ↓
Redirect to login screen
```

## API Integration

### Authentication Endpoints

All endpoints use `axiosInstance` which automatically:
- Attaches `Authorization: Bearer <token>` header
- Handles 401 responses by clearing token
- Retries failed requests with valid token

**Endpoints:**
```
POST /auth/login
  Body: { email, password }
  Response: { token, user }

POST /auth/signup
  Body: { name, email, password }
  Response: { token, user }

GET /auth/me
  Response: { user }
  
POST /auth/logout
  Response: { message }
```

## Token Persistence

### SecureStore
Tokens are stored securely using:
- **iOS**: Keychain
- **Android**: Android Keystore

### Storage Key
```
STORAGE_KEYS.AUTH_TOKEN = 'auth_token'
```

### Token Lifecycle
1. **Created**: User logs in/signs up
2. **Persisted**: Saved to SecureStore immediately
3. **Restored**: Loaded on app launch during bootstrap
4. **Validated**: GET /auth/me confirms token is valid
5. **Cleared**: On 401 response or logout

## Protected Routing

### Route Structure
```
app/
  _layout.tsx (root - handles auth routing)
    ├── (auth)/ (public routes)
    │   ├── _layout.tsx
    │   ├── login.tsx
    │   └── signup.tsx
    └── (tabs)/ (protected routes)
        ├── _layout.tsx
        ├── index.tsx (tasks)
        ├── explore.tsx
        ├── chat.tsx
        ├── personal.tsx
        └── profile.tsx
```

### Protection Method
Root layout checks `isAuthenticated`:
- If false: Render auth stack only
- If true: Render app tabs + other routes
- If loading: Show loading spinner

## Error Handling

### Validation Errors
- **Client-side**: Shown in red text below form fields
- **Cleared**: When user starts typing
- **Examples**: "Email required", "Passwords don't match"

### API Errors
- **Display**: From `useAuth().error`
- **Source**: Backend response message or network error
- **Examples**: "Invalid credentials", "Email already exists"

### Session Errors
- **401 Unauthorized**: Token invalid/expired
  - Token removed from storage
  - User redirected to login
- **Network Error**: Cannot reach server
  - Error displayed to user
  - Retry possible on next login attempt

## Usage Example

### In Components
```tsx
import { useAuth } from '@/src/auth/AuthContext';

export default function MyComponent() {
  const { user, isLoading, error, logout } = useAuth();

  if (isLoading) return <ActivityIndicator />;
  if (!user) return null;

  return (
    <>
      <Text>Welcome, {user.name}!</Text>
      <Button onPress={logout} title="Logout" />
    </>
  );
}
```

### Checking Authentication
```tsx
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) {
  // Show loading
}

if (!isAuthenticated) {
  // Show login prompt or redirect
}

// Show protected content
```

## Testing Authentication

### Test Credentials
Use credentials created via signup screen or backend test fixtures.

### Test Scenarios
1. **Fresh App**: No token - shows login
2. **Login**: Valid credentials - shows tabs
3. **Invalid Login**: Wrong password - shows error
4. **Signup**: New account - shows tabs
5. **Logout**: Clears token - shows login
6. **Token Expiry**: Invalid token on bootstrap - shows login

## Security Considerations

- ✅ Tokens stored in secure storage (Keychain/Keystore)
- ✅ Tokens attached automatically to all API requests
- ✅ Token validation on app launch (bootstrap)
- ✅ Automatic logout on 401 response
- ✅ Form validation prevents weak credentials
- ✅ Passwords never logged or exposed
- ✅ HTTPS required for all API calls

## Dependencies

- `expo-router`: File-based routing
- `expo-secure-store`: Secure token storage
- `@react-navigation/native`: Navigation system
- `axios`: HTTP client via `axiosInstance`
- `AuthContext`: Custom context provider

## Files Summary

| File | Purpose |
|------|---------|
| `src/auth/AuthContext.tsx` | Authentication state and logic |
| `app/(auth)/login.tsx` | Login form screen |
| `app/(auth)/signup.tsx` | Signup form screen |
| `app/(auth)/_layout.tsx` | Auth stack routing |
| `app/_layout.tsx` | Root routing with auth guard |
| `src/api/auth.ts` | API client methods |
| `src/utils/storage.ts` | SecureStore wrapper |
| `src/api/axiosInstance.js` | HTTP client with auto auth |

## Next Steps

1. Test authentication flow end-to-end
2. Add forgot password functionality
3. Add two-factor authentication if needed
4. Implement session timeout
5. Add biometric login (Face ID / Touch ID)
6. Create profile management screen
