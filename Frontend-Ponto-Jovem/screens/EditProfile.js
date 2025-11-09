import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import TabBar from "../components/TabBar";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthProvider";
import { getApiBase } from "../utils/api";

export default function EditProfileScreen() {
  const { session } = useAuth();
  const id_usuario =
    session?.id_usuario ||
    session?.user?.id_usuario ||
    session?.user_metadata?.id_usuario;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [identificacao, setIdentificacao] = useState(
    session?.id || session?.identificacao || ""
  );
  const [dob, setDob] = useState(
  session?.data_nascimento ? formatToInput(session.data_nascimento) : ''
);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showStyledAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
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


  const hasAvatar = useMemo(() => !!session?.avatar, [session]);
  const getColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 55%)`;
  };
  const avatarColor = getColorFromString(nome || "U");
  const avatarLetter = (nome || "U").charAt(0).toUpperCase();


  function maskDate(value) {
    if (!value) return "";
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function formatToInput(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  function formatToApi(dateStr) {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!id_usuario) return;
        const base = await getApiBase();
        const res = await fetch(`${base}/usuario/${id_usuario}`);
        const data = await res.json();

        if (res.ok && data) {
          setNome(data.nome || "");
          setEmail(data.email || "");
          setDob(formatToInput(data.data_nascimento || ""));
          if (data.identificacao) setIdentificacao(data.identificacao);
        } else {
          showStyledAlert("Erro ao carregar perfil.", "error");
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        showStyledAlert("Erro de conexão com o servidor.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id_usuario]);


  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {};
      if (nome) updates.nome = nome;
      if (email) updates.email = email;
      if (dob) updates.data_nascimento = formatToApi(dob);

      const base = await getApiBase();
      const res = await fetch(`${base}/user/${id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (data.success) {
        showStyledAlert("Perfil atualizado com sucesso!", "success");
        setEditing(false);
      } else {
        showStyledAlert(data.message || "Falha ao atualizar.", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showStyledAlert("Erro de conexão.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 10 }}>
          Carregando perfil...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      
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

      
      <View style={styles.headerWrap}>
        <View style={styles.headerCard}>
          {hasAvatar ? (
            <Image source={{ uri: session.avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                { backgroundColor: avatarColor, alignItems: "center", justifyContent: "center" },
              ]}
            >
              <Text style={{ color: "#fff", fontSize: 38, fontWeight: "bold" }}>
                {avatarLetter}
              </Text>
            </View>
          )}

          <Text style={styles.name}>{nome || session?.username || "Usuário"}</Text>
          {!!email && <Text style={styles.emailHint}>Você pode atualizar seus dados abaixo</Text>}

          <Pressable style={styles.secondaryBtn} onPress={() => { /* trocar foto futuramente */ }}>
            <AntDesign name="camerao" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Alterar foto</Text>
          </Pressable>

          {!editing && (
            <Pressable
              style={[styles.secondaryBtn, { marginTop: 10 }]}
              onPress={() => setEditing(true)}
            >
              <AntDesign name="edit" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryBtnText}>Editar dados</Text>
            </Pressable>
          )}
        </View>
      </View>

      
      <View style={styles.formCard}>
        <Text style={styles.label}>Nome</Text>
        {editing ? (
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />
        ) : (
          <Text style={styles.readonly}>{nome || "-"}</Text>
        )}

        <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.readonly}>{email || "-"}</Text>
        )}

        <Text style={[styles.label, { marginTop: 12 }]}>Data de Nascimento</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={(text) => setDob(maskDate(text))}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.readonly}>{dob || "-"}</Text>
        )}

        <Text style={[styles.label, { marginTop: 12 }]}>Identificação</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={identificacao}
            onChangeText={setIdentificacao}
          />
        ) : (
          <Text style={styles.readonly}>{identificacao || "-"}</Text>
        )}

        {editing && (
          <Pressable
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>{saving ? "Salvando..." : "Salvar"}</Text>
          </Pressable>
        )}
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const BG = "#6b6b6b";
const CARD = "#3a3a3a";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },


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
  alertText: { color: "#fff", fontSize: 14, flex: 1, marginRight: 10 },


  headerWrap: { paddingTop: 24, paddingHorizontal: 16 },
  headerCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  avatar: { width: 94, height: 94, borderRadius: 47, backgroundColor: "#4b5563" },
  name: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 10 },
  emailHint: { color: "#d1d5db", fontSize: 12, marginTop: 2 },

  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "#4b4b4b",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "700" },


  formCard: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
  },
  label: { color: "#d1d5db", fontSize: 14, fontWeight: "700" },
  input: {
    backgroundColor: "#171717",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  readonly: {
    color: "#fff",
    fontSize: 16,
    marginTop: 6,
    backgroundColor: "transparent",
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
