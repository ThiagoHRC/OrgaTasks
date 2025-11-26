import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TasksScreen = ({ navigation }) => {
  const [boards, setBoards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');


  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // Troque o IP abaixo pelo seu IPv4 local
      const response = await axios.get('http://192.168.1.73:3001/api/boards', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(response.data);
    } catch (error) {
      console.log('Erro ao buscar quadros:', error.response?.data || error.message);
      Alert.alert('Erro', 'Falha ao carregar quadros');
    }
  };

  const createBoard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post('http://192.168.1.73:3001/api/boards', {
        title: 'Novo Quadro',
        description: 'Adicione listas'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Sucesso!', 'Quadro criado!');
      fetchBoards();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Falha ao criar');
    }
  };

  const openEditModal = (board) => {
    setSelectedBoard(board);
    setNewTitle(board.title);
    setNewDescription(board.description || '');
    setModalVisible(true);
  };

  const updateBoard = async () => {
    if (!selectedBoard) return;

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`http://192.168.1.73:3001/api/boards/${selectedBoard.id}`, {
        title: newTitle,
        description: newDescription
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Sucesso!', 'Quadro atualizado!');
      setModalVisible(false);
      fetchBoards();
    } catch (error) {
      console.log('Erro ao atualizar quadro:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.error || 'Falha ao atualizar');
    }
  };

  const handleDeleteBoard = async (boardId) => {
    Alert.alert(
      'Excluir quadro',
      'Tem certeza que deseja excluir este quadro e todo o seu conteúdo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`http://192.168.1.73:3001/api/boards/${boardId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Sucesso', 'Quadro excluído!');
              fetchBoards();
            } catch (error) {
              console.log('Erro ao excluir quadro:', error.response?.data || error.message);
              Alert.alert('Erro', error.response?.data?.error || 'Falha ao excluir quadro');
            }
          },
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seus Quadros</Text>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('BoardDetailsScreen', {
                  boardId: item.id,
                  boardDescription: item.description,
                })
              }
            >
              <Text style={styles.boardTitle}>{item.title}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteBoard(item.id)}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />


      <TouchableOpacity style={styles.button} onPress={createBoard}>
        <Text style={styles.buttonText}>Criar Novo Quadro</Text>
      </TouchableOpacity>

      {/* Modal de edição */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Quadro</Text>
            <TextInput
              style={styles.input}
              placeholder="Novo título"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={newDescription}
              onChangeText={setNewDescription}
            />
          <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={updateBoard}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  item: { 
    padding: 10, 
    borderBottomWidth: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  boardTitle: { fontSize: 16 },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
  },
  editText: { color: '#fff', fontWeight: 'bold' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: { flexDirection: 'row', 
    justifyContent: 'space-between', 
  },
  saveButton: { backgroundColor: '#4CAF50', 
    padding: 10, 
    borderRadius: 8, 
    width: '45%', 
    alignItems: 'center',
   },
  cancelButton: { backgroundColor: '#f44336', 
    padding: 10, 
    borderRadius: 8, 
    width: '45%', 
    alignItems: 'center', 
  },
  deleteButton: {
  backgroundColor: '#f44336',
  padding: 8,
  borderRadius: 5,
},
  deleteText: { color: '#fff', 
    fontWeight: 'bold', 
  },

});

export default TasksScreen;
