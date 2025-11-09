
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Linking,
  Animated,
} from "react-native";
import { useAuth } from "../providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import TabBar from "../components/TabBar";
import { getApiBase } from "../utils/api";

function fixLocalDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  const local = new Date(y, m - 1, d);
  return local.toISOString().split("T")[0];
}

export default function ReportScreen() {
  const { session } = useAuth();
  const [selectedDates, setSelectedDates] = useState([]);
  const [reportLink, setReportLink] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [mode, setMode] = useState(null);


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



  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [alertVisible, setAlertVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;


  const showStyledAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setAlertVisible(false));
    }, 4000);
  };


  const handleDateSelect = async (date) => {
    if (mode === "diario") {
      const localDate = fixLocalDate(date.dateString);
      await gerarRelatorio(localDate, localDate);
      setShowCalendar(false);
    } else {
      if (selectedDates.length < 2)
        setSelectedDates([...selectedDates, date.dateString]);
      else setSelectedDates([date.dateString]);
    }
  };


  const handleConfirmPeriod = async () => {
    if (selectedDates.length !== 2) {
      showStyledAlert("Selecione duas datas para gerar o relatório.", "info");
      return;
    }
    const [inicio, fim] = selectedDates.sort().map(fixLocalDate);
    await gerarRelatorio(inicio, fim);
    setShowCalendar(false);
  };


  const gerarRelatorio = async (data_inicio, data_fim) => {
    try {
      const id_usuario =
        session?.id_usuario ||
        session?.user?.id ||
        session?.user?.id_usuario ||
        session?.user_metadata?.id_usuario;
      const nome_usuario = session?.nome || session?.username || "Usuário";

      const base = await getApiBase();
      const res = await fetch(`${base}/ponto/relatorio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, data_inicio, data_fim, nome_usuario }),
      });

      const data = await res.json();

      if (res.status === 404) {
        showStyledAlert("Nenhum ponto encontrado nesse período.", "info");
        setReportLink(null);
        return;
      }

      if (data.success && data.url) {
        setReportLink(data.url);
        showStyledAlert("✅ Relatório gerado com sucesso!", "success");
      } else {
        showStyledAlert(data.message || "Falha ao gerar relatório.", "error");
        setReportLink(null);
      }
    } catch (e) {
      console.error(e);
      showStyledAlert("Erro de conexão com o servidor.", "error");
      setReportLink(null);
    }
  };


  const startMode = (type) => {
    setMode(type);
    setReportLink(null);
    setSelectedDates([]);
    setShowCalendar(true);
    setAlertVisible(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios</Text>

        
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

      
      {alertVisible && (
        <Animated.View
          style={[
            styles.alertBox,
            alertType === "success" && { backgroundColor: "#16a34a" },
            alertType === "error" && { backgroundColor: "#dc2626" },
            alertType === "info" && { backgroundColor: "#737373" },
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.alertText}>{alertMessage}</Text>
          <Pressable onPress={() => setAlertVisible(false)}>
            <Feather name="x-circle" size={20} color="#fff" />
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.content}>
        <Text style={styles.selectPeriod}>Gerar relatório</Text>
        <View style={styles.buttonsRow}>
          <Pressable
            style={[
              styles.reportButton,
              mode === "periodo" && { backgroundColor: "#16a34a" },
            ]}
            onPress={() => startMode("periodo")}
          >
            <Text style={styles.reportButtonText}>Por período</Text>
          </Pressable>
          <Pressable
            style={[
              styles.dailyButton,
              mode === "diario" && { backgroundColor: "#16a34a" },
            ]}
            onPress={() => startMode("diario")}
          >
            <Text style={styles.reportButtonText}>Diário</Text>
          </Pressable>
        </View>

        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              current={new Date().toISOString().split("T")[0]}
              onDayPress={handleDateSelect}
              markedDates={selectedDates.reduce((acc, date) => {
                acc[date] = { selected: true, selectedColor: "#22c55e" };
                return acc;
              }, {})}
            />
            {mode === "periodo" && (
              <Pressable onPress={handleConfirmPeriod} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Confirmar período</Text>
              </Pressable>
            )}
          </View>
        )}

        {reportLink && (
          <View style={styles.reportBox}>
            <Text style={styles.reportInfo}>Relatório disponível</Text>
            <Pressable onPress={() => Linking.openURL(reportLink)}>
              <Feather name="download" size={24} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#6b6b6b" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarLetter: { color: "#fff", fontWeight: "700", fontSize: 18 },
  content: { padding: 16 },
  selectPeriod: { color: "#fff", fontSize: 18, marginBottom: 8 },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  reportButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 5,
    alignItems: "center",
  },
  dailyButton: {
    flex: 1,
    backgroundColor: "#898989",
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 5,
    alignItems: "center",
  },
  reportButtonText: { color: "#fff", fontWeight: "700" },
  calendarContainer: {
    backgroundColor: "#3a3a3a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  confirmButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  reportBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#898989",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportInfo: { color: "#fff", fontSize: 16 },


  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 8,
    elevation: 3,
  },
  alertText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
});
