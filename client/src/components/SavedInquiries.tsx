import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/lib/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Car,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SavedQuery } from "@shared/schema";

interface ServiceFlow {
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  steps: { en: string; ar: string }[];
  requirements: { en: string; ar: string }[];
  fees: { en: string; ar: string };
  processingTime: { en: string; ar: string };
  officialLink: string;
  platform: string;
}

const serviceFlows: Record<string, ServiceFlow> = {
  renew_iqama: {
    title: { en: "Iqama Renewal", ar: "تجديد الإقامة" },
    description: {
      en: "Renew your residence permit (Iqama) through Absher",
      ar: "جدد إقامتك عبر منصة أبشر",
    },
    steps: [
      { en: "Login to Absher platform", ar: "تسجيل الدخول إلى منصة أبشر" },
      { en: "Go to 'My Services' then 'Passport Services'", ar: "اذهب إلى 'خدماتي' ثم 'خدمات الجوازات'" },
      { en: "Select 'Renew Iqama'", ar: "اختر 'تجديد الإقامة'" },
      { en: "Verify your personal information", ar: "تحقق من معلوماتك الشخصية" },
      { en: "Pay the renewal fees", ar: "ادفع رسوم التجديد" },
      { en: "Print the new Iqama or save digital copy", ar: "اطبع الإقامة الجديدة أو احفظ النسخة الرقمية" },
    ],
    requirements: [
      { en: "Valid passport", ar: "جواز سفر ساري" },
      { en: "Medical insurance", ar: "تأمين طبي" },
      { en: "Employer registered on GOSI", ar: "صاحب العمل مسجل في التأمينات" },
      { en: "No traffic violations", ar: "لا توجد مخالفات مرورية" },
      { en: "No legal issues", ar: "لا توجد قضايا قانونية" },
    ],
    fees: { en: "SAR 650 per year", ar: "٦٥٠ ريال سعودي سنوياً" },
    processingTime: { en: "Instant (online)", ar: "فوري (إلكترونياً)" },
    officialLink: "https://www.absher.sa",
    platform: "Absher",
  },
  check_violations: {
    title: { en: "Traffic Violations Check", ar: "الاستعلام عن المخالفات المرورية" },
    description: {
      en: "Check and pay traffic violations through Absher",
      ar: "استعلم عن المخالفات المرورية وادفعها عبر أبشر",
    },
    steps: [
      { en: "Login to Absher platform", ar: "تسجيل الدخول إلى منصة أبشر" },
      { en: "Go to 'Traffic Services'", ar: "اذهب إلى 'خدمات المرور'" },
      { en: "Select 'Query Traffic Violations'", ar: "اختر 'الاستعلام عن المخالفات'" },
      { en: "View violation details and fines", ar: "عرض تفاصيل المخالفات والغرامات" },
      { en: "Pay violations online or object if applicable", ar: "ادفع المخالفات إلكترونياً أو اعترض إن أمكن" },
    ],
    requirements: [
      { en: "Absher account", ar: "حساب أبشر" },
      { en: "National ID or Iqama number", ar: "رقم الهوية أو الإقامة" },
    ],
    fees: { en: "Varies per violation", ar: "تختلف حسب المخالفة" },
    processingTime: { en: "Instant query", ar: "استعلام فوري" },
    officialLink: "https://www.absher.sa",
    platform: "Absher",
  },
  bank_account: {
    title: { en: "Bank Account Opening", ar: "فتح حساب بنكي" },
    description: {
      en: "Requirements to open a bank account in Saudi Arabia",
      ar: "متطلبات فتح حساب بنكي في المملكة العربية السعودية",
    },
    steps: [
      { en: "Choose your preferred bank", ar: "اختر البنك المفضل لديك" },
      { en: "Visit the branch or apply online", ar: "زر الفرع أو قدم إلكترونياً" },
      { en: "Present required documents", ar: "قدم المستندات المطلوبة" },
      { en: "Complete identity verification via Nafath", ar: "أكمل التحقق من الهوية عبر نفاذ" },
      { en: "Sign account agreement", ar: "وقع اتفاقية الحساب" },
      { en: "Receive debit card and account details", ar: "استلم بطاقة الصراف وتفاصيل الحساب" },
    ],
    requirements: [
      { en: "Valid ID (Iqama or National ID)", ar: "هوية سارية (إقامة أو هوية وطنية)" },
      { en: "Saudi phone number", ar: "رقم جوال سعودي" },
      { en: "Proof of address (utility bill or rental)", ar: "إثبات العنوان (فاتورة أو عقد إيجار)" },
      { en: "Work permit or salary certificate", ar: "تصريح عمل أو شهادة راتب" },
      { en: "Absher and Nafath registration", ar: "التسجيل في أبشر ونفاذ" },
    ],
    fees: { en: "Usually free for basic accounts", ar: "مجاني عادةً للحسابات الأساسية" },
    processingTime: { en: "Same day to 3 days", ar: "نفس اليوم إلى ٣ أيام" },
    officialLink: "https://www.sama.gov.sa",
    platform: "Bank Branch / Online",
  },
  renew_vehicle: {
    title: { en: "Vehicle Registration Renewal", ar: "تجديد استمارة المركبة" },
    description: {
      en: "Renew your vehicle registration (Istimara) through Absher",
      ar: "جدد استمارة مركبتك عبر منصة أبشر",
    },
    steps: [
      { en: "Login to Absher platform", ar: "تسجيل الدخول إلى منصة أبشر" },
      { en: "Go to 'Traffic Services'", ar: "اذهب إلى 'خدمات المرور'" },
      { en: "Select 'Renew Vehicle Registration'", ar: "اختر 'تجديد الاستمارة'" },
      { en: "Complete vehicle inspection (Fahs)", ar: "أكمل فحص المركبة" },
      { en: "Pay renewal fees", ar: "ادفع رسوم التجديد" },
      { en: "Print new registration or save digital copy", ar: "اطبع الاستمارة الجديدة أو احفظ النسخة الرقمية" },
    ],
    requirements: [
      { en: "Valid vehicle insurance", ar: "تأمين مركبة ساري" },
      { en: "Valid vehicle inspection (Fahs)", ar: "فحص مركبة ساري" },
      { en: "No unpaid traffic violations", ar: "لا توجد مخالفات مرورية غير مدفوعة" },
      { en: "Valid Iqama or National ID", ar: "إقامة أو هوية سارية" },
    ],
    fees: { en: "SAR 100-300 depending on vehicle", ar: "١٠٠-٣٠٠ ريال حسب المركبة" },
    processingTime: { en: "Instant (online)", ar: "فوري (إلكترونياً)" },
    officialLink: "https://www.absher.sa",
    platform: "Absher",
  },
};

