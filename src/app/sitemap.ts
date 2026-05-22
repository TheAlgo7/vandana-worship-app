import type { MetadataRoute } from "next";
import { getSongIds } from "@/lib/getSongs";
import { MINISTRIES } from "@/lib/ministries";

const BASE_URL = "https://vandanaapp.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const songIds = await getSongIds();

  const songEntries: MetadataRoute.Sitemap = songIds.map((id) => ({
    url: `${BASE_URL}/song/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const ministryEntries: MetadataRoute.Sitemap = MINISTRIES.map((m) => ({
    url: `${BASE_URL}/ministry/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/updates`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...ministryEntries,
    ...songEntries,
  ];
}
