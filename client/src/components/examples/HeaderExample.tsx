import { useState } from "react";
import { LanguageProvider } from "@/lib/LanguageContext";
import { Header } from "../Header";

export default function HeaderExample() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <LanguageProvider>
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
    </LanguageProvider>
  );
}
