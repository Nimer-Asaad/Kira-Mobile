import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getErrorMessage } from "../../../../src/api/client";
import { personalTasksApi } from "../../../../src/api/personal";
import { tasksApi } from "../../../../src/api/tasks";
import { Task } from "../../../../src/api/types";
import { useAuth } from "../../../../src/auth/AuthContext";
import { TaskCard } from "../../../../src/components/TaskCard";
import { COLORS } from "../../../../src/utils/constants";

export default function TasksListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  // Consider personal mode only when the user's role is explicitly 'personal'
  const isPersonal = user?.role === "personal";

  const loadTasks = async () => {
    try {
      setError(null);
      // Determine if user is in personal workspace
      // Use strict role check here to avoid treating admins as personal when
      // workspaceMode/mode flags may be present for other reasons.
      const isPersonal = user?.role === "personal";

      if (isPersonal) {
        // Load personal tasks and map to Task shape
        const personal = await personalTasksApi.getAll();
        const mapped: Task[] = (personal || []).map((p: any) => ({
          _id: p._id,
          title: p.title,
          description: p.description || "",
          status: p.completed ? "completed" : "pending",
          priority: p.priority,
          dueDate: p.dueDate,
          checklist: p.checklist || [],
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));
        setTasks(mapped);
      } else {
        // Pass user role to get the correct endpoint
        const data = await tasksApi.getMyTasks(user?.role);
        setTasks(data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Failed to load tasks:", getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => router.push(`/(app)/(tabs)/tasks/${item._id}` as any)}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {user?.role === "admin" || user?.role === "hr"
              ? "All Tasks"
              : "My Tasks"}
          </Text>
          <Text style={styles.headerSubtitle}>{tasks.length} tasks</Text>
        </View>
        {(() => {
          // Show button for admin/hr (assign) and personal users (add)
          if (user?.role === "admin" || user?.role === "hr" || isPersonal) {
            return (
              <>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() =>
                    router.push("/(app)/(tabs)/tasks/create" as any)
                  }
                >
                  <Text style={styles.createButtonText}>
                    {isPersonal ? "Add Task" : "Assign Task"}
                  </Text>
                </TouchableOpacity>
                {/* HR-only: View Trainees button */}
                {user?.role === "hr" && (
                  <TouchableOpacity
                    style={[styles.createButton, { marginLeft: 8 }]}
                    onPress={() =>
                      router.push("/(app)/(tabs)/trainee/dashboard" as any)
                    }
                  >
                    <Text style={styles.createButtonText}>Trainees</Text>
                  </TouchableOpacity>
                )}
                {isPersonal && (
                  <TouchableOpacity
                    style={[styles.createButton, { marginLeft: 8 }]}
                    onPress={() =>
                      router.push("/(app)/(tabs)/personal/dashboard" as any)
                    }
                  >
                    <Text style={styles.createButtonText}>Dashboard</Text>
                  </TouchableOpacity>
                )}
              </>
            );
          }
          return null;
        })()}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks assigned</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  errorBanner: {
    backgroundColor: COLORS.error,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
