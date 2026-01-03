import { Stack, useLocalSearchParams } from 'expo-router';
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
import { getErrorMessage } from '../../src/api/client';
import { tasksApi } from '../../src/api/tasks';
import { Task } from '../../src/api/types';
import { Badge } from '../../src/components/Badge';
import { ChecklistItem } from '../../src/components/ChecklistItem';
import { COLORS } from '../../src/utils/constants';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadTask = async () => {
    try {
      const data = await tasksApi.getTaskById(id!);
      setTask(data);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;

    setUpdating(true);
    try {
      const updatedTask = await tasksApi.updateTaskStatus(task._id, newStatus);
      setTask(updatedTask);
      Alert.alert('Success', 'Task status updated');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  const handleChecklistToggle = async (itemId: string, completed: boolean) => {
    if (!task) return;

    // Optimistic update
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
      // Rollback on failure
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
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: task.title }} />

      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        
        {task.priority && <Badge type="priority" value={task.priority} />}
        <Badge type="status" value={task.status} />
      </View>

      {task.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        {task.dueDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {task.assignedBy && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned By:</Text>
            <Text style={styles.detailValue}>{task.assignedBy.name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>
            {new Date(task.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {task.checklist && task.checklist.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          {task.checklist.map((item) => (
            <ChecklistItem
              key={item._id}
              item={item}
              onToggle={handleChecklistToggle}
              disabled={updating}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[styles.statusButton, task.status === 'pending' && styles.statusButtonActive]}
            onPress={() => handleStatusChange('pending')}
            disabled={updating}
          >
            <Text style={[styles.statusButtonText, task.status === 'pending' && styles.statusButtonTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, task.status === 'in-progress' && styles.statusButtonActive]}
            onPress={() => handleStatusChange('in-progress')}
            disabled={updating}
          >
            <Text style={[styles.statusButtonText, task.status === 'in-progress' && styles.statusButtonTextActive]}>
              In Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, task.status === 'completed' && styles.statusButtonActive]}
            onPress={() => handleStatusChange('completed')}
            disabled={updating}
          >
            <Text style={[styles.statusButtonText, task.status === 'completed' && styles.statusButtonTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark || '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#e0e0e0',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
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
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark || '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  statusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusButtonTextActive: {
    color: '#fff',
  },
});
