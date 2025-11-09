import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function initNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Padrão',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

export async function notifyStatus(statusText) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ponto Jovem',
      body: `Status: ${statusText}`,
    },
    trigger: null,
  });
}
