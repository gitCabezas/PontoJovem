
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Linking,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { getWeekDays, getDateISO } from "../utils/date";
import { useAuth } from "../providers/AuthProvider";
import { useClock } from "../hooks/useClock";
import { Ionicons } from "@expo/vector-icons";
import { initNotifications, notifyStatus } from "../utils/notifications";
import { getApiBase } from "../utils/api";

export default function HomeScreen({ navigation }) {
  const { session } = useAuth();
  const { formattedTime } = useClock();

  const [apiBase, setApiBase] = useState(null);
  const [weekDays, setWeekDays] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [justText, setJustText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);


  const nomeUsuario = session?.nome || session?.username || "Usuário";
  const getColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 55%)`;
  };
  const avatarColor = getColorFromString(nomeUsuario);
  const avatarLetter = nomeUsuario.charAt(0).toUpperCase();


  useEffect(() => {
    (async () => {
      setWeekDays(getWeekDays());
      initNotifications().catch(() => {});
      const base = await getApiBase();
      setApiBase(base);
      if (session?.id_usuario) carregarPontos(base);
    })();

  }, [session]);

  const carregarPontos = async (base = apiBase) => {
    if (!base) return;
    try {
      const res = await fetch(`${base}/ponto/${session.id_usuario}`);
      const data = await res.json();
      if (data.success) setRegistros(data.data || []);
    } catch (e) {
      console.error("Erro ao carregar pontos:", e);
    }
  };

  const handlePunch = async (tipo) => {
    if (!apiBase) return;
    try {
      setLoading(true);
      const endpoint = `${apiBase}/ponto/${tipo}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: session.id_usuario }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("Sucesso", data.message);
        carregarPontos(apiBase);
        if (tipo === "entrada") {
          await notifyStatus("Ponto de saída pendente");
        } else if (tipo === "saida") {
          await notifyStatus("Jornada diária registrada");
        }
      } else {
        Alert.alert("Erro", data.message || "Falha ao registrar ponto");
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível registrar o ponto.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const hoje = getDateISO();
  const registroHoje = registros.find((r) => r.data_registro === hoje);
  const statusHoje = registroHoje
    ? registroHoje.hora_entrada && registroHoje.hora_saida
      ? "Jornada diária registrada"
      : "Ponto de saída pendente"
    : "Aguardando ponto de entrada";

  const proximoTipo = !registroHoje ? "entrada" : !registroHoje.hora_saida ? "saida" : null;

  const abrirModal = (registro) => {
    setSelectedDay(registro);
    setJustText(registro.justificativa || "");
    setSelectedFile(null);
    setShowModal(true);
  };

  const escolherArquivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
      });
      if (result.canceled) return;
      setSelectedFile(result.assets[0]);
    } catch (err) {
      console.log("Erro ao escolher arquivo:", err);
    }
  };

  const enviarArquivo = async () => {
    if (!apiBase) return;
    try {
      if (!selectedFile) {
        Alert.alert("Atenção", "Escolha um arquivo antes de enviar.");
        return;
      }

      const formData = new FormData();
      formData.append("id_usuario", session.id_usuario);
      if (selectedDay?.id_ponto) formData.append("id_ponto", selectedDay.id_ponto);
      else formData.append("data_registro", selectedDay.data_registro);

      if (Platform.OS === "web") {
        formData.append("file", selectedFile.file || selectedFile);
      } else {
        formData.append("file", {
          uri: Platform.OS === "ios" ? selectedFile.uri.replace("file://", "") : selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || "application/octet-stream",
        });
      }

      const fetchOptions = {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      };

      try {
        if (typeof process !== "undefined" && process.version) {
          fetchOptions.duplex = "half";
        }
      } catch (_) {}

      const res = await fetch(`${apiBase}/ponto/upload-justificativa`, fetchOptions);
      const data = await res.json();

      if (data.success) {
        Alert.alert("Sucesso", "Arquivo enviado com sucesso!");
        setShowModal(false);
        setSelectedFile(null);
        carregarPontos(apiBase);
      } else {
        Alert.alert("Erro", data.message || "Falha ao enviar o arquivo.");
      }
    } catch (e) {
      console.error("Erro no envio:", e);
      Alert.alert("Erro", "Não foi possível enviar o arquivo.");
    }
  };

  const renderItem = ({ item }) => {
    const dia = registros.find((r) => r.data_registro === item.date);
    return (
      <Pressable disabled={!dia} onPress={() => abrirModal(dia)}>
        <View style={styles.row}>
          <View style={[styles.badge, dia ? styles.badgeOn : styles.badgeOff]}>
            <Text style={styles.badgeNum}>{item.dayNumber}</Text>
            <Text style={styles.badgeWeek}>{item.dayName.toUpperCase()}</Text>
          </View>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.rowText}>
              Entrada: <Text style={styles.rowTime}>{dia?.hora_entrada || "-"}</Text>
            </Text>
            <Text style={[styles.rowText, { marginTop: 4 }]}>
              Saída: <Text style={styles.rowTime}>{dia?.hora_saida || "-"}</Text>
            </Text>

            {dia?.justificativa && dia.justificativa.startsWith("http") ? (
              <Pressable onPress={() => Linking.openURL(dia.justificativa)}>
                <Text style={styles.justLink}>📎 Ver justificativa</Text>
              </Pressable>
            ) : dia?.justificativa ? (
              <Text style={styles.justText}>Justificativa: {dia.justificativa}</Text>
            ) : null}
          </View>
        </View>
      </Pressable>
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
                <Text style={styles.hi}>Olá, Bem-vindo(a)</Text>
                <Text style={styles.name}>{nomeUsuario}</Text>
              </View>

              
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: avatarColor,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text style={styles.avatarLetter}>{avatarLetter}</Text>
              </View>
            </View>

            <Text style={styles.title}>Registro de ponto</Text>
            <Text style={styles.clock}>{formattedTime}</Text>
            <Text style={styles.subclock}>Horário de Brasília</Text>
            <Text style={styles.status}>
              Status: <Text style={styles.statusValue}>{statusHoje}</Text>
            </Text>

            {proximoTipo ? (
              <Pressable
                style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                onPress={() => handlePunch(proximoTipo)}
                disabled={loading}
              >
                <Text style={styles.primaryText}>
                  {loading ? "Registrando..." : proximoTipo === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
                </Text>
              </Pressable>
            ) : null}

            <View style={styles.divider} />
          </>
        }
      />

      
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Justificar atraso</Text>
            <Text style={styles.modalDate}>
              {selectedDay?.data_registro} | Entrada: {selectedDay?.hora_entrada} | Saída: {selectedDay?.hora_saida}
            </Text>

            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="Descreva o motivo..."
              value={justText}
              onChangeText={setJustText}
            />

            <Pressable style={styles.fileBtn} onPress={escolherArquivo}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="attach-outline" size={18} color="#333" style={{ marginRight: 6 }} />
                <Text style={styles.fileBtnText}>
                  {selectedFile ? selectedFile.name : "Escolher arquivo"}
                </Text>
              </View>
            </Pressable>

            <Pressable style={styles.modalBtn} onPress={enviarArquivo}>
              <Text style={styles.modalBtnText}>Enviar</Text>
            </Pressable>

            <Pressable onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      
      <View style={styles.tabFloat}>
        <Pressable style={styles.tabBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.tabText}>Início</Text>
        </Pressable>
        <Pressable style={styles.tabBtn} onPress={() => navigation.navigate("ReportScreen")}>
          <Text style={styles.tabText}>Relatório</Text>
        </Pressable>
        <Pressable style={styles.tabBtn} onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.tabText}>Perfil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const BG = "#6b6b6b";
