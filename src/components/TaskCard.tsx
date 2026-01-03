import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../api/types';
import { COLORS } from '../utils/constants';
import { Badge } from './Badge';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/task/${task._id}` as any);
    }
  };

  const getProgressPercentage = () => {
    if (!task.checklist || task.checklist.length === 0) return 0;
    const completed = task.checklist.filter((item) => item.completed).length;
    return Math.round((completed / task.checklist.length) * 100);
  };

  const progressPercentage = getProgressPercentage();

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        {task.priority && <Badge type="priority" value={task.priority} />}
      </View>

      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      <View style={styles.footer}>
        <Badge type="status" value={task.status} />

        {task.dueDate && (
          <Text style={styles.dueDate}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {task.checklist && task.checklist.length > 0 && (
        <View style={styles.checklistSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.checklistProgress}>
            {progressPercentage}% ({task.checklist.filter((i) => i.completed).length}/{task.checklist.length})
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  checklistSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success || '#4CAF50',
  },
  checklistProgress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
});
