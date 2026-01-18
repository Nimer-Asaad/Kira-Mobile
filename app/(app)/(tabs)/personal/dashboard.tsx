import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { personalTasksApi } from "../../../../src/api/personal";
import { Task } from "../../../../src/api/types";
import { useAuth } from "../../../../src/auth/AuthContext";
import { TaskCard } from "../../../../src/components/TaskCard";
import { COLORS } from "../../../../src/utils/constants";

export default function PersonalDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await personalTasksApi.getAll();
      const mapped: Task[] = (data || []).map((p: any) => ({
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
    } catch (err) {
      console.error("Failed to load personal dashboard tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status !== "completed").length;
    const today = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      const today = new Date();
      d.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;
    return { total, completed, pending, today };
  }, [tasks]);

  if (!user) return null;

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personal Dashboard</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>{stats.pending}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{stats.completed}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>{stats.today}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Tasks</Text>
      <FlatList
        data={tasks
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 10)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() =>
              router.push(`/(app)/(tabs)/tasks/${item._id}` as any)
            }
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tasks</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  statCard: { alignItems: "center" },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  statValue: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  sectionTitle: {
    padding: 16,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  empty: { padding: 16, color: COLORS.textSecondary },
});
