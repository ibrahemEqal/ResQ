import { db } from "@/config/firebaseConfig";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data as {
    type: string;
    location: string;
  };

  router.push({
    pathname: "/alert-details",
    params: {
      type: data.type,
      location: data.location,
    },
  });
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert("Use physical device");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permission not granted for push notifications!");
    return;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data;

  console.log("EXPO PUSH TOKEN:", token);

  return token;
}

export async function saveToken(userId: string, token: string, role: string) {
  try {
    await setDoc(
      doc(db, "userTokens", userId),
      {
        uid: userId,
        expoPushToken: token,
        role,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    console.log("Token saved");
  } catch (error) {
    console.log("Firestore Error:", error);
  }
}

export async function getAllTokens() {
  const snapshot = await getDocs(collection(db, "userTokens"));

  const tokens: string[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.expoPushToken) {
      tokens.push(data.expoPushToken);
    }
  });

  return tokens;
}

export async function getStudentTokens() {
  const snapshot = await getDocs(collection(db, "userTokens"));

  const tokens: string[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.role?.trim() === "student" && data.expoPushToken) {
      tokens.push(data.expoPushToken);
    }
  });

  return tokens;
}

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  type: string,
  location: string,
  platform: "android" | "ios",
) {
  try {
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: {
        screen: "alert-details",
        type,
        location,
      },
    }));

    const response = await fetch(
      `https://exp.host/--/api/v2/push/send?platform=${platform}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      },
    );

    const data = await response.json();
    console.log("Push result:", data);
  } catch (error) {
    console.log("Push error:", error);
  }
}
