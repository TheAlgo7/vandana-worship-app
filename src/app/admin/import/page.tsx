import type { Metadata } from "next";
import ImportClient from "./ImportClient";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SongImportPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ImportClient />;
}
