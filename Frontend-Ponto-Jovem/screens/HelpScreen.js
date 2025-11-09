import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Linking, Image } from 'react-native';
import TabBar from '../components/TabBar';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

export default function HelpScreen() {
  const navigation = useNavigation();

  const handleCall = () => {
    Linking.openURL('tel:88997140476');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Ajuda</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../assets/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.description}>
          Está com algum problema ou precisa de suporte?{"\n"}Entre em contato conosco.
        </Text>

        <Pressable style={styles.callButton} onPress={handleCall}>
          <Text style={styles.callText}>Ligar</Text>
        </Pressable>

        <Pressable
          style={[styles.callButton, { backgroundColor: '#4b4b4b', marginTop: 16 }]}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Text style={styles.callText}>Política de Privacidade</Text>
        </Pressable>
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#6b6b6b' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  backButton: { marginRight: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },

  content: { flex: 1, alignItems: 'center', padding: 20, marginTop: 30 },
  logo: { width: 160, height: 160, marginBottom: 10 },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  callButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 12,
  },
  callText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
