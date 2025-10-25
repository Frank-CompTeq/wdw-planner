import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, ProgressBar, Chip } from 'react-native-paper';
import { DVCContract } from '../types';

interface DVCPointsBarProps {
  contract: DVCContract;
  pointsUsed?: number;
  showDetails?: boolean;
}

export default function DVCPointsBar({ 
  contract, 
  pointsUsed = 0, 
  showDetails = false 
}: DVCPointsBarProps) {
  const totalPoints = contract.annual_points + contract.banked_points + contract.borrowed_points;
  const availablePoints = contract.current_points - pointsUsed;
  const usagePercentage = (pointsUsed / totalPoints) * 100;
  const availablePercentage = (availablePoints / totalPoints) * 100;

  const getStatusColor = (percentage: number) => {
    if (percentage > 80) return '#F44336'; // Red
    if (percentage > 60) return '#FF9800'; // Orange
    return '#4CAF50'; // Green
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString('fr-FR');
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{contract.home_resort}</Title>
          <Chip style={styles.useYearChip}>
            {contract.use_year}
          </Chip>
        </View>
        
        <View style={styles.pointsContainer}>
          <View style={styles.pointsRow}>
            <Paragraph style={styles.pointsLabel}>Points utilisés:</Paragraph>
            <Paragraph style={[styles.pointsValue, { color: getStatusColor(usagePercentage) }]}>
              {formatPoints(pointsUsed)}
            </Paragraph>
          </View>
          
          <ProgressBar 
            progress={usagePercentage / 100} 
            color={getStatusColor(usagePercentage)}
            style={styles.progressBar}
          />
          
          <View style={styles.pointsRow}>
            <Paragraph style={styles.pointsLabel}>Points disponibles:</Paragraph>
            <Paragraph style={[styles.pointsValue, { color: '#4CAF50' }]}>
              {formatPoints(availablePoints)}
            </Paragraph>
          </View>
          
          <ProgressBar 
            progress={availablePercentage / 100} 
            color="#4CAF50"
            style={styles.progressBar}
          />
        </View>
        
        {showDetails && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Points annuels:</Paragraph>
              <Paragraph style={styles.detailValue}>
                {formatPoints(contract.annual_points)}
              </Paragraph>
            </View>
            
            {contract.banked_points > 0 && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Points reportés:</Paragraph>
                <Paragraph style={styles.detailValue}>
                  {formatPoints(contract.banked_points)}
                </Paragraph>
              </View>
            )}
            
            {contract.borrowed_points > 0 && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Points empruntés:</Paragraph>
                <Paragraph style={[styles.detailValue, { color: '#FF9800' }]}>
                  {formatPoints(contract.borrowed_points)}
                </Paragraph>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Total:</Paragraph>
              <Paragraph style={[styles.detailValue, { fontWeight: 'bold' }]}>
                {formatPoints(totalPoints)}
              </Paragraph>
            </View>
          </View>
        )}
      </Card.Content>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  useYearChip: {
    backgroundColor: '#E3F2FD',
  },
  pointsContainer: {
    marginBottom: 16,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  details: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
