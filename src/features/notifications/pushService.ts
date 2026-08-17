import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  pushRegistrationSchema,
  type PushRegistrationState,
} from "@/src/features/notifications/schemas";
import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";

const INSTALLATION_ID_KEY = "duoqueue.push.installation-id";
const ACTIVITY_CHANNEL_ID = "duoqueue-activity";
const MESSAGE_CHANNEL_ID = "duoqueue-messages";

function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  }
  return supabase;
}

export function canUseRemotePush() {
  return (
    (Platform.OS === "android" || Platform.OS === "ios")
    && Device.isDevice
    && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
  );
}

export function getPushProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId
    ?? null;
}

export function getPushCapabilityState(): PushRegistrationState | null {
  if (!canUseRemotePush()) {
    let detail = "Use an EAS development or production build on a physical device for remote push notifications.";
    if (Platform.OS === "web") {
      detail = "Push delivery is unavailable on web. Your account preferences are still saved.";
    }
    return { status: "unsupported", detail };
  }
  if (!getPushProjectId()) {
    return {
      status: "unconfigured",
      detail: "Link this app to an EAS project before registering push notifications.",
    };
  }
  return null;
}

async function getExistingInstallationId() {
  if (Platform.OS === "web") return null;
  return AsyncStorage.getItem(INSTALLATION_ID_KEY);
}

async function getInstallationId() {
  const existing = await getExistingInstallationId();
  if (existing) return existing;
  const installationId = Crypto.randomUUID();
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, installationId);
  return installationId;
}

export async function ensureNotificationChannels() {
  if (Platform.OS !== "android") return;
  await Promise.all([
    Notifications.setNotificationChannelAsync(ACTIVITY_CHANNEL_ID, {
      name: "Duo and matchmaking activity",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: "#20E8FF",
    }),
    Notifications.setNotificationChannelAsync(MESSAGE_CHANNEL_ID, {
      name: "Duo chat messages",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: "#FF4FD8",
    }),
  ]);
}

function hasGrantedPermission(permission: Notifications.NotificationPermissionsStatus) {
  if (Platform.OS !== "ios") return permission.granted;
  const status = permission.ios?.status;
  return (
    status === Notifications.IosAuthorizationStatus.AUTHORIZED
    || status === Notifications.IosAuthorizationStatus.PROVISIONAL
    || status === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

async function registerToken() {
  const projectId = getPushProjectId();
  if (!projectId) {
    return {
      status: "unconfigured",
      detail: "Link this app to an EAS project before registering push notifications.",
    } satisfies PushRegistrationState;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const installationId = await getInstallationId();
  const { data, error } = await requireSupabase().rpc("register_my_push_token", {
    installation_id: installationId,
    expo_push_token: token,
    device_platform: Platform.OS,
  });
  if (error) throw error;
  pushRegistrationSchema.parse(data);
  return {
    status: "registered",
    detail: "Push notifications are active on this device.",
  } satisfies PushRegistrationState;
}

export async function requestAndRegisterPushNotifications() {
  const unavailable = getPushCapabilityState();
  if (unavailable) return unavailable;

  await ensureNotificationChannels();
  let permission = await Notifications.getPermissionsAsync();
  if (!hasGrantedPermission(permission)) {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (!hasGrantedPermission(permission)) {
    return {
      status: "denied",
      detail: "Notification permission is off. Enable it in device settings when you are ready.",
    } satisfies PushRegistrationState;
  }
  return registerToken();
}

export async function refreshPushRegistrationIfAuthorized() {
  if (!canUseRemotePush()) return null;
  await ensureNotificationChannels();
  const permission = await Notifications.getPermissionsAsync();
  if (!hasGrantedPermission(permission)) return null;
  return registerToken();
}

export async function disableCurrentPushInstallation() {
  const installationId = await getExistingInstallationId();
  if (!installationId || !supabase) return;
  const { data, error } = await supabase.rpc("disable_my_push_installation", {
    installation_id: installationId,
  });
  if (error) throw error;
  pushRegistrationSchema.parse(data);
}

export function subscribeToNativePushTokenChanges(onChange: () => void) {
  if (!canUseRemotePush()) return () => undefined;
  const subscription = Notifications.addPushTokenListener(() => onChange());
  return () => subscription.remove();
}

export const notificationChannelIds = {
  activity: ACTIVITY_CHANNEL_ID,
  messages: MESSAGE_CHANNEL_ID,
} as const;
