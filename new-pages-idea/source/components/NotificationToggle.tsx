"use client";

import { useEffect, useState } from "react";
import {
  ensurePushRegistration,
  getCurrentPushSubscription,
  getVapidPublicKey,
  isPushSupported,
  showLocalNotification,
  urlBase64ToUint8Array,
} from "@/lib/pushNotifications";

type State = "unsupported" | "blocked" | "off" | "checking" | "loading" | "on" | "error";

async function readError(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.error ? String(data.error) : "Could not save this device for notifications.";
}

export default function NotificationToggle() {
  const [state, setState] = useState<State>("off");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function syncSubscription() {
      setState("checking");

      if (!isPushSupported()) {
        if (!cancelled) setState("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        if (!cancelled) setState("blocked");
        return;
      }

      if (Notification.permission !== "granted") {
        if (!cancelled) setState("off");
        return;
      }

      try {
        const sub = await getCurrentPushSubscription();
        if (cancelled) return;
        setState(sub ? "on" : "off");
        setMessage(
          sub
            ? "This device is subscribed."
            : "Permission is allowed, but this device is not subscribed yet."
        );
      } catch (error) {
        if (cancelled) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "Could not check notification status.");
      }
    }

    void syncSubscription();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setState("loading");
    setMessage("");

    try {
      const vapidPublicKey = getVapidPublicKey();
      if (!vapidPublicKey) {
        setState("error");
        setMessage("Notifications are not configured for this build.");
        return;
      }

      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      if (permission === "denied") {
        setState("blocked");
        setMessage("Notifications are blocked. Enable them in browser or Android app settings.");
        return;
      }

      if (permission !== "granted") {
        setState("off");
        setMessage("Notifications were not enabled. Tap again when you are ready to allow them.");
        return;
      }

      const registration = await ensurePushRegistration();
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        await subscription.unsubscribe().catch(() => undefined);
        setState("error");
        setMessage(await readError(res));
        return;
      }

      setState("on");
      setMessage("Notifications are on for this device.");
      await showLocalNotification(
        registration,
        "Vandana notifications are on",
        "Daily verse alerts are ready on this device."
      ).catch(() => undefined);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not enable notifications.");
    }
  }

  async function disable() {
    setState("loading");
    setMessage("");

    try {
      const registration = await ensurePushRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => undefined);
        await subscription.unsubscribe();
      }

      setState("off");
      setMessage("Notifications are off for this device.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not disable notifications.");
    }
  }

  async function sendTest() {
    if (state !== "on") return;
    setMessage("");

    try {
      const registration = await ensurePushRegistration();
      await showLocalNotification(
        registration,
        "Vandana test notification",
        "Your device can show Vandana notifications."
      );
      setMessage("Test notification sent to this device.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not send a test notification.");
    }
  }

  if (state === "unsupported") {
    return (
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", padding: "14px 16px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", margin: 0 }}>
        Notifications are not supported in this browser.
      </p>
    );
  }

  const isBlocked = state === "blocked";
  const isOn = state === "on";
  const isBusy = state === "loading" || state === "checking";
  const statusLabel = isBusy ? "Checking" : isOn ? "On" : isBlocked ? "Blocked" : "Off";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          padding: "14px 16px",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <p style={{ fontSize: "var(--text-base)", fontWeight: 500, margin: 0 }}>
            Push Notifications
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: "2px 0 0" }}>
            Daily verse alerts
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span
            aria-live="polite"
            style={{
              color: isOn ? "var(--accent)" : "var(--text-muted)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
            }}
          >
            {statusLabel}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isOn}
            onClick={isOn ? disable : enable}
            disabled={isBusy || isBlocked}
            aria-label={isOn ? "Disable notifications" : "Enable notifications"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              minHeight: 44,
              background: "none",
              border: "none",
              cursor: isBusy || isBlocked ? "not-allowed" : "pointer",
              flexShrink: 0,
              padding: 0,
              opacity: isBusy ? 0.55 : 1,
            }}
          >
            <span
              style={{
                position: "relative",
                display: "block",
                width: 48,
                height: 28,
                borderRadius: "var(--radius-pill)",
                background: isOn ? "var(--accent)" : "var(--border)",
                transition: "background var(--transition-fast)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: isOn ? 23 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: isOn ? "var(--bg-base)" : "var(--bg-surface)",
                  transition: "left var(--transition-fast)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                }}
              />
            </span>
          </button>
        </div>
      </div>

      {(message || isBlocked || isOn) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingLeft: 4,
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
            {message ||
              (isBlocked
                ? "Notifications are blocked. Enable them in browser or Android app settings."
                : "Notifications are on for this device.")}
          </p>
          {isOn && (
            <button
              type="button"
              onClick={sendTest}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-pill)",
                background: "transparent",
                color: "var(--text-secondary)",
                minHeight: 34,
                padding: "0 12px",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Test
            </button>
          )}
        </div>
      )}
    </div>
  );
}
