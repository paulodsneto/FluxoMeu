import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput, ActivityIndicator, Modal, Pressable, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native'; // Fix no teclado do iphone que não confirmava
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Defs, LinearGradient, Stop, G, Circle, Path } from 'react-native-svg';

// Configuração do calendário
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';


// Declaração para salvar as chaves de armazenamento 
const STORAGE_KEY = '@cycle_data';
const USER_PROFILE_KEY = '@user_profile';

// Renderização da logo em SVG
const FluxoMeuLogo = () => (
  <View style={{ alignItems: 'center', marginBottom: 30 }}>
    <Svg viewBox="0 0 180 180" width={120} height={120}>
      <Defs>
        <LinearGradient id="fluxoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF6B81" />
          <Stop offset="100%" stopColor="#FF2A54" />
        </LinearGradient>
      </Defs>
      <G>
        <Circle cx="90" cy="90" r="90" fill="#FFF0F2" />
        <Path d="M90 20 C 90 20, 40 90, 40 130 C 40 157.6 62.4 175 90 175 C 117.6 175 140 157.6 140 130 C 140 90, 90 20, 90 20 Z" fill="url(#fluxoGradient)" />
        <Path d="M65 120 C 65 100, 80 70, 90 60 C 85 80, 75 110, 75 120 C 75 130, 80 135, 80 135 C 70 135, 65 130, 65 120 Z" fill="#ffffff" opacity="0.4" />
      </G>
    </Svg>
  </View>
);

