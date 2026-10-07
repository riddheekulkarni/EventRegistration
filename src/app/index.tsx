import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { addRegistration, createTable } from '../database/database';

export default function HomeScreen() {
  createTable();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');

function submitForm() {
  if (name === '' || phone === '' || city === '') {
    setMessage('Please fill all the fields.');
    return;
  }

  if (phone.length !== 10 || phone[0] === '0') {
  setMessage('Please enter a valid 10-digit WhatsApp number.');
  return;
  }

  addRegistration(name, phone, city);
  setMessage('Registration saved successfully!');
}

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Event Registration</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>WhatsApp Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 10-digit number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={10}
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your city"
        value={city}
        onChangeText={setCity}
      />

      <Button title="Submit" onPress={submitForm} />
      <Text>{message}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 12,
    marginBottom: 20,
    borderRadius: 5,
  },
});