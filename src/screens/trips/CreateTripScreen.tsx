import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, Chip, Switch, Divider } from 'react-native-paper';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { useCreateTrip } from '../../hooks/useTrips';
import { CreateTripInput } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

interface CreateTripScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateTrip'>;
}

export default function CreateTripScreen({ navigation }: CreateTripScreenProps) {
  const [user] = useAuthState(auth);
  const createTripMutation = useCreateTrip();
  
  const [formData, setFormData] = useState<CreateTripInput>({
    name: '',
    start_date: new Date(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    use_dvc: false,
    dvc_contract_id: undefined
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Trip name is required');
      return;
    }

    if (formData.start_date >= formData.end_date) {
      setError('End date must be after start date');
      return;
    }

    if (formData.use_dvc && !formData.dvc_contract_id) {
      setError('Please select a DVC contract');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tripId = await createTripMutation.mutateAsync({
        userId: user?.uid || '',
        input: formData
      });
      
      navigation.navigate('TripDetail', { tripId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: 'start_date' | 'end_date', date: Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Surface style={styles.form} elevation={2}>
          <Text variant="headlineMedium" style={styles.title}>
            Create New Trip
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Plan your magical Disney World adventure
          </Text>

          <TextInput
            label="Trip Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Summer 2024 Disney Trip"
          />

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text variant="bodyMedium" style={styles.dateLabel}>Start Date</Text>
              <Button
                mode="outlined"
                onPress={() => {
                  // TODO: Implement date picker
                  const newDate = new Date(formData.start_date);
                  newDate.setDate(newDate.getDate() + 1);
                  handleDateChange('start_date', newDate);
                }}
                style={styles.dateButton}
              >
                {formData.start_date.toLocaleDateString()}
              </Button>
            </View>
            
            <View style={styles.dateInput}>
              <Text variant="bodyMedium" style={styles.dateLabel}>End Date</Text>
              <Button
                mode="outlined"
                onPress={() => {
                  // TODO: Implement date picker
                  const newDate = new Date(formData.end_date);
                  newDate.setDate(newDate.getDate() + 1);
                  handleDateChange('end_date', newDate);
                }}
                style={styles.dateButton}
              >
                {formData.end_date.toLocaleDateString()}
              </Button>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.dvcSection}>
            <View style={styles.dvcHeader}>
              <Text variant="titleMedium" style={styles.dvcTitle}>
                Disney Vacation Club
              </Text>
              <Switch
                value={formData.use_dvc}
                onValueChange={(value) => setFormData(prev => ({ ...prev, use_dvc: value }))}
              />
            </View>
            
            {formData.use_dvc && (
              <View style={styles.dvcContent}>
                <Text variant="bodyMedium" style={styles.dvcDescription}>
                  Use DVC points for this trip
                </Text>
                <Chip 
                  icon="diamond" 
                  style={styles.dvcChip}
                  onPress={() => {
                    // TODO: Navigate to DVC contract selection
                    setFormData(prev => ({ ...prev, dvc_contract_id: 'demo-contract' }));
                  }}
                >
                  {formData.dvc_contract_id ? 'Contract Selected' : 'Select DVC Contract'}
                </Chip>
              </View>
            )}
          </View>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.createButton}
            >
              Create Trip
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    marginBottom: 8,
    color: '#666',
  },
  dateButton: {
    borderColor: '#1976d2',
  },
  divider: {
    marginVertical: 16,
  },
  dvcSection: {
    marginBottom: 16,
  },
  dvcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dvcTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  dvcContent: {
    marginTop: 8,
  },
  dvcDescription: {
    color: '#666',
    marginBottom: 8,
  },
  dvcChip: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    flex: 1,
    marginLeft: 8,
  },
});
