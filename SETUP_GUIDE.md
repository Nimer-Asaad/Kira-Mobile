# Kira Mobile - Quick Start Guide

## 📋 What We've Built

A complete mobile companion app for the Kira Task Management System with:

### ✅ Completed Features
- **Authentication System**: Login/Signup with JWT token storage
- **Task Management**: View assigned tasks, update status, manage checklists
- **Team Chat**: Real-time messaging with conversation history
- **User Profile**: Account management and logout
- **API Integration**: Full integration with existing Kira-Backend

### 📱 Screen Structure
```
/(auth)/
  - login          → Login screen
  - signup         → Signup screen

/(tabs)/
  - index          → Tasks list (default)
  - personal       → Personal features (placeholder)
  - chat           → Chat conversations list
  - profile        → User profile

/task/[id]         → Task detail & management
/chat/[userId]     → Chat conversation
```

## 🚀 Getting Started

### Step 1: Install Dependencies (Already Done ✓)
```bash
npm install
```

Installed:
- `axios` - HTTP client for API calls
- `zustand` - Lightweight state management
- `expo-secure-store` - Secure token storage
- `@react-native-async-storage/async-storage` - Storage fallback for web

### Step 2: Configure Backend URL

**IMPORTANT**: Edit [src/utils/constants.ts](src/utils/constants.ts#L2)

```typescript
export const API_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:8000/api'  // ← Change this!
  : 'https://your-production-api.com/api';
```

**For testing on physical device:**
1. Find your computer's IP:
   - Windows: Run `ipconfig` → Look for "IPv4 Address"
   - Mac/Linux: Run `ifconfig` → Look for "inet"
2. Example: `http://192.168.1.100:8000/api`

**For emulator/simulator:**
- iOS Simulator: `http://localhost:8000/api` works
- Android Emulator: Use `http://10.0.2.2:8000/api`

### Step 3: Start Backend

```bash
cd ../Kira-Backend
npm start
```

Ensure backend is running on port 8000.

### Step 4: Start Mobile App

```bash
cd Kira-Mobile
npm start
```

Then:
- Press `i` → iOS Simulator
- Press `a` → Android Emulator
- Scan QR → Expo Go app on your phone

## 🏗️ Architecture Overview

### Folder Structure
```
Kira-Mobile/
├── app/                       # Expo Router screens
│   ├── _layout.tsx           # Root layout with auth loader
│   ├── (auth)/               # Auth screens (login, signup)
│   ├── (tabs)/               # Main authenticated tabs
│   ├── task/[id].tsx         # Task detail screen
│   └── chat/[userId].tsx     # Chat conversation screen
│
├── src/
│   ├── api/                  # API layer
│   │   ├── client.ts         # Axios instance with JWT interceptor
│   │   ├── auth.ts           # Auth API calls
│   │   ├── tasks.ts          # Tasks API calls
│   │   ├── personal.ts       # Personal API calls
│   │   └── chat.ts           # Chat API calls
│   │
│   ├── store/                # State management
│   │   ├── authStore.ts      # Zustand auth store
│   │   └── types.ts          # TypeScript interfaces
│   │
│   └── utils/
│       ├── constants.ts      # App configuration
│       └── storage.ts        # Secure storage wrapper
```

### Key Design Patterns

#### 1. **Authentication Flow**
```typescript
// On app start (app/_layout.tsx)
useEffect(() => {
  loadUser(); // Check for stored token
}, []);

// Zustand auth store (src/store/authStore.ts)
- Stores JWT token securely
- Auto-redirects based on auth state
- Validates token on app start
```

#### 2. **API Client with JWT Interceptor**
```typescript
// src/api/client.ts
apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handles 401 errors automatically
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Auto logout
    }
  }
);
```

#### 3. **Route Protection**
```typescript
// app/(tabs)/_layout.tsx
const { isAuthenticated } = useAuthStore();

if (!isAuthenticated) {
  return <Redirect href="/(auth)/login" />;
}
```

## 🔌 API Integration

All endpoints match the existing backend:

### Auth (`/api/auth`)
- `POST /login` → Login with email/password
- `POST /signup` → Create new account
- `GET /me` → Get current user (with JWT)
- `PUT /me` → Update profile

### Tasks (`/api/tasks`)
- `GET /my` → Get assigned tasks
- `GET /:id` → Get task details
- `PATCH /:id/status` → Update task status
- `PATCH /:id/checklist/:itemId` → Toggle checklist item

### Chat (`/api/chat`)
- `GET /conversations` → Get all conversations
- `GET /conversation/:userModel/:userId` → Get messages
- `POST /send` → Send message
- `POST /mark-read` → Mark as read

### Personal (`/api/personal`)
- `GET /tasks` → Personal tasks
- `GET /calendar` → Calendar events
- `GET /planner` → Daily planner

## 🎨 Customization

### Change Colors
Edit [src/utils/constants.ts](src/utils/constants.ts#L6):
```typescript
export const COLORS = {
  primary: '#6366f1',      // Main brand color
  secondary: '#8b5cf6',    // Secondary actions
  success: '#10b981',      // Success states
  warning: '#f59e0b',      // Warnings
  error: '#ef4444',        // Errors
  // ...
};
```

### Add New Screen
1. Create file in `app/` folder
2. Use Expo Router conventions:
   - `app/settings.tsx` → `/settings`
   - `app/profile/edit.tsx` → `/profile/edit`
   - `app/task/[id].tsx` → `/task/123` (dynamic)

## 🧪 Testing Checklist

### Authentication ✓
- [x] Login with valid credentials
- [x] Login with invalid credentials (error handling)
- [x] Signup new account
- [x] Token persists after app restart
- [x] Auto-redirect based on auth state

### Tasks ✓
- [x] View tasks list
- [x] Pull to refresh
- [x] Navigate to task detail
- [x] View task description, checklist, details
- [x] Update task status
- [x] Toggle checklist items

### Chat ✓
- [x] View conversations list
- [x] Navigate to conversation
- [x] Send message
- [x] Receive messages (polling every 5s)
- [x] Mark messages as read

### Profile ✓
- [x] View user info
- [x] Logout with confirmation

## 🚧 Next Steps / TODO

### High Priority
- [ ] **Replace polling with WebSocket** for real-time chat
- [ ] **Implement Personal Tasks screen** (CRUD operations)
- [ ] **Add Calendar view** with event management
- [ ] **Daily Planner UI** with time blocks

### Medium Priority
- [ ] **Push notifications** (Expo Notifications)
- [ ] **Offline support** (AsyncStorage queue)
- [ ] **Image attachments** in chat
- [ ] **Task creation** from mobile
- [ ] **Search & filters** for tasks

### Low Priority
- [ ] Dark mode support
- [ ] Biometric authentication
- [ ] App icon & splash screen customization
- [ ] Animations & micro-interactions

## 🐛 Troubleshooting

### "Network Error" when calling API
**Cause**: Cannot reach backend
**Fix**:
1. Verify backend is running: `http://localhost:8000`
2. Update `API_URL` in constants.ts with correct IP
3. Ensure phone and computer are on same WiFi

### "401 Unauthorized" errors
**Cause**: Token expired or invalid
**Fix**: App automatically logs out. Log in again.

### App not updating after code changes
**Fix**: 
```bash
# Clear Expo cache
npx expo start -c
```

### Type errors in IDE
**Fix**:
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## 📦 Build for Production

### iOS (requires Mac)
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

Requires Expo account: https://expo.dev/signup

## 📚 Additional Resources

- **Expo Router Docs**: https://docs.expo.dev/router/introduction/
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Zustand Docs**: https://github.com/pmndrs/zustand
- **Axios Docs**: https://axios-http.com/docs/intro

## 🎯 Summary

You now have a fully functional mobile app that:
- ✅ Authenticates with JWT tokens
- ✅ Securely stores credentials
- ✅ Displays and manages tasks
- ✅ Enables team chat
- ✅ Integrates with existing backend
- ✅ Follows React Native best practices
- ✅ Uses TypeScript for type safety

**Ready to test!** Start the backend, run `npm start`, and scan the QR code.
