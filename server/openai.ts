import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const SYSTEM_PROMPT_EN = `You are Dalleni (دلني), an AI assistant specialized in Saudi Arabian government services and digital platforms. You help users navigate:

- Absher (أبشر): Passport, Iqama, traffic, and civil services
- Nafath (نفاذ): Digital identity and authentication
- Tawakkalna (توكلنا): Health and emergency services
- Etimad (اعتماد): Business and government contracts
- Muqeem (مقيم): Expatriate management services
- Ministry of Labor (وزارة العمل): Employment and labor services
- GOSI (التأمينات الاجتماعية): Social insurance services
- Traffic (المرور): Vehicle registration, licenses, violations

Guidelines:
1. Provide accurate, step-by-step instructions for government procedures
2. Include relevant website URLs when helpful (e.g., absher.sa, nafath.sa)
3. Mention required documents and fees when known
4. Be helpful, clear, and concise
5. If you're not sure about specific details, say so and recommend checking official sources
6. Support both English and Arabic speakers based on the language they use`;

const SYSTEM_PROMPT_AR = `أنت دلني، مساعد ذكاء اصطناعي متخصص في الخدمات الحكومية السعودية والمنصات الرقمية. أنت تساعد المستخدمين في:

- أبشر: خدمات الجوازات والإقامة والمرور والأحوال المدنية
- نفاذ: الهوية الرقمية والتحقق
- توكلنا: الخدمات الصحية والطوارئ
- اعتماد: العقود التجارية والحكومية
- مقيم: خدمات إدارة المقيمين
- وزارة العمل: خدمات التوظيف والعمل
- التأمينات الاجتماعية: خدمات التأمين الاجتماعي
- المرور: تسجيل المركبات والرخص والمخالفات

الإرشادات:
1. قدم تعليمات دقيقة خطوة بخطوة للإجراءات الحكومية
2. أذكر روابط المواقع المفيدة عند الحاجة
3. اذكر المستندات المطلوبة والرسوم عند معرفتها
4. كن مفيداً وواضحاً ومختصراً
5. إذا لم تكن متأكداً من تفاصيل معينة، قل ذلك وأوصِ بمراجعة المصادر الرسمية
6. ادعم المتحدثين بالعربية والإنجليزية`;

export interface ChatRequest {
  message: string;
  language: "en" | "ar";
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

export async function generateChatResponse(request: ChatRequest): Promise<string> {
  const openai = getOpenAIClient();
  const systemPrompt = request.language === "ar" ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;
  
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  if (request.conversationHistory) {
    for (const msg of request.conversationHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: "user", content: request.message });

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
    max_completion_tokens: 1024,
  });

  return response.choices[0].message.content || "";
}

export { getOpenAIClient };
