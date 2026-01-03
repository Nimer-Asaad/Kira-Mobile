import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { API_PATHS } from '../../src/api/apiPaths';
import axiosInstance from '../../src/api/axiosInstance';
import { useAuth } from '../../src/auth/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/theme';

interface ApiResponse {
  status: number;
  statusText: string;
  data: unknown;
  headers: Record<string, unknown>;
}

interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
  isNetworkError?: boolean;
}

export default function ApiTestScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [endpoint, setEndpoint] = useState(API_PATHS.AUTH.ME);
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');

  const testApiCall = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let result: ApiResponse;

      if (method === 'GET') {
        result = await axiosInstance.get(endpoint);
      } else if (method === 'POST') {
        const body = requestBody ? JSON.parse(requestBody) : {};
        result = await axiosInstance.post(endpoint, body);
      } else if (method === 'PUT') {
        const body = requestBody ? JSON.parse(requestBody) : {};
        result = await axiosInstance.put(endpoint, body);
      } else if (method === 'PATCH') {
        const body = requestBody ? JSON.parse(requestBody) : {};
        result = await axiosInstance.patch(endpoint, body);
      } else if (method === 'DELETE') {
        result = await axiosInstance.delete(endpoint);
      } else {
        throw new Error('Invalid method');
      }

      setResponse({
        status: result.status,
        statusText: result.statusText,
        data: result.data,
        headers: result.headers,
      });
    } catch (err) {
      const error = err as any;
      setError({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        isNetworkError: error.isNetworkError,
      });

      if (error.response?.status === 401) {
        Alert.alert('Unauthorized', 'Your session has expired. Please log in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const testEndpoints = [
    { label: 'GET /auth/me', endpoint: API_PATHS.AUTH.ME, method: 'GET' },
    { label: 'GET /tasks/my', endpoint: API_PATHS.TASKS.MY, method: 'GET' },
    { label: 'GET /chat/conversations', endpoint: API_PATHS.CHAT.CONVERSATIONS, method: 'GET' },
    { label: 'GET /personal/tasks', endpoint: API_PATHS.PERSONAL.TASKS.LIST, method: 'GET' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>API Connectivity Test</Text>
        <Text style={styles.subtitle}>
          {user?.name ? `Logged in as: ${user.name}` : 'Not authenticated'}
        </Text>
      </View>

      {/* Quick Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tests</Text>
        {testEndpoints.map((test, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.quickTestButton}
            onPress={() => {
              setEndpoint(test.endpoint);
              setMethod(test.method);
              setRequestBody('');
            }}
          >
            <Text style={styles.quickTestButtonText}>{test.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Manual Test Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Test</Text>

        {/* Method Selector */}
        <View style={styles.methodRow}>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.methodButton,
                method === m && styles.methodButtonActive,
              ]}
              onPress={() => setMethod(m)}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  method === m && styles.methodButtonTextActive,
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Endpoint Input */}
        <Text style={styles.label}>Endpoint:</Text>
        <TextInput
          style={styles.input}
          placeholder="/api/endpoint"
          value={endpoint}
          onChangeText={setEndpoint}
          placeholderTextColor={COLORS.textSecondary}
        />

        {/* Request Body Input */}
        {method !== 'GET' && method !== 'DELETE' && (
          <>
            <Text style={styles.label}>Request Body (JSON):</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder='{"key": "value"}'
              value={requestBody}
              onChangeText={setRequestBody}
              multiline
              placeholderTextColor={COLORS.textSecondary}
            />
          </>
        )}

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={testApiCall}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.sendButtonText}>Send Request</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Response Display */}
      {response && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Response</Text>
          <View style={styles.responseBox}>
            <Text style={styles.responseLabel}>Status: {response.status} {response.statusText}</Text>
            <Text style={styles.responseCode}>{JSON.stringify(response.data, null, 2)}</Text>
          </View>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error</Text>
          <View style={[styles.responseBox, styles.errorBox]}>
            <Text style={styles.errorLabel}>
              {error.isNetworkError ? 'Network Error' : `Status: ${error.status}`}
            </Text>
            <Text style={styles.errorCode}>{error.message}</Text>
            {error.data ? (
              <Text style={styles.errorCode}>
                {typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2)}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* API Config Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <View style={styles.configBox}>
          <Text style={styles.configText}>
            Base URL: {process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}
          </Text>
          <Text style={styles.configText}>
            Auth Token: {user ? 'Present' : 'Not set'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.sm,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  methodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodButtonText: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  methodButtonTextActive: {
    color: COLORS.text,
  },
  quickTestButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  quickTestButtonText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  responseBox: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    maxHeight: 300,
  },
  errorBox: {
    borderLeftColor: COLORS.error,
  },
  responseLabel: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  errorLabel: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  responseCode: {
    fontFamily: 'Courier New',
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
  },
  errorCode: {
    fontFamily: 'Courier New',
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
  },
  configBox: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: SPACING.md,
  },
  configText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontFamily: 'Courier New',
  },
});
