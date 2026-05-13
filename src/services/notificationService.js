import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { db } from "@/config/firebaseConfig";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

export async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    console.log("Must use physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted");
    return null;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  // 📱 Android config
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}

export async function saveToken(userId, token) {
  try {
    console.log("Saving token...");
    console.log("USER:", userId);
    console.log("TOKEN:", token);

    await setDoc(doc(db, "userTokens", userId), {
      expoPushToken: token,
      updatedAt: new Date(),
    });

    console.log("✅ Saved successfully");
  } catch (error) {
    console.log(" Firestore error:", error);
  }
}

export async function getAllTokens() {
  const snapshot = await getDocs(collection(db, "users"));

  const tokens = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.expoPushToken) {
      tokens.push(data.expoPushToken);
    }
  });

  return tokens;
}

export async function sendPushNotification(tokens, title, body, data = {}) {
  try {
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data,
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log("Push result:", result);

    return result;
  } catch (error) {
    console.log("Error sending notification:", error);
  }
}
