import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, Card, Chip, Divider, IconButton } from 'react-native-paper';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { useTrip, useCreateDay, useUpdateDay } from '../../hooks/useTrips';
import { TripDay, Meal } from '../../types';
import MealPicker from '../../components/MealPicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type EditDayScreenProps = {
  route: { params: { tripId: string; dayId?: string; date?: string } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditDay'>;
};

const PARKS = [
  { id: 'magic-kingdom', name: 'Magic Kingdom', icon: '🏰', color: '#FF6B6B' },
  { id: 'epcot', name: 'EPCOT', icon: '🌍', color: '#4ECDC4' },
  { id: 'hollywood-studios', name: 'Hollywood Studios', icon: '🎬', color: '#45B7D1' },
  { id: 'animal-kingdom', name: 'Animal Kingdom', icon: '🦁', color: '#96CEB4' },
  { id: 'rest-day', name: 'Rest Day', icon: '😴', color: '#FFA07A' },
];

const HOTELS = [
  { id: 'grand-floridian', name: 'Grand Floridian Resort & Spa', icon: '🏰' },
  { id: 'contemporary', name: 'Disney\'s Contemporary Resort', icon: '🏢' },
  { id: 'polynesian', name: 'Disney\'s Polynesian Village Resort', icon: '🏝️' },
  { id: 'wilderness-lodge', name: 'Disney\'s Wilderness Lodge', icon: '🏕️' },
  { id: 'beach-club', name: 'Disney\'s Beach Club Resort', icon: '🏖️' },
  { id: 'boardwalk', name: 'Disney\'s BoardWalk Inn', icon: '🎡' },
  { id: 'yacht-club', name: 'Disney\'s Yacht Club Resort', icon: '⛵' },
  { id: 'swan-dolphin', name: 'Walt Disney World Swan & Dolphin', icon: '🦢' },
];

export default function EditDayScreen({ route, navigation }: EditDayScreenProps) {
  const { tripId, dayId, date } = route.params;
  const [user] = useAuthState(auth);
  const { data: trip } = useTrip(tripId);
  const createDayMutation = useCreateDay();
  const updateDayMutation = useUpdateDay();
  
  const [selectedPark, setSelectedPark] = useState<string>('');
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load existing day data if editing
  useEffect(() => {
    if (dayId && dayId !== 'new' && trip?.days) {
      const existingDay = trip.days.find(day => day.id === dayId);
      if (existingDay) {
        setSelectedPark(existingDay.park || '');
        setSelectedHotel(existingDay.hotel || '');
        setMeals(existingDay.meals || []);
        setNotes(existingDay.notes || '');
      }
    }
  }, [dayId, trip]);

  const handleSave = async () => {
    if (!selectedPark && !selectedHotel && meals.length === 0) {
      alert('Please select at least a park, hotel, or plan a meal');
      return;
    }

    setLoading(true);
    try {
      const dayDate = date ? new Date(date) : new Date();

      if (!dayId || dayId === 'new') {
        // Create new day
        await createDayMutation.mutateAsync({
          trip_id: tripId,
          date: dayDate,
          park: selectedPark || undefined,
          hotel: selectedHotel || undefined,
          meals: meals.length > 0 ? meals : undefined,
          notes: notes || undefined,
        });
      } else {
        // Update existing day
        await updateDayMutation.mutateAsync({
          tripId,
          dayId,
          updates: {
            park: selectedPark || null,
            hotel: selectedHotel || null,
            meals,
            notes,
          }
        });
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving day:', error);
      alert('Failed to save day. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMealChange = (mealType: string, restaurant: string) => {
    setMeals(prev => {
      const existingMeal = prev.find(meal => meal.type === mealType);
      if (existingMeal) {
        return prev.map(meal => 
          meal.type === mealType 
            ? { ...meal, restaurant }
            : meal
        );
      } else {
        return [...prev, { type: mealType, restaurant, time: '' }];
      }
    });
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
              {!dayId || dayId === 'new' ? 'Plan New Day' : 'Edit Day'}
            </Text>
            {date && (
              <Text variant="bodyMedium" style={styles.date}>
                {formatDate(typeof date === 'string' ? new Date(date) : date)}
              </Text>
            )}
          </View>
        </View>
      </Surface>

      {/* Park Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🎢 Select Park
          </Text>
          <View style={styles.optionsContainer}>
            {PARKS.map(park => (
              <Chip
                key={park.id}
                selected={selectedPark === park.id}
                onPress={() => setSelectedPark(park.id)}
                style={[
                  styles.optionChip,
                  selectedPark === park.id && { backgroundColor: park.color }
                ]}
                icon={park.icon}
              >
                {park.name}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Hotel Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🏨 Select Hotel
          </Text>
          <View style={styles.optionsContainer}>
            {HOTELS.map(hotel => (
              <Chip
                key={hotel.id}
                selected={selectedHotel === hotel.id}
                onPress={() => setSelectedHotel(hotel.id)}
                style={[
                  styles.optionChip,
                  selectedHotel === hotel.id && { backgroundColor: '#E3F2FD' }
                ]}
                icon={hotel.icon}
              >
                {hotel.name}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Meals Planning */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🍽️ Plan Meals
          </Text>
          <MealPicker
            meals={meals}
            onMealChange={handleMealChange}
          />
        </Card.Content>
      </Card>

      {/* Notes */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📝 Notes
          </Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes for this day..."
            style={styles.notesInput}
          />
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
          {!dayId || dayId === 'new' ? 'Create Day' : 'Save Changes'}
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
  date: {
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    marginBottom: 8,
  },
  notesInput: {
    marginTop: 8,
  },
  saveContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: '#1976d2',
  },
});
