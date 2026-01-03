import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getErrorMessage } from '../../../../src/api/client';
import { tasksApi } from '../../../../src/api/tasks';
import { Task as TaskType } from '../../../../src/api/types';
import { Badge } from '../../../../src/components/Badge';
import { ChecklistItem } from '../../../../src/components/ChecklistItem';
import { COLORS } from '../../../../src/utils/constants';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<TaskType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    try {
      const fetchTask = async () => {
        const data = await tasksApi.getTaskById(id);
        setTask(data);
      };
      fetchTask();
    } catch (error) {
      console.error('Failed to load task:', getErrorMessage(error));
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
      const response = await tasksApi.updateChecklistItem(task._id, itemId, completed);
      setTask(response);
    } catch (error) {
      setTask(previousTask);
      Alert.alert('Error', getErrorMessage(error));
    }
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completedItems = task.checklist?.filter((item) => item.completed).length ?? 0;
  const totalItems = task.checklist?.length ?? 0;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
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
                onToggle={(itemId, completed) => handleChecklistToggle(itemId, completed)}
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
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: 'bold',
    color: COLORS.text,
  },
  badgeContainer: {
    flexDirection: 'row',
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
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistProgress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
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
});
