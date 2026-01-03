# Kira-Mobile Folder Structure Refactoring

## Overview
Successfully restructured Kira-Mobile to follow a feature-based architecture with centralized patterns for maintainability and scalability.

## New Folder Structure

```
Kira-Mobile/
├── app/                           # Expo Router screens (routes only)
│   ├── _layout.tsx               # Root layout with AuthProvider
│   ├── (auth)/                   # Auth screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                   # Main tab screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Tasks list
│   │   ├── chat.tsx              # Conversations list
│   │   └── profile.tsx           # User profile
│   ├── task/[id].tsx            # Task detail screen
│   └── chat/[userId].tsx        # Chat conversation screen
│
├── src/                          # Application logic
│   ├── api/                      # API clients and configuration
│   │   ├── client.ts            # Axios instance with JWT interceptors
│   │   ├── apiPaths.ts          # Centralized API endpoint mapping
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── auth.ts              # Authentication API calls
│   │   ├── tasks.ts             # Task management API calls
│   │   ├── chat.ts              # Chat/messaging API calls
│   │   └── personal.ts          # Personal tasks/calendar/planner API
│   │
│   ├── auth/                     # Authentication logic
│   │   └── AuthContext.tsx      # React Context API for auth state
│   │
│   ├── components/               # Reusable UI components
│   │   ├── index.ts             # Barrel export
│   │   ├── hello-wave.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   ├── themed-text.tsx
│   │   ├── themed-view.tsx
│   │   └── ui/                  # UI-specific components
│   │       ├── index.ts
│   │       ├── collapsible.tsx
│   │       ├── icon-symbol.tsx
│   │       └── icon-symbol.ios.tsx
│   │
│   ├── features/                 # Feature-based modules (future expansion)
│   │   ├── tasks/
│   │   ├── chat/
│   │   └── profile/
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── index.ts
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   │
│   ├── theme/                    # Design system
│   │   └── index.ts             # Centralized theme (colors, spacing, typography)
│   │
│   └── utils/                    # Utility functions
│       ├── constants.ts         # App-wide constants
│       └── storage.ts           # Secure storage wrapper
│
└── Documentation files...
```

## Key Improvements

### 1. Centralized Patterns
- **API Endpoints**: All endpoints now defined in `src/api/apiPaths.ts` for easy maintenance
- **Types**: Consolidated TypeScript interfaces in `src/api/types.ts`
- **Theme System**: Unified design tokens in `src/theme/index.ts` (COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS)

### 2. Authentication Migration
- **Replaced**: Zustand store (`src/store/authStore.ts`)
- **With**: React Context API (`src/auth/AuthContext.tsx`)
- **Benefits**: More React-idiomatic, better for auth state, cleaner provider pattern

### 3. Organized Imports
- **Before**: Components/hooks at root level, scattered imports
- **After**: Organized in `src/` with barrel exports (`index.ts`) for clean imports
- **Example**: `import { HelloWave, ThemedText } from '@/src/components'`

