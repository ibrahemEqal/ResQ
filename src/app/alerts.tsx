import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PageName() {
  return (
    <View style={styles.container}>
      <Text>لسا الصفحة مش معمولة</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
