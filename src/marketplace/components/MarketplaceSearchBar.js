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
        placeholder="Search restaurants, cuisine, features"
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
    backgroundColor: '#f5f7fa',
    borderColor: '#e6eaf0',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  input: {
    color: '#16202a',
    fontSize: 15,
    fontWeight: '500',
    minHeight: 42,
  },
});
