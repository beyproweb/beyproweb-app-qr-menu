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
    gap: 9,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: '#222b35',
  },
  chipLabel: {
    color: '#5e6a77',
    fontSize: 13,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: '#ffffff',
  },
});
