import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, SafeAreaView, StyleSheet, Image } from 'react-native';
import { storage } from '../utils/storage';
import { getDateISO, getWeekDays, formatTime } from '../utils/date';
import { useAuth } from '../providers/AuthProvider';
import { useClock } from '../hooks/useClock';

const AVATAR = 'https://i.pravatar.cc/100?img=15';

export default function HomeScreen() {
  const { logout, session } = useAuth();
  const { formattedTime } = useClock();
  const [punches, setPunches] = useState({});
  const [weekDays, setWeekDays] = useState([]);
  const [seg, setSeg] = useState('entrada');

  useEffect(() => {
    (async () => {
      const p = await storage.getPunches();
      setPunches(p);
      setWeekDays(getWeekDays());

      if (Object.keys(p).length === 0) {
        const now = new Date();
        const d = (n) => getDateISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + n));
        const ex = {
          [d(-6)]: { entrada: '08:03', saida: '15:14' },
          [d(-4)]: { entrada: '07:51', saida: '15:24' },
          [d(-3)]: { entrada: '08:32', saida: '15:01' },
          [d(-2)]: { entrada: '08:01', saida: '15:14' },
        };
        for (const [date, data] of Object.entries(ex)) {
          for (const [type, time] of Object.entries(data)) {
            await storage.setPunch(date, type, time);
          }
        }
        setPunches(await storage.getPunches());
      }
    })();
  }, []);

  const today = getDateISO();
  const todayPunches = punches[today] || {};
  const bothDone = !!(todayPunches.entrada && todayPunches.saida);
  const statusLabel = bothDone ? 'Registrado.' : 'Não registrado.';
  const nextType = !todayPunches.entrada ? 'entrada' : (!todayPunches.saida ? 'saida' : null);

  const handlePunch = async () => {
    if (!nextType) return;
    const t = formatTime(new Date());
    await storage.setPunch(today, nextType, t);
    setPunches(await storage.getPunches());
  };

  const renderItem = ({ item }) => {
    const dayPunches = punches[item.date] || {};
    const has = !!(dayPunches.entrada || dayPunches.saida);
    return (
      <View style={styles.row}>
        <View style={[styles.badge, has ? styles.badgeOn : styles.badgeOff]}>
          <Text style={styles.badgeNum}>{item.dayNumber}</Text>
          <Text style={styles.badgeWeek}>{item.dayName.toUpperCase()}</Text>
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.rowText}>
            Entrada: <Text style={styles.rowTime}>{dayPunches.entrada || '-'}</Text>
          </Text>
          <Text style={[styles.rowText, { marginTop: 4 }]}>
            Saída: <Text style={styles.rowTime}>{dayPunches.saida || '-'}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={weekDays}
        keyExtractor={(i) => i.date}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.hi}>Olá, Bem Vindo(A)</Text>
                <Text style={styles.name}>{session?.username || 'Usuário'}</Text>
              </View>
              <View style={styles.rightHeader}>
                <Pressable onPress={logout}>
                  <Text style={styles.logout}>Sair</Text>
                </Pressable>
                <Image source={{ uri: AVATAR }} style={styles.avatar} />
              </View>
            </View>

            <Text style={styles.title}>Registrar ponto</Text>

            <View style={styles.segment}>
              {['entrada', 'saida'].map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setSeg(k)}
                  style={[styles.segmentItem, seg === k && styles.segmentActive]}
                >
                  <Text style={[styles.segmentText, seg === k && styles.segmentTextActive]}>
                    {k === 'entrada' ? 'Entrada' : 'Saída'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.clock}>{formattedTime}</Text>
            <Text style={styles.subclock}>Horário de Brasília</Text>
            <Text style={styles.status}>
              Status: <Text style={styles.statusValue}>{statusLabel}</Text>
            </Text>

            <Pressable style={styles.primaryBtn} onPress={handlePunch} disabled={!nextType}>
              <Text style={styles.primaryText}>{bothDone ? 'Justificar' : 'Registrar'}</Text>
            </Pressable>

            <View style={styles.divider} />
          </>
        }
      />

      <View style={styles.tabFloat} pointerEvents="box-none">
        <View style={styles.tabInner}>
          <Pressable style={styles.tabBtn}><Text style={styles.tabText}>Início</Text></Pressable>
          <Pressable style={styles.tabBtn}><Text style={styles.tabText}>Relatório</Text></Pressable>
          <Pressable style={styles.tabBtn}><Text style={styles.tabText}>Perfil</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BG = '#6b6b6b';
const CARD = '#3a3a3a';
const GREEN = '#22c55e';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hi: { color: '#f5f5f5', fontSize: 14, opacity: 0.9 },
  name: { color: '#e5e5e5', fontSize: 13, opacity: 0.8 },
  rightHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logout: { color: '#fca5a5', fontWeight: '600', marginRight: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#555' },

  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  segment: { flexDirection: 'row', backgroundColor: '#4b4b4b', borderRadius: 16, padding: 4, alignSelf: 'flex-start' },
  segmentItem: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12 },
  segmentActive: { backgroundColor: '#fff' },
  segmentText: { color: '#e5e5e5', fontWeight: '700' },
  segmentTextActive: { color: '#000' },

  clock: { color: '#fff', fontSize: 40, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  subclock: { color: '#e5e7eb', textAlign: 'center', opacity: 0.9 },
  status: { color: '#e5e7eb', textAlign: 'center', marginTop: 8 },
  statusValue: { color: '#a5b4fc', fontWeight: '700' },

  primaryBtn: { marginTop: 14, alignSelf: 'center', backgroundColor: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  primaryText: { fontWeight: '700', color: '#111827' },

  divider: { height: 1, backgroundColor: '#bdbdbd', opacity: 0.35, marginVertical: 16 },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: 12 },
  badge: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  badgeOn: { backgroundColor: GREEN },
  badgeOff: { backgroundColor: '#a3a3a3' },
  badgeNum: { color: '#fff', fontWeight: '800', fontSize: 16, lineHeight: 18 },
  badgeWeek: { color: '#fff', fontSize: 10, marginTop: 2, opacity: 0.95 },
  rowText: { color: '#f5f5f5' },
  rowTime: { color: '#d1fae5', fontWeight: '700' },

  tabFloat: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  tabInner: { backgroundColor: '#2b2b2b', borderRadius: 24, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  tabText: { color: '#e5e5e5', fontWeight: '600', fontSize: 13 }
});
