import { LanguageProvider } from "@/lib/LanguageContext";
import { ChatInterface } from "../ChatInterface";

export default function ChatInterfaceExample() {
  return (
    <LanguageProvider>
      <div className="h-[600px] border rounded-md overflow-hidden">
        <ChatInterface />
      </div>
    </LanguageProvider>
  );
}
