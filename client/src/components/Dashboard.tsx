import { useLanguage } from "@/lib/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  ShieldCheck, 
  Clock, 
  Search, 
  FileText,
  Car,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from "lucide-react";

export function Dashboard() {
  const { t, language } = useLanguage();
  const ChevronIcon = language === "ar" ? ChevronLeft : ChevronRight;

  // todo: remove mock functionality - replace with actual user data
  const mockData = {
    securityStatus: "safe",
    lastCheck: "2024-12-06 09:00 PM",
    recentSearches: [
      { id: 1, query: language === "en" ? "How to renew Iqama?" : "كيف أجدد الإقامة؟", date: "2024-12-06" },
      { id: 2, query: language === "en" ? "Traffic violation fees" : "رسوم المخالفات المرورية", date: "2024-12-05" },
      { id: 3, query: language === "en" ? "Transfer car ownership" : "نقل ملكية السيارة", date: "2024-12-04" },
    ],
    savedInquiries: [
      { id: 1, title: language === "en" ? "Iqama Renewal Steps" : "خطوات تجديد الإقامة", icon: FileText },
      { id: 2, title: language === "en" ? "Traffic Violations Check" : "الاستعلام عن المخالفات", icon: Car },
      { id: 3, title: language === "en" ? "Bank Account Requirements" : "متطلبات فتح حساب بنكي", icon: CreditCard },
    ],
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${language === "ar" ? "font-arabic" : ""}`}>
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{t("security")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("lastCheck")}: {mockData.lastCheck}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="default" className="bg-primary gap-1">
              <Shield className="h-3 w-3" />
              {language === "en" ? "Protected" : "محمي"}
            </Badge>
            <Button variant="ghost" size="sm" className="gap-1">
              {t("viewDetails")}
              <ChevronIcon className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">
                {language === "en" ? "Upcoming Renewals" : "التجديدات القادمة"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "No pending renewals" : "لا توجد تجديدات معلقة"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-1">
            {language === "en" ? "Add Reminder" : "إضافة تذكير"}
          </Button>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t("recentSearches")}
          </h3>
        </div>
        <div className="space-y-2">
          {mockData.recentSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer"
              data-testid={`recent-search-${search.id}`}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{search.query}</span>
              </div>
              <span className="text-xs text-muted-foreground">{search.date}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("savedInquiries")}
          </h3>
        </div>
        <div className="space-y-2">
          {mockData.savedInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer"
              data-testid={`saved-inquiry-${inquiry.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <inquiry.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{inquiry.title}</span>
              </div>
              <ChevronIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
