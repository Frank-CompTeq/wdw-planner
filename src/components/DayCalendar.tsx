import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { TripDay } from '../types';

interface DayCalendarProps {
  days: TripDay[];
  onDayPress: (day: TripDay) => void;
  selectedDate?: string;
}

export default function DayCalendar({ days, onDayPress, selectedDate }: DayCalendarProps) {
  const markedDates = days.reduce((acc, day) => {
    const dateStr = day.date.toISOString().split('T')[0];
    acc[dateStr] = {
      marked: true,
      dotColor: getParkColor(day.park),
      selected: selectedDate === dateStr,
    };
    return acc;
  }, {} as any);

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
          const selectedDay = days.find(d => 
            d.date.toISOString().split('T')[0] === day.dateString
          );
          if (selectedDay) {
            onDayPress(selectedDay);
          }
        }}
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
        <Title style={styles.legendTitle}>Légende</Title>
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
