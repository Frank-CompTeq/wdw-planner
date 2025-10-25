import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TripDetailScreen({ route }: any) {
  const { tripId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Details</Text>
      <Text style={styles.subtitle}>Trip ID: {tripId}</Text>
      <Text style={styles.text}>Trip details will be implemented here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
});
