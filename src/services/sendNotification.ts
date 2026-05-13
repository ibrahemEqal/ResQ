export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
) {
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
  }));

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const data = await response.json();

    console.log("Push response:", data);

    return data;
  } catch (error) {
    console.log("Push error:", error);
  }
}
