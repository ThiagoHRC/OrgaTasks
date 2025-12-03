import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import RegisterScreen from './src/screens/RegisterScreen';
import TasksScreen from './src/screens/TasksScreen';
import LoginScreen from './src/screens/LoginScreen';
import BoardDetailsScreen from './src/screens/BoardDetailsScreen';
import { StackScreen } from 'react-native-screens';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#2196F3" />
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Cadastro" 
          component={RegisterScreen} 
          options={{ title: 'Cadastro' }} 
        />
        <Stack.Screen 
          name="Tarefas" 
          component={TasksScreen} 
          options={{ title: 'OrgaTasks' }} 
        />
        <Stack.Screen
          name="BoardDetailsScreen"
          component={BoardDetailsScreen}
          options={{ title: 'Detalhes do Quadro' }}
        />  
      </Stack.Navigator>
    </NavigationContainer>
  );
}