import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, ShieldCheck, Loader2, AlertTriangle, CheckCircle, Key, Smartphone, Mail } from "lucide-react";

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

  const handleCheck = async () => {
    if (!email.trim()) return;
    
    setIsChecking(true);
    setResult(null);

    // todo: remove mock functionality - replace with actual HIBP API call
    setTimeout(() => {
      const mockHasBreaches = email.includes("test") || email.includes("example");
      
      if (mockHasBreaches) {
        setResult({
          found: true,
          breaches: [
            {
              name: "Dropbox 2024",
              date: "2024-03-15",
              dataTypes: ["email", "password", "phone"],
              severity: "high",
            },
            {
              name: "LinkedIn 2023",
              date: "2023-08-20",
              dataTypes: ["email", "name"],
              severity: "medium",
            },
          ],
        });
      } else {
        setResult({ found: false });
      }
      setIsChecking(false);
    }, 2000);
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
    switch (type) {
      case "email":
        return Mail;
      case "password":
        return Key;
      case "phone":
        return Smartphone;
      default:
        return Shield;
    }
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
                            {type}
                          </Badge>
                        );
                      })}
                    </div>
                  </Card>
                ))}

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
      </Card>
    </div>
  );
}
