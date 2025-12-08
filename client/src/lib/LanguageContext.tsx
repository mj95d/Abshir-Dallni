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
  digitalShield: { en: "Digital Shield", ar: "درع الحماية الرقمية" },
  shieldTitle: { en: "Digital Protection Shield", ar: "درع الحماية الرقمية" },
  shieldDesc: { en: "Monitor your email for data breaches and get alerts", ar: "راقب بريدك الإلكتروني لاكتشاف التسريبات واحصل على تنبيهات" },
  subscribeAlerts: { en: "Subscribe to Alerts", ar: "اشترك في التنبيهات" },
  unsubscribe: { en: "Unsubscribe", ar: "إلغاء الاشتراك" },
  breachAlert: { en: "Breach Alert", ar: "تنبيه تسريب" },
  safeStatus: { en: "Your email appears safe", ar: "بريدك الإلكتروني آمن" },
  changeAbsherPassword: { en: "Change Absher Password", ar: "تغيير كلمة مرور أبشر" },
  absherLink: { en: "Go to Absher", ar: "الذهاب إلى أبشر" },
  consentText: { en: "I consent to periodic monitoring of my email for data breaches", ar: "أوافق على المراقبة الدورية لبريدي الإلكتروني للكشف عن التسريبات" },
  privacyNotice: { en: "We only check if your email appears in public breach databases. We never access your accounts or store your passwords.", ar: "نتحقق فقط إذا ظهر بريدك في قواعد بيانات التسريبات العامة. لا نصل إلى حساباتك أو نخزن كلمات مرورك." },
  subscribed: { en: "Subscribed", ar: "مشترك" },
  notSubscribed: { en: "Not Subscribed", ar: "غير مشترك" },
  monitoringActive: { en: "Monitoring Active", ar: "المراقبة نشطة" },
  monitoringStopped: { en: "Monitoring Stopped", ar: "المراقبة متوقفة" },
  deleteAccount: { en: "Delete My Data", ar: "حذف بياناتي" },
  confirmDelete: { en: "Are you sure you want to delete all your monitoring data?", ar: "هل أنت متأكد من حذف جميع بيانات المراقبة؟" },
  subscriptionSuccess: { en: "Successfully subscribed to breach alerts", ar: "تم الاشتراك في تنبيهات التسريبات بنجاح" },
  unsubscribeSuccess: { en: "Successfully unsubscribed from alerts", ar: "تم إلغاء الاشتراك من التنبيهات بنجاح" },
  deleteSuccess: { en: "All your data has been deleted", ar: "تم حذف جميع بياناتك" },
  breachesDetected: { en: "Breaches Detected", ar: "تسريبات مكتشفة" },
  noBreachesDetected: { en: "No Breaches Detected", ar: "لا توجد تسريبات" },
  lastUpdated: { en: "Last Updated", ar: "آخر تحديث" },
  viewNotifications: { en: "View Notifications", ar: "عرض الإشعارات" },
  deviceSecurity: { en: "Device Security", ar: "أمان الجهاز" },
  currentDevice: { en: "Current Device", ar: "الجهاز الحالي" },
  newDeviceDetected: { en: "New Device Detected", ar: "تم اكتشاف جهاز جديد" },
  newDeviceAlert: { en: "We detected a login from a new device. If this wasn't you, please secure your account immediately.", ar: "اكتشفنا تسجيل دخول من جهاز جديد. إذا لم يكن هذا أنت، يرجى تأمين حسابك فوراً." },
  itsMe: { en: "It's Me", ar: "هذا أنا" },
  secureAccount: { en: "Secure Account", ar: "تأمين الحساب" },
  yourDevices: { en: "Your Devices", ar: "أجهزتك" },
  viewAllDevices: { en: "View All Devices", ar: "عرض جميع الأجهزة" },
  yourOtherDevices: { en: "Your Other Devices", ar: "أجهزتك الأخرى" },
  protected: { en: "Protected", ar: "محمي" },
  noSavedInquiries: { en: "No saved inquiries yet", ar: "لا توجد استفسارات محفوظة" },
  upcomingRenewals: { en: "Upcoming Renewals", ar: "التجديدات القادمة" },
  noPendingRenewals: { en: "No pending renewals", ar: "لا توجد تجديدات معلقة" },
  addReminder: { en: "Add Reminder", ar: "إضافة تذكير" },
  supportCenter: { en: "Support Center", ar: "مركز الدعم" },
  support: { en: "Support", ar: "الدعم" },
  createTicket: { en: "Create New Ticket", ar: "إنشاء طلب جديد" },
  myTickets: { en: "My Tickets", ar: "طلباتي" },
  noTickets: { en: "No tickets yet", ar: "لا توجد طلبات" },
  noTicketsDesc: { en: "Create your first support ticket to get help", ar: "أنشئ طلب دعم للحصول على المساعدة" },
  ticketNumber: { en: "Ticket Number", ar: "رقم الطلب" },
  ticketStatus: { en: "Status", ar: "الحالة" },
  ticketCreated: { en: "Created", ar: "تاريخ الإنشاء" },
  ticketDetails: { en: "Ticket Details", ar: "تفاصيل الطلب" },
  issueDescription: { en: "Issue Description", ar: "وصف المشكلة" },
  describeIssue: { en: "Describe your issue in detail...", ar: "اشرح مشكلتك بالتفصيل..." },
  selectService: { en: "Select Service", ar: "اختر الخدمة" },
  serviceType: { en: "Service Type", ar: "نوع الخدمة" },
  yourEmail: { en: "Your Email", ar: "بريدك الإلكتروني" },
  yourPhone: { en: "Phone Number (Optional)", ar: "رقم الجوال (اختياري)" },
  nationalIdOptional: { en: "National ID (Optional)", ar: "رقم الهوية (اختياري)" },
  submitTicket: { en: "Submit Ticket", ar: "إرسال الطلب" },
  submitting: { en: "Submitting...", ar: "جاري الإرسال..." },
  ticketSuccess: { en: "Ticket created successfully!", ar: "تم إنشاء الطلب بنجاح!" },
  ticketError: { en: "Failed to create ticket", ar: "فشل إنشاء الطلب" },
  aiSolution: { en: "AI Suggested Solution", ar: "الحل المقترح من الذكاء الاصطناعي" },
  timeline: { en: "Timeline", ar: "الجدول الزمني" },
  comments: { en: "Comments", ar: "التعليقات" },
  addComment: { en: "Add Comment", ar: "إضافة تعليق" },
  writeComment: { en: "Write your comment...", ar: "اكتب تعليقك..." },
  postComment: { en: "Post", ar: "نشر" },
  goToAbsher: { en: "Go to Absher", ar: "الذهاب إلى أبشر" },
  deleteTicket: { en: "Delete Ticket", ar: "حذف الطلب" },
  confirmDeleteTicket: { en: "Are you sure you want to delete this ticket?", ar: "هل أنت متأكد من حذف هذا الطلب؟" },
  backToTickets: { en: "Back to Tickets", ar: "العودة للطلبات" },
  admin: { en: "Admin", ar: "المشرف" },
  adminDashboard: { en: "Admin Dashboard", ar: "لوحة المشرف" },
  allTickets: { en: "All Tickets", ar: "جميع الطلبات" },
  filterByStatus: { en: "Filter by Status", ar: "تصفية حسب الحالة" },
  allStatuses: { en: "All Statuses", ar: "جميع الحالات" },
  updateStatus: { en: "Update Status", ar: "تحديث الحالة" },
  adminNotes: { en: "Admin Notes", ar: "ملاحظات المشرف" },
  saveNotes: { en: "Save Notes", ar: "حفظ الملاحظات" },
  serviceIqama: { en: "Iqama Services", ar: "خدمات الإقامة" },
  serviceVehicleTransfer: { en: "Vehicle Transfer", ar: "نقل ملكية" },
  serviceVehicleRenewal: { en: "Vehicle Renewal", ar: "تجديد استمارة" },
  serviceReports: { en: "Reports", ar: "بلاغات" },
  serviceAppointments: { en: "Appointments", ar: "مواعيد" },
  serviceBaladi: { en: "Baladi Services", ar: "خدمات بلدي" },
  serviceTraffic: { en: "Traffic Services", ar: "خدمات المرور" },
  serviceOther: { en: "Other", ar: "أخرى" },
  statusNew: { en: "New", ar: "جديد" },
  statusInReview: { en: "In Review", ar: "قيد المراجعة" },
  statusResolved: { en: "Resolved", ar: "تم الحل" },
  statusRequiresOfficial: { en: "Contact Official Support", ar: "يتطلب التواصل الرسمي" },
  canBeSolvedOnline: { en: "Can be solved online", ar: "يمكن حلها عبر الإنترنت" },
  requiresBranchVisit: { en: "Requires branch visit", ar: "يتطلب زيارة الفرع" },
  requiredDocuments: { en: "Required Documents", ar: "المستندات المطلوبة" },
  stepByStep: { en: "Step by Step Guide", ar: "دليل خطوة بخطوة" },
  officialLinks: { en: "Official Links", ar: "الروابط الرسمية" },
  aiRecommendation: { en: "AI Recommendation", ar: "توصية الذكاء الاصطناعي" },
  analyzing: { en: "Analyzing your issue...", ar: "جاري تحليل مشكلتك..." },
  viewTicket: { en: "View Ticket", ar: "عرض الطلب" },
  ticketNotFound: { en: "Ticket not found", ar: "الطلب غير موجود" },
  searchTickets: { en: "Search tickets...", ar: "البحث في الطلبات..." },
  user: { en: "User", ar: "المستخدم" },
  noCommentsYet: { en: "No comments yet", ar: "لا توجد تعليقات" },
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