// Definindo os estados da aplicação e as funções de carregamento, registro e manipulação de dados do que vai ser inputado
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [profileData, setProfileData] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [cycleData, setCycleData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Verificação de dados salvos no AsyncStorage (ou armazenamento local) para manter o usuário logado e os ciclos registrados mesmo após fechar o app

  const loadInitialData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (storedUser !== null) {
        setProfileData(JSON.parse(storedUser));
        setIsRegistered(true);
      }
      const storedCycle = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedCycle !== null) {
        setCycleData(JSON.parse(storedCycle));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Definição de função para formatar a data selecionada no modal, deixando mais amigável e legível para o usuário

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
  };

  const handleRegister = async () => {
    if (userName.trim() === '' || userAge.trim() === '') {
      Alert.alert('Atenção', 'Por favor, preencha seu nome e idade.');
      return;
    }
    const newProfile = { name: userName, age: userAge };
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
      setProfileData(newProfile);
      setIsRegistered(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    }
  };

  const logPeriod = async (flowLevel) => {
    if (!selectedDate) return;
    const updatedData = {
      ...cycleData,
      [selectedDate]: { ...cycleData[selectedDate], flow: flowLevel }
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setCycleData(updatedData);
    } catch (error) {
      console.error("Erro ao salvar fluxo:", error);
    }
  };

  const clearPeriod = async () => {
    if (!selectedDate || !cycleData[selectedDate]) return;
    const updatedData = { ...cycleData };
    delete updatedData[selectedDate];

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setCycleData(updatedData);
    } catch (error) {
      console.error("Erro ao limpar fluxo:", error);
    }
  };

  const getMarkedDates = () => {
    let baseMarkedDates = {};
    Object.keys(cycleData).forEach(date => {
      if (cycleData[date]?.flow) {
        baseMarkedDates[date] = { marked: true, dotColor: '#FF2A54' };
      }
    });

    if (selectedDate) {
      const newMarkedDates = JSON.parse(JSON.stringify(baseMarkedDates));
      Object.keys(newMarkedDates).forEach(date => {
        if (newMarkedDates[date]?.selected) {
          newMarkedDates[date] = { ...newMarkedDates[date], selected: false };
        }
      });
      newMarkedDates[selectedDate] = { 
        ...newMarkedDates[selectedDate], 
        selected: true, 
        selectedColor: '#FF6B81' 
      };
      return newMarkedDates;
    }
    return baseMarkedDates;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF2A54" />
      </View>
    );
  }

  if (!isRegistered) {
    // 1 Guarda todo o conteúdo visual em uma variável pra checar a plataforma do usuário
    const contentSetup = (
      <View style={styles.containerSetup}>
        <FluxoMeuLogo />
        <Text style={styles.subtitleSetup}>Para começarmos, conte um pouco sobre você.</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Como gostaria de ser chamada?</Text>
          <TextInput style={styles.input} placeholder="Digite seu nome" value={userName} onChangeText={setUserName} />
          <Text style={styles.label}>Qual a sua idade?</Text>
          <TextInput style={styles.input} placeholder="Digite sua idade" keyboardType="numeric" value={userAge} onChangeText={setUserAge} />
          <TouchableOpacity style={styles.mainButton} onPress={handleRegister}>
            <Text style={styles.mainButtonText}>Começar a Acompanhar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    // 2 Se for web, retornamos direto. Se for mobile, envolvemos em TouchableWithoutFeedback para fechar o teclado ao clicar fora e não bugar o form no iphone
    if (Platform.OS === 'web') {
      return contentSetup;
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {contentSetup}
      </TouchableWithoutFeedback>
    );
  }


  // Core da aplicação, calendário e modal de registro de fluxo
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Olá, {profileData?.name}</Text>
      
      <Calendar
        onDayPress={day => {
          setSelectedDate(day.dateString);
          setModalVisible(true);
        }}
        markedDates={getMarkedDates()}
        theme={{ 
          todayTextColor: '#FF6B81', 
          arrowColor: '#FF6B81',
          selectedDayTextColor: 'white' 
        }}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Envolvendo a tela escura em um Pressable para detectar o toque fora delar */}
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          
          {/* onStartShouldSetResponder impede que o toque na caixa branca vaze pro fundo e feche sem querer */}
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            
            <Text style={styles.modalTitle}>
              {formatDisplayDate(selectedDate)}
            </Text>
            
            <Text style={styles.subtitle}>Intensidade do Fluxo:</Text>
            
            <View style={styles.buttonRow}>
              {/* Botões agora mudam de cor se estiverem selecionados! */}
              <TouchableOpacity 
                style={[styles.button, cycleData[selectedDate]?.flow === 'Leve' && styles.buttonSelected]} 
                onPress={() => logPeriod('Leve')}
              >
                <Text style={styles.buttonText}>Leve</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, cycleData[selectedDate]?.flow === 'Médio' && styles.buttonSelected]} 
                onPress={() => logPeriod('Médio')}
              >
                <Text style={styles.buttonText}>Médio</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, cycleData[selectedDate]?.flow === 'Intenso' && styles.buttonSelected]} 
                onPress={() => logPeriod('Intenso')}
              >
                <Text style={styles.buttonText}>Intenso</Text>
              </TouchableOpacity>
            </View>

            {cycleData[selectedDate]?.flow && (
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity style={styles.clearButton} onPress={clearPeriod}>
                  <Text style={styles.clearButtonText}>Remover Registro do Dia</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>

          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    paddingTop: 60 
  },
  containerSetup: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    paddingTop: 80, 
    paddingHorizontal: 25 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FF2A54', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  subtitleSetup: { 
    fontSize: 16, 
    color: '#666666', 
    textAlign: 'center', 
    marginBottom: 40 
  },
  inputContainer: { 
    width: '100%' 
  },
  label: { 
    fontSize: 16, 
    color: '#333333', 
    fontWeight: '600', 
    marginBottom: 8, 
    marginTop: 15 
  },
  input: { 
    backgroundColor: '#F0F0F0', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    fontSize: 16, 
    marginBottom: 10 
  },
  mainButton: { 
    backgroundColor: '#FF2A54', 
    paddingVertical: 15, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginTop: 30, 
    elevation: 5 
  },
  mainButtonText: { 
    color: '#ffffff', 
    fontSize: 18, 
    fontWeight: 'bold'
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: '85%',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 20, 
    color: '#333333', 
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666666', 
    marginBottom: 15 
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginBottom: 10 },
  
  // Estilo base do botão 
  button: {
    backgroundColor: '#FFB6C1', 
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15
  },
  // Estilo aplicado dinamicamente quando selecionado (o vermelho principal)
  buttonSelected: {
    backgroundColor: '#FF2A54'
  },
  
  buttonText: { 
    color: '#ffffff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  clearButton: {
    backgroundColor: '#FFF0F2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FF2A54'
  },
  clearButtonText: { 
    color: '#FF2A54', 
    fontWeight: '600' 
  },
  closeModalButton: { 
    marginTop: 10, 
    padding: 10 
  },
  closeModalText: { 
    color: '#888888', 
    fontSize: 16, 
    fontWeight: '500'
   }
});