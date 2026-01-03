import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChecklistItem as ChecklistItemType } from '../api/types';
import { COLORS } from '../utils/constants';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (itemId: string, completed: boolean) => Promise<void>;
  disabled?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle, disabled = false }) => {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleToggle = async () => {
    if (disabled || isUpdating) return;

    setIsUpdating(true);
    try {
      await onToggle(item._id, !item.completed);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      disabled={disabled || isUpdating}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <Text style={[styles.text, item.completed && styles.textCompleted]} numberOfLines={2}>
        {item.text}
      </Text>

      {isUpdating && (
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  loader: {
    marginLeft: 8,
  },
});
