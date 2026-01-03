import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/constants';

interface BadgeProps {
  type: 'status' | 'priority';
  value: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  const getColor = () => {
    if (type === 'status') {
      switch (value) {
        case 'completed':
          return COLORS.success || '#4CAF50';
        case 'in-progress':
          return COLORS.warning || '#FF9800';
        case 'pending':
        default:
          return COLORS.textSecondary || '#9E9E9E';
      }
    } else {
      // priority
      switch (value) {
        case 'high':
          return COLORS.error || '#F44336';
        case 'medium':
          return COLORS.warning || '#FF9800';
        case 'low':
        default:
          return COLORS.textSecondary || '#9E9E9E';
      }
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <Text style={styles.badgeText}>{value.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
