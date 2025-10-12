import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import Logo from '../assets/Logo.png';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');

    if (!form.email.trim()) {
      setError('E-mail é obrigatório');
      setLoading(false);
      return;
    }
    if (!form.password) {
      setError('Senha é obrigatória');
      setLoading(false);
      return;
    }

    try {
      await login(form.email.trim().toLowerCase(), form.password);
      // redirecionamento após login, se necessário
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />
      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(v) => setForm((s) => ({ ...s, email: v }))}
          placeholder="Digite o seu e-mail"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={form.password}
          onChangeText={(v) => setForm((s) => ({ ...s, password: v }))}
          placeholder="Digite sua senha"
          placeholderTextColor="#9ca3af"
          secureTextEntry
        />

        <Pressable style={[styles.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
        </Pressable>

        <View style={{ marginTop: 12 }}>
          <Text onPress={() => navigation.navigate('Forgot')} style={styles.link}>Problemas para entrar?</Text>
          <Text onPress={() => navigation.navigate('Register')} style={styles.link}>Novo aqui? Cadastre-se</Text>
          <Text onPress={() => navigation.navigate('Help')} style={styles.link}>Ajuda</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#171717', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#262626', borderRadius: 16, padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  label: { color: '#e5e7eb', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#171717', color: '#fff', borderWidth: 1, borderColor: '#404040', borderRadius: 12, padding: 12 },
  btn: { backgroundColor: '#6366f1', padding: 14, borderRadius: 12, marginTop: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { color: '#a5b4fc', marginTop: 8, textAlign: 'center' },
  error: { color: '#f87171', marginBottom: 8, textAlign: 'center' },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 16 },
});
