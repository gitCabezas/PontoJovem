import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function TabBar() {
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { name: "Home", label: "Início" },
    { name: "ReportScreen", label: "Relatório" },
    { name: "Profile", label: "Perfil" },
  ];

  return (
    <View style={styles.tabFloat}>
      {tabs.map((tab) => {
        const isActive = route.name === tab.name;
        return (
          <Pressable
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={[styles.tabBtn, isActive && styles.activeTab]}
          >
            <Text style={[styles.tabText, isActive && styles.activeText]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabFloat: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#2b2b2b",
    borderRadius: 24,
    height: 58,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  tabText: {
    color: "#e5e5e5",
    fontWeight: "600",
    fontSize: 14,
  },
  activeTab: {
    backgroundColor: "#3a3a3a",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
});
