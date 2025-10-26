import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, Card, Switch, IconButton } from 'react-native-paper';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { useTrip, useUpdateTrip } from '../../hooks/useTrips';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type EditTripScreenProps = {
  route: { params: { tripId: string } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditTrip'>;
};

export default function EditTripScreen({ route, navigation }: EditTripScreenProps) {
  const { tripId } = route.params;
  const [user] = useAuthState(auth);
  const { data: trip } = useTrip(tripId);
  const updateTripMutation = useUpdateTrip();
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: new Date(),
    end_date: new Date(),
    use_dvc: false,
    dvc_contract_id: '',
  });
  const [loading, setLoading] = useState(false);

  // Load existing trip data
  useEffect(() => {
    if (trip) {
      setFormData({
        name: trip.metadata.name,
        start_date: trip.metadata.start_date,
        end_date: trip.metadata.end_date,
        use_dvc: !!trip.dvc_booking,
        dvc_contract_id: trip.dvc_booking?.contract_used || '',
      });
    }
  }, [trip]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a trip name');
      return;
    }

    if (formData.start_date >= formData.end_date) {
      alert('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      await updateTripMutation.mutateAsync({
        tripId,
        updates: {
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          use_dvc: formData.use_dvc,
          dvc_contract_id: formData.use_dvc ? formData.dvc_contract_id : undefined,
        }
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <View style={styles.titleContainer}>
            <Text variant="headlineSmall" style={styles.title}>
              Edit Trip
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Modify your trip details
            </Text>
          </View>
        </View>
      </Surface>

      {/* Trip Name */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📝 Trip Name
          </Text>
          <TextInput
            mode="outlined"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter trip name"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Dates */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📅 Trip Dates
          </Text>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Text variant="bodyMedium" style={styles.dateLabel}>
                Start Date
              </Text>
              <Text variant="bodyLarge" style={styles.dateValue}>
                {formatDate(formData.start_date)}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Text variant="bodyMedium" style={styles.dateLabel}>
                End Date
              </Text>
              <Text variant="bodyLarge" style={styles.dateValue}>
                {formatDate(formData.end_date)}
              </Text>
            </View>
          </View>
          
          <Text variant="bodySmall" style={styles.dateNote}>
            Note: Date changes will affect all planned days
          </Text>
        </Card.Content>
      </Card>

      {/* DVC Options */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            💎 DVC Booking
          </Text>
          
          <View style={styles.switchContainer}>
            <Text variant="bodyLarge">Use DVC Points</Text>
            <Switch
              value={formData.use_dvc}
              onValueChange={(value) => setFormData(prev => ({ ...prev, use_dvc: value }))}
            />
          </View>
          
          {formData.use_dvc && (
            <TextInput
              mode="outlined"
              value={formData.dvc_contract_id}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dvc_contract_id: text }))}
              placeholder="DVC Contract ID"
              style={styles.input}
            />
          )}
        </Card.Content>
      </Card>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          icon="content-save"
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1976d2',
  },
  input: {
    marginTop: 8,
  },
  dateContainer: {
    marginTop: 8,
  },
  dateItem: {
    marginBottom: 12,
  },
  dateLabel: {
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  dateNote: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: '#1976d2',
  },
});
