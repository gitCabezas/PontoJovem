import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext) || { showToast: () => {}, toast: null };

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[styles.container, toast.type === 'success' ? styles.success : styles.error]}>
      <Text style={styles.text}>{toast.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position:'absolute', top: 40, right: 16, paddingVertical: 10, paddingHorizontal:16, borderRadius:12, zIndex: 100 },
  success: { backgroundColor: '#16a34a' },
  error: { backgroundColor: '#dc2626' },
  text: { color: '#fff', fontWeight: '600' }
});
