import ImportClient from "./ImportClient";
import { notFound } from "next/navigation";

export default function SongImportPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ImportClient />;
}