const iconMap: Record<string, typeof FileText> = {
  FileText: FileText,
  Car: Car,
  CreditCard: CreditCard,
};

interface SavedInquiriesProps {
  userId?: string;
  compact?: boolean;
}

export function SavedInquiries({ userId, compact = false }: SavedInquiriesProps) {
  const { language, t } = useLanguage();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const ChevronIcon = language === "ar" ? ChevronLeft : ChevronRight;

  const { data: queries, isLoading } = useQuery<SavedQuery[]>({
    queryKey: userId ? ["/api/saved-queries", userId] : ["/api/saved-queries"],
  });

  const useMutation_ = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/saved-queries/${id}/use`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-queries"] });
    },
  });

  const handleServiceClick = (serviceKey: string, id: string) => {
    setSelectedService(serviceKey);
    if (id && !id.startsWith("default-")) {
      useMutation_.mutate(id);
    }
  };

  const selectedFlow = selectedService ? serviceFlows[selectedService] : null;

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const displayQueries = queries?.slice(0, compact ? 3 : undefined) || [];

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold flex items-center gap-2 flex-wrap">
            <FileText className="h-4 w-4" />
            {t("savedInquiries")}
          </h3>
          {displayQueries.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {displayQueries.length}
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          {displayQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {language === "en" ? "No saved inquiries yet" : "لا توجد استفسارات محفوظة"}
            </p>
          ) : (
            displayQueries.map((query) => {
              const IconComponent = iconMap[query.icon || "FileText"] || FileText;
              const title = language === "ar" ? query.titleAr : query.title;
              return (
                <div
                  key={query.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md hover-elevate cursor-pointer"
                  onClick={() => handleServiceClick(query.serviceKey, query.id)}
                  data-testid={`saved-inquiry-${query.serviceKey}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium truncate">{title}</span>
                  </div>
                  <ChevronIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedFlow && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {language === "ar" ? selectedFlow.title.ar : selectedFlow.title.en}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? selectedFlow.description.ar : selectedFlow.description.en}
                </p>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {t("steps")}
                  </h4>
                  <ol className="space-y-2">
                    {selectedFlow.steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{language === "ar" ? step.ar : step.en}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    {t("requirements")}
                  </h4>
                  <ul className="space-y-1">
                    {selectedFlow.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-1">-</span>
                        <span>{language === "ar" ? req.ar : req.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-md bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">
                      {t("fees")}
                    </div>
                    <div className="text-sm font-medium">
                      {language === "ar" ? selectedFlow.fees.ar : selectedFlow.fees.en}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t("processingTime")}
                    </div>
                    <div className="text-sm font-medium">
                      {language === "ar" ? selectedFlow.processingTime.ar : selectedFlow.processingTime.en}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full gap-2"
                    onClick={() => window.open(selectedFlow.officialLink, "_blank")}
                    data-testid="button-official-link"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t("officialLink")} - {selectedFlow.platform}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
