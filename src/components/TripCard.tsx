import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, Button } from 'react-native-paper';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onEdit?: () => void;
}

export default function TripCard({ trip, onPress, onEdit }: TripCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getParkIcon = (park: string) => {
    switch (park) {
      case 'Magic Kingdom': return '🏰';
      case 'EPCOT': return '🌍';
      case 'Hollywood Studios': return '🎬';
      case 'Animal Kingdom': return '🦁';
      default: return '🎢';
    }
  };

  const parks = trip.days
    .map(day => day.park)
    .filter(Boolean)
    .filter((park, index, arr) => arr.indexOf(park) === index);

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{trip.metadata.name}</Title>
          {trip.dvc_booking && (
            <Chip icon="diamond" style={styles.dvcChip}>
              DVC
            </Chip>
          )}
        </View>
        
        <Paragraph style={styles.dates}>
          {formatDate(trip.metadata.start_date)} - {formatDate(trip.metadata.end_date)}
        </Paragraph>
        
        <View style={styles.parksContainer}>
          {parks.map((park, index) => (
            <Chip key={index} style={styles.parkChip}>
              {getParkIcon(park)} {park}
            </Chip>
          ))}
        </View>
        
        <View style={styles.stats}>
          <Paragraph style={styles.stat}>
            📅 {trip.days.length} jour{trip.days.length > 1 ? 's' : ''}
          </Paragraph>
          <Paragraph style={styles.stat}>
            🍽️ {trip.days.reduce((total, day) => 
              total + day.meals.length, 0
            )} repas planifiés
          </Paragraph>
        </View>
      </Card.Content>
      
      {onEdit && (
        <Card.Actions>
          <Button onPress={onEdit}>Modifier</Button>
        </Card.Actions>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dvcChip: {
    backgroundColor: '#FFD700',
  },
  dates: {
    color: '#666',
    marginBottom: 12,
  },
  parksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  parkChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 14,
    color: '#666',
  },
});
