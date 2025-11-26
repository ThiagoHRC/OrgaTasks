import React, { useState } from 'react';
import { View, TextInput, Button, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);

      // Troque o IP abaixo pelo seu IPv4 local
      const response = await axios.post('http://192.168.1.73:3001/api/auth/login', {
        email,
        password,
      });

      await AsyncStorage.setItem('token', response.data.token);
      Alert.alert('Sucesso!', 'Login realizado!');
      navigation.navigate('Tarefas'); // ou "Boards", dependendo do fluxo

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.error || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>Entrar</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 20 }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: '#007BFF',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center'
        }}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16 }}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={{ textAlign: 'center', marginTop: 15, color: '#007BFF' }}>
          Não tem conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
