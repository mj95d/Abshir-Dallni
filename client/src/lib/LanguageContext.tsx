import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "en" | "ar";

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  appName: { en: "Dalleni", ar: "دلّني" },
  tagline: { en: "Your AI Government Services Assistant", ar: "مساعدك الذكي للخدمات الحكومية" },
  home: { en: "Home", ar: "الرئيسية" },
  services: { en: "Services", ar: "الخدمات" },
  security: { en: "Security", ar: "الأمان" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  chat: { en: "AI Assistant", ar: "المساعد الذكي" },
  askQuestion: { en: "Ask me anything about government services...", ar: "اسألني عن أي خدمة حكومية..." },
  send: { en: "Send", ar: "إرسال" },
  categories: { en: "Service Categories", ar: "فئات الخدمات" },
  absher: { en: "Absher Services", ar: "خدمات أبشر" },
  passports: { en: "Passports", ar: "الجوازات" },
  traffic: { en: "Traffic", ar: "المرور" },
  health: { en: "Health", ar: "الصحة" },
  education: { en: "Education", ar: "التعليم" },
  banks: { en: "Banks", ar: "البنوك" },
  telecom: { en: "Telecom & SIM", ar: "الاتصالات" },
  breachCheck: { en: "Check Data Breach", ar: "فحص تسريب البيانات" },
  breachDesc: { en: "Check if your email or phone has been compromised", ar: "تحقق إذا تم تسريب بريدك أو رقمك" },
  enterEmail: { en: "Enter your email address", ar: "أدخل بريدك الإلكتروني" },
  checkNow: { en: "Check Now", ar: "فحص الآن" },
  noBreaches: { en: "No breaches found!", ar: "لم يتم العثور على تسريبات!" },
  breachFound: { en: "Breach detected!", ar: "تم اكتشاف تسريب!" },
  securityAlert: { en: "Security Alert", ar: "تنبيه أمني" },
  lastCheck: { en: "Last check", ar: "آخر فحص" },
  savedInquiries: { en: "Saved Inquiries", ar: "الاستفسارات المحفوظة" },
  recentSearches: { en: "Recent Searches", ar: "البحث الأخير" },
  requirements: { en: "Requirements", ar: "المتطلبات" },
  fees: { en: "Fees", ar: "الرسوم" },
  processingTime: { en: "Processing Time", ar: "وقت المعالجة" },
  steps: { en: "Steps", ar: "الخطوات" },
  officialLink: { en: "Official Link", ar: "الرابط الرسمي" },
  renewIqama: { en: "Renew Iqama", ar: "تجديد الإقامة" },
  renewLicense: { en: "Renew License", ar: "تجديد الرخصة" },
  checkViolations: { en: "Check Violations", ar: "الاستعلام عن المخالفات" },
  transferOwnership: { en: "Transfer Ownership", ar: "نقل الملكية" },
  severity: { en: "Severity", ar: "الخطورة" },
  high: { en: "High", ar: "عالية" },
  medium: { en: "Medium", ar: "متوسطة" },
  low: { en: "Low", ar: "منخفضة" },
  recommendedActions: { en: "Recommended Actions", ar: "الإجراءات الموصى بها" },
  changePassword: { en: "Change your password immediately", ar: "غيّر كلمة المرور فوراً" },
  enable2FA: { en: "Enable two-factor authentication", ar: "فعّل المصادقة الثنائية" },
  checkAccounts: { en: "Review connected accounts", ar: "راجع الحسابات المرتبطة" },
  protectedBy: { en: "Protected by Dalleni", ar: "محمي بواسطة دلّني" },
  suggestedQuestions: { en: "Suggested Questions", ar: "أسئلة مقترحة" },
  welcomeMessage: { en: "Hello! I'm Dalleni, your AI assistant for Saudi government services. How can I help you today?", ar: "مرحباً! أنا دلّني، مساعدك الذكي للخدمات الحكومية السعودية. كيف يمكنني مساعدتك اليوم؟" },
  viewDetails: { en: "View Details", ar: "عرض التفاصيل" },
  close: { en: "Close", ar: "إغلاق" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("dalleni-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("dalleni-language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
