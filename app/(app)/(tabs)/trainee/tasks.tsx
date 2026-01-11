import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getErrorMessage } from "../../../../src/api/client";
import { traineeApi, TraineeTask } from "../../../../src/api/trainee";
import { COLORS } from "../../../../src/utils/constants";

export default function TraineeTasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TraineeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [openForms, setOpenForms] = useState<Record<string, boolean>>({});
  const [submissionData, setSubmissionData] = useState<
    Record<string, { repoUrl: string; codeSnippet: string; notes: string }>
  >({});

  const loadTasks = async () => {
    try {
      const data = await traineeApi.getMyTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to load tasks:", getErrorMessage(error));
      Alert.alert("Error", getErrorMessage(error));
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

  const handleSubmitTask = async (taskId: string) => {
    Alert.alert(
      "Submit Task",
      "Submit this task? You can view your points earned after submission.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            try {
              setSubmitting(taskId);
              const data = submissionData[taskId] || {};
              const result = await traineeApi.submitTask(taskId, {
                repoUrl: data.repoUrl || "",
                codeSnippet: data.codeSnippet || "",
                notes: data.notes || "",
              });

              const points = result.points ?? result.task?.earnedPoints ?? 0;
              const breakdown = result.breakdown || {};
              const timing =
                breakdown.earlyBonus > 0
                  ? "early"
                  : breakdown.latePenalty > 0
                  ? "late"
                  : "on time";

              Alert.alert(
                "Task Submitted!",
                `Points: ${points}\n` +
                  `Base: ${breakdown.basePoints || points} | Early bonus: +${
                    breakdown.earlyBonus || 0
                  } | Late penalty: -${breakdown.latePenalty || 0}\n` +
                  `Timing: ${timing}`
              );

              setOpenForms((prev) => ({ ...prev, [taskId]: false }));
              await loadTasks();
            } catch (error) {
              Alert.alert("Error", getErrorMessage(error));
            } finally {
              setSubmitting(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#f59e0b",
      "in-progress": "#2563eb",
      submitted: "#6366f1",
      reviewed: "#10b981",
      completed: "#10b981",
    };
    return colors[status] || COLORS.textSecondary;
  };

  const renderTask = ({ item }: { item: TraineeTask }) => {
    const isFormOpen = openForms[item._id];
    const submission = submissionData[item._id] || {
      repoUrl: "",
      codeSnippet: "",
      notes: "",
    };

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View style={styles.taskInfo}>
          {item.earnedPoints !== undefined && (
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsLabel}>Earned:</Text>
              <Text style={styles.pointsValue}>
                {item.earnedPoints} / {item.maxPoints || 0} pts
              </Text>
            </View>
          )}
          {item.dueDate && (
            <Text style={styles.dueDate}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        {item.status !== "reviewed" &&
          item.status !== "submitted" &&
          item.status !== "completed" && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() =>
                setOpenForms((prev) => ({
                  ...prev,
                  [item._id]: !prev[item._id],
                }))
              }
            >
              <Text style={styles.submitButtonText}>
                {isFormOpen ? "Hide Form" : "Submit Task"}
              </Text>
            </TouchableOpacity>
          )}

        {isFormOpen && (
          <View style={styles.submissionForm}>
            <Text style={styles.formLabel}>Repository URL (optional)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="https://github.com/user/repo"
              value={submission.repoUrl}
              onChangeText={(text) =>
                setSubmissionData((prev) => ({
                  ...prev,
                  [item._id]: { ...submission, repoUrl: text },
                }))
              }
            />

            <Text style={styles.formLabel}>Code Snippet *</Text>
            <TextInput
              style={[styles.formInput, styles.codeInput]}
              placeholder="Paste the core code that solves this task"
              value={submission.codeSnippet}
              onChangeText={(text) =>
                setSubmissionData((prev) => ({
                  ...prev,
                  [item._id]: { ...submission, codeSnippet: text },
                }))
              }
              multiline
              numberOfLines={6}
            />

            <Text style={styles.formLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.formInput, styles.notesInput]}
              placeholder="Any notes to help review"
              value={submission.notes}
              onChangeText={(text) =>
                setSubmissionData((prev) => ({
                  ...prev,
                  [item._id]: { ...submission, notes: text },
                }))
              }
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[
                styles.submitFormButton,
                (!submission.codeSnippet.trim() || submitting === item._id) &&
                  styles.submitFormButtonDisabled,
              ]}
              onPress={() => handleSubmitTask(item._id)}
              disabled={
                !submission.codeSnippet.trim() || submitting === item._id
              }
            >
              {submitting === item._id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitFormButtonText}>
                  Validate & Submit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {item.status === "submitted" && (
          <View style={styles.awaitingReview}>
            <Text style={styles.awaitingReviewText}>Awaiting HR review</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Tasks</Text>
        <Text style={styles.headerSubtitle}>
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </Text>
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
            <Text style={styles.emptyText}>No training tasks assigned</Text>
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
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  taskInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10b981",
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  submissionForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitFormButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitFormButtonDisabled: {
    opacity: 0.5,
  },
  submitFormButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  awaitingReview: {
    backgroundColor: "#e9d5ff",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  awaitingReviewText: {
    color: "#7c3aed",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
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
});
