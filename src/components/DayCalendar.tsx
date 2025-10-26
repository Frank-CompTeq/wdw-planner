import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { TripDay } from '../types';

interface DayCalendarProps {
  startDate: Date;
  endDate: Date;
  days: TripDay[];
  onDateSelect: (date: Date | null) => void;
  selectedDate?: Date | null;
}

export default function DayCalendar({ startDate, endDate, days, onDateSelect, selectedDate }: DayCalendarProps) {
  // Create marked dates for the trip period
  const markedDates: any = {};
  
  // Mark trip period
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    markedDates[dateStr] = {
      color: '#E3F2FD',
      textColor: '#1976d2',
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Mark days with plans
  days.forEach(day => {
    const dateStr = day.date.toISOString().split('T')[0];
    markedDates[dateStr] = {
      ...markedDates[dateStr],
      marked: true,
      dotColor: getParkColor(day.park),
    };
  });
  
  // Mark selected date
  if (selectedDate) {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    markedDates[selectedDateStr] = {
      ...markedDates[selectedDateStr],
      selected: true,
      selectedColor: '#1976d2',
      selectedTextColor: '#ffffff',
    };
  }

  const getParkColor = (park: string | null) => {
    switch (park) {
      case 'Magic Kingdom': return '#FF6B6B';
      case 'EPCOT': return '#4ECDC4';
      case 'Hollywood Studios': return '#45B7D1';
      case 'Animal Kingdom': return '#96CEB4';
      default: return '#FFA07A';
    }
  };

  const getParkIcon = (park: string | null) => {
    switch (park) {
      case 'Magic Kingdom': return '🏰';
      case 'EPCOT': return '🌍';
      case 'Hollywood Studios': return '🎬';
      case 'Animal Kingdom': return '🦁';
      default: return '🎢';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => {
          const selectedDate = new Date(day.dateString);
          onDateSelect(selectedDate);
        }}
        minDate={startDate.toISOString().split('T')[0]}
        maxDate={endDate.toISOString().split('T')[0]}
        current={startDate.toISOString().split('T')[0]}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#1976d2',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#1976d2',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#1976d2',
          selectedDotColor: '#ffffff',
          arrowColor: '#1976d2',
          disabledArrowColor: '#d9e1e8',
          monthTextColor: '#2d4150',
          indicatorColor: '#1976d2',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13
        }}
      />
      
      <View style={styles.legend}>
        <Title style={styles.legendTitle}>Parks Legend</Title>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <Chip style={[styles.legendChip, { backgroundColor: '#FF6B6B' }]}>
              🏰 Magic Kingdom
            </Chip>
          </View>
          <View style={styles.legendItem}>
            <Chip style={[styles.legendChip, { backgroundColor: '#4ECDC4' }]}>
              🌍 EPCOT
            </Chip>
          </View>
          <View style={styles.legendItem}>
            <Chip style={[styles.legendChip, { backgroundColor: '#45B7D1' }]}>
              🎬 Hollywood Studios
            </Chip>
          </View>
          <View style={styles.legendItem}>
            <Chip style={[styles.legendChip, { backgroundColor: '#96CEB4' }]}>
              🦁 Animal Kingdom
            </Chip>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  legend: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    marginRight: 8,
    marginBottom: 4,
  },
  legendChip: {
    height: 32,
  },
});
