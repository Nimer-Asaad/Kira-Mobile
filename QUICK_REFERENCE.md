# 🚀 Kira Mobile - Quick Reference

## 📱 Run the App

```bash
# 1. Configure API URL in src/utils/constants.ts
export const API_URL = 'http://YOUR_IP:8000/api';

# 2. Start backend
cd ../Kira-Backend && npm start

# 3. Start mobile app
cd Kira-Mobile && npm start

# 4. Press 'i' (iOS) or 'a' (Android) or scan QR
```

## 🗺️ Screen Routes

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/(auth)/login` | Email/password login |
| Signup | `/(auth)/signup` | New user registration |
| Tasks | `/(tabs)/` | Assigned tasks list |
| Personal | `/(tabs)/personal` | Personal productivity |
| Chat | `/(tabs)/chat` | Conversations list |
| Profile | `/(tabs)/profile` | User settings |
| Task Detail | `/task/[id]` | Task details & management |
| Conversation | `/chat/[userId]` | Chat with user |

## 🔧 Project Structure

```
src/
├── api/           # API clients (auth, tasks, chat, personal)
├── store/         # Zustand state management
├── utils/         # Constants, storage helpers
└── components/    # Reusable UI components (future)

app/
├── (auth)/        # Auth flow screens
├── (tabs)/        # Main app tab screens
├── task/          # Task detail screens
└── chat/          # Chat screens
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/api/client.ts` | Axios + JWT interceptor |
| `src/store/authStore.ts` | Auth state (Zustand) |
| `src/store/types.ts` | TypeScript types |
| `src/utils/constants.ts` | **API URL config** |
| `app/_layout.tsx` | Root layout + auth loader |

## 🎨 Customization

### Change Colors
```typescript
// src/utils/constants.ts
export const COLORS = {
  primary: '#6366f1',    // Your brand color
  // ...
};
```

### Change API URL
```typescript
// src/utils/constants.ts
export const API_URL = 'http://192.168.1.100:8000/api';
```

## 🔐 Authentication Flow

```
1. App starts → loadUser()
2. Check SecureStore for token
3. If token exists → validate with /api/auth/me
4. Valid? → Navigate to /(tabs)
5. Invalid? → Navigate to /(auth)/login
6. After login → Store token + Navigate to /(tabs)
```

## 📡 API Integration

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Signup
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Tasks
- `GET /api/tasks/my` - My tasks
- `GET /api/tasks/:id` - Task detail
- `PATCH /api/tasks/:id/status` - Update status
- `PATCH /api/tasks/:id/checklist/:itemId` - Toggle checklist

### Chat
- `GET /api/chat/conversations` - All conversations
- `GET /api/chat/conversation/:model/:id` - Messages
- `POST /api/chat/send` - Send message
- `POST /api/chat/mark-read` - Mark as read

## 🐛 Common Issues

### "Network Error"
```bash
# Fix: Use correct IP in constants.ts
# Find IP: ipconfig (Windows) or ifconfig (Mac/Linux)
```

### "Unauthorized" errors
```bash
# Fix: Token expired, logout and login again
# Auto-handled by 401 interceptor
```

### App not updating
```bash
# Fix: Clear cache
npx expo start -c
```

## 📦 Installed Packages

```json
{
  "axios": "HTTP client",
  "zustand": "State management",
  "expo-secure-store": "Secure token storage",
  "expo-router": "File-based navigation"
}
```

## ✅ What Works

- ✅ Login / Signup / Logout
- ✅ JWT token persistence
- ✅ Tasks list & detail
- ✅ Task status updates
- ✅ Checklist management
- ✅ Chat conversations & messaging
- ✅ User profile display
- ✅ Pull-to-refresh
- ✅ Error handling
- ✅ Empty states

## 🚧 TODO (Quick Wins)

1. **Personal Tasks UI** (API ready)
2. **Calendar View** (API ready)
3. **Daily Planner** (API ready)
4. **WebSocket Chat** (replace polling)
5. **Push Notifications**

## 📖 Documentation

- [README.md](README.md) - Overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Complete feature list

## 🎯 Testing Checklist

- [ ] Login with valid credentials
- [ ] View tasks list
- [ ] Open task detail
- [ ] Update task status
- [ ] Toggle checklist item
- [ ] View chat conversations
- [ ] Send a message
- [ ] View profile
- [ ] Logout

---

**Ready to go! Start the backend, run `npm start`, and scan the QR code.**
