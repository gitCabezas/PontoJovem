
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { useAuth } from '../providers/AuthProvider';

export default function JustifyScreen({ navigation }) {
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);
  const { session } = useAuth();

  const handleJustify = () => {

    console.log('Justificativa enviada!', reason, file);
    setReason('');
    setFile(null);
  };

  return (
    <SafeAreaView style={styles.screen}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Justificar</Text>
      </View>

      
      <View style={styles.content}>
        <Text style={styles.label}>Informe a causa</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="Descreva o motivo"
        />

        <Text style={styles.label}>Anexe um comprovante</Text>
        <Pressable style={styles.fileButton}>
          <Text style={styles.fileButtonText}>
            {file ? file.name : 'Aperte para subir o arquivo'}
          </Text>
        </Pressable>

        <Pressable style={styles.justifyButton} onPress={handleJustify}>
          <Text style={styles.justifyText}>Justificar</Text>
        </Pressable>
      </View>

      
      <View style={styles.tabFloat}>
        <Pressable style={styles.tabBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.tabText}>Início</Text>
        </Pressable>
        <Pressable style={styles.tabBtn} onPress={() => navigation.navigate('ReportScreen')}>
          <Text style={styles.tabText}>Relatório</Text>
        </Pressable>
        <Pressable style={styles.tabBtn} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.tabText}>Perfil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#6b6b6b' },
  header: { justifyContent: 'center', alignItems: 'center', paddingTop: 20, paddingBottom: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },

  content: { padding: 16, marginTop: 20 },
  label: { color: '#fff', fontSize: 18, marginBottom: 8 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 },
  fileButton: { backgroundColor: '#898989', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  fileButtonText: { color: '#fff', fontWeight: '700' },

  justifyButton: { backgroundColor: '#898989', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  justifyText: { color: '#fff', fontWeight: '700' },

  tabFloat: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#2b2b2b',
    borderRadius: 24,
    height: 58,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  tabText: { color: '#e5e5e5', fontWeight: '600', fontSize: 14 },
});
