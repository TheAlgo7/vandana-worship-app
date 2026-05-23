"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/app/install/install.module.css";

type Tab = "ios" | "android" | "desktop";

function detectPlatform(): Tab {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

// SVG icons
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ThreeDots = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <circle cx="12" cy="12" r="3" /><circle cx="6" cy="12" r="1" /><circle cx="18" cy="12" r="1" />
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="6" y="9" width="12" height="13" rx="2" />
    <line x1="12" y1="14" x2="12" y2="3" />
    <polyline points="8 7 12 3 16 7" />
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="4" width="16" height="16" rx="3" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(236,234,228,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(236,234,228,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 16 9" />
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <polyline points="9 14 12 17 15 14" />
  </svg>
);
const ThreeDotsV = ({ hi }: { hi?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={hi ? "var(--accent)" : "currentColor"} aria-hidden>
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);
const ArrowRightLong = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="14 6 20 12 14 18" />
  </svg>
);
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <polygon points="6 4 20 12 6 20" />
  </svg>
);
const BookmarkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 12 5a5.5 5.5 0 0 0-10 3.5C2 10.7 3.5 12.5 5 14l7 7Z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  </svg>
);
const CheckmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);
const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5S11 23.33 11 22.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V9H6v9zM3.5 9C2.67 9 2 9.67 2 10.5v7c0 .83.67 1.5 1.5 1.5S5 18.33 5 17.5v-7C5 9.67 4.33 9 3.5 9zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5S22 18.33 22 17.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84 1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C7.08 4.04 6 5.65 6 7.5h12c0-1.85-1.08-3.46-2.47-4.34zM10 6H8V4h2v2zm6 0h-2V4h2v2z" />
  </svg>
);
const DesktopIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21 2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7l-2 3v1h8v-1l-2-3h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 12H3V4h18v10z" />
  </svg>
);

