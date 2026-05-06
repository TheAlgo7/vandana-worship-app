import updatesData from "@/data/updates.json";
import UpdatesContent from "./UpdatesContent";
import BottomNav from "@/components/BottomNav";

export default async function UpdatesPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <UpdatesContent updates={updatesData} />
      <BottomNav />
    </div>
  );
}
