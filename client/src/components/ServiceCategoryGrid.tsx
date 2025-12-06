import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { ServiceCard } from "./ServiceCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, 
  FileText, 
  Car, 
  Heart, 
  GraduationCap, 
  Building2, 
  Smartphone,
  Clock,
  Banknote,
  CheckCircle,
  ExternalLink,
  X
} from "lucide-react";

interface ServiceDetail {
  titleKey: string;
  requirements: string[];
  fees: string;
  processingTime: string;
  steps: string[];
  officialLink: string;
}

const services = [
  { 
    icon: User, 
    titleKey: "absher",
    details: {
      requirements: ["Valid ID", "Active Absher account", "Registered phone number"],
      requirementsAr: ["هوية صالحة", "حساب أبشر نشط", "رقم جوال مسجل"],
      fees: "Free / مجاني",
      processingTime: "Instant / فوري",
      steps: [
        "Log in to Absher portal",
        "Navigate to desired service",
        "Complete required information",
        "Submit and wait for confirmation"
      ],
      stepsAr: [
        "تسجيل الدخول إلى بوابة أبشر",
        "الانتقال إلى الخدمة المطلوبة",
        "إكمال المعلومات المطلوبة",
        "الإرسال وانتظار التأكيد"
      ],
      officialLink: "https://absher.sa"
    }
  },
  { 
    icon: FileText, 
    titleKey: "passports",
    details: {
      requirements: ["Valid passport", "Iqama card", "Photos", "Application form"],
      requirementsAr: ["جواز سفر صالح", "بطاقة إقامة", "صور", "نموذج طلب"],
      fees: "SAR 650 / ٦٥٠ ريال",
      processingTime: "1-3 days / ١-٣ أيام",
      steps: [
        "Visit passport office or use Absher",
        "Submit required documents",
        "Pay applicable fees",
        "Collect passport or wait for delivery"
      ],
      stepsAr: [
        "زيارة مكتب الجوازات أو استخدام أبشر",
        "تقديم المستندات المطلوبة",
        "دفع الرسوم المطلوبة",
        "استلام الجواز أو انتظار التوصيل"
      ],
      officialLink: "https://absher.sa/wps/portal/individuals/static/passport"
    }
  },
  { 
    icon: Car, 
    titleKey: "traffic",
    details: {
      requirements: ["Valid driving license", "Vehicle registration", "Insurance"],
      requirementsAr: ["رخصة قيادة صالحة", "استمارة السيارة", "تأمين"],
      fees: "Varies / متغير",
      processingTime: "Same day / نفس اليوم",
      steps: [
        "Check violations via Absher",
        "Select violations to pay",
        "Complete payment",
        "Download receipt"
      ],
      stepsAr: [
        "فحص المخالفات عبر أبشر",
        "اختيار المخالفات للدفع",
        "إتمام الدفع",
        "تحميل الإيصال"
      ],
      officialLink: "https://absher.sa/wps/portal/individuals/static/traffic"
    }
  },
  { 
    icon: Heart, 
    titleKey: "health",
    details: {
      requirements: ["Iqama or ID", "Health insurance card"],
      requirementsAr: ["إقامة أو هوية", "بطاقة التأمين الصحي"],
      fees: "Varies / متغير",
      processingTime: "Varies / متغير",
      steps: [
        "Visit Sehhaty app or website",
        "Book appointment",
        "Visit healthcare facility",
        "Follow up as needed"
      ],
      stepsAr: [
        "زيارة تطبيق أو موقع صحتي",
        "حجز موعد",
        "زيارة المنشأة الصحية",
        "المتابعة حسب الحاجة"
      ],
      officialLink: "https://sehhaty.sa"
    }
  },
  { 
    icon: GraduationCap, 
    titleKey: "education",
    details: {
      requirements: ["Student ID", "Registration documents"],
      requirementsAr: ["هوية الطالب", "مستندات التسجيل"],
      fees: "Varies / متغير",
      processingTime: "1-5 days / ١-٥ أيام",
      steps: [
        "Access Noor system",
        "Select education service",
        "Submit required documents",
        "Track application status"
      ],
      stepsAr: [
        "الدخول إلى نظام نور",
        "اختيار الخدمة التعليمية",
        "تقديم المستندات المطلوبة",
        "متابعة حالة الطلب"
      ],
      officialLink: "https://noor.moe.gov.sa"
    }
  },
  { 
    icon: Building2, 
    titleKey: "banks",
    details: {
      requirements: ["Valid ID", "Proof of address", "Employment letter"],
      requirementsAr: ["هوية صالحة", "إثبات عنوان", "خطاب عمل"],
      fees: "Varies by bank / يختلف حسب البنك",
      processingTime: "1-7 days / ١-٧ أيام",
      steps: [
        "Visit bank or use mobile app",
        "Submit required documents",
        "Complete verification",
        "Activate account"
      ],
      stepsAr: [
        "زيارة البنك أو استخدام التطبيق",
        "تقديم المستندات المطلوبة",
        "إتمام التحقق",
        "تفعيل الحساب"
      ],
      officialLink: "https://sama.gov.sa"
    }
  },
  { 
    icon: Smartphone, 
    titleKey: "telecom",
    details: {
      requirements: ["Valid ID or Iqama", "Fingerprint verification"],
      requirementsAr: ["هوية أو إقامة صالحة", "التحقق بالبصمة"],
      fees: "Varies by carrier / يختلف حسب الشركة",
      processingTime: "Instant / فوري",
      steps: [
        "Visit carrier store or website",
        "Verify identity via Absher",
        "Select plan",
        "Activate SIM card"
      ],
      stepsAr: [
        "زيارة فرع الشركة أو الموقع",
        "التحقق من الهوية عبر أبشر",
        "اختيار الباقة",
        "تفعيل شريحة SIM"
      ],
      officialLink: "https://citc.gov.sa"
    }
  },
];

export function ServiceCategoryGrid() {
  const { t, language } = useLanguage();
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  const getLocalizedContent = (service: typeof services[0]) => {
    const details = service.details;
    return {
      requirements: language === "ar" ? details.requirementsAr : details.requirements,
      steps: language === "ar" ? details.stepsAr : details.steps,
    };
  };

  return (
    <div className={`${language === "ar" ? "font-arabic" : ""}`}>
      <h2 className="text-2xl font-bold mb-6">{t("categories")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <ServiceCard
            key={service.titleKey}
            icon={service.icon}
            titleKey={service.titleKey}
            onClick={() => setSelectedService(service)}
          />
        ))}
      </div>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${language === "ar" ? "font-arabic" : ""}`}>
              {selectedService && (
                <>
                  <selectedService.icon className="h-5 w-5 text-primary" />
                  {t(selectedService.titleKey)}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedService && (
            <div className={`space-y-4 ${language === "ar" ? "font-arabic" : ""}`}>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t("requirements")}
                </h4>
                <ul className="space-y-1">
                  {getLocalizedContent(selectedService).requirements.map((req, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    {t("fees")}
                  </h4>
                  <Badge variant="secondary">{selectedService.details.fees}</Badge>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t("processingTime")}
                  </h4>
                  <Badge variant="secondary">{selectedService.details.processingTime}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">{t("steps")}</h4>
                <ol className="space-y-2">
                  {getLocalizedContent(selectedService).steps.map((step, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <Button 
                className="w-full gap-2" 
                asChild
              >
                <a 
                  href={selectedService.details.officialLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="link-official"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("officialLink")}
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