export default function InstallTabs() {
  const [active, setActive] = useState<Tab>("desktop");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vandana-install-tab") as Tab | null;
      if (saved && ["ios", "android", "desktop"].includes(saved)) {
        setActive(saved);
      } else {
        setActive(detectPlatform());
      }
    } catch {
      setActive(detectPlatform());
    }
  }, []);

  function switchTab(tab: Tab) {
    setActive(tab);
    try { localStorage.setItem("vandana-install-tab", tab); } catch {}
  }

  return (
    <>
      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {(["ios", "android", "desktop"] as Tab[]).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            role="tab"
            aria-selected={active === tab}
            aria-controls={`panel-${tab}`}
            className={`${styles.tabBtn}${active === tab ? ` ${styles.active}` : ""}`}
            onClick={() => switchTab(tab)}
          >
            {tab === "ios" && <AppleIcon />}
            {tab === "android" && <AndroidIcon />}
            {tab === "desktop" && <DesktopIcon />}
            {tab === "ios" ? "iPhone / iPad" : tab === "android" ? "Android" : "Desktop"}
          </button>
        ))}
      </div>

      {/* Panels */}
      <section className={styles.panel}>

        {/* iOS */}
        <div
          id="panel-ios"
          role="tabpanel"
          aria-labelledby="tab-ios"
          tabIndex={0}
          className={`${styles.pane}${active === "ios" ? ` ${styles.active}` : ""}`}
        >
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <h3 className={styles.stepH3}>Open in Safari</h3>
              <p className={styles.stepP}>Go to <b style={{ color: "var(--text-primary)" }}>vandanaapp.vercel.app</b> in Safari. Chrome, Edge and Firefox on iOS can&rsquo;t install PWAs; Apple only allows it from Safari.</p>
              <div className={styles.mock} aria-hidden>
                <div className={styles.mockIc}><ChevronLeft /></div>
                <div className={styles.mockIc}><ChevronRight /></div>
                <div className={styles.mockUrl}>vandanaapp.vercel.app</div>
                <div className={styles.mockIc}><ThreeDots /></div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <h3 className={styles.stepH3}>Tap Share</h3>
              <p className={styles.stepP}>Tap the <b style={{ color: "var(--text-primary)" }}>Share</b> button (the square with the arrow pointing up). It&rsquo;s in the bottom toolbar on iPhone, top toolbar on iPad.</p>
              <div className={styles.mock} aria-hidden>
                <div className={styles.mockIc}><ChevronLeft /></div>
                <div className={styles.mockIc}><ChevronRight /></div>
                <div className={`${styles.mockIc} ${styles.mockIcHi}`}><ShareIcon /></div>
                <div className={styles.mockIc}><MenuIcon /></div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <h3 className={styles.stepH3}>Add to Home Screen</h3>
              <p className={styles.stepP}>Scroll down in the share sheet and tap <b style={{ color: "var(--text-primary)" }}>Add to Home Screen</b>. Confirm the name; the default <b style={{ color: "var(--text-primary)" }}>Vandana</b> is fine.</p>
              <div className={styles.shareSheet} aria-hidden>
                <div className={styles.shareRow}><SendIcon /><span className={styles.shareLabel}>Send to…</span></div>
                <div className={styles.shareRow}><CheckIcon /><span className={styles.shareLabel}>Add to Reading List</span></div>
                <div className={`${styles.shareRow} ${styles.shareRowHi}`}><AddIcon /><span className={styles.shareLabel}>Add to Home Screen</span></div>
                <div className={styles.shareRow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(236,234,228,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                    <path d="M12 20h9"/><path d="M16 4l4 4-12 12H4v-4z"/>
                  </svg>
                  <span className={styles.shareLabel}>Edit Actions</span>
                </div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>4</div>
              <h3 className={styles.stepH3}>You&rsquo;re done</h3>
              <p className={styles.stepP}>The Vandana icon appears on your home screen. Tap it like any app: it opens fullscreen, with no Safari address bar.</p>
              <div className={styles.dialog} aria-hidden>
                <Image className={styles.dialogIcon} src="/icons/icon-192.png" alt="" aria-hidden width={36} height={36} />
                <div className={styles.dialogText}>
                  <div className={styles.dialogTitle}>Vandana</div>
                  <div className={styles.dialogSub}>vandanaapp.vercel.app</div>
                </div>
                <span className={styles.dialogBtn}>Add</span>
              </div>
            </div>
          </div>
        </div>

        {/* Android */}
        <div
          id="panel-android"
          role="tabpanel"
          aria-labelledby="tab-android"
          tabIndex={0}
          className={`${styles.pane}${active === "android" ? ` ${styles.active}` : ""}`}
        >
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <h3 className={styles.stepH3}>Open in Chrome</h3>
              <p className={styles.stepP}>Go to <b style={{ color: "var(--text-primary)" }}>vandanaapp.vercel.app</b> in Chrome (or another Chromium browser: Brave, Edge, Samsung Internet all work).</p>
              <div className={styles.mock} aria-hidden>
                <div className={styles.mockIc}><ArrowRightLong /></div>
                <div className={styles.mockUrl}>https://vandanaapp.vercel.app</div>
                <div className={styles.mockIc}><ThreeDotsV /></div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <h3 className={styles.stepH3}>Open the menu</h3>
              <p className={styles.stepP}>Tap the three-dot <b style={{ color: "var(--text-primary)" }}>⋮</b> menu in the top-right of Chrome. On some Androids you may see an install banner first: tap that instead and skip to step 4.</p>
              <div className={styles.mock} aria-hidden>
                <div className={styles.mockUrl}>vandanaapp.vercel.app</div>
                <div className={`${styles.mockIc} ${styles.mockIcHi}`}><ThreeDotsV hi /></div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <h3 className={styles.stepH3}>Add to Home screen</h3>
              <p className={styles.stepP}>Tap <b style={{ color: "var(--text-primary)" }}>Add to Home screen</b> (sometimes labelled <b style={{ color: "var(--text-primary)" }}>Install app</b>). Chrome will preview the icon and label.</p>
              <div className={styles.androidMenu} aria-hidden>
                <div className={styles.androidRow}><PlayIcon />New tab</div>
                <div className={styles.androidRow}><BookmarkIcon />Bookmarks</div>
                <div className={`${styles.androidRow} ${styles.androidRowHi}`}><AddIcon />Add to Home screen</div>
                <div className={styles.androidRow}><TrashIcon />History</div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>4</div>
              <h3 className={styles.stepH3}>Confirm Install</h3>
              <p className={styles.stepP}>Tap <b style={{ color: "var(--text-primary)" }}>Install</b>. The icon lands in your app drawer and home screen. Opens fullscreen, runs offline, behaves like a real Android app.</p>
              <div className={styles.dialog} aria-hidden>
                <Image className={styles.dialogIcon} src="/icons/icon-192.png" alt="" aria-hidden width={36} height={36} />
                <div className={styles.dialogText}>
                  <div className={styles.dialogTitle}>Install Vandana?</div>
                  <div className={styles.dialogSub}>Worship in your language</div>
                </div>
                <span className={styles.dialogBtn}>Install</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div
          id="panel-desktop"
          role="tabpanel"
          aria-labelledby="tab-desktop"
          tabIndex={0}
          className={`${styles.pane}${active === "desktop" ? ` ${styles.active}` : ""}`}
        >
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <h3 className={styles.stepH3}>Open in Chrome or Edge</h3>
              <p className={styles.stepP}>Visit <b style={{ color: "var(--text-primary)" }}>vandanaapp.vercel.app</b> in <b style={{ color: "var(--text-primary)" }}>Chrome</b>, <b style={{ color: "var(--text-primary)" }}>Edge</b>, <b style={{ color: "var(--text-primary)" }}>Brave</b>, or <b style={{ color: "var(--text-primary)" }}>Arc</b>. Safari on macOS doesn&rsquo;t install PWAs yet.</p>
              <div className={styles.desktopBar} aria-hidden>
                <div className={styles.traffic}>
                  <span className={`${styles.trafficDot} ${styles.trafficR}`} />
                  <span className={`${styles.trafficDot} ${styles.trafficY}`} />
                  <span className={`${styles.trafficDot} ${styles.trafficG}`} />
                </div>
                <div className={styles.addressPill}>
                  <span style={{ color: "var(--accent)" }}>●</span>
                  vandanaapp.vercel.app
                  <span style={{ opacity: 0.5 }}>⋮</span>
                </div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <h3 className={styles.stepH3}>Click the install icon</h3>
              <p className={styles.stepP}>In the address bar (right side), look for a small icon: a monitor with a down-arrow, or a &ldquo;+&rdquo; inside a frame. Hover shows <b style={{ color: "var(--text-primary)" }}>Install Vandana</b>.</p>
              <div className={styles.desktopBar} aria-hidden>
                <div className={styles.traffic}>
                  <span className={`${styles.trafficDot} ${styles.trafficR}`} />
                  <span className={`${styles.trafficDot} ${styles.trafficY}`} />
                  <span className={`${styles.trafficDot} ${styles.trafficG}`} />
                </div>
                <div className={styles.addressPill}>
                  <span>vandanaapp.vercel.app</span>
                  <span className={styles.installIcon}><DownloadIcon /></span>
                </div>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <h3 className={styles.stepH3}>Click Install</h3>
              <p className={styles.stepP}>A confirmation dialog appears. Click <b style={{ color: "var(--text-primary)" }}>Install</b>. Vandana opens in its own window: no browser chrome, just the app.</p>
              <div className={styles.dialog} aria-hidden>
                <Image className={styles.dialogIcon} src="/icons/icon-192.png" alt="" aria-hidden width={36} height={36} />
                <div className={styles.dialogText}>
                  <div className={styles.dialogTitle}>Install app?</div>
                  <div className={styles.dialogSub}>Vandana · vandanaapp.vercel.app</div>
                </div>
                <span className={styles.dialogBtn}>Install</span>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNum}>4</div>
              <h3 className={styles.stepH3}>Pin or launch</h3>
              <p className={styles.stepP}>The Vandana window stays open. Mac: it&rsquo;s in <b style={{ color: "var(--text-primary)" }}>Launchpad</b> and you can keep it in the <b style={{ color: "var(--text-primary)" }}>Dock</b>. Windows: it&rsquo;s in <b style={{ color: "var(--text-primary)" }}>Start</b>, pin to taskbar with right-click.</p>
              <p className={styles.stepP} style={{ opacity: 0.7 }}>
                <kbd style={{ display: "inline-block", padding: "1px 7px", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.10)", borderBottomWidth: 1.5, borderRadius: 5, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>⌘</kbd>
                {" + "}
                <kbd style={{ display: "inline-block", padding: "1px 7px", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.10)", borderBottomWidth: 1.5, borderRadius: 5, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>Space</kbd>
                {" “Vandana” on Mac · "}
                <kbd style={{ display: "inline-block", padding: "1px 7px", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.10)", borderBottomWidth: 1.5, borderRadius: 5, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>⊞</kbd>
                {" “Vandana” on Windows."}
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* Outro */}
      <section className={styles.outro}>
        <div className={styles.outroCard}>
          <h2 className={styles.outroH2}>Once it&rsquo;s installed</h2>
          <p className={styles.outroP}>
            It behaves like any other app on your device. There&rsquo;s no separate account, no settings to sync, nothing to log into. The lyrics live offline after the first load.
          </p>
          <div className={styles.outroList}>
            {[
              { h: "Works offline", d: "Songs cache on first open and stay readable without WiFi." },
              { h: "No App Store", d: "It's a PWA. Updates roll out instantly from the web." },
              { h: "No tracking", d: "No ads, no analytics popups, no consent banners." },
              { h: "Free, forever", d: "Built as a personal offering to the Indian worship community." },
            ].map(({ h, d }) => (
              <div key={h} className={styles.outroItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }} aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div>
                  <div className={styles.outroItemH}>{h}</div>
                  <div className={styles.outroItemD}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
