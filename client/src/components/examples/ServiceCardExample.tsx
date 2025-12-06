import { LanguageProvider } from "@/lib/LanguageContext";
import { ServiceCard } from "../ServiceCard";
import { User, FileText, Car } from "lucide-react";

export default function ServiceCardExample() {
  return (
    <LanguageProvider>
      <div className="p-4 space-y-4 max-w-md">
        <ServiceCard
          icon={User}
          titleKey="absher"
          onClick={() => console.log("Absher clicked")}
        />
        <ServiceCard
          icon={FileText}
          titleKey="passports"
          onClick={() => console.log("Passports clicked")}
        />
        <ServiceCard
          icon={Car}
          titleKey="traffic"
          onClick={() => console.log("Traffic clicked")}
        />
      </div>
    </LanguageProvider>
  );
}
