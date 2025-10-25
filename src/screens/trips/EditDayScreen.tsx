import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function EditDayScreen({ route, navigation }: any) {
  const { tripId, dayId, date } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Day</Text>
      <Text style={styles.subtitle}>Trip: {tripId}</Text>
      <Text style={styles.subtitle}>Date: {date}</Text>
      
      <Button 
        mode="contained" 
        onPress={() => navigation.goBack()}
        style={styles.button}
      >
        Save Changes
      </Button>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
});
