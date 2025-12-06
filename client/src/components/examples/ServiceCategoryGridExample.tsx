import { LanguageProvider } from "@/lib/LanguageContext";
import { ServiceCategoryGrid } from "../ServiceCategoryGrid";

export default function ServiceCategoryGridExample() {
  return (
    <LanguageProvider>
      <div className="p-4">
        <ServiceCategoryGrid />
      </div>
    </LanguageProvider>
  );
}
