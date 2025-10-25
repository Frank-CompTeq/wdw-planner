import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Button, Chip, Modal, Portal, List } from 'react-native-paper';
import { Restaurant, Meal } from '../types';

interface MealPickerProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  currentMeal?: Meal;
  restaurants: Restaurant[];
  onMealSelect: (meal: Partial<Meal>) => void;
  onTimeSelect: (time: string) => void;
}

export default function MealPicker({ 
  mealType, 
  currentMeal, 
  restaurants, 
  onMealSelect, 
  onTimeSelect 
}: MealPickerProps) {
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const mealTypeLabels = {
    breakfast: 'Petit-déjeuner',
    lunch: 'Déjeuner',
    dinner: 'Dîner'
  };

  const timeSlots = {
    breakfast: ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'],
    lunch: ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'],
    dinner: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']
  };

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

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>{mealTypeLabels[mealType]}</Title>
        
        {currentMeal ? (
          <View style={styles.currentMeal}>
            <Chip 
              icon="restaurant" 
              style={styles.restaurantChip}
              onPress={() => setShowRestaurantModal(true)}
            >
              {currentMeal.restaurant_name}
            </Chip>
            <Chip 
              icon="clock" 
              style={styles.timeChip}
              onPress={() => setShowTimeModal(true)}
            >
              {currentMeal.time}
            </Chip>
            <Chip 
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(currentMeal.status) }
              ]}
            >
              {getStatusLabel(currentMeal.status)}
            </Chip>
          </View>
        ) : (
          <Button 
            mode="outlined" 
            onPress={() => setShowRestaurantModal(true)}
            style={styles.addButton}
          >
            Ajouter un restaurant
          </Button>
        )}
      </Card.Content>

      {/* Restaurant Selection Modal */}
      <Portal>
        <Modal 
          visible={showRestaurantModal} 
          onDismiss={() => setShowRestaurantModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>Choisir un restaurant</Title>
          {restaurants.map((restaurant) => (
            <List.Item
              key={restaurant.id}
              title={restaurant.name}
              description={`${restaurant.park_location} • ${getDifficultyLabel(restaurant.difficulty)}`}
              left={() => (
                <Chip 
                  style={[
                    styles.difficultyChip,
                    { backgroundColor: getDifficultyColor(restaurant.difficulty) }
                  ]}
                >
                  {restaurant.difficulty}
                </Chip>
              )}
              onPress={() => {
                onMealSelect({
                  restaurant_id: restaurant.id,
                  restaurant_name: restaurant.name,
                  status: 'planned'
                });
                setShowRestaurantModal(false);
                setShowTimeModal(true);
              }}
            />
          ))}
        </Modal>
      </Portal>

      {/* Time Selection Modal */}
      <Portal>
        <Modal 
          visible={showTimeModal} 
          onDismiss={() => setShowTimeModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>Choisir une heure</Title>
          <View style={styles.timeGrid}>
            {timeSlots[mealType].map((time) => (
              <Button
                key={time}
                mode={currentMeal?.time === time ? 'contained' : 'outlined'}
                onPress={() => {
                  onTimeSelect(time);
                  setShowTimeModal(false);
                }}
                style={styles.timeButton}
              >
                {time}
              </Button>
            ))}
          </View>
        </Modal>
      </Portal>
    </Card>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned': return '#FF9800';
    case 'reserved': return '#2196F3';
    case 'confirmed': return '#4CAF50';
    default: return '#9E9E9E';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'planned': return 'Planifié';
    case 'reserved': return 'Réservé';
    case 'confirmed': return 'Confirmé';
    default: return 'Inconnu';
  }
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  currentMeal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  restaurantChip: {
    backgroundColor: '#E3F2FD',
  },
  timeChip: {
    backgroundColor: '#F3E5F5',
  },
  statusChip: {
    backgroundColor: '#FF9800',
  },
  addButton: {
    marginTop: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  difficultyChip: {
    height: 24,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  timeButton: {
    margin: 4,
  },
});
