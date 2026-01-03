# File Movement Reference

## Quick Reference: Where Files Moved

### Components
| Old Location | New Location | Status |
|-------------|-------------|---------|
| `/components/hello-wave.tsx` | `src/components/hello-wave.tsx` | ✅ Copied |
| `/components/haptic-tab.tsx` | `src/components/haptic-tab.tsx` | ✅ Copied |
| `/components/parallax-scroll-view.tsx` | `src/components/parallax-scroll-view.tsx` | ✅ Copied |
| `/components/themed-text.tsx` | `src/components/themed-text.tsx` | ✅ Copied |
| `/components/themed-view.tsx` | `src/components/themed-view.tsx` | ✅ Copied |
| `/components/ui/collapsible.tsx` | `src/components/ui/collapsible.tsx` | ✅ Copied |
| `/components/ui/icon-symbol.tsx` | `src/components/ui/icon-symbol.tsx` | ✅ Copied |
| `/components/ui/icon-symbol.ios.tsx` | `src/components/ui/icon-symbol.ios.tsx` | ✅ Copied |

### Hooks
| Old Location | New Location | Status |
|-------------|-------------|---------|
| `/hooks/use-color-scheme.ts` | `src/hooks/use-color-scheme.ts` | ✅ Copied |
| `/hooks/use-color-scheme.web.ts` | `src/hooks/use-color-scheme.web.ts` | ✅ Copied |
| `/hooks/use-theme-color.ts` | `src/hooks/use-theme-color.ts` | ✅ Copied |

### State Management
| Old Location | New Location | Status | Notes |
|-------------|-------------|---------|-------|
| `src/store/authStore.ts` | `src/auth/AuthContext.tsx` | ✅ Migrated | Zustand → React Context |
| `src/store/types.ts` | `src/api/types.ts` | ✅ Moved | Consolidated with API types |
| `src/store/` directory | - | ✅ Deleted | No longer needed |

### Theme & Constants
| Old Location | New Location | Status | Notes |
|-------------|-------------|---------|-------|
| `/constants/theme.ts` | `src/theme/index.ts` | ✅ Merged | Unified with COLORS/SPACING |
| `src/utils/constants.ts` | `src/utils/constants.ts` | ✅ Updated | Re-exports from theme |

### New Files Created
| File Path | Purpose |
|-----------|---------|
| `src/theme/index.ts` | Centralized design system (COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS) |
| `src/auth/AuthContext.tsx` | React Context for authentication (replaces Zustand) |
| `src/api/types.ts` | All TypeScript type definitions in one place |
| `src/api/apiPaths.ts` | Centralized API endpoint mapping |
| `src/components/index.ts` | Barrel export for components |
| `src/components/ui/index.ts` | Barrel export for UI components |
| `src/hooks/index.ts` | Barrel export for hooks |
| `RESTRUCTURE_SUMMARY.md` | This documentation |

### Existing Files Updated

#### App Screens (9 files)
| File | Changes |
|------|---------|
| `app/_layout.tsx` | ✅ Wrapped with AuthProvider, updated imports to `@/src/hooks` and `@/src/auth/AuthContext` |
| `app/(auth)/_layout.tsx` | ✅ Changed from `useAuthStore` to `useAuth` |
| `app/(auth)/login.tsx` | ✅ Uses `useAuth` hook from AuthContext |
| `app/(auth)/signup.tsx` | ✅ Uses `useAuth` hook from AuthContext |
| `app/(tabs)/_layout.tsx` | ✅ Uses `useAuth` instead of `useAuthStore` |
| `app/(tabs)/index.tsx` | ✅ Updated import: `Task` from `../../src/api/types` |
| `app/(tabs)/chat.tsx` | ✅ Updated import: `Conversation` from `../../src/api/types` |
| `app/(tabs)/profile.tsx` | ✅ Uses `useAuth` hook |
| `app/task/[id].tsx` | ✅ Updated import: `Task` from `../../src/api/types` |
| `app/chat/[userId].tsx` | ✅ Uses `useAuth`, updated import: `Message` from `../../src/api/types` |

#### API Files (4 files)
| File | Changes |
|------|---------|
| `src/api/auth.ts` | ✅ Updated to use `API_PATHS.AUTH.*` endpoints, imports from `./types` |
| `src/api/tasks.ts` | ✅ Updated to use `API_PATHS.TASKS.*` endpoints, imports from `./types` |
| `src/api/chat.ts` | ✅ Updated to use `API_PATHS.CHAT.*` endpoints, imports from `./types` |
| `src/api/personal.ts` | ✅ Updated 13 endpoints to use `API_PATHS.PERSONAL.*`, imports from `./types` |

### Import Path Migration Examples

#### Authentication
```diff
- import { useAuthStore } from '../../src/store/authStore';
- const { login, user, logout } = useAuthStore();
+ import { useAuth } from '../../src/auth/AuthContext';
+ const { login, user, logout } = useAuth();
```

#### Types
```diff
- import { Task } from '../../src/store/types';
+ import { Task } from '../../src/api/types';
```

#### API Endpoints
```diff
- const response = await apiClient.get('/api/tasks');
+ import { API_PATHS } from './apiPaths';
+ const response = await apiClient.get(API_PATHS.TASKS.MY_TASKS);
```

#### Theme/Constants
```diff
- import { COLORS } from '../../src/utils/constants';
+ import { COLORS } from '../../src/utils/constants'; // Now re-exported from theme
// Or directly:
+ import { COLORS, SPACING, TYPOGRAPHY } from '../../src/theme';
```

## Folder Size Comparison

### Before
```
/components         (8 files, ~400 lines)
/hooks              (3 files, ~80 lines)
/constants          (1 file, ~50 lines)
src/store           (2 files, ~150 lines)
src/api             (5 files, ~300 lines)
src/utils           (2 files, ~100 lines)
```

### After
```
src/components      (8 files, ~400 lines) [+ index.ts barrel export]
src/hooks           (3 files, ~80 lines) [+ index.ts barrel export]
src/theme           (1 file, ~120 lines) [unified design system]
src/auth            (1 file, ~90 lines) [AuthContext replaces authStore]
src/api             (7 files, ~500 lines) [+types.ts, +apiPaths.ts]
src/utils           (2 files, ~100 lines) [constants.ts now re-exports theme]
src/features        (empty, ready for future modules)
```

## Root Level Files (Unchanged)
- `/app/*` - All Expo Router screens remain in place (only imports updated)
- `/assets/*` - Static assets unchanged
- `/scripts/*` - Scripts unchanged
- `package.json` - No changes needed
- `tsconfig.json` - No changes needed
- All documentation files (README, SETUP_GUIDE, etc.)

## Verification Checklist

✅ All screen files updated with new imports
✅ All API files using centralized API_PATHS
✅ All type imports point to src/api/types
✅ AuthContext replaces Zustand store everywhere
✅ Theme system unified and re-exported properly
✅ Barrel exports created for easy importing
✅ Old src/store/ folder deleted
✅ No TypeScript errors
✅ App structure follows best practices

## Next Steps to Run

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Test key flows**:
   - Login/Signup (uses AuthContext)
   - Task list (uses API_PATHS)
   - Chat (uses API_PATHS and AuthContext)
   - Profile (uses AuthContext)

3. **Optional cleanup**:
   - Remove old `/components`, `/hooks`, `/constants` folders if desired
   - Update documentation files to reflect new structure

The restructuring is complete and the app is ready to run! 🎉
