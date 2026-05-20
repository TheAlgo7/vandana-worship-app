"use client";

import { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type State = "unsupported" | "denied" | "off" | "loading" | "on";

export default function NotificationToggle() {
  const [state, setState] = useState<State>("off");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        setState(sub ? "on" : "off");
      })
    );
  }, []);

  async function enable() {
    setState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setState(res.ok ? "on" : "off");
    } catch {
      setState("off");
    }
  }

  async function disable() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("off");
    }
  }

  if (state === "unsupported") {
    return (
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", padding: "14px 16px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", margin: 0 }}>
        Notifications are not supported in this browser.
      </p>
    );
  }

  const isDenied = state === "denied";
  const isOn = state === "on";
  const isLoading = state === "loading";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            Daily verse and new song alerts
          </p>
        </div>
        <button
          onClick={isOn ? disable : enable}
          disabled={isLoading || isDenied}
          aria-label={isOn ? "Disable notifications" : "Enable notifications"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            minHeight: 44,
            background: "none",
            border: "none",
            cursor: isLoading || isDenied ? "not-allowed" : "pointer",
            flexShrink: 0,
            padding: 0,
            opacity: isLoading ? 0.5 : 1,
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

      {isDenied && (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0, paddingLeft: 4 }}>
          Notifications are blocked. Enable them in your browser settings to continue.
        </p>
      )}
    </div>
  );
}
