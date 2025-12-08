import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, ShieldCheck, Loader2, AlertTriangle, CheckCircle, Key, Smartphone, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BreachResult {
  found: boolean;
  breaches?: {
    name: string;
    date: string;
    dataTypes: string[];
    severity: "high" | "medium" | "low";
  }[];
}

export function BreachChecker() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<BreachResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!email.trim()) return;
    
    setIsChecking(true);
    setResult(null);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/breach-check", { email });
      const data: BreachResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Breach check error:", err);
      setError(language === "en" 
        ? "Failed to check for breaches. Please try again later."
        : "فشل في التحقق من التسريبات. يرجى المحاولة مرة أخرى لاحقاً.");
    } finally {
      setIsChecking(false);
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
    <div className={`max-w-2xl mx-auto ${language === "ar" ? "font-arabic" : ""}`}>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("breachCheck")}</h2>
            <p className="text-sm text-muted-foreground">{t("breachDesc")}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("enterEmail")}
            className="flex-1"
            dir="ltr"
            data-testid="input-email-breach"
          />
          <Button 
            onClick={handleCheck} 
            disabled={isChecking || !email.trim()}
            data-testid="button-check-breach"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("checkNow")
            )}
          </Button>
        </div>

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
                    <div className="flex items-start justify-between gap-2 mb-3">
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
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      {language === "ar" ? "تحذير هام: تم تسريب كلمة المرور!" : "Important Warning: Password Leaked!"}
                    </h4>
                    <p className="text-sm mb-3">
                      {language === "ar"
                        ? "تم تسريب كلمة المرور الخاصة بك في أكثر من تسريب. إذا كنت تستخدم نفس كلمة المرور في مواقع أخرى، يجب تغييرها فوراً في جميع المواقع."
                        : "Your password was leaked in multiple breaches. If you use the same password on other websites, you must change it immediately on all of them."}
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>
                        {language === "ar"
                          ? "• استخدم كلمات مرور مختلفة لكل موقع"
                          : "• Use different passwords for each website"}
                      </li>
                      <li>
                        {language === "ar"
                          ? "• استخدم مدير كلمات المرور لإنشاء كلمات مرور قوية"
                          : "• Use a password manager to generate strong passwords"}
                      </li>
                    </ul>
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
                  <p className="text-sm text-muted-foreground">{t("protectedBy")}</p>
                </div>
              </div>
            )}
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
