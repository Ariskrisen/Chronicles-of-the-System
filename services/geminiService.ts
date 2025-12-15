import { GoogleGenAI, Type } from "@google/genai";
import { HeroProfile, AIResponse, Message, Sender, ApiConfig } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Call the server-side proxy endpoint which in turn calls the @google/genai SDK on the server.
 * The server will prefer GENAI_API_KEY env var if set; client apiKey is optional (dev).
 */
async function callProxyGenerateContent(config: ApiConfig, options: { model: string; contents: string | any[]; config?: any; schema?: any; }) {
  const payload: any = {
    model: options.model,
    contents: options.contents,
    config: options.config || {},
    schema: options.schema || undefined,
  };

  // Include client apiKey only for dev/test if needed. Server will prefer env key when present.
  if (config.apiKey) payload.apiKey = config.apiKey;

  const resp = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Proxy error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  return { text: data.text || null };
}

// Helper to create SDK instance when NOT using proxy (direct/browser mode)
const createAI = (config: ApiConfig) => {
  if (config.useProxy) return null;
  return new GoogleGenAI({ apiKey: config.apiKey });
};

/**
 * Generates a random hero profile + starting location description.
 */
export const generateHero = async (config: ApiConfig): Promise<HeroProfile> => {
  const ai = createAI(config);

  const prompt = `
    Сгенерируй профиль человека (героя), который попал в мрачный, опасный, реалистичный средневековый мир.
    Верни JSON:
    - name: Имя
    - archetype: Профессия/Роль в прошлом мире
    - personality: Характер
    - origin: Как попал сюда
    - theme: 'dungeon' | 'forest' | 'desert' | 'winter' | 'swamp' | 'city'
    - locationDescription: Описание места, где очнулся герой
  `;

  try {
    if (config.useProxy) {
      const response = await callProxyGenerateContent(config, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              archetype: { type: Type.STRING },
              personality: { type: Type.STRING },
              origin: { type: Type.STRING },
              theme: { type: Type.STRING, enum: ['dungeon', 'forest', 'desert', 'winter', 'swamp', 'city'] },
              locationDescription: { type: Type.STRING },
            },
            required: ["name", "archetype", "personality", "origin", "theme", "locationDescription"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI (proxy)");
      const data = JSON.parse(text);
      return {
        ...data,
        startCoordinates: `${Math.floor(Math.random() * 99)}°${Math.floor(Math.random() * 60)}'N, ${Math.floor(Math.random() * 99)}°${Math.floor(Math.random() * 60)}'E`,
      } as HeroProfile;
    } else {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              archetype: { type: Type.STRING },
              personality: { type: Type.STRING },
              origin: { type: Type.STRING },
              theme: { type: Type.STRING, enum: ['dungeon', 'forest', 'desert', 'winter', 'swamp', 'city'] },
              locationDescription: { type: Type.STRING },
            },
            required: ["name", "archetype", "personality", "origin", "theme", "locationDescription"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI (direct)");
      const data = JSON.parse(text);
      return {
        ...data,
        startCoordinates: `${Math.floor(Math.random() * 99)}°${Math.floor(Math.random() * 60)}'N, ${Math.floor(Math.random() * 99)}°${Math.floor(Math.random() * 60)}'E`,
      } as HeroProfile;
    }
  } catch (error) {
    console.error("Error generating hero:", error);
    throw error;
  }
};

/**
 * Generates the hero's response based on history and system input.
 */
export const continueStory = async (
  hero: HeroProfile,
  history: Message[],
  systemInput: string | null,
  config: ApiConfig
): Promise<AIResponse> => {
  const ai = createAI(config);

  const lastMessages = history.slice(-10);
  const conversationLog = lastMessages.map(msg => `${msg.sender === Sender.SYSTEM ? 'ГОЛОС' : 'ГЕРОЙ'}: ${msg.content}`).join("\n");

  const isSilent = systemInput === null;
  const systemAction = isSilent
    ? "ГОЛОС МОЛЧИТ. Герой предоставлен сам себе."
    : `ГОЛОС: "${systemInput}"`;

  const prompt = `
    Ты играешь роль: ${hero.name}. Архетип: ${hero.archetype}. Характер: ${hero.personality}.
    КОНТЕКСТ ДИАЛОГА:
    ${conversationLog}
    ТЕКУЩАЯ ИНСТРУКЦИЯ:
    ${systemAction}

    Верни ответ строго в JSON:
    {
      "diaryEntry": "Текст (1-3 абзаца)",
      "isDead": true/false,
      "statusDescription": "Статус"
    }
  `;

  try {
    if (config.useProxy) {
      const response = await callProxyGenerateContent(config, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          temperature: 1.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diaryEntry: { type: Type.STRING },
              isDead: { type: Type.BOOLEAN },
              statusDescription: { type: Type.STRING },
            },
            required: ["diaryEntry", "isDead", "statusDescription"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI (proxy)");
      return JSON.parse(text) as AIResponse;
    } else {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          temperature: 1.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diaryEntry: { type: Type.STRING },
              isDead: { type: Type.BOOLEAN },
              statusDescription: { type: Type.STRING },
            },
            required: ["diaryEntry", "isDead", "statusDescription"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI (direct)");
      return JSON.parse(text) as AIResponse;
    }
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};