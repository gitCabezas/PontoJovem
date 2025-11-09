
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import TabBar from '../components/TabBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { getApiBase } from '../utils/api';

export default function ProfileScreen() {
  const { logout, session } = useAuth();
  const navigation = useNavigation();

  const id_usuario =
    session?.id_usuario ||
    session?.user?.id_usuario ||
    session?.user_metadata?.id_usuario;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    nome: session?.username || 'Usuário',
    email: session?.email || '-',
    data_nascimento: session?.birthDate || '',
    identificacao: session?.id || session?.identificacao || '-',
    avatar: session?.avatar || null,
  });


  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchUser = async () => {
        if (!id_usuario) {
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          const base = await getApiBase();
          const res = await fetch(`${base}/usuario/${id_usuario}`);
          const data = await res.json();

          if (isActive && res.ok && data) {
            setUser((prev) => ({
              ...prev,
              nome: data.nome || prev.nome,
              email: data.email || prev.email,
              data_nascimento: data.data_nascimento || prev.data_nascimento,
              identificacao: data.identificacao || prev.identificacao,

              avatar: data.avatar || prev.avatar,
            }));
          }
        } catch (e) {

          console.log('Erro ao carregar usuário:', e);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchUser();
      return () => {
        isActive = false;
      };
    }, [id_usuario])
  );

  const hasAvatar = !!user.avatar;


  const formatDateBR = (d) => {
    if (!d) return '-';
    const s = String(d).trim();

    let m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;

    m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;

    const dt = new Date(s);
    return isNaN(dt.getTime()) ? s : dt.toLocaleDateString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <View style={styles.headerCard}>
          {hasAvatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View className="avatarPlaceholder" style={styles.avatarPlaceholder}>
              <Feather name="user" size={34} color="#fff" />
            </View>
          )}

          <Text style={styles.name}>{user.nome || 'Usuário'}</Text>
          {!!user.email && <Text style={styles.email}>{user.email}</Text>}
        </View>
      </View>

      <View style={styles.infoBox}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <ActivityIndicator size="small" color="#22c55e" />
            <Text style={{ color: '#e5e7eb', marginTop: 6 }}>Carregando...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email || '-'}</Text>

            <Text style={[styles.infoLabel, { marginTop: 14 }]}>Data de Nascimento:</Text>
            <Text style={styles.infoValue}>{formatDateBR(user.data_nascimento)}</Text>
          </>
        )}
      </View>

      <View style={styles.menu}>
        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <AntDesign name="idcard" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.menuText}>Informações Pessoais</Text>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate('Help')}
        >
          <Feather name="help-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.menuText}>Ajuda</Text>
        </Pressable>

        <Pressable style={[styles.menuButton, styles.exitButton]} onPress={logout}>
          <Feather name="log-out" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.menuText}>Sair</Text>
        </Pressable>
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const BG = '#6b6b6b';
const CARD = '#3a3a3a';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  headerWrap: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  headerCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#555' },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#4b5563',
    alignItems: 'center', justifyContent: 'center',
  },

  name: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 10 },
  email: { color: '#e5e7eb', fontSize: 13, marginTop: 2 },

  infoBox: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
  },
  infoLabel: { color: '#d1d5db', fontSize: 14, fontWeight: '700' },
  infoValue: { color: '#fff', fontSize: 15, marginTop: 4 },

  menu: { padding: 16, marginTop: 16, gap: 10 },
  menuButton: {
    backgroundColor: '#4b4b4b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
  },
  exitButton: { backgroundColor: '#d65a5a' },
  menuText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
