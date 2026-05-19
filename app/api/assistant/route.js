import { NextResponse } from "next/server.js";
import { CONTACT, ASSISTANT_MODEL } from "../../../lib/config.js";
import { buildAssistantIndex, getWikiEntries, retrieveAssistantContext } from "../../../lib/assistantIndex.js";
import { recordAnalyticsEvent } from "../../../lib/analyticsStore.js";
import { getGeneralMaterials, getVehicleMaterials } from "../../../lib/data.js";
import { logError } from "../../../lib/logger.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MAX_MESSAGES = 12;
const FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash-preview"];

function isChinese(text = "") {
  return /[\u3400-\u9fff]/.test(text);
}

function cleanMessages(messages = []) {
  return messages
    .filter(message => ["user", "assistant"].includes(message.role) && String(message.content || "").trim())
    .slice(-MAX_MESSAGES)
    .map(message => ({
      role: message.role,
      content: String(message.content).slice(0, 1200),
    }));
}

function fallbackReply(language) {
  if (language === "zh") {
    return "Carloha AI 还没有配置 AI API key。请先在 Vercel 环境变量里添加 GEMINI_API_KEY，然后重新部署。";
  }

  return "Carloha AI is not configured yet. Please add GEMINI_API_KEY in Vercel environment variables and redeploy.";
}

