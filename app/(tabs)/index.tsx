import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getErrorMessage } from "../../src/api/client";
import { tasksApi } from "../../src/api/tasks";
import { Task } from "../../src/api/types";
import { TaskCard } from "../../src/components/TaskCard";
import { ThemeSettings } from "../../src/components/ThemeSettings";
import { useThemedColors } from "../../src/hooks/use-themed-colors";
import { COLORS } from "../../src/utils/constants";

export default function TasksScreen() {
  const themedColors = useThemedColors();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const router = useRouter();

  const loadTasks = async () => {
    try {
      setError(null);
      const data = await tasksApi.getMyTasks();
      setTasks(data);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      console.error("Failed to load tasks:", errorMsg);
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
      onPress={() => router.push(`/task/${item._id}` as any)}
    />
  );

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: themedColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themedColors.tint} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themedColors.background }]}
    >
      <View
        style={[styles.header, { borderBottomColor: themedColors.icon + "20" }]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: themedColors.text }]}>
              My Tasks
            </Text>
            <Text style={[styles.headerSubtitle, { color: themedColors.icon }]}>
              {tasks.length} tasks assigned
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: "#FFD93D",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 12,
              borderWidth: 2,
              borderColor: "#FF6B6B",
            }}
            onPress={() => {
              console.log("Theme button tapped");
              setShowThemeModal(true);
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>🎨</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: themedColors.tint + "20" },
          ]}
        >
          <Text style={[styles.errorText, { color: themedColors.tint }]}>
            {error}
          </Text>
        </View>
      )}

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

      {/* Theme Settings Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: themedColors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: themedColors.background,
                borderBottomColor: themedColors.icon + "20",
              },
            ]}
          >
            <TouchableOpacity onPress={() => setShowThemeModal(false)}>
              <Text
                style={[styles.modalCloseButton, { color: themedColors.tint }]}
              >
                Done
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themedColors.text }]}>
              Appearance Settings
            </Text>
            <View style={{ width: 50 }} />
          </View>
          <ThemeSettings />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark || "#f5f5f5",
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
    borderBottomColor: COLORS.border || "#e0e0e0",
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
  errorBanner: {
    backgroundColor: "#ffebee",
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error || "#F44336",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
});
