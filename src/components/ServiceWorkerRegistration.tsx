"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  const [isOffline, setIsOffline] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const syncOnlineState = () => setIsOffline(!navigator.onLine);
    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);
    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
          setUpdateReady(true);
        }

        registration.addEventListener("updatefound", () => {
          const nextWorker = registration.installing;
          if (!nextWorker) return;
          nextWorker.addEventListener("statechange", () => {
            if (nextWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(nextWorker);
              setUpdateReady(true);
            }
          });
        });
      } catch {
        // Ignore registration failures; app remains fully usable online.
      }
    };

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      window.removeEventListener("load", register);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!isOffline && !updateReady) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(var(--nav-clearance) + 10px)",
        transform: "translateX(-50%)",
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: "calc(100vw - 32px)",
        padding: "10px 12px",
        borderRadius: "var(--radius-pill)",
        border: "1px solid var(--border)",
        background: "var(--bg-overlay)",
        color: "var(--text-primary)",
        boxShadow: "var(--shadow-sm)",
        backdropFilter: "blur(14px)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
      }}
    >
      <span style={{ whiteSpace: "nowrap" }}>
        {updateReady ? "New version ready" : "Offline mode"}
      </span>
      {updateReady && (
        <button
          type="button"
          onClick={() => waitingWorker?.postMessage({ type: "SKIP_WAITING" })}
          style={{
            border: "none",
            borderRadius: "var(--radius-pill)",
            background: "var(--accent)",
            color: "var(--bg-base)",
            padding: "6px 10px",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Update
        </button>
      )}
    </div>
  );
}
