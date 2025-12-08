import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/LanguageContext";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/components/HomePage";
import { ServiceCategoryGrid } from "@/components/ServiceCategoryGrid";
import { ChatInterface } from "@/components/ChatInterface";
import { DigitalShield } from "@/components/DigitalShield";
import { Dashboard } from "@/components/Dashboard";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "services":
        return (
          <div className="p-4 max-w-7xl mx-auto">
            <ServiceCategoryGrid />
          </div>
        );
      case "chat":
        return (
          <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-73px)]">
            <ChatInterface />
          </div>
        );
      case "security":
        return (
          <div className="p-4 py-8">
            <DigitalShield />
          </div>
        );
      case "dashboard":
        return (
          <div className="p-4 py-8">
            <Dashboard />
          </div>
        );
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="pb-20 md:pb-0 flex-1">
        {renderPage()}
      </main>
      <Footer />
      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AppContent />
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
