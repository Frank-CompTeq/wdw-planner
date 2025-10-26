import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform, Dimensions } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { useTrip } from '../../hooks/useTrips';
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
  const [screenData] = useState(Dimensions.get('window'));

  // Enhanced calendar component
  const EnhancedCalendar = () => {
    const calendarDays = getCalendarDays(trip.metadata.start_date, trip.metadata.end_date);
    const tripDays = getDaysBetweenDates(trip.metadata.start_date, trip.metadata.end_date);
    const isWideScreen = screenData.width > 768;
    
    // Get day data for a specific date
    const getDayData = (date: Date) => {
      return trip.days?.find(day => {
        const dayDate = new Date(day.date);
        return dayDate.toDateString() === date.toDateString();
      });
    };

    // Check if a day has planning
    const hasPlanning = (date: Date) => {
      const dayData = getDayData(date);
      return dayData && (dayData.park || dayData.hotel || (dayData.meals && dayData.meals.length > 0));
    };

    // Check if a date is within the trip period
    const isTripDate = (date: Date) => {
      return date >= startDate && date <= endDate;
    };

    // Check if a date is today
    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    // Handle day selection
    const handleDayPress = (date: Date) => {
      setSelectedDate(date);
    };

    return (
      <Surface style={isWideScreen ? styles.webCalendarContainer : styles.mobileCalendarContainer} elevation={2}>
        <Text variant="titleMedium" style={styles.calendarTitle}>
          Trip Calendar
        </Text>
        
        {/* Month/Year Header */}
        <View style={styles.calendarHeader}>
          <Text variant="bodyLarge" style={styles.monthYear}>
            {trip.metadata.start_date.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} variant="caption" style={styles.dayHeader}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((date, index) => {
            if (!date) {
              // Empty cell for days before month starts
              return (
                <View key={index} style={styles.emptyDay} />
              );
            }
            
            const dayData = getDayData(date);
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const hasPlan = hasPlanning(date);
            const isTrip = isTripDate(date);
            const isCurrentDay = isToday(date);
            
            return (
              <Surface 
                key={index} 
                style={[
                  styles.calendarDay,
                  isTrip && styles.tripDay,
                  isSelected && styles.selectedDay,
                  hasPlan && styles.plannedDay,
                  isCurrentDay && styles.todayDay
                ]} 
                elevation={isSelected ? 3 : 1}
                onTouchEnd={() => handleDayPress(date)}
              >
                <Text variant="bodySmall" style={[
                  styles.dayNumber,
                  isTrip && styles.tripDayText,
                  isSelected && styles.selectedDayText,
                  hasPlan && styles.plannedDayText,
                  isCurrentDay && styles.todayDayText
                ]}>
                  {date.getDate()}
                </Text>
                {hasPlan && (
                  <View style={styles.planIndicator} />
                )}
                {isTrip && !hasPlan && (
                  <View style={styles.tripIndicator} />
                )}
              </Surface>
            );
          })}
        </View>

        {/* Calendar Legend */}
        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.tripDay]} />
            <Text variant="caption">Dates du voyage</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.plannedDay]} />
            <Text variant="caption">Jour planifié</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.todayDay]} />
            <Text variant="caption">Aujourd'hui</Text>
          </View>
        </View>

        <Text variant="bodySmall" style={styles.calendarNote}>
          {tripDays.length} days total • {trip.days?.length || 0} planned
        </Text>
      </Surface>
    );
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

  const getCalendarDays = (startDate: Date, endDate: Date): (Date | null)[] => {
    const days: (Date | null)[] = [];
    
    // Get the month and year of the trip start
    const tripMonth = startDate.getMonth();
    const tripYear = startDate.getFullYear();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(tripYear, tripMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the number of days in the month
    const daysInMonth = new Date(tripYear, tripMonth + 1, 0).getDate();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(tripYear, tripMonth, day));
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

  const isWideScreen = screenData.width > 768;

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          {trip.metadata.name}
        </Text>
        <Text variant="bodyMedium" style={styles.dates}>
          {trip.metadata.start_date.toLocaleDateString()} - {trip.metadata.end_date.toLocaleDateString()}
        </Text>
      </Surface>

      {/* Main Content - Responsive Layout */}
      <View style={isWideScreen ? styles.webLayout : styles.mobileLayout}>
        {/* Calendar */}
        <EnhancedCalendar />

        {/* Days List */}
        <View style={isWideScreen ? styles.webDaysContainer : styles.mobileDaysContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {selectedDate ? `Day Details - ${selectedDate.toLocaleDateString()}` : 'Trip Days'}
          </Text>
        
          {selectedDate ? (
            // Show selected day details
            (() => {
              const dayData = trip.days?.find(day => {
                const dayDate = new Date(day.date);
                return dayDate.toDateString() === selectedDate.toDateString();
              });
              
              return dayData ? (
                <Surface style={styles.selectedDayCard} elevation={2}>
                  <Text variant="titleSmall" style={styles.selectedDayTitle}>
                    {selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </Text>
                  <View style={styles.dayDetails}>
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.detailLabel}>Park:</Text>
                      <Text variant="bodyMedium" style={styles.detailValue}>
                        {dayData.park || 'Not planned'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.detailLabel}>Hotel:</Text>
                      <Text variant="bodyMedium" style={styles.detailValue}>
                        {dayData.hotel || 'Not planned'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={styles.detailLabel}>Meals:</Text>
                      <Text variant="bodyMedium" style={styles.detailValue}>
                        {dayData.meals ? `${dayData.meals.length} planned` : 'None planned'}
                      </Text>
                    </View>
                  </View>
                  <Button 
                    mode="contained" 
                    onPress={() => navigation.navigate('EditDay', { tripId, dayId: dayData.id })}
                    style={styles.editDayButton}
                  >
                    Edit Day
                  </Button>
                </Surface>
              ) : (
                <Surface style={styles.unplannedDayCard} elevation={1}>
                  <Text variant="titleSmall" style={styles.unplannedDayTitle}>
                    {selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </Text>
                  <Text variant="bodyMedium" style={styles.unplannedDayText}>
                    This day hasn't been planned yet.
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => {
                      // Create new day and navigate to edit
                      navigation.navigate('EditDay', { tripId, date: selectedDate.toISOString() });
                    }}
                    style={styles.planDayButton}
                  >
                    Plan This Day
                  </Button>
                </Surface>
              );
            })()
          ) : (
            // Show all days list
            trip.days && trip.days.length > 0 ? (
              trip.days.map((day, index) => (
                <Surface key={day.id} style={styles.dayCard} elevation={1}>
                  <Text variant="titleSmall">Day {index + 1}</Text>
                  <Text variant="bodySmall">
                    Park: {day.park || 'Not planned'}
                  </Text>
                  <Text variant="bodySmall">
                    Hotel: {day.hotel || 'Not planned'}
                  </Text>
                  <Text variant="bodySmall">
                    Meals: {day.meals ? day.meals.length : 0}
                  </Text>
                </Surface>
              ))
            ) : (
              <Text style={styles.noDaysText}>No days planned yet</Text>
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  title: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  dates: {
    color: '#666',
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
    flexDirection: 'column',
  },
  webCalendarContainer: {
    width: 300,
    maxWidth: 300,
    minWidth: 250,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignSelf: 'flex-start',
  },
  mobileCalendarContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
  },
  webDaysContainer: {
    flex: 1,
    paddingRight: 16,
    minWidth: 0,
  },
  mobileDaysContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  calendarTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
    textAlign: 'center',
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  monthYear: {
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  dayHeader: {
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    width: '14.28%', // 100% / 7 days = 14.28%
    minWidth: 32,
    maxWidth: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 12,
    width: '100%',
  },
  calendarDay: {
    width: '14.28%', // 100% / 7 days = 14.28%
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
    minWidth: 32,
    maxWidth: 40,
  },
  emptyDay: {
    width: '14.28%', // 100% / 7 days = 14.28%
    height: 32,
    marginBottom: 4,
    minWidth: 32,
    maxWidth: 40,
  },
  selectedDay: {
    backgroundColor: '#1976d2',
    transform: [{ scale: 1.1 }],
  },
  plannedDay: {
    backgroundColor: '#C8E6C9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  tripDay: {
    backgroundColor: '#FFE0B2',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  todayDay: {
    backgroundColor: '#FFCDD2',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  dayNumber: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#1976d2',
  },
  selectedDayText: {
    color: 'white',
  },
  plannedDayText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  tripDayText: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  todayDayText: {
    color: '#C62828',
    fontWeight: 'bold',
  },
  planIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  tripIndicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  calendarNote: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    fontSize: 11,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  dayCard: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  selectedDayCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  selectedDayTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
    textAlign: 'center',
  },
  dayDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
    color: '#333',
  },
  editDayButton: {
    marginTop: 8,
  },
  unplannedDayCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  unplannedDayTitle: {
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 12,
    textAlign: 'center',
  },
  unplannedDayText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  planDayButton: {
    marginTop: 8,
  },
  noDaysText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
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