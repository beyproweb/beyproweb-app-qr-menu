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
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  title: {
    color: '#151c24',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#7d8895',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    backgroundColor: '#f6f8fb',
    borderColor: '#e4e9ef',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyText: {
    color: '#6c7784',
    fontSize: 13,
    fontWeight: '500',
  },
});
