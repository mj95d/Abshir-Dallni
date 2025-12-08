import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Key, 
  Smartphone, 
  Mail,
  Bell,
  BellOff,
  Trash2,
  ExternalLink,
  Lock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BreachResult {
  found: boolean;
  breaches?: {
    name: string;
    date: string;
    dataTypes: string[];
    severity: "high" | "medium" | "low";
  }[];
  storedBreachCount?: number;
}

interface ShieldStatus {
  subscribed: boolean;
  user?: {
    email: string;
    notifyChannel: string;
    locale: string;
    createdAt: string;
  };
  breachCount: number;
  recentBreaches: any[];
  notificationCount: number;
}

export function DigitalShield() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [result, setResult] = useState<BreachResult | null>(null);
  const [status, setStatus] = useState<ShieldStatus | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchStatus = async (emailToCheck: string) => {
    if (!emailToCheck.trim()) return;
    
    setIsLoadingStatus(true);
    try {
      const response = await apiRequest("POST", "/api/shield/status", { email: emailToCheck });
      const data: ShieldStatus = await response.json();
      setStatus(data);
      if (data.subscribed) {
        setConsent(true);
      }
    } catch (err) {
      console.error("Status fetch error:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleCheck = async () => {
    if (!email.trim()) return;
    
    setIsChecking(true);
    setResult(null);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/shield/check", { email });
      const data: BreachResult = await response.json();
      setResult(data);
      await fetchStatus(email);
    } catch (err) {
      console.error("Breach check error:", err);
      setError(language === "en" 
        ? "Failed to check for breaches. Please try again later."
        : "فشل في التحقق من التسريبات. يرجى المحاولة مرة أخرى لاحقاً.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubscribe = async () => {
    if (!email.trim() || !consent) return;
    
    setIsSubscribing(true);
    try {
      await apiRequest("POST", "/api/shield/subscribe", {
        email,
        consent: true,
        locale: language,
        notifyChannel: "email",
      });
      
      toast({
        title: language === "en" ? "Success" : "نجاح",
        description: t("subscriptionSuccess"),
      });
      
      await fetchStatus(email);
    } catch (err) {
      console.error("Subscribe error:", err);
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description: language === "en" ? "Failed to subscribe" : "فشل الاشتراك",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    try {
      await apiRequest("POST", "/api/shield/unsubscribe", { email });
      
      toast({
        title: language === "en" ? "Success" : "نجاح",
        description: t("unsubscribeSuccess"),
      });
      
      await fetchStatus(email);
      setConsent(false);
    } catch (err) {
      console.error("Unsubscribe error:", err);
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description: language === "en" ? "Failed to unsubscribe" : "فشل إلغاء الاشتراك",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDelete = async () => {
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    try {
      await apiRequest("POST", "/api/shield/delete", { email });
      
      toast({
        title: language === "en" ? "Success" : "نجاح",
        description: t("deleteSuccess"),
      });
      
      setStatus(null);
      setResult(null);
      setConsent(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description: language === "en" ? "Failed to delete data" : "فشل حذف البيانات",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-yellow-500 text-white dark:bg-yellow-600";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDataTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("email")) return Mail;
    if (lowerType.includes("password")) return Key;
    if (lowerType.includes("phone")) return Smartphone;
    return Shield;
  };

  const formatDataType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className={`max-w-2xl mx-auto space-y-4 ${language === "ar" ? "font-arabic" : ""}`}>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("shieldTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("shieldDesc")}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("enterEmail")}
            className="flex-1"
            dir="ltr"
            data-testid="input-email-shield"
          />
          <Button 
            onClick={handleCheck} 
            disabled={isChecking || !email.trim()}
            data-testid="button-check-shield"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("checkNow")
            )}
          </Button>
        </div>

        {status?.subscribed && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-primary/10 border border-primary/20 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">{t("monitoringActive")}</span>
            <Badge variant="outline" className="ml-auto">
              {t("subscribed")}
            </Badge>
          </div>
        )}

        {!status?.subscribed && email.trim() && (
          <div className="space-y-3 mb-4 p-4 rounded-md bg-muted/50">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                data-testid="checkbox-consent"
              />
              <label htmlFor="consent" className="text-sm cursor-pointer">
                {t("consentText")}
              </label>
            </div>
            
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {t("privacyNotice")}
            </p>
            
            <Button
              onClick={handleSubscribe}
              disabled={isSubscribing || !consent || !email.trim()}
              className="w-full"
              data-testid="button-subscribe"
            >
              {isSubscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  {t("subscribeAlerts")}
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-destructive/10 border border-destructive/20 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.found ? (
              <>
                <div className="flex items-center gap-3 p-4 rounded-md bg-destructive/10 border border-destructive/20">
                  <ShieldAlert className="h-8 w-8 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-destructive">{t("breachFound")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" 
                        ? `Found in ${result.breaches?.length} breach(es)`
                        : `تم العثور عليه في ${result.breaches?.length} تسريب(ات)`}
                    </p>
                  </div>
                </div>

                {result.breaches?.map((breach, index) => (
                  <Card key={index} className="p-4" data-testid={`card-breach-${index}`}>
                    <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <span className="font-semibold">{breach.name}</span>
                      </div>
                      <Badge className={getSeverityColor(breach.severity)}>
                        {t(breach.severity)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {language === "en" ? "Date: " : "التاريخ: "}{breach.date}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {breach.dataTypes.map((type) => {
                        const Icon = getDataTypeIcon(type);
                        return (
                          <Badge key={type} variant="outline" className="gap-1">
                            <Icon className="h-3 w-3" />
                            {formatDataType(type)}
                          </Badge>
                        );
                      })}
                    </div>
                  </Card>
                ))}

                {result.breaches?.some(b => b.dataTypes.some(t => t.toLowerCase().includes("password"))) && (
                  <Card className="p-4 bg-destructive/10 border-destructive/30">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      {language === "ar" ? "تحذير هام: تم تسريب كلمة المرور!" : "Important Warning: Password Leaked!"}
                    </h4>
                    <p className="text-sm mb-4">
                      {language === "ar"
                        ? "تم تسريب كلمة المرور الخاصة بك. إذا كنت تستخدم نفس كلمة المرور في أبشر أو مواقع أخرى، يجب تغييرها فوراً."
                        : "Your password was leaked. If you use the same password on Absher or other websites, you must change it immediately."}
                    </p>
                    
                    <Button
                      asChild
                      className="w-full"
                      data-testid="button-absher-password"
                    >
                      <a 
                        href="https://www.absher.sa/portal/landing.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t("changeAbsherPassword")}
                      </a>
                    </Button>
                  </Card>
                )}

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    {t("recommendedActions")}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {t("changePassword")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {t("enable2FA")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {t("checkAccounts")}
                    </li>
                  </ul>
                </Card>
              </>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-md bg-primary/10 border border-primary/20">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-primary">{t("noBreaches")}</h3>
                  <p className="text-sm text-muted-foreground">{t("safeStatus")}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {status?.subscribed && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={isSubscribing}
                data-testid="button-unsubscribe"
              >
                {isSubscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    {t("unsubscribe")}
                  </>
                )}
              </Button>
              
              {!showDeleteConfirm ? (
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive"
                  data-testid="button-show-delete"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("deleteAccount")}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-destructive">{t("confirmDelete")}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isSubscribing}
                    data-testid="button-confirm-delete"
                  >
                    {isSubscribing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      language === "en" ? "Yes, Delete" : "نعم، احذف"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    data-testid="button-cancel-delete"
                  >
                    {language === "en" ? "Cancel" : "إلغاء"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {language === "ar" ? "مدعوم بواسطة " : "Powered by "}
            <a 
              href="https://leakcheck.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LeakCheck
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
