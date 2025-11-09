import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Política de Privacidade</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.paragraph}>
          A sua privacidade é importante para nós. Esta Política de Privacidade explica como
          coletamos, usamos e protegemos as suas informações pessoais ao utilizar o aplicativo
          <Text style={styles.bold}> Ponto Jovem</Text>.
        </Text>

        <Text style={styles.sectionTitle}>1. Coleta de Informações</Text>
        <Text style={styles.paragraph}>
          Coletamos apenas as informações necessárias para o funcionamento do aplicativo,
          incluindo nome, e-mail, data de nascimento e registros de ponto.
        </Text>

        <Text style={styles.sectionTitle}>2. Uso das Informações</Text>
        <Text style={styles.paragraph}>
          As informações são utilizadas exclusivamente para autenticação, geração de relatórios e
          funcionamento correto do sistema. Não compartilhamos seus dados com terceiros sem o seu
          consentimento.
        </Text>

        <Text style={styles.sectionTitle}>3. Armazenamento e Segurança</Text>
        <Text style={styles.paragraph}>
          Os dados são armazenados de forma segura e criptografada. Utilizamos boas práticas para
          proteger suas informações contra acesso não autorizado.
        </Text>

        <Text style={styles.sectionTitle}>4. Direitos do Usuário</Text>
        <Text style={styles.paragraph}>
          Você pode solicitar a exclusão ou atualização de suas informações a qualquer momento
          através do suporte do aplicativo.
        </Text>

        <Text style={styles.sectionTitle}>5. Contato</Text>
        <Text style={styles.paragraph}>
          Em caso de dúvidas sobre esta política, entre em contato conosco pelo suporte do
          aplicativo ou pelo número (88) 99714-0476.
        </Text>

        <Text style={styles.footerText}>Última atualização: Novembro de 2025</Text>
      </ScrollView>
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
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 20 },
  paragraph: { color: '#f5f5f5', fontSize: 15, marginTop: 10, lineHeight: 22 },
  bold: { fontWeight: '700' },
  footerText: { color: '#d1d5db', fontSize: 13, textAlign: 'center', marginTop: 30 },
});
