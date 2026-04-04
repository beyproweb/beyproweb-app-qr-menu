import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export function MarketplaceSearchBar({ onChangeText, value }) {
  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onChangeText={onChangeText}
        placeholder="Search places, food, or experiences"
        placeholderTextColor="#8b95a1"
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f6f8',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#0f1720',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },
  input: {
    color: '#1a232d',
    fontSize: 15,
    fontWeight: '400',
    minHeight: 46,
  },
});
