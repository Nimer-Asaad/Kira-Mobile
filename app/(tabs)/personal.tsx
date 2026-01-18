import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { personalTasksApi } from "../../src/api/personal";
import { PersonalTask } from "../../src/api/types";
import { useAuth } from "../../src/auth/AuthContext";
import { useThemedColors } from "../../src/hooks/use-themed-colors";
import { COLORS } from "../../src/utils/constants";

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  todayTasks: number;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const themedColors = useThemedColors();
  return (
    <View
      style={[
        styles.statCard,
        { borderLeftColor: color, backgroundColor: themedColors.background },
      ]}
    >
      <View style={styles.statCardContent}>
        <Text style={[styles.statLabel, { color: themedColors.text }]}>
          {label}
        </Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <IconSymbol name={icon as any} size={24} color={color} />
    </View>
  );
};

export default function PersonalScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const themedColors = useThemedColors();
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    todayTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if user is not personal role
  useEffect(() => {
    if (user && user.role !== "personal") {
      router.replace("/(tabs)");
    }
  }, [user, router]);

  useEffect(() => {
    // Only personal role users can access this dashboard
    if (user?.role !== "personal") {
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await personalTasksApi.getAll();
      setTasks(fetchedTasks);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTasks = fetchedTasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });

      setStats({
        totalTasks: fetchedTasks.length,
        completedTasks: fetchedTasks.filter((t) => t.completed).length,
        pendingTasks: fetchedTasks.filter((t) => !t.completed).length,
        inProgressTasks: 0, // Personal tasks don't have status field, using completed flag
        todayTasks: todayTasks.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const recentTasks = tasks
    .filter((t) => !t.completed)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: themedColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themedColors.tint} />
      </View>
    );
  }

  // If not a personal role user, deny access to personal dashboard
  if (user?.role !== "personal") {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: themedColors.background },
        ]}
      >
        <IconSymbol
          name={"lock.slash" as any}
          size={48}
          color={themedColors.icon}
        />
        <Text style={[styles.emptyStateTitle, { color: themedColors.text }]}>
          Access Restricted
        </Text>
        <Text style={[styles.emptyStateSubtitle, { color: themedColors.icon }]}>
          Personal dashboard is only available for personal workspace users
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themedColors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: themedColors.icon + "20" }]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: themedColors.text }]}>
            Personal Dashboard
          </Text>
          <Text style={[styles.headerSubtitle, { color: themedColors.icon }]}>
            Manage your tasks and track progress
          </Text>
        </View>
        <View style={{ position: "absolute", right: 16, top: 56 }}>
          <TouchableOpacity
            onPress={() => router.push("/(app)/(tabs)/personal/planner" as any)}
            style={[
              styles.plannerButton,
              { backgroundColor: themedColors.tint },
            ]}
          >
            <Text style={styles.plannerButtonText}>Planner</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <StatCard
                label="Total Tasks"
                value={stats.totalTasks}
                icon="checklist"
                color="#4f46e5"
              />
            </View>
            <View style={styles.statsCol}>
              <StatCard
                label="Completed"
                value={stats.completedTasks}
                icon="checkmark.circle.fill"
                color="#10b981"
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <StatCard
                label="Pending"
                value={stats.pendingTasks}
                icon="clock"
                color="#f59e0b"
              />
            </View>
            <View style={styles.statsCol}>
              <StatCard
                label="Today"
                value={stats.todayTasks}
                icon="calendar"
                color="#ef4444"
              />
            </View>
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <View
                style={[styles.summaryIcon, { backgroundColor: "#e0e7ff" }]}
              >
                <Text
                  style={{ color: "#4f46e5", fontSize: 12, fontWeight: "bold" }}
                >
                  T
                </Text>
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryLabel}>Total Tasks</Text>
                <Text style={[styles.summaryValue, { color: "#4f46e5" }]}>
                  {stats.totalTasks}
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View
                style={[styles.summaryIcon, { backgroundColor: "#dcfce7" }]}
              >
                <Text
                  style={{ color: "#10b981", fontSize: 12, fontWeight: "bold" }}
                >
                  C
                </Text>
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryLabel}>Completed</Text>
                <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                  {stats.completedTasks}
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View
                style={[styles.summaryIcon, { backgroundColor: "#fef3c7" }]}
              >
                <Text
                  style={{ color: "#f59e0b", fontSize: 12, fontWeight: "bold" }}
                >
                  P
                </Text>
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
                  {stats.pendingTasks}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Tasks Section */}
        {recentTasks.length > 0 && (
          <View style={styles.recentTasksCard}>
            <View style={styles.recentTasksHeader}>
              <Text style={styles.recentTasksTitle}>Recent Tasks</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentTasks.map((task) => (
              <View key={task._id} style={styles.taskItem}>
                <View style={styles.taskCheckbox}>
                  <IconSymbol
                    name={
                      (task.completed
                        ? "checkmark.circle.fill"
                        : "circle") as any
                    }
                    size={20}
                    color={task.completed ? "#10b981" : COLORS.border}
                  />
                </View>
                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text style={styles.taskDescription} numberOfLines={1}>
                      {task.description}
                    </Text>
                  )}
                  {task.dueDate && (
                    <Text style={styles.taskDueDate}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                {task.priority && (
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          task.priority === "high"
                            ? "#fee2e2"
                            : task.priority === "medium"
                            ? "#fef3c7"
                            : "#dcfce7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color:
                            task.priority === "high"
                              ? "#dc2626"
                              : task.priority === "medium"
                              ? "#f59e0b"
                              : "#10b981",
                        },
                      ]}
                    >
                      {task.priority.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {stats.totalTasks === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              name="checklist"
              size={48}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyStateTitle}>No tasks yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Create your first task to get started
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statsCol: {
    flex: 1,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  plannerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  plannerButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  statCardContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryContent: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  recentTasksCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentTasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentTasksTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  viewAllLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },
  taskDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  taskDueDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