### 4. Feature-Ready Structure
- **src/features/**: Prepared for feature-based architecture (tasks, chat, profile modules)
- Each feature can have its own components, hooks, and logic
- Promotes code isolation and reusability

## Files Moved/Updated

### Created
- `src/theme/index.ts` - Centralized theme configuration
- `src/auth/AuthContext.tsx` - React Context for authentication
- `src/api/types.ts` - Consolidated TypeScript types
- `src/api/apiPaths.ts` - Centralized API endpoint mapping
- `src/components/index.ts` - Barrel export for components
- `src/components/ui/index.ts` - Barrel export for UI components
- `src/hooks/index.ts` - Barrel export for hooks

### Copied from Root
- `/components/*` → `src/components/*`
- `/hooks/*` → `src/hooks/*`
- `/constants/theme.ts` → `src/theme/index.ts` (merged)

### Updated
- `app/_layout.tsx` - Wrapped with AuthProvider, updated imports
- `app/(auth)/_layout.tsx` - Uses useAuth instead of useAuthStore
- `app/(auth)/login.tsx` - Uses useAuth hook
- `app/(auth)/signup.tsx` - Uses useAuth hook
- `app/(tabs)/_layout.tsx` - Uses useAuth
- `app/(tabs)/profile.tsx` - Uses useAuth
- `app/(tabs)/index.tsx` - Updated type imports
- `app/(tabs)/chat.tsx` - Updated type imports
- `app/task/[id].tsx` - Updated type imports
- `app/chat/[userId].tsx` - Uses useAuth, updated type imports
- `src/api/auth.ts` - Uses API_PATHS and new types location
- `src/api/tasks.ts` - Uses API_PATHS and new types location
- `src/api/chat.ts` - Uses API_PATHS and new types location
- `src/api/personal.ts` - Uses API_PATHS throughout (13 endpoints)
- `src/utils/constants.ts` - Re-exports from theme

### Deleted
- `src/store/authStore.ts` - Replaced by AuthContext
- `src/store/types.ts` - Moved to src/api/types.ts
- `src/store/` directory - No longer needed

## Import Path Changes

### Before
```typescript
import { useAuthStore } from '../../src/store/authStore';
import { Task } from '../../src/store/types';
import { COLORS } from '../../src/utils/constants';
```

### After
```typescript
import { useAuth } from '../../src/auth/AuthContext';
import { Task } from '../../src/api/types';
import { COLORS } from '../../src/utils/constants'; // Re-exported from theme
```

## API Endpoint Changes

### Before
```typescript
const response = await apiClient.get(`/api/tasks/${taskId}`);
```

### After
```typescript
import { API_PATHS } from './apiPaths';
const response = await apiClient.get(API_PATHS.TASKS.BY_ID(taskId));
```

## Theme System

### Before (Scattered)
```typescript
// In /constants/theme.ts
export const Colors = { light: {...}, dark: {...} };

// In /src/utils/constants.ts
export const COLORS = { primary: '#6366f1', ... };
```

### After (Unified)
```typescript
// In /src/theme/index.ts
export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  success: '#10b981',
  // ... complete design system
};

export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
};

export const TYPOGRAPHY = {
  fontFamily: { regular: 'System', semiBold: 'System' },
  fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32 },
  fontWeight: { regular: '400', semiBold: '600', bold: '700' }
};

// Backward compatibility
export const Colors = { light: {...}, dark: {...} };
```

## Running the App

The restructuring maintains full functionality. To run:

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm start

# Or run on specific platform
npm run ios
npm run android
npm run web
```

## Next Steps

### Feature Modules (Optional Enhancement)
Create feature-based modules in `src/features/`:

```
src/features/tasks/
├── components/
│   ├── TaskCard.tsx
│   └── TaskList.tsx
├── hooks/
│   └── useTaskFilters.ts
├── api/
│   └── taskHelpers.ts
└── index.ts

src/features/chat/
├── components/
│   ├── MessageBubble.tsx
│   └── ConversationItem.tsx
├── hooks/
│   └── useMessages.ts
└── index.ts
```

### Documentation Updates
The following documentation files reference the old structure and can be updated:
- `IMPLEMENTATION_SUMMARY.md`
- `SETUP_GUIDE.md`
- `QUICK_REFERENCE.md`
- `PROJECT_REPORT.md`

## Benefits of New Structure

1. **Maintainability**: Centralized patterns make changes easier
2. **Scalability**: Feature-based structure supports growth
3. **Type Safety**: Consolidated types prevent inconsistencies
4. **Clean Imports**: Barrel exports reduce import complexity
5. **Best Practices**: Follows React Native community conventions
6. **Developer Experience**: Easier to navigate and understand codebase

## Verification

✅ No TypeScript errors
✅ All imports updated
✅ Authentication working with AuthContext
✅ API calls using centralized API_PATHS
✅ Theme system unified
✅ Old store folder deleted
✅ All screens updated

The app is ready to run with the new structure!
