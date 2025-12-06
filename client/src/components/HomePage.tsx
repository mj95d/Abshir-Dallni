import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ServiceCard } from "./ServiceCard";
import { 
  MessageSquare, 
  Shield, 
  Clock, 
  Sparkles,
  User,
  FileText,
  Car,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { t, language } = useLanguage();
  const ChevronIcon = language === "ar" ? ChevronLeft : ChevronRight;

  const features = [
    {
      icon: MessageSquare,
      title: language === "en" ? "AI-Powered Assistant" : "مساعد مدعوم بالذكاء الاصطناعي",
      description: language === "en" 
        ? "Get instant answers to any government service question"
        : "احصل على إجابات فورية لأي سؤال عن الخدمات الحكومية",
    },
    {
      icon: Shield,
      title: language === "en" ? "Data Breach Monitoring" : "مراقبة تسريب البيانات",
      description: language === "en"
        ? "Check if your personal data has been compromised"
        : "تحقق إذا تم تسريب بياناتك الشخصية",
    },
    {
      icon: Clock,
      title: language === "en" ? "Step-by-Step Guides" : "دليل خطوة بخطوة",
      description: language === "en"
        ? "Clear instructions for all government procedures"
        : "تعليمات واضحة لجميع الإجراءات الحكومية",
    },
  ];

  const quickServices = [
    { icon: User, titleKey: "absher" },
    { icon: FileText, titleKey: "passports" },
    { icon: Car, titleKey: "traffic" },
  ];

  return (
    <div className={`${language === "ar" ? "font-arabic" : ""}`}>
      <section className="relative py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            {language === "en" ? "AI-Powered Government Assistant" : "مساعد حكومي مدعوم بالذكاء الاصطناعي"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("appName")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("tagline")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => onNavigate("chat")} data-testid="button-start-chat">
              <MessageSquare className="h-5 w-5" />
              {t("chat")}
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate("security")} data-testid="button-check-security">
              <Shield className="h-5 w-5" />
              {t("breachCheck")}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center" data-testid={`card-feature-${index}`}>
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {language === "en" ? "Popular Services" : "الخدمات الشائعة"}
          </h2>
          <Button variant="ghost" onClick={() => onNavigate("services")} className="gap-1">
            {language === "en" ? "View All" : "عرض الكل"}
            <ChevronIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickServices.map((service) => (
            <ServiceCard
              key={service.titleKey}
              icon={service.icon}
              titleKey={service.titleKey}
              onClick={() => onNavigate("services")}
            />
          ))}
        </div>
      </section>

      <section className="py-12 px-4">
        <Card className="max-w-4xl mx-auto p-8 text-center bg-primary/5 border-primary/20">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {language === "en" ? "Protect Your Data" : "احمِ بياناتك"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {language === "en" 
              ? "Check if your email or phone number has been exposed in data breaches. Stay informed and take action to protect your accounts."
              : "تحقق إذا تم تسريب بريدك الإلكتروني أو رقم هاتفك في اختراقات البيانات. ابقَ على اطلاع واتخذ إجراءات لحماية حساباتك."}
          </p>
          <Button onClick={() => onNavigate("security")} data-testid="button-security-cta">
            {t("checkNow")}
          </Button>
        </Card>
      </section>
    </div>
  );
}
