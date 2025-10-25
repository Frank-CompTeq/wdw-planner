import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, Button } from 'react-native-paper';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
  onSelect?: () => void;
  showSelectButton?: boolean;
}

export default function RestaurantCard({ 
  restaurant, 
  onPress, 
  onSelect, 
  showSelectButton = false 
}: RestaurantCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'moderate': return 'Modéré';
      case 'hard': return 'Difficile';
      default: return 'Inconnu';
    }
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

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{restaurant.name}</Title>
          <Chip 
            style={[
              styles.difficultyChip,
              { backgroundColor: getDifficultyColor(restaurant.difficulty) }
            ]}
          >
            {getDifficultyLabel(restaurant.difficulty)}
          </Chip>
        </View>
        
        <View style={styles.location}>
          <Paragraph style={styles.park}>
            {getParkIcon(restaurant.park_location)} {restaurant.park_location}
          </Paragraph>
          <Paragraph style={styles.cuisine}>{restaurant.cuisine_type}</Paragraph>
        </View>
        
        <View style={styles.details}>
          <Chip style={styles.priceChip}>
            {restaurant.price_range}
          </Chip>
          {restaurant.requires_reservation && (
            <Chip style={styles.reservationChip} icon="calendar">
              Réservation requise
            </Chip>
          )}
        </View>
        
        <Paragraph style={styles.bookingWindow}>
          Réservation {restaurant.booking_window_days} jours à l'avance
        </Paragraph>
      </Card.Content>
      
      {showSelectButton && onSelect && (
        <Card.Actions>
          <Button mode="contained" onPress={onSelect}>
            Sélectionner
          </Button>
        </Card.Actions>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  difficultyChip: {
    height: 28,
  },
  location: {
    marginBottom: 12,
  },
  park: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976d2',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  priceChip: {
    backgroundColor: '#E8F5E8',
    marginRight: 8,
    marginBottom: 4,
  },
  reservationChip: {
    backgroundColor: '#FFF3E0',
    marginBottom: 4,
  },
  bookingWindow: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
