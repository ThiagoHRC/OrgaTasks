import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DraxProvider, DraxView, DraxScrollView } from 'react-native-drax';
import DraggableFlatList from 'react-native-draggable-flatlist';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BoardDetailsScreen = ({ route }) => {
  const { boardId, boardDescription } = route.params;
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [newCardTitles, setNewCardTitles] = useState({});

  const baseURL = 'http://192.168.1.73:3001';

  const fetchLists = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${baseURL}/api/lists/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLists(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Falha ao carregar listas');
    }
  };

  const createList = async () => {
    if (!newListTitle.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${baseURL}/api/lists`, { boardId, title: newListTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewListTitle('');
      fetchLists();
    } catch (err) {
      Alert.alert('Erro', 'Falha ao criar lista');
    }
  };

  const createCard = async (listId) => {
    const title = newCardTitles[listId];
    if (!title?.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${baseURL}/api/cards`, { listId, title }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCardTitles((prev) => ({ ...prev, [listId]: '' }));
      fetchLists();
    } catch (err) {
      Alert.alert('Erro', 'Falha ao criar card');
    }
  };

  // DELETE com logging detalhado
  const handleDeleteList = async (listId) => {
    Alert.alert(
      'Excluir lista',
      'Tem certeza que deseja excluir esta lista e todos os seus cards?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              console.log('Deletando lista id=', listId, 'com token=', !!token);
              const res = await axios.delete(`${baseURL}/api/lists/${listId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log('Resposta delete list:', res.status, res.data);
              fetchLists();
              Alert.alert('Sucesso', 'Lista excluída com sucesso');
            } catch (err) {
              console.log('Erro delete list raw:', err);
              console.log('Erro delete list response.data:', err.response?.data);
              console.log('Erro delete list status:', err.response?.status);
              Alert.alert('Erro', err.response?.data?.error || err.message || 'Falha ao excluir lista');
            }
          },
        },
      ]
    );
  };

  const handleDeleteCard = async (cardId) => {
    Alert.alert(
      'Excluir card',
      'Deseja realmente excluir este card?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              console.log('Deletando card id=', cardId, 'com token=', !!token);
              const res = await axios.delete(`${baseURL}/api/cards/${cardId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log('Resposta delete card:', res.status, res.data);
              fetchLists();
              Alert.alert('Sucesso', 'Card excluído com sucesso');
            } catch (err) {
              console.log('Erro delete card raw:', err);
              console.log('Erro delete card response.data:', err.response?.data);
              console.log('Erro delete card status:', err.response?.status);
              Alert.alert('Erro', err.response?.data?.error || err.message || 'Falha ao excluir card');
            }
          },
        },
      ]
    );
  };


  useEffect(() => { fetchLists(); }, []);

  const saveCardPositions = async (updatedCards, listId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(`${baseURL}/api/cards/reorder`, {
        listId,
        cards: updatedCards.map((card) => ({ id: card.id, position: card.position }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Posições salvas no DB!');  // Log pra debug
      fetchLists();  // Recarrega da API pra confirmar
    } catch (error) {
      console.log('Erro ao salvar positions:', error.response?.data || error.message);
      Alert.alert('Erro', 'Falha ao salvar posição do card');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.boardTitle}>Quadro</Text>
      <Text style={styles.description}>{boardDescription || 'Sem descrição.'}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {lists.map((list) => (
          <View key={list.id} style={styles.list}>
            {list.isEditing ? (
              <TextInput
                style={styles.editInput}
                value={list.title}
                onChangeText={(text) => {
                  const updatedLists = lists.map((l) =>
                    l.id === list.id ? { ...l, title: text } : l
                  );
                  setLists(updatedLists);
                }}
                onBlur={async () => {
                  try {
                    const token = await AsyncStorage.getItem('token');
                    await axios.put(`${baseURL}/api/lists/${list.id}`, 
                      { title: list.title },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setLists((prev) =>
                      prev.map((l) =>
                        l.id === list.id ? { ...l, isEditing: false } : l
                      )
                    );
                  } catch {
                    Alert.alert('Erro', 'Falha ao atualizar título da lista');
                  }
                }}
              />
            ) : (
              <TouchableOpacity
                onLongPress={() => {
                  setLists((prev) =>
                    prev.map((l) =>
                      l.id === list.id ? { ...l, isEditing: true } : l
                    )
                  );
                }}
              >
                <Text style={styles.listTitle}>{list.title}</Text>
              </TouchableOpacity>
            )}

            {/* Botão de excluir lista */}
            <TouchableOpacity
              style={styles.deleteListButton}
              onPress={() => handleDeleteList(list.id)}
            >
              <Text style={styles.deleteText}>🗑️ Excluir Lista</Text>
            </TouchableOpacity>

            <DraggableFlatList
              data={list.cards}
              keyExtractor={(item) => item.id}
              renderItem={({ item: card, drag, isActive }) => (
                <TouchableOpacity
                  onLongPress={drag}
                  disabled={isActive}
                  style={[
                    styles.card,
                    { backgroundColor: isActive ? '#d0d0d0' : '#eaeaea' },
                  ]}
                >
                  {card.isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={card.title}
                      onChangeText={(text) => {
                        const updatedLists = lists.map((l) =>
                          l.id === list.id
                            ? {
                                ...l,
                                cards: l.cards.map((c) =>
                                  c.id === card.id ? { ...c, title: text } : c
                                ),
                              }
                            : l
                        );
                        setLists(updatedLists);
                      }}
                      onBlur={async () => {
                        try {
                          const token = await AsyncStorage.getItem('token');
                          await axios.put(`${baseURL}/api/cards/${card.id}`,
                            { title: card.title },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          fetchLists();
                        } catch {
                          Alert.alert('Erro', 'Falha ao atualizar card');
                        }
                      }}
                    />
                  ) : (
                    <TouchableOpacity
                      onLongPress={() => {
                        const updatedLists = lists.map((l) =>
                          l.id === list.id
                            ? {
                                ...l,
                                cards: l.cards.map((c) =>
                                  c.id === card.id ? { ...c, isEditing: true } : c
                                ),
                              }
                            : l
                        );
                        setLists(updatedLists);
                      }}
                    >
                      <Text>{card.title}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleDeleteCard(card.id)}
                    style={styles.deleteCardButton}
                  >
                    <Text style={styles.deleteText}>Excluir Card</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              onDragEnd={({ data }) => {
                const updatedCards = data.map((card, index) => ({ ...card, position: index })); // Atualiza posições
                const updatedLists = lists.map((l) =>
                  l.id === list.id ? { ...l, cards: updatedCards } : l
                );
                setLists(updatedLists); // Atualiza estado local

                // Salva no DB
                saveCardPositions(updatedCards, list.id);
              }}
            />


            <TextInput
              style={styles.input}
              placeholder="Novo card..."
              value={newCardTitles[list.id] || ''}
              onChangeText={(text) =>
                setNewCardTitles((prev) => ({ ...prev, [list.id]: text }))
              }
            />
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => createCard(list.id)}
            >
              <Text style={styles.addCardText}>+ Adicionar Card</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Adicionar nova lista */}
        <View style={styles.newListContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nova lista..."
            value={newListTitle}
            onChangeText={setNewListTitle}
          />
          <TouchableOpacity style={styles.addListButton} onPress={createList}>
            <Text style={styles.addListText}>+ Criar Lista</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: '#f0f2f5', 
  },
  boardTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 5, 
  },
  description: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 15, 
  },
  list: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: 220,
    marginRight: 15,
    elevation: 4,
  },
  listTitle: { fontWeight: 'bold', 
    fontSize: 18, 
    marginBottom: 8, 
  },
  card: {
    backgroundColor: '#eaeaea',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  addCardButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addCardText: { color: '#fff', 
    fontWeight: 'bold', 
  },
  newListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
  },
  addListButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
  },
  addListText: { color: '#fff', 
    fontWeight: 'bold', 
  },
  editInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 6,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  deleteListButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 6,
    alignItems: 'center',
    marginBottom: 6,
  },
  deleteCardButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  deleteText: { color: 'red', 
    fontWeight: 'bold', 
  },
});

export default BoardDetailsScreen;
