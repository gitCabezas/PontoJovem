import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

function FieldBase({ label, value, onChangeText, placeholder, secure, error }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={!!secure}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
export default memo(FieldBase);

const styles = StyleSheet.create({
  label:{ color:'#e5e7eb', marginBottom:6 },
  input:{ backgroundColor:'#171717', color:'#fff', borderWidth:1, borderColor:'#404040', borderRadius:12, padding:12 },
  error:{ color:'#f87171', marginTop:4 }
});
