import { GoogleGenAI, Type } from "@google/genai";
import { HeroProfile, AIResponse, Message, Sender, ApiConfig } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// Helper to create instance based on current config
const createAI = (config: ApiConfig) => {
  if (config.useProxy) {
    // When proxy mode is enabled, we point the SDK to our local Vercel function path.
    // The SDK will append /v1beta/models/... to this base.
    // 'window.location.origin' ensures it works on whatever domain the app is deployed to.
    return new GoogleGenAI({ 
      apiKey: config.apiKey,
    }, {
      baseUrl: `${window.location.origin}/api/proxy`
    });
  }
  
  return new GoogleGenAI({ apiKey: config.apiKey });
};

/**
 * Generates a random hero profile + starting location description.
 */
export const generateHero = async (config: ApiConfig): Promise<HeroProfile> => {
  const ai = createAI(config);
  
  const prompt = `
    Сгенерируй профиль человека (героя), который попал (исекай) в мрачный, опасный, реалистичный средневековый дарк-фэнтези мир.
    
    Также выбери "theme" (биом/локацию).
    Варианты theme: 'dungeon' (темница, древние руины), 'forest' (проклятый лес), 'desert' (пепельная пустошь), 'winter' (ледяные пики), 'swamp' (ядовитые болота), 'city' (трущобы темного города).
    
    Придумай "locationDescription": Описание места, где очнулся герой. Это должно быть атмосферное описание окружения (запахи, звуки, вид), которое мы покажем игроку перед началом игры. Объем: 2-3 предложения.

    Верни JSON:
    - name: Имя
    - archetype: Профессия/Роль в прошлом мире
    - personality: Характер (влияет на действия)
    - origin: Как попал сюда
    - theme: Строка из списка выше
    - locationDescription: Текст описания локации
  `;

  try {
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
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return {
      ...data,
      startCoordinates: `${Math.floor(Math.random() * 99)}°${Math.floor(Math.random() * 60)}'N, ${Math.floor(Math.random() * 99)}°${Math.floor(Math.random() * 60)}'E` // Fluff
    } as HeroProfile;
  } catch (error) {
    console.error("Error generating hero:", error);
    // Re-throw to handle in UI (e.g. invalid key)
    throw error;
  }
};

/**
 * Generates the hero's response.
 */
export const continueStory = async (
  hero: HeroProfile,
  history: Message[],
  systemInput: string | null,
  config: ApiConfig
): Promise<AIResponse> => {
  const ai = createAI(config);

  // Create a condensed context log. 
  // IMPORTANT: To prevent loops, we explicitly tell the AI if the last messages were repetitive.
  const lastMessages = history.slice(-10); // Look at last 10 messages context
  
  const conversationLog = lastMessages.map(msg => 
    `${msg.sender === Sender.SYSTEM ? 'ГОЛОС' : 'ГЕРОЙ'}: ${msg.content}`
  ).join('\n');

  const isSilent = systemInput === null;

  const systemAction = isSilent
    ? "ГОЛОС МОЛЧИТ. Герой предоставлен сам себе. Проходит ВРЕМЯ (от 10 минут до часа). Герой должен совершить СЕРИЮ действий."
    : `ГОЛОС В ГОЛОВЕ прозвучал/появился текст: "${systemInput}". Герой реагирует на это немедленно.`;

  const prompt = `
    Ты играешь роль: ${hero.name}. Архетип: ${hero.archetype}. Характер: ${hero.personality}.
    
    МИР: Дарк фэнтези. Реалистичный, жестокий.
    ТВОЕ СОСТОЯНИЕ: Ты не знаешь, что такое "Система". Голос в голове для тебя — это мистика/шизофрения/божество.
    
    КОНТЕКСТ ДИАЛОГА:
    ${conversationLog}

    ТЕКУЩАЯ ИНСТРУКЦИЯ:
    ${systemAction}

    ЗАДАЧА:
    Напиши запись в ментальный дневник (от 1-го лица).
    
    ВАЖНЕЙШИЕ ПРАВИЛА (ЧТОБЫ ИЗБЕЖАТЬ ЦИКЛОВ):
    1. Ели ГОЛОС МОЛЧИТ: Не описывай одно и то же. Сделай шаг вперед по сюжету. Опиши, как герой идет дальше, исследует, находит что-то, ест, спит или сражается. Промотай время вперед.
    2. Описывай МНОГО действий, если голос молчит. Не стой на месте.
    3. МИР ЖИВОЙ: Встречай странных существ (монстров) или следы людей. Людей встречай редко (только в деревнях/городах), монстров чаще.
    4. Если игрок использует РУНЫ (рисует знаки), они работают, но описывай это как магию, которая отнимает силы или пугает.
    5. Не повторяй текст из предыдущих сообщений.

    Верни ответ строго в JSON:
    {
      "diaryEntry": "Текст (1-3 абзаца, насыщенных событиями)",
      "isDead": true/false,
      "statusDescription": "Статус (например: 'Идет через лес', 'Прячется', 'Сражается')"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 1.1, // Higher temperature to reduce repetition
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
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Error generating story:", error);
    return {
      diaryEntry: "...",
      isDead: false,
      statusDescription: "Неизвестно"
    };
  }
};