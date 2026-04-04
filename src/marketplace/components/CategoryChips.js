import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

export function CategoryChips({ categories, onSelectCategory, selectedCategory }) {
  const list = Array.isArray(categories) ? categories : [];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {list.map((category) => {
        const isActive = category.id === selectedCategory;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelectCategory?.(category.id)}
            style={[styles.chip, isActive ? styles.chipActive : null]}
          >
            <Text style={[styles.chipLabel, isActive ? styles.chipLabelActive : null]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: '#f3f6f9',
    borderColor: '#e5eaf0',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: '#1a1f26',
    borderColor: '#1a1f26',
  },
  chipLabel: {
    color: '#475361',
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: '#ffffff',
  },
});
