import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function SectionBlock({ children, subtitle, title }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function SectionEmptyState({ message }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  title: {
    color: '#1f2933',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  subtitle: {
    color: '#98a3af',
    fontSize: 11,
    fontWeight: '400',
  },
  emptyContainer: {
    backgroundColor: '#f6f8fb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyText: {
    color: '#6f7b88',
    fontSize: 13,
    fontWeight: '500',
  },
});
