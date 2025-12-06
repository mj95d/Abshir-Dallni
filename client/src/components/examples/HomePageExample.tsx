import { LanguageProvider } from "@/lib/LanguageContext";
import { HomePage } from "../HomePage";

export default function HomePageExample() {
  return (
    <LanguageProvider>
      <HomePage onNavigate={(page) => console.log("Navigate to:", page)} />
    </LanguageProvider>
  );
}
