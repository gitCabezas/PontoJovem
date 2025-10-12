import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { auth } from '../utils/auth';
import { validation } from '../utils/validation';
import { storage } from '../utils/storage';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({ identifier:'', code:'', password:'', confirmPassword:'' });
  const [errors, setErrors] = useState({});
  const [loading,setLoading] = useState(false);

  const maskEmail = (email) => {
    const [u,d] = email.split('@'); return `${u[0]}${'*'.repeat(Math.max(u.length-2,1))}${u.slice(-1)}@${d}`;
  };

  const step1 = async () => {
    setLoading(true); setErrors({});
    const found = await storage.findUser(form.identifier);
    if (!found) { setErrors({identifier:'Usuário ou e-mail não encontrado'}); setLoading(false); return; }
    setUserData(found); setStep(2); setLoading(false);
  };

  const step2 = async () => {
    if (!form.code.trim()) { setErrors({code:'Código é obrigatório'}); return; }
    setStep(3);
  };

  const step3 = async () => {
    setLoading(true); setErrors({});
    const e = {
      password: validation.password(form.password),
      confirmPassword: validation.confirmPassword(form.password, form.confirmPassword)
    };
    const filtered = Object.fromEntries(Object.entries(e).filter(([_,v])=>v));
    if (Object.keys(filtered).length) { setErrors(filtered); setLoading(false); return; }
    await auth.resetPassword(userData.username, form.password);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{step===1?'Recuperar senha': step===2?'Código de verificação':'Nova senha'}</Text>

        {step===1 && <>
          <Text style={styles.label}>Usuário ou e-mail</Text>
          <TextInput style={styles.input} value={form.identifier} onChangeText={(v)=>setForm(s=>({...s,identifier:v}))} placeholderTextColor="#9ca3af" />
          {!!errors.identifier && <Text style={styles.error}>{errors.identifier}</Text>}
          <Pressable style={styles.btn} onPress={step1}><Text style={styles.btnText}>{loading?'Verificando...':'Próximo'}</Text></Pressable>
          <Text onPress={()=>navigation.navigate('Login')} style={styles.link}>Voltar ao login</Text>
        </>}

        {step===2 && <>
          <Text style={{color:'#d4d4d8', textAlign:'center', marginBottom:12}}>
            Enviamos um código para {maskEmail(userData?.email || '')}
          </Text>
          <Text style={styles.label}>Código de verificação</Text>
          <TextInput style={[styles.input,{textAlign:'center',letterSpacing:4}]} value={form.code} onChangeText={(v)=>setForm(s=>({...s,code:v}))} placeholderTextColor="#9ca3af" />
          {!!errors.code && <Text style={styles.error}>{errors.code}</Text>}
          <Pressable style={styles.btn} onPress={step2}><Text style={styles.btnText}>Confirmar</Text></Pressable>
          <Text onPress={()=>setStep(1)} style={styles.link}>Voltar</Text>
        </>}

        {step===3 && <>
          <Text style={styles.label}>Nova senha</Text>
          <TextInput style={styles.input} secureTextEntry value={form.password} onChangeText={(v)=>setForm(s=>({...s,password:v}))} placeholderTextColor="#9ca3af" />
          {!!errors.password && <Text style={styles.error}>{errors.password}</Text>}
          <Text style={styles.label}>Repetir nova senha</Text>
          <TextInput style={styles.input} secureTextEntry value={form.confirmPassword} onChangeText={(v)=>setForm(s=>({...s,confirmPassword:v}))} placeholderTextColor="#9ca3af" />
          {!!errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
          <Pressable style={styles.btn} onPress={step3}><Text style={styles.btnText}>{loading?'Redefinindo...':'Redefinir senha'}</Text></Pressable>
        </>}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#171717', padding:16, justifyContent:'center' },
  card:{ backgroundColor:'#262626', borderRadius:16, padding:20 },
  title:{ color:'#fff', fontSize:22, fontWeight:'700', marginBottom:16, textAlign:'center' },
  label:{ color:'#e5e7eb', marginTop:12, marginBottom:6 },
  input:{ backgroundColor:'#171717', color:'#fff', borderWidth:1, borderColor:'#404040', borderRadius:12, padding:12 },
  btn:{ backgroundColor:'#6366f1', padding:14, borderRadius:12, marginTop:16, alignItems:'center' },
  btnText:{ color:'#fff', fontWeight:'700' },
  link:{ color:'#a5b4fc', marginTop:12, textAlign:'center' },
  error:{ color:'#f87171', marginTop:4 }
});
