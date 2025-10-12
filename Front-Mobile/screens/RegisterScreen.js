import React, { useState } from 'react';
import { View, Text, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { validation } from '../utils/validation';
import { auth } from '../utils/auth';
import Field from '../components/Field';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    birthDate: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    e.username = validation.required(form.username, 'Nome de usuário');
    e.email = validation.email(form.email);
    e.birthDate = validation.date(form.birthDate);
    e.password = validation.password(form.password);
    e.confirmPassword = validation.confirmPassword(form.password, form.confirmPassword);
    return Object.fromEntries(Object.entries(e).filter(([_, v]) => v));
  };

  const submit = async () => {
    setLoading(true);
    setErrors({});
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    try {
      await auth.register({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        birthDate: form.birthDate,
        password: form.password
      });
      navigation.navigate('Login');
    } catch (e) {
      setErrors({ general: e.message });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (id) => (v) => setForm((s) => ({ ...s, [id]: v }));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Cadastro</Text>
        {!!errors.general && <Text style={styles.error}>{errors.general}</Text>}

        <Field
          label="Nome de usuário"
          value={form.username}
          onChangeText={onChange('username')}
          placeholder="Digite nome de usuário"
          error={errors.username}
        />

        <Field
          label="E-mail"
          value={form.email}
          onChangeText={onChange('email')}
          placeholder="Digite e-mail"
          error={errors.email}
        />

        <Field
          label="Data de nascimento (DD-MM-AAAA)"
          value={form.birthDate}
          onChangeText={onChange('birthDate')}
          placeholder="dd-mm-aaaa"
          error={errors.birthDate}
        />

        <Field
          label="Senha"
          value={form.password}
          onChangeText={onChange('password')}
          placeholder="Digite senha"
          secure
          error={errors.password}
        />

        <Field
          label="Repetir senha"
          value={form.confirmPassword}
          onChangeText={onChange('confirmPassword')}
          placeholder="Digite repetir senha"
          secure
          error={errors.confirmPassword}
        />

        <Pressable style={[styles.btn, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </Pressable>

        <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
          Já tem uma conta? Faça login
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#171717', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#262626', borderRadius: 16, padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  btn: { backgroundColor: '#6366f1', padding: 14, borderRadius: 12, marginTop: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { color: '#a5b4fc', marginTop: 12, textAlign: 'center' },
  error: { color: '#f87171', marginTop: 4 }
});
