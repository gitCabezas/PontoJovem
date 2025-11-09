
import { Platform, NativeModules } from "react-native";
import * as Network from "expo-network";
import Constants from "expo-constants";

let CACHED_BASE = null;

function isPrivateIPv4(ip) {

  if (/^10\./.test(ip)) return true;

  if (/^192\.168\./.test(ip)) return true;

  const m = ip.match(/^172\.(\d{1,2})\./);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

function fromScriptURL() {
  try {
    const url = NativeModules?.SourceCode?.scriptURL;
    if (!url) return null;
    const u = new URL(url);
    let host = u.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      if (Platform.OS === "android") host = "10.0.2.2";

    }
    return host;
  } catch {
    return null;
  }
}

function fromExpoConstants() {
  try {

    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.expoConfig?.experiments?.url ||
      Constants?.manifest2?.extra?.expoClient?.hostUri ||
      Constants?.expoGoConfig?.debuggerHost;

    if (!hostUri) return null;
    const host = String(hostUri).split(":")[0];
    if (!host) return null;
    if (host === "localhost" || host === "127.0.0.1") {
      if (Platform.OS === "android") return "10.0.2.2";
    }
    return host;
  } catch {
    return null;
  }
}

export async function getApiBase() {
  if (CACHED_BASE) return CACHED_BASE;


  const envBase = Constants?.expoConfig?.extra?.EXPO_PUBLIC_API_BASE || process.env?.EXPO_PUBLIC_API_BASE;
  if (envBase) {
    CACHED_BASE = envBase.replace(/\/+$/, "");
    return CACHED_BASE;
  }


  const hostFromScript = fromScriptURL();
  if (hostFromScript) {
    CACHED_BASE = `http://${hostFromScript}:3000/bk-mobile`;
    return CACHED_BASE;
  }


  const hostFromConstants = fromExpoConstants();
  if (hostFromConstants) {
    CACHED_BASE = `http://${hostFromConstants}:3000/bk-mobile`;
    return CACHED_BASE;
  }


  try {
    const ip = await Network.getIpAddressAsync();
    if (ip && isPrivateIPv4(ip)) {
      CACHED_BASE = `http://${ip}:3000/bk-mobile`;
      return CACHED_BASE;
    }
  } catch {}


  CACHED_BASE = Platform.select({
    android: "http://10.0.2.2:3000/bk-mobile",
    ios: "http://localhost:3000/bk-mobile",
    default: "http://localhost:3000/bk-mobile",
  });
  return CACHED_BASE;
}
