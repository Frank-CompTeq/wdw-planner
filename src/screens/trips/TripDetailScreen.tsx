import React, { useState, useEffect } from 'react';
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
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

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
  const isWideScreen = screenData.width > 768;

  console.log('Screen data:', screenData.width, 'isWideScreen:', isWideScreen, 'isWeb:', isWeb);

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
          {/* Debug indicator */}
          <Chip style={[styles.chip, { backgroundColor: isWideScreen ? '#4CAF50' : '#FF9800' }]}>
            {isWideScreen ? 'Web Layout' : 'Mobile Layout'} ({screenData.width}px)
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
                  <Card.Content style={styles.dayCardContent}>
                    <View style={styles.dayRow}>
                      {/* Day Info */}
                      <View style={styles.dayInfo}>
                        <Text variant="titleSmall" style={styles.dayTitle}>
                          Day {index + 1}
                        </Text>
                        <Text variant="bodySmall" style={styles.dayDate}>
                          {formatDate(date)}
                        </Text>
                      </View>
                      
                      {/* Park & Hotel */}
                      <View style={styles.dayMiddle}>
                        <Text style={styles.lineText} numberOfLines={1} ellipsizeMode="tail">
                          {existingDay ? `${existingDay.park || 'No park'} • ${existingDay.hotel || 'No hotel'}` : 'Not planned'}
                        </Text>
                      </View>
                      
                      {/* Meals */}
                      <View style={styles.dayMeals}>
                        <Text style={styles.lineText} numberOfLines={1} ellipsizeMode="tail">
                          {existingDay && existingDay.meals && existingDay.meals.length > 0
                            ? `${existingDay.meals
                                .slice(0, 2)
                                .map(meal => `${meal.type}: ${meal.restaurant || 'TBD'}`)
                                .join(' | ')}${existingDay.meals.length > 2 ? ` +${existingDay.meals.length - 2}` : ''}`
                            : 'No meals'}
                        </Text>
                      </View>
                      
                      {/* Action Button */}
                      <View style={styles.dayAction}>
                        {existingDay ? (
                          <Button
                            mode="outlined"
                            compact
                            onPress={() => handleEditDay(existingDay)}
                            style={styles.editDayButton}
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            mode="contained"
                            compact
                            onPress={() => handleAddDay()}
                            style={styles.addDayButton}
                          >
                            Plan
                          </Button>
                        )}
                      </View>
                    </View>
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
    minHeight: 0,
    // Force web layout with explicit CSS
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      width: '100%',
      height: '100%',
    }),
  },
  mobileLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  webCalendarContainer: {
    width: 350,
    maxWidth: 350,
    minWidth: 300,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    padding: 8,
    alignSelf: 'flex-start',
    // Force web calendar positioning
    ...(Platform.OS === 'web' && {
      flexShrink: 0,
      flexGrow: 0,
      flexBasis: '350px',
      position: 'relative',
      float: 'left',
      marginRight: '16px',
    }),
  },
  mobileCalendarContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  webDaysContainer: {
    flex: 1,
    paddingRight: 16,
    minWidth: 0,
    // Force web days container
    ...(Platform.OS === 'web' && {
      flexShrink: 1,
      flexGrow: 1,
      flexBasis: 'auto',
      overflow: 'hidden',
      position: 'relative',
    }),
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
    marginBottom: 8,
    marginHorizontal: 4,
    elevation: 2,
    borderRadius: 8,
  },
  dayCardContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayInfo: {
    minWidth: 80,
    flexShrink: 0,
  },
  dayTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 14,
  },
  dayDate: {
    color: '#666',
    marginTop: 2,
    fontSize: 11,
  },
  dayMiddle: {
    flex: 1,
    minWidth: 120,
  },
  parkChip: {
    backgroundColor: '#E8F5E8',
    fontSize: 10,
  },
  hotelChip: {
    backgroundColor: '#FFF3E0',
    fontSize: 10,
  },
  dayMeals: {
    flex: 1,
    minWidth: 100,
  },
  mealsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 4,
  },
  mealChip: {
    backgroundColor: '#F3E5F5',
    fontSize: 10,
  },
  moreMealsChip: {
    backgroundColor: '#E0E0E0',
    fontSize: 10,
  },
  dayAction: {
    flexShrink: 0,
  },
  editDayButton: {
    minWidth: 50,
    height: 32,
  },
  addDayButton: {
    backgroundColor: '#1976d2',
    minWidth: 50,
    height: 32,
  },
  notPlanned: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 11,
  },
  noMeals: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 11,
  },
  lineText: {
    fontSize: 12,
    color: '#444',
    // Truncation for web and native
    ...(Platform.OS === 'web' ? {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block',
      maxWidth: '100%',
    } : {}),
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
