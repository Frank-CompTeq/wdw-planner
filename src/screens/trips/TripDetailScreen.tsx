import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl, Platform, Dimensions } from 'react-native';
import { Text, Surface, Button, FAB, Chip, Card, Divider, IconButton } from 'react-native-paper';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { useTrip } from '../../hooks/useTrips';
import { Trip, TripDay } from '../../types';
import DayCalendar from '../../components/DayCalendar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type TripDetailScreenProps = {
  route: { params: { tripId: string } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'TripDetail'>;
};

export default function TripDetailScreen({ route, navigation }: TripDetailScreenProps) {
  const { tripId } = route.params;
  const [user] = useAuthState(auth);
  const { data: trip, isLoading, error, refetch } = useTrip(tripId);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleEditTrip = () => {
    navigation.navigate('EditTrip', { tripId });
  };

  const handleEditDay = (day: TripDay) => {
    navigation.navigate('EditDay', { tripId, dayId: day.id });
  };

  const handleAddDay = () => {
    // Navigate to add day screen or show date picker
    navigation.navigate('EditDay', { tripId, dayId: 'new' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysBetweenDates = (startDate: Date, endDate: Date): Date[] => {
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading trip details...</Text>
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading trip: {error?.message}</Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  const tripDays = getDaysBetweenDates(trip.metadata.start_date, trip.metadata.end_date);
  const existingDays = trip.days || [];
  const isWeb = Platform.OS === 'web';
  const screenWidth = Dimensions.get('window').width;
  const isWideScreen = screenWidth > 768;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              {trip.metadata.name}
            </Text>
            <Text variant="bodyMedium" style={styles.dates}>
              {formatDate(trip.metadata.start_date)} - {formatDate(trip.metadata.end_date)}
            </Text>
          </View>
          
          <IconButton
            icon="pencil"
            size={24}
            onPress={handleEditTrip}
            style={styles.editButton}
          />
        </View>

        <View style={styles.chipsContainer}>
          <Chip icon="calendar" style={styles.chip}>
            {tripDays.length} days
          </Chip>
          {trip.dvc_booking && (
            <Chip icon="diamond" style={styles.chip}>
              DVC Booking
            </Chip>
          )}
          <Chip icon="account-group" style={styles.chip}>
            {trip.metadata.shared_with.length + 1} travelers
          </Chip>
        </View>
      </Surface>

      {/* Main Content - Responsive Layout */}
      <View style={isWideScreen ? styles.webLayout : styles.mobileLayout}>
        {/* Calendar */}
        <View style={isWideScreen ? styles.webCalendarContainer : styles.mobileCalendarContainer}>
          <DayCalendar
            startDate={trip.metadata.start_date}
            endDate={trip.metadata.end_date}
            days={existingDays}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
            compact={isWideScreen}
          />
        </View>

        {/* Days List */}
        <View style={isWideScreen ? styles.webDaysContainer : styles.mobileDaysContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Trip Days
          </Text>
          
          <FlatList
            data={tripDays}
            keyExtractor={(item, index) => `day-${index}`}
            renderItem={({ item: date, index }) => {
              const existingDay = existingDays.find(day => 
                day.date.toDateString() === date.toDateString()
              );
              
              return (
                <Card style={styles.dayCard}>
                  <Card.Content>
                    <View style={styles.dayHeader}>
                      <View style={styles.dayInfo}>
                        <Text variant="titleSmall" style={styles.dayTitle}>
                          Day {index + 1}
                        </Text>
                        <Text variant="bodySmall" style={styles.dayDate}>
                          {formatDate(date)}
                        </Text>
                      </View>
                      
                      {existingDay ? (
                        <View style={styles.dayDetails}>
                          <View style={styles.chipsRow}>
                            <Chip 
                              icon="map-marker" 
                              style={styles.parkChip}
                              compact
                            >
                              {existingDay.park || 'No park'}
                            </Chip>
                            <Chip 
                              icon="bed" 
                              style={styles.hotelChip}
                              compact
                            >
                              {existingDay.hotel || 'No hotel'}
                            </Chip>
                          </View>
                          <Button
                            mode="outlined"
                            compact
                            onPress={() => handleEditDay(existingDay)}
                            style={styles.editDayButton}
                          >
                            Edit
                          </Button>
                        </View>
                      ) : (
                        <Button
                          mode="contained"
                          compact
                          onPress={() => handleAddDay()}
                          style={styles.addDayButton}
                        >
                          Plan Day
                        </Button>
                      )}
                    </View>
                    
                    {existingDay && (
                      <View style={styles.dayContent}>
                        <Divider style={styles.divider} />
                        <Text variant="bodySmall" style={styles.mealsTitle}>
                          Meals:
                        </Text>
                        <View style={styles.mealsContainer}>
                          {existingDay.meals?.map((meal, mealIndex) => (
                            <Chip key={mealIndex} style={styles.mealChip} compact>
                              {meal.type}: {meal.restaurant || 'TBD'}
                            </Chip>
                          )) || (
                            <Text variant="bodySmall" style={styles.noMeals}>
                              No meals planned
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              );
            }}
            contentContainerStyle={styles.daysList}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
          />
        </View>
      </View>

      {/* FAB for adding new day */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddDay}
        label="Add Day"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Responsive Layout Styles
  webLayout: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
  },
  mobileLayout: {
    flex: 1,
  },
  webCalendarContainer: {
    width: 350,
    maxWidth: 350,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    padding: 8,
  },
  mobileCalendarContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  webDaysContainer: {
    flex: 1,
    paddingRight: 16,
  },
  mobileDaysContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  dates: {
    color: '#666',
  },
  editButton: {
    margin: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#E3F2FD',
    marginBottom: 4,
  },
  daysContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  daysList: {
    paddingBottom: 100,
  },
  dayCard: {
    marginBottom: 12,
    marginHorizontal: 4,
    elevation: 2,
    borderRadius: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  dayInfo: {
    flex: 1,
    minWidth: 120,
    marginBottom: 8,
  },
  dayTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 16,
  },
  dayDate: {
    color: '#666',
    marginTop: 2,
    fontSize: 12,
  },
  dayDetails: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: '60%',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-end',
  },
  parkChip: {
    backgroundColor: '#E8F5E8',
    marginBottom: 4,
    maxWidth: 120,
  },
  hotelChip: {
    backgroundColor: '#FFF3E0',
    marginBottom: 4,
    maxWidth: 120,
  },
  editDayButton: {
    marginTop: 4,
    minWidth: 60,
  },
  addDayButton: {
    backgroundColor: '#1976d2',
    marginTop: 4,
    minWidth: 80,
  },
  dayContent: {
    marginTop: 12,
  },
  divider: {
    marginBottom: 8,
  },
  mealsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  mealsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  mealChip: {
    backgroundColor: '#F3E5F5',
  },
  noMeals: {
    fontStyle: 'italic',
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
});
