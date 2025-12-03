import React, { useState, useEffect } from 'react';
import {View,Text,TouchableOpacity,FlatList,Alert,StyleSheet,Modal,TextInput, KeyboardAvoidingView,Platform} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TasksScreen = ({ navigation }) => {
  const [boards, setBoards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [sekectedBoardId, setSelectedBoardId] = useState(null);
  const [editModalTitle, setEditModalTitle] = useState('');
  const [editModalDesc, setEditModalDesc] = useState('');

  const baseURL = 'https://marty-consistorian-untemporally.ngrok-free.dev';

  const fetchBoards = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${baseURL}/api/boards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards(res.data);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao carregar quadros');
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const createBoard = async () => {
    if (!newBoardTitle.trim()) {
      Alert.alert('Erro', 'Dê um nome ao quadro');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${baseURL}/api/boards`,
        { title: newBoardTitle, description: newBoardDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewBoardTitle('');
      setNewBoardDesc('');
      setModalVisible(false);
      fetchBoards();
      Alert.alert('Sucesso', 'Quadro criado!');
    } catch (err) {
      Alert.alert('Erro', 'Falha ao criar quadro');
    }
  };

  const deleteBoard = async (id) => {
    Alert.alert('Excluir quadro', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${baseURL}/api/boards/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchBoards();
            Alert.alert('Sucesso', 'Quadro excluído');
          } catch (err) {
            Alert.alert('Erro', 'Falha ao excluir');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seus Quadros</Text>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.boardCard}>
            {/* Título clicável – abre detalhes */}
            <TouchableOpacity
              style={{ paddingVertical: 10 }}
              onPress={() => navigation.navigate('BoardDetailsScreen', {
                boardId: item.id,
                boardDescription: item.description,
              })}
            >
              <Text style={styles.boardTitle}>{item.title}</Text>
            </TouchableOpacity>

            {/* Botões editar e excluir – fora do TouchableOpacity grande */}
            <View style={styles.buttons}>
              {/* EDITAR */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setSelectedBoardId(item.id);
                  setEditModalTitle(item.title);
                  setEditModalDesc(item.description || '');
                  setEditModalVisible(true);
                }}
              >
                <Ionicons name="pencil" size={20} color="#1976D2" />
              </TouchableOpacity>

              {/* EXCLUIR */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteBoard(item.id)}
              >
                <Ionicons name="trash" size={20} color="#D32F2F" />
              </TouchableOpacity>
            </View>

            {/* Descrição */}
            {item.description ? (
              <Text style={styles.boardDesc}>{item.description}</Text>
            ) : (
              <Text style={styles.noDesc}>Sem descrição</Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum quadro ainda. Crie o primeiro!</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal Criar Quadro */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Quadro</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do quadro"
              value={newBoardTitle}
              onChangeText={setNewBoardTitle}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Descrição (opcional)"
              value={newBoardDesc}
              onChangeText={setNewBoardDesc}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={createBoard}>
                <Text style={styles.createText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Modal Editar Quadro */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Quadro</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do quadro"
              value={editModalTitle}
              onChangeText={setEditModalTitle}
              autoFocus
            />

            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Descrição (opcional)"
              value={editModalDesc}
              onChangeText={setEditModalDesc}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={async () => {
                  if (!editModalTitle.trim()) {
                    Alert.alert('Erro', 'O nome do quadro é obrigatório');
                    return;
                  }

                  try {
                    const token = await AsyncStorage.getItem('token');
                    await axios.put(`${baseURL}/api/boards/${sekectedBoardId}`,
                      {
                        title: editModalTitle,
                        description: editModalDesc,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    setEditModalVisible(false);
                    fetchBoards();
                    Alert.alert('Sucesso', 'Quadro atualizado!');
                  } catch (err) {
                    console.log(err.response?.data || err.message);
                    Alert.alert('Erro', 'Falha ao salvar alterações');
                  }
                }}
              >
                <Text style={styles.createText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1976D2', marginBottom: 20 },
  boardCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  boardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  buttons: { flexDirection: 'row', gap: 10 },
  editButton: { padding: 5 },
  deleteButton: { padding: 5 },
  boardDesc: { color: '#666', marginTop: 5 },
  noDesc: { color: '#999', fontStyle: 'italic', marginTop: 5 },
  empty: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 50 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '85%', elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1976D2', marginBottom: 15, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { backgroundColor: '#ccc', padding: 12, borderRadius: 10, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelText: { color: '#333', fontWeight: 'bold' },
  createButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, flex: 1, marginLeft: 10, alignItems: 'center' },
  createText: { color: '#fff', fontWeight: 'bold' },
});

export default TasksScreen;