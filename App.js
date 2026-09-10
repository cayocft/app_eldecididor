import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';

export default function App() {
  const [nickname, setNickname] = useState(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionInput, setOptionInput] = useState('');
  const [winner, setWinner] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadNickname();
  }, []);

  const loadNickname = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_nickname');
      if (stored) {
        setNickname(stored);
      }
    } catch (error) {
      console.error('Error loading nickname:', error);
    }
  };

  const saveNickname = async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      Alert.alert('Aviso', 'Por favor ingresa un nombre o apodo.');
      return;
    }
    try {
      await AsyncStorage.setItem('user_nickname', trimmed);
      setNickname(trimmed);
      setNicknameInput('');
      setIsEditingNickname(false);
    } catch (error) {
      console.error('Error saving nickname:', error);
    }
  };

  const clearNickname = async () => {
    try {
      await AsyncStorage.removeItem('user_nickname');
      setNickname(null);
      setNicknameInput('');
      setIsEditingNickname(false);
    } catch (error) {
      console.error('Error clearing nickname:', error);
    }
  };

  const addOption = () => {
    const trimmed = optionInput.trim();
    if (!trimmed) return;
    setOptions([...options, trimmed]);
    setOptionInput('');
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const pickRandom = () => {
    if (options.length < 2) {
      Alert.alert('Aviso', 'Agrega al menos 2 opciones para decidir.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * options.length);
    setWinner(options[randomIndex]);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const reroll = () => {
    const randomIndex = Math.floor(Math.random() * options.length);
    setWinner(options[randomIndex]);
  };

  if (!nickname || isEditingNickname) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>� ¡Bienvenido!</Text>
          <Text style={styles.subtitle}>
            {isEditingNickname ? 'Edita tu nombre o apodo' : 'Ingresa tu nombre o apodo para comenzar'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre o apodo..."
            placeholderTextColor={colors.textMuted}
            value={nicknameInput}
            onChangeText={setNicknameInput}
            onSubmitEditing={saveNickname}
          />
          <View style={styles.rowButtons}>
            {isEditingNickname && (
              <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={clearNickname}>
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.button} onPress={saveNickname}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>¡Hola, {nickname}!</Text>
        <TouchableOpacity style={styles.smallButton} onPress={() => setIsEditingNickname(true)}>
          <Text style={styles.smallButtonText}>Cambiar Apodo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🎯 Tus Opciones</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            placeholder="Escribe una opción..."
            placeholderTextColor={colors.textMuted}
            value={optionInput}
            onChangeText={setOptionInput}
            onSubmitEditing={addOption}
          />
          <TouchableOpacity style={[styles.button, styles.buttonSmall]} onPress={addOption}>
            <Text style={styles.buttonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={options}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aún no hay opciones. ¡Agrega algunas arriba!</Text>
          }
          renderItem={({ item, index }) => (
            <View style={styles.optionCard}>
              <Text style={styles.optionText}>{item}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => removeOption(index)}>
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity style={styles.buttonPrimary} onPress={pickRandom}>
          <Text style={styles.buttonPrimaryText}>🎲 ¡Decidir por mí!</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>✨ ¡El ganador es!</Text>
            <View style={styles.winnerBox}>
              <Text style={styles.winnerText}>{winner}</Text>
            </View>
            <View style={styles.rowButtons}>
              <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={closeModal}>
                <Text style={styles.buttonSecondaryText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={reroll}>
                <Text style={styles.buttonText}>🔄 Volver a tirar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const colors = {
  background: '#f0f4f8',
  card: '#ffffff',
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#e2e8f0',
  danger: '#ef4444',
  text: '#1a202c',
  textMuted: '#a0aec0',
  accent: '#fef3c7',
  accentText: '#92400e',
  shadow: '#000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.secondary,
  },
  smallButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  inputFlex: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSmall: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonSecondaryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  list: {
    maxHeight: 320,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  winnerBox: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  winnerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.accentText,
    textAlign: 'center',
  },
});
