import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function FeatureBadgeList({ badges, compact }) {
  const list = Array.isArray(badges) ? badges : [];
  if (!list.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {list.map((badge) => (
        <View key={badge} style={[styles.badge, compact ? styles.badgeCompact : null]}>
          <Text numberOfLines={1} style={[styles.badgeText, compact ? styles.badgeTextCompact : null]}>
            {badge}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#eef1f5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  badgeCompact: {
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#46525f',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  badgeTextCompact: {
    fontSize: 10,
  },
});
