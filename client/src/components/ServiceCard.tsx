import { useLanguage } from "@/lib/LanguageContext";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  titleKey: string;
  description?: string;
  onClick?: () => void;
}

export function ServiceCard({ icon: Icon, titleKey, description, onClick }: ServiceCardProps) {
  const { t, language } = useLanguage();
  const ChevronIcon = language === "ar" ? ChevronLeft : ChevronRight;

  return (
    <Card
      className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
        language === "ar" ? "font-arabic" : ""
      }`}
      onClick={onClick}
      data-testid={`card-service-${titleKey}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
        <ChevronIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}
