import { useLanguage } from "@/lib/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Search, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { SavedInquiries } from "@/components/SavedInquiries";
import { DeviceDetection } from "@/components/DeviceDetection";

export function Dashboard() {
  const { t, language } = useLanguage();
  const ChevronIcon = language === "ar" ? ChevronLeft : ChevronRight;

  const mockRecentSearches = [
    { id: 1, query: language === "en" ? "How to renew Iqama?" : "كيف أجدد الإقامة؟", date: "2024-12-06" },
    { id: 2, query: language === "en" ? "Traffic violation fees" : "رسوم المخالفات المرورية", date: "2024-12-05" },
    { id: 3, query: language === "en" ? "Transfer car ownership" : "نقل ملكية السيارة", date: "2024-12-04" },
  ];

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${language === "ar" ? "font-arabic" : ""}`}>
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeviceDetection />

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">
                {t("upcomingRenewals")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("noPendingRenewals")}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-1" data-testid="button-add-reminder">
            {t("addReminder")}
          </Button>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold flex items-center gap-2 flex-wrap">
            <Search className="h-4 w-4" />
            {t("recentSearches")}
          </h3>
        </div>
        <div className="space-y-2">
          {mockRecentSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between gap-2 p-2 rounded-md hover-elevate cursor-pointer"
              data-testid={`recent-search-${search.id}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{search.query}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{search.date}</span>
            </div>
          ))}
        </div>
      </Card>

      <SavedInquiries />
    </div>
  );
}
