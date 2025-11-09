import React, { useState } from 'react';
import { View, Text, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { validation } from '../utils/validation';
import { auth } from '../utils/auth';
import Field from '../components/Field';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    data_nascimento: '',
    senha: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    e.nome = validation.required(form.nome, 'Nome');
    e.email = validation.email(form.email);
    e.data_nascimento = validation.required(form.data_nascimento, 'Data de nascimento');
    e.senha = validation.password(form.senha);
    e.confirmPassword = validation.confirmPassword(form.senha, form.confirmPassword);
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
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
        data_nascimento: form.data_nascimento.trim()
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
          label="Nome completo"
          value={form.nome}
          onChangeText={onChange('nome')}
          placeholder="Digite seu nome"
          error={errors.nome}
        />

        <Field
          label="E-mail"
          value={form.email}
          onChangeText={onChange('email')}
          placeholder="Digite seu e-mail"
          error={errors.email}
        />

        <Field
          label="Data de nascimento (DD-MM-AAAA)"
          value={form.data_nascimento}
          onChangeText={onChange('data_nascimento')}
          placeholder="07-08-2004"
          error={errors.data_nascimento}
        />

        <Field
          label="Senha"
          value={form.senha}
          onChangeText={onChange('senha')}
          placeholder="Digite sua senha"
          secure
          error={errors.senha}
        />

        <Field
          label="Confirmar senha"
          value={form.confirmPassword}
          onChangeText={onChange('confirmPassword')}
          placeholder="Repita sua senha"
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
