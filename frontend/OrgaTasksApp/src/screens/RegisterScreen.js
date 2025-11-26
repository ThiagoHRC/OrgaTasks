import React, { useState } from 'react';
import { View, TextInput, Button, Alert, TouchableOpacity, ActivityIndicator, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://192.168.1.73:3001/api/auth/register', { email, password, name }); // Troque o IP pelo seu IPv4 local
      await AsyncStorage.setItem('token', response.data.token);
      Alert.alert('Sucesso!', 'Cadastro realizado! Redirecionando...');
      navigation.navigate('Tarefas');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TextInput placeholder="Nome" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
