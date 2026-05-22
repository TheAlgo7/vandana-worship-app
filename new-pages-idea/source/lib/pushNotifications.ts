"use client";

const SERVICE_WORKER_URL = "/sw.js";
const SERVICE_WORKER_SCOPE = "/";
const READY_TIMEOUT_MS = 10000;

function timeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), READY_TIMEOUT_MS);
    }),
  ]);
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
}

export function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  return arr.buffer;
}

export async function ensurePushRegistration() {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const existing = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_SCOPE);
  if (!existing) {
    await navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE });
  }

  return timeout(
    navigator.serviceWorker.ready,
    "The notification service worker did not become ready. Please reload the app and try again."
  );
}

export async function getCurrentPushSubscription() {
  const registration = await ensurePushRegistration();
  return registration.pushManager.getSubscription();
}

export async function showLocalNotification(
  registration: ServiceWorkerRegistration,
  title: string,
  body: string
) {
  await registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/favicon-32.png",
    tag: "vandana-test",
    data: { url: "/settings" },
  });
}
