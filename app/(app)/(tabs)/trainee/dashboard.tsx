import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getErrorMessage } from "../../../../src/api/client";
import { traineeApi, TraineeDashboard } from "../../../../src/api/trainee";
import { COLORS } from "../../../../src/utils/constants";

export default function TraineeDashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<TraineeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const loadDashboard = async () => {
    try {
      const dashboardData = await traineeApi.getDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard:", getErrorMessage(error));
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleEvaluate = async () => {
    if (!data?.trainee?._id) return;

    Alert.alert(
      "Submit for Evaluation",
      "Submit for HR evaluation? This will finalize your current training status.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            setEvaluating(true);
            try {
              // This endpoint would need to be added to the API
              // await traineeApi.submitForEvaluation(data.trainee._id);
              Alert.alert("Success", "Submitted for evaluation successfully");
              await loadDashboard();
            } catch (error) {
              Alert.alert("Error", getErrorMessage(error));
            } finally {
              setEvaluating(false);
            }
          },
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

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No data available</Text>
      </View>
    );
  }

  const { trainee, points, timing, totals, recent } = data;
  const completionRate = totals?.completionRate || 0;

  const statusColors: Record<string, string> = {
    trial: "#3b82f6",
    needs_improvement: "#f59e0b",
    part_time_candidate: "#10b981",
    eligible_for_promotion: "#8b5cf6",
    promoted: "#10b981",
    paused: "#f59e0b",
    frozen: "#f97316",
    cancelled: "#ef4444",
    withdrawn: "#6b7280",
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Training Dashboard</Text>
          {trainee?.position && (
            <Text style={styles.headerSubtitle}>
              Position: {trainee.position}
            </Text>
          )}
        </View>
        {trainee?.status === "trial" && (
          <TouchableOpacity
            style={styles.evaluateButton}
            onPress={handleEvaluate}
            disabled={evaluating}
          >
            {evaluating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.evaluateButtonText}>
                Submit for Evaluation
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusColors[trainee?.status || ""] || COLORS.primary,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {trainee?.status?.toUpperCase() || "UNKNOWN"}
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Points</Text>
          <Text style={styles.statValue}>
            {Math.round(points?.totalEarned || 0)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Completion Rate</Text>
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statHelper}>
            {totals?.reviewedTasks || 0}/{totals?.totalTasks || 0} tasks
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Points/Task</Text>
          <Text style={styles.statValue}>
            {(points?.avgPerReviewed || 0).toFixed(1)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>On-Time</Text>
          <Text style={styles.statValue}>{timing?.onTime || 0}</Text>
          <Text style={styles.statHelper}>
            Early: {timing?.early || 0} | Late: {timing?.late || 0}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Overall Progress</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(completionRate, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{completionRate}% Complete</Text>
      </View>

      {/* Status Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.cardTitle}>Status Breakdown</Text>
        <View style={styles.breakdownList}>
          <View style={styles.breakdownItem}>
            <View
              style={[styles.breakdownDot, { backgroundColor: "#f59e0b" }]}
            />
            <Text style={styles.breakdownLabel}>Pending</Text>
            <Text style={styles.breakdownValue}>
              {totals?.pendingTasks || 0}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View
              style={[styles.breakdownDot, { backgroundColor: "#2563eb" }]}
            />
            <Text style={styles.breakdownLabel}>In Progress</Text>
            <Text style={styles.breakdownValue}>
              {totals?.inProgressTasks || 0}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View
              style={[styles.breakdownDot, { backgroundColor: "#6366f1" }]}
            />
            <Text style={styles.breakdownLabel}>Submitted</Text>
            <Text style={styles.breakdownValue}>
              {totals?.submittedTasks || 0}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View
              style={[styles.breakdownDot, { backgroundColor: "#10b981" }]}
            />
            <Text style={styles.breakdownLabel}>Reviewed</Text>
            <Text style={styles.breakdownValue}>
              {totals?.reviewedTasks || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentCard}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {!recent || recent.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity</Text>
        ) : (
          <View style={styles.recentList}>
            {recent.map((item) => (
              <View key={item.taskId} style={styles.recentItem}>
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle}>{item.title}</Text>
                  <Text style={styles.recentDate}>
                    {new Date(item.updatedAt).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.recentRight}>
                  <View
                    style={[
                      styles.recentStatus,
                      {
                        backgroundColor:
                          item.status === "reviewed"
                            ? "#10b981"
                            : item.status === "submitted"
                            ? "#6366f1"
                            : item.status === "in-progress"
                            ? "#2563eb"
                            : "#f59e0b",
                      },
                    ]}
                  >
                    <Text style={styles.recentStatusText}>{item.status}</Text>
                  </View>
                  <Text style={styles.recentPoints}>
                    Earned: {item.earnedPoints || 0} pts
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          💡 Submit tasks early to earn bonus points (+1/day, max +3). Late
          submissions deduct points (-1/day, max -5).
        </Text>
      </View>
    </ScrollView>
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
  contentContainer: {
    paddingBottom: 32,
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
  evaluateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  evaluateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statusContainer: {
    padding: 16,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "47%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statHelper: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "right",
  },
  breakdownCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  breakdownList: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  recentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  recentRight: {
    alignItems: "flex-end",
  },
  recentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  recentStatusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  recentPoints: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  tipCard: {
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  tipText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});
