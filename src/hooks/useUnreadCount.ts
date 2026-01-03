import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { chatApi } from '../api/chat';
import { getErrorMessage } from '../api/client';

/**
 * Hook to poll unread count every 5 seconds
 * Returns unread count and handles polling in background/foreground
 */
export const useUnreadCount = (enabled = true) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      const count = await chatApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Fetch immediately
    fetchUnreadCount();
    
    // Then poll every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 5000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }

    startPolling();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stopPolling();
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const handleAppStateChange = (state: AppStateStatus) => {
    appState.current = state;

    if (state === 'active') {
      // App came to foreground - restart polling
      startPolling();
    } else {
      // App went to background - stop polling
      stopPolling();
    }
  };

  return {
    unreadCount,
    loading,
    refetch: fetchUnreadCount,
  };
};
