import { LanguageProvider } from "@/lib/LanguageContext";
import { Dashboard } from "../Dashboard";

export default function DashboardExample() {
  return (
    <LanguageProvider>
      <div className="p-4">
        <Dashboard />
      </div>
    </LanguageProvider>
  );
}
