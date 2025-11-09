
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView, StyleSheet, Alert } from 'react-native';
import { validation } from '../utils/validation';
import { getApiBase } from '../utils/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');


    const emailError = validation.email(email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    try {
      const base = await getApiBase();
      const res = await fetch(`${base}/recuperar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert(
          'Verifique seu e-mail 📩',
          'Enviamos um link para redefinir sua senha. Ele expira em 1 hora.'
        );
        navigation.navigate('Login');
      } else {
        setError(data.message || 'Erro ao enviar e-mail de recuperação.');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar senha</Text>

        <Text style={styles.label}>Digite seu e-mail cadastrado</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@email.com"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Enviando...' : 'Enviar link'}</Text>
        </Pressable>

        <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
          Voltar ao login
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#171717', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#262626', borderRadius: 16, padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  label: { color: '#e5e7eb', marginBottom: 6 },
  input: {
    backgroundColor: '#171717',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  btn: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center'
  },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { color: '#a5b4fc', marginTop: 16, textAlign: 'center' },
  error: { color: '#f87171', marginTop: 4, textAlign: 'center' }
});
