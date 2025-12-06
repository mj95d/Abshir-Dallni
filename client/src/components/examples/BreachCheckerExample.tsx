import { LanguageProvider } from "@/lib/LanguageContext";
import { BreachChecker } from "../BreachChecker";

export default function BreachCheckerExample() {
  return (
    <LanguageProvider>
      <div className="p-4">
        <BreachChecker />
      </div>
    </LanguageProvider>
  );
}
