import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getErrorMessage } from "../../../../src/api/client";
import { personalTasksApi } from "../../../../src/api/personal";
import { tasksApi } from "../../../../src/api/tasks";
import { Task as TaskType } from "../../../../src/api/types";
import { useAuth } from "../../../../src/auth/AuthContext";
import { Badge } from "../../../../src/components/Badge";
import { ChecklistItem } from "../../../../src/components/ChecklistItem";
import { COLORS } from "../../../../src/utils/constants";

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<TaskType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingChecklistIds, setUpdatingChecklistIds] = useState<string[]>(
    []
  );
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const fetchTask = async () => {
      setLoading(true);
      try {
        // Detect personal workspace
        const isPersonal = Boolean(
          (user as any)?.workspaceMode === "personal" ||
            (user as any)?.mode === "personal" ||
            (user as any)?.role === "personal"
        );

        if (isPersonal) {
          // Fetch personal task and map to TaskType (handle either `completed` boolean or `status` string)
          const p = await personalTasksApi.getById(id as string);
          const completedFlag =
            (p as any).completed ?? (p as any).status === "completed";
          const mapped: TaskType = {
            _id: (p as any)._id,
            title: p.title,
            description: p.description || "",
            status: completedFlag ? "completed" : "pending",
            priority: (p as any).priority,
            dueDate: p.dueDate,
            checklist: p.checklist || [],
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString(),
          };
          setTask(mapped);
        } else {
          const data = await tasksApi.getTaskById(id as string);
          setTask(data);
        }
      } catch (error) {
        console.error("Failed to load task:", getErrorMessage(error));
        Alert.alert("Error", "Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, user]);

  const handleChecklistToggle = async (itemId: string, completed: boolean) => {
    if (!task) return;

    const previousTask = task;
    const updatedTask = {
      ...task,
      checklist: task.checklist?.map((item) =>
        item._id === itemId ? { ...item, completed } : item
      ),
    };
    setTask(updatedTask);

    try {
      setUpdatingChecklistIds((s) => [...s, itemId]);
      // If personal task, use personalTasksApi.update
      const isPersonal = Boolean(
        (user as any)?.workspaceMode === "personal" ||
          (user as any)?.mode === "personal" ||
          (user as any)?.role === "personal"
      );

      if (isPersonal) {
        // Update checklist locally and send full checklist to personal API
        const isNowCompleted = updatedTask.checklist?.length
          ? updatedTask.checklist.every((i) => i.completed)
          : false;

        // Send both `completed` boolean and `status` string to match backend expectations
        const response = await personalTasksApi.update(task._id, {
          checklist: updatedTask.checklist,
          completed: isNowCompleted,
          status: isNowCompleted ? "completed" : "pending",
        } as any);

        // Map back to TaskType (handle `completed` or `status` from response)
        const completedResp =
          (response as any).completed ??
          (response as any).status === "completed";
        const mapped: TaskType = {
          _id: response._id,
          title: response.title,
          description: response.description || "",
          status: completedResp ? "completed" : "pending",
          priority: response.priority,
          dueDate: response.dueDate,
          checklist: response.checklist || [],
          createdAt: response.createdAt || new Date().toISOString(),
          updatedAt: response.updatedAt || new Date().toISOString(),
        };
        setTask(mapped);
      } else {
        const response = await tasksApi.updateChecklistItem(
          task._id,
          itemId,
          completed
        );
        setTask(response);
      }
    } catch (error) {
      setTask(previousTask);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setUpdatingChecklistIds((s) => s.filter((id) => id !== itemId));
    }
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This action cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setDeleting(true);
              await tasksApi.deleteTask(task?._id || (id as string));
              Alert.alert("Success", "Task deleted successfully");
              router.back();
            } catch (error) {
              Alert.alert("Error", getErrorMessage(error));
            } finally {
              setDeleting(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completedItems =
    task.checklist?.filter((item) => item.completed).length ?? 0;
  const totalItems = task.checklist?.length ?? 0;
  const progressPercent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          {user?.role === "admin" && (
            <TouchableOpacity
              onPress={handleDeleteTask}
              disabled={deleting}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>
                {deleting ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title}>{task.title}</Text>
      </View>

      {/* Badges */}
      <View style={styles.badgeContainer}>
        {task.priority && <Badge type="priority" value={task.priority} />}
        <Badge type="status" value={task.status} />
      </View>

      {/* Description */}
      {task.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      )}

      {/* Task Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>

        {task.dueDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>
              {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {task.assignedBy && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned By</Text>
            <Text style={styles.detailValue}>{task.assignedBy.name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created</Text>
          <Text style={styles.detailValue}>
            {new Date(task.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Checklist */}
      {task.checklist && task.checklist.length > 0 && (
        <View style={styles.section}>
          <View style={styles.checklistHeader}>
            <Text style={styles.sectionTitle}>Checklist</Text>
            <Text style={styles.checklistProgress}>
              {completedItems}/{totalItems} ({progressPercent}%)
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>

          {/* Checklist Items */}
          <View style={styles.checklistItems}>
            {task.checklist.map((item) => (
              <ChecklistItem
                key={item._id}
                item={item}
                disabled={updatingChecklistIds.includes(item._id)}
                onToggle={(itemId, completed) =>
                  handleChecklistToggle(itemId, completed)
                }
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#fff",
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  checklistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  checklistProgress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  checklistItems: {
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
