import * as Device from "expo-device";
import * as Notifications from "expo-notifications";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export async function registerForPushNotifications() {

  if (!Device.isDevice) {
    alert("Use a physical device");
    return;
  }


  const { status } =
    await Notifications.requestPermissionsAsync();


  if (status !== "granted") {
    alert("Notification permission denied");
    return;
  }


  const token =
    (await Notifications.getExpoPushTokenAsync()).data;


  console.log("Expo Token:", token);


  return token;
}