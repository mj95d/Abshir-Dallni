import { useLanguage } from "@/lib/LanguageContext";
import vision2030Logo from "@assets/15131878-503e-4ab1-8c7f-b17f95942501_transparent_1765030657873.png";
import dalleniLogo from "@assets/ebb1130c-e595-4902-8c67-f972261613a0_transparent_1765030513603.png";

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="hidden md:block bg-muted/30 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={dalleniLogo} 
              alt="Dalleni Logo" 
              className="h-12 w-auto"
            />
            <div className={`${language === "ar" ? "font-arabic text-right" : ""}`}>
              <p className="font-semibold">
                {language === "ar" ? "دلني" : "Dalleni"}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "ar" 
                  ? "مساعدك الذكي للخدمات الحكومية"
                  : "Your Smart Government Services Assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <img 
              src={vision2030Logo} 
              alt="Saudi Vision 2030" 
              className="h-16 w-auto"
              data-testid="img-vision-2030"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border/50 text-center">
          <p className={`text-sm text-muted-foreground ${language === "ar" ? "font-arabic" : ""}`}>
            {language === "ar" 
              ? `© ${new Date().getFullYear()} دلني. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Dalleni. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