const CARD = "#3a3a3a";
const GREEN = "#22c55e";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hi: { color: "#f5f5f5", fontSize: 14 },
  name: { color: "#e5e5e5", fontSize: 13 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarLetter: { color: "#fff", fontWeight: "700", fontSize: 18 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 16 },
  clock: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  subclock: { color: "#e5e7eb", textAlign: "center", opacity: 0.9 },
  status: { color: "#e5e7eb", textAlign: "center", marginTop: 8 },
  statusValue: { color: "#a5b4fc", fontWeight: "700" },
  primaryBtn: {
    marginTop: 14,
    alignSelf: "center",
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  primaryText: { fontWeight: "700", color: "#111827" },
  divider: {
    height: 1,
    backgroundColor: "#bdbdbd",
    opacity: 0.35,
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeOn: { backgroundColor: GREEN },
  badgeOff: { backgroundColor: "#a3a3a3" },
  badgeNum: { color: "#fff", fontWeight: "800", fontSize: 16 },
  badgeWeek: { color: "#fff", fontSize: 10 },
  rowText: { color: "#f5f5f5" },
  rowTime: { color: "#d1fae5", fontWeight: "700" },
  justText: { color: "#a5b4fc", fontSize: 12, marginTop: 4 },
  justLink: {
    color: "#60a5fa",
    fontSize: 13,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "85%",
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalDate: { fontSize: 12, color: "#555", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  fileBtn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  fileBtnText: { color: "#333", fontWeight: "600" },
  modalBtn: {
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "700" },
  modalCancel: { color: "#555", textAlign: "center", marginTop: 8 },
  tabFloat: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#2b2b2b",
    borderRadius: 24,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  tabText: { color: "#e5e5e5", fontWeight: "600", fontSize: 13 },
});
