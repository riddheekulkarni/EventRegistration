import { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import {
  addRegistration,
  createTable,
  getPendingRegistrations,
  getRegistrations,
  markRegistrationSynced
} from '../database/database';

const API_URL = 'http://192.168.31.233:8000/api/register/';

export default function HomeScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    createTable();
    showRegistrations();
  }, []);

  function showRegistrations() {
    const data = getRegistrations();
    setRegistrations(data);
  }

  function submitForm() {
    if (
      name.trim() === '' ||
      phone.trim() === '' ||
      city.trim() === ''
    ) {
      setMessage('Please fill all the fields.');
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      setMessage('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    try {
      const saved = addRegistration(name, phone, city);

      if (saved === false) {
        setMessage('This registration already exists.');
        return;
      }

      showRegistrations();
      setMessage('Registration saved successfully!');
      setName('');
      setPhone('');
      setCity('');
    } catch (error) {
      setMessage('Could not save registration. Please try again.');
    }
  }

  async function syncRegistrations() {
    if (syncing) {
      return;
    }

    setSyncing(true);
    setMessage('Syncing registrations...');

    try {
      const pending = getPendingRegistrations();
      let syncedCount = 0;

      for (let i = 0; i < pending.length; i++) {
        const item = pending[i];

        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: item.name,
              phone: item.phone,
              city: item.city,
              sync_id: item.sync_id
            })
          });

          const result = await response.json();

          if (
            response.status === 201 ||
            (
              response.status === 200 &&
              result.message ===
                'This registration has already been received.'
            )
          ) {
            markRegistrationSynced(item.id);
            syncedCount++;
          } else if (response.status === 409) {
            setMessage(
              'A duplicate registration was found on the server. It needs review.'
            );
          } else {
            setMessage(
              'Some registrations could not be synced. Please try again.'
            );
          }
        } catch (error) {
          setMessage(
            'Connection failed. Registrations remain saved on this device.'
          );
          break;
        }
      }

      showRegistrations();

      if (pending.length === 0) {
        setMessage('There are no pending registrations.');
      } else if (syncedCount === pending.length) {
        setMessage('All pending registrations synced successfully!');
      } else if (syncedCount > 0) {
        setMessage(
          syncedCount + ' registration(s) synced. Some still need syncing.'
        );
      }
    } finally {
      setSyncing(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <View style={styles.buttonSpace}>
        <Button
          title={syncing ? 'Syncing...' : 'Sync Now'}
          onPress={syncRegistrations}
          disabled={syncing}
        />
      </View>

      <Text style={styles.message}>{message}</Text>

      <Text style={styles.heading}>Saved Registrations</Text>

      {registrations.map((item) => (
        <View style={styles.card} key={item.id}>
          <Text>Name: {item.name}</Text>
          <Text>WhatsApp: {item.phone}</Text>
          <Text>City: {item.city}</Text>
          <Text>Status: {item.sync_status}</Text>
        </View>
      ))}

      {registrations.length === 0 && (
        <Text>No registrations saved yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },
  label: {
    fontSize: 16,
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 12,
    marginBottom: 20,
    borderRadius: 5
  },
  buttonSpace: {
    marginTop: 12
  },
  message: {
    marginTop: 10,
    marginBottom: 20
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15
  },
  card: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 12,
    marginBottom: 10,
    borderRadius: 5
  }
});