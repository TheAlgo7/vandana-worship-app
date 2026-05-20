import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import verses from "@/data/verses.json";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  "mailto:gauravtiger60@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type VersePeriod = keyof typeof verses;

type PushPayload = { title: string; body: string; silent: boolean; url: string; tag: string };

async function broadcast(payload: PushPayload) {
  const { data: subs, error } = await db
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = await Promise.allSettled(
    (subs ?? []).map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  // Clean up subscriptions where the device has revoked permission
  const expired = results
    .map((r, i) => ({ r, sub: subs![i] }))
    .filter(({ r }) => r.status === "rejected" && (r.reason as { statusCode?: number })?.statusCode === 410)
    .map(({ sub }) => sub.endpoint);

  if (expired.length > 0) {
    await db.from("push_subscriptions").delete().in("endpoint", expired);
  }

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ ok: true, sent, total: subs?.length ?? 0 });
}

function buildVersePayload(): PushPayload {
  const dayOfYear = Math.floor(Date.now() / 86400000);
  const pool = verses["morning" as VersePeriod];
  const verse = pool[dayOfYear % pool.length];
  return {
    title: "Verse of the Day",
    body: `${verse.english}\n${verse.reference}`,
    silent: true,
    url: "/",
    tag: "daily-verse",
  };
}

// GET: called by Vercel cron daily at 8am IST (02:30 UTC)
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return broadcast(buildVersePayload());
}

// POST: called manually to send verse or a custom update notification
export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const type: string = body.type ?? "verse";

  const payload: PushPayload =
    type === "verse"
      ? buildVersePayload()
      : {
          title: body.title ?? "Vandana",
          body: body.body ?? "",
          silent: false,
          url: body.url ?? "/updates",
          tag: "update",
        };

  return broadcast(payload);
}
