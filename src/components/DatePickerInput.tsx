import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  disabled?: boolean;
  error?: boolean;
  style?: any;
}

export default function DatePickerInput({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  mode = 'date',
  disabled = false,
  error = false,
  style,
}: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    if (mode === 'time') {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDismiss = () => {
    setShow(false);
  };

  // On Web, show a native HTML5 date input
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <TextInput
          label={label}
          value={formatDate(value)}
          mode="outlined"
          editable={false}
          disabled={disabled}
          error={error}
          right={
            <TextInput.Icon
              icon="calendar"
              onPress={() => !disabled && setShow(true)}
            />
          }
          onPressIn={() => !disabled && setShow(true)}
          style={styles.input}
        />
        {show && (
          <input
            type="date"
            value={value.toISOString().split('T')[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                onChange(newDate);
              }
              setShow(false);
            }}
            min={minimumDate?.toISOString().split('T')[0]}
            max={maximumDate?.toISOString().split('T')[0]}
            style={styles.webDateInput}
          />
        )}
      </View>
    );
  }

  // iOS shows the picker inline or as a modal
  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={formatDate(value)}
        mode="outlined"
        editable={false}
        disabled={disabled}
        error={error}
        right={
          <TextInput.Icon
            icon="calendar"
            onPress={() => !disabled && setShow(true)}
          />
        }
        onPressIn={() => !disabled && setShow(true)}
        style={styles.input}
      />

      {show && Platform.OS === 'ios' && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <Button onPress={handleDismiss}>Cancel</Button>
            <Button onPress={() => setShow(false)}>Done</Button>
          </View>
          <DateTimePicker
            value={value}
            mode={mode}
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.picker}
          />
        </View>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  picker: {
    width: '100%',
  },
  iosPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  webDateInput: {
    position: 'absolute',
    opacity: 0,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
});
