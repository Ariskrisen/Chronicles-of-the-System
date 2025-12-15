import { GoogleGenAI } from "@google/genai";

/**
 * Server-side proxy handler (Node serverless).
 * - Do NOT set runtime: 'edge' for this file (remove export const config if present).
 * - In production prefer setting GENAI_API_KEY in environment variables.
 *
 * Expects POST JSON:
 * {
 *   apiKey?: string,         // optional if GENAI_API_KEY env is set
 *   model?: string,          // optional, defaults to gemini-2.5-flash
 *   contents: string | any[],// required
 *   config?: object,         // optional SDK config (temperature, responseMimeType, responseSchema, ...)
 *   schema?: any             // optional shorthand for responseSchema
 * }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = await (async () => {
      try {
        return await req.json();
      } catch {
        return {};
      }
    })();

    const { apiKey: clientKey, model, contents, config: clientConfig, schema } = body || {};

    if (!contents) {
      return res.status(400).json({ error: "Missing 'contents' in request body" });
    }

    const serverKey = process.env.GENAI_API_KEY;
    const apiKey = serverKey || (clientKey ? String(clientKey) : undefined);

    if (!apiKey) {
      return res.status(400).json({ error: "API key required: set GENAI_API_KEY on server or include apiKey in request body" });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build SDK config merging provided config and schema (if exists)
    const sdkConfig = {
      ...(clientConfig || {}),
      responseSchema: clientConfig?.responseSchema || schema || clientConfig?.responseSchema,
    };

    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents,
      config: sdkConfig,
    });

    // Return a minimal normalized result to the client (text). Keep this stable for client parsing.
    return res.status(200).json({ text: response?.text ?? null });
  } catch (err) {
    console.error("Gemini Proxy Error:", err);
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}