function extractJson(text = "") {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function readGeminiError(response) {
  try {
    const data = await response.json();
    return data.error?.message || response.statusText || "Unknown Gemini API error.";
  } catch {
    return response.statusText || "Unknown Gemini API error.";
  }
}

function uniqueModels() {
  return [ASSISTANT_MODEL, ...FALLBACK_MODELS].filter((model, index, models) => model && models.indexOf(model) === index);
}

function geminiErrorReply(status, detail, language, attemptedModels = []) {
  const modelText = attemptedModels.length ? attemptedModels.join(", ") : ASSISTANT_MODEL;
  const detailText = detail ? ` Detail: ${detail.slice(0, 220)}` : "";

  if (status === 400) {
    return language === "zh"
      ? `Carloha AI 配置需要调整：Gemini API 返回 400。已尝试模型：${modelText}。错误详情：${detail || "未返回具体原因"}`
      : `Carloha AI needs a configuration check: Gemini API returned 400. Tried models: ${modelText}.${detailText}`;
  }

  if (status === 401 || status === 403) {
    return language === "zh"
      ? "Carloha AI 的 Gemini API key 不能使用。请检查 Vercel 里的 GEMINI_API_KEY 是否正确，以及 Google AI Studio 里这个 key 有没有 API 限制。"
      : "Carloha AI cannot use the Gemini API key. Please check GEMINI_API_KEY in Vercel and make sure the key is not blocked by API restrictions in Google AI Studio.";
  }

  if (status === 429) {
    return language === "zh"
      ? "Carloha AI 今天的免费额度可能用完了。你可以稍后再试，或直接使用 Request 页面提交需求。"
      : "Carloha AI may have reached today's free quota. Please try again later or submit the Request form.";
  }

  if (status >= 500) {
    return language === "zh"
      ? "Gemini 服务暂时不可用。请稍后再试，或直接使用 Request 页面提交需求。"
      : "Gemini is temporarily unavailable. Please try again later or use the Request form.";
  }

  return language === "zh"
    ? `Carloha AI 暂时无法连接 Gemini。错误：${detail}`
    : `Carloha AI cannot connect to Gemini right now. Error: ${detail}`;
}

async function generateWithGemini(model, systemPrompt, conversationText) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${conversationText}\n\nReturn JSON only with this shape: {"reply":"...","requestDraft":null or {"requestType":"...","name":"...","email":"...","whatsapp":"...","market":"...","vehicle":"...","materialType":"...","urgency":"...","message":"..."}}. Do not include markdown code fences.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.35,
          maxOutputTokens: 900,
        },
      }),
    }
  );

  if (response.ok) {
    return { response, model, detail: "" };
  }

  const detail = await readGeminiError(response);
  return { response, model, detail };
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid assistant request." }, { status: 400 });
  }

  const messages = cleanMessages(payload.messages);
  const lastUserMessage = [...messages].reverse().find(message => message.role === "user")?.content || "";
  const language = isChinese(lastUserMessage) ? "zh" : "en";

  if (!messages.length) {
    return NextResponse.json({ error: "Please send a message." }, { status: 400 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ reply: fallbackReply(language), requestDraft: null, sources: [] });
  }

  const [vehicleMaterials, generalMaterials, wikiEntries] = await Promise.all([
    getVehicleMaterials(),
    getGeneralMaterials(),
    getWikiEntries(),
  ]);
  const assistantIndex = buildAssistantIndex(vehicleMaterials, generalMaterials, wikiEntries);
  const retrieval = retrieveAssistantContext(assistantIndex, lastUserMessage);

  recordAnalyticsEvent({
    type: "assistant_question",
    query: lastUserMessage,
    topic: retrieval.sources[0]?.title || lastUserMessage.slice(0, 80),
    language,
  });

  const systemPrompt = `
You are Carloha AI for Carloha Marketing Hub.
Answer only questions related to Carloha Marketing Hub, vehicle marketing materials, dealer support, FAQ, broken links, and request submission.
If the user asks in Chinese, reply in Chinese. If the user asks in English, reply in English.
Be concise, friendly, and practical.
When a user wants to submit a request, collect useful fields and create requestDraft. Never say it has been submitted until the user confirms.
If information is missing for a request, ask for the missing details.
Use only the indexed site context below for material links and status. If a link is "Coming Soon", say the material is not ready yet and offer to create a request.

Contact:
- Name: ${CONTACT.name}
- Email: ${CONTACT.email}
- WhatsApp: ${CONTACT.whatsapp}

Request draft fields:
requestType, name, email, whatsapp, market, vehicle, materialType, urgency, message.

Indexed Carloha knowledge context:
${retrieval.context || "No strongly relevant indexed context found."}
`;

  const conversationText = messages
    .map(message => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
    .join("\n");

  try {
    let geminiResult;
    const attemptedModels = [];
    for (const model of uniqueModels()) {
      attemptedModels.push(model);
      geminiResult = await generateWithGemini(model, systemPrompt, conversationText);
      if (geminiResult.response.ok) break;
      if (geminiResult.response.status !== 400) break;
    }

    const { response, model, detail } = geminiResult;

    if (!response.ok) {
      logError("Gemini assistant request failed", {
        status: response.status,
        model,
        detail,
      });
      recordAnalyticsEvent({
        type: "assistant_poor_answer",
        query: lastUserMessage,
        reason: `gemini_${response.status}`,
        language,
      });

      return NextResponse.json(
        {
          reply: geminiErrorReply(response.status, detail, language, attemptedModels),
          sources: retrieval.sources,
          requestDraft: null,
        },
        { status: 200 }
      );
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
    const parsed = extractJson(text);

    if (!parsed?.reply) {
      recordAnalyticsEvent({
        type: "assistant_poor_answer",
        query: lastUserMessage,
        reason: "missing_reply",
        language,
      });
      return NextResponse.json({
        reply:
          language === "zh"
            ? "我暂时没能整理出可靠回答。你可以换一种方式再问我。"
            : "I could not prepare a reliable answer yet. Please try asking another way.",
        sources: retrieval.sources,
        requestDraft: null,
      });
    }

    if (!retrieval.sources.length) {
      recordAnalyticsEvent({
        type: "assistant_poor_answer",
        query: lastUserMessage,
        reason: "no_sources",
        language,
      });
    }

    return NextResponse.json({
      reply: parsed.reply,
      sources: retrieval.sources,
      requestDraft: parsed.requestDraft || null,
    });
  } catch (error) {
    logError("Assistant route failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    recordAnalyticsEvent({
      type: "assistant_poor_answer",
      query: lastUserMessage,
      reason: "exception",
      language,
    });
    return NextResponse.json({
      reply:
        language === "zh"
          ? "Carloha AI 暂时无法连接。请稍后再试，或直接使用 Request 表单。"
          : "Carloha AI cannot connect right now. Please try again later or use the Request form.",
      sources: retrieval.sources,
      requestDraft: null,
    });
  }
}
