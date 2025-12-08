import { useLanguage } from "@/lib/LanguageContext";
import { Home, Grid3X3, Shield, LayoutDashboard, MessageSquare, Ticket } from "lucide-react";

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const { t, language } = useLanguage();

  const navItems = [
    { id: "home", icon: Home, label: t("home") },
    { id: "services", icon: Grid3X3, label: t("services") },
    { id: "support", icon: Ticket, label: t("support") },
    { id: "chat", icon: MessageSquare, label: t("chat") },
    { id: "security", icon: Shield, label: t("security") },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50 ${language === "ar" ? "font-arabic" : ""}`}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md min-w-[60px] transition-colors ${
              currentPage === item.id
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            data-testid={`mobile-nav-${item.id}`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
