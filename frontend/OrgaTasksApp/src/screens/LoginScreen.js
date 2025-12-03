import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,Alert,StyleSheet,KeyboardAvoidingView,Platform,Image} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const baseURL = 'https://marty-consistorian-untemporally.ngrok-free.dev'; // teu ngrok

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }

    try {
      const res = await axios.post(`${baseURL}/api/auth/login`, { email, password });
      await AsyncStorage.setItem('token', res.data.token);
      Alert.alert('Sucesso!', 'Bem-vindo de volta!');
      navigation.replace('Tarefas'); // ou 'Tasks', 'Boards', onde você quiser
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Falha no login');
    }
  };

  return (
    <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>OrgaTasks</Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#1976D2" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#1976D2" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.link}>Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 120 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1976D2', marginTop: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 30,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16 },
  button: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  link: { color: '#1976D2', fontSize: 16 },
  linkBold: { fontWeight: 'bold' },
});

export default LoginScreen;