import { NextResponse } from "next/server";
import { CONTACT, ASSISTANT_MODEL } from "../../../lib/config";
import { getGeneralMaterials, getVehicleMaterials } from "../../../lib/data";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MAX_MESSAGES = 12;

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

function formatVehicleContext(materials) {
  return materials
    .map(item => {
      const title = item.Title || `${item.Vehicle} ${item["Material Type"]}`;
      const link = item["Google Drive Link"] || "Coming Soon";
      const status = item.Status || "Ready";
      return `- ${item.Vehicle} | ${item["Material Type"]} | ${title} | ${status} | ${link}`;
    })
    .join("\n");
}

function formatGeneralContext(materials) {
  return materials
    .map(item => {
      const link = item["Google Drive Link"] || "Coming Soon";
      return `- ${item.Category} | ${item.Title} | ${item.Status || "Ready"} | ${link}`;
    })
    .join("\n");
}

function fallbackReply(language) {
  if (language === "zh") {
    return "Marketing Assistant 还没有配置 AI API key。请先在 Vercel 环境变量里添加 GEMINI_API_KEY，然后重新部署。";
  }

  return "Marketing Assistant is not configured yet. Please add GEMINI_API_KEY in Vercel environment variables and redeploy.";
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
    return NextResponse.json({ reply: fallbackReply(language), requestDraft: null });
  }

  const [vehicleMaterials, generalMaterials] = await Promise.all([
    getVehicleMaterials(),
    getGeneralMaterials(),
  ]);

  const systemPrompt = `
You are Marketing Assistant for Carloha Marketing Hub.
Answer only questions related to Carloha Marketing Hub, vehicle marketing materials, dealer support, FAQ, broken links, and request submission.
If the user asks in Chinese, reply in Chinese. If the user asks in English, reply in English.
Be concise, friendly, and practical.
When a user wants to submit a request, collect useful fields and create requestDraft. Never say it has been submitted until the user confirms.
If information is missing for a request, ask for the missing details.
Use only the site context below for material links and status. If a link is "Coming Soon", say the material is not ready yet and offer to create a request.

Contact:
- Name: ${CONTACT.name}
- Email: ${CONTACT.email}
- WhatsApp: ${CONTACT.whatsapp}

Request draft fields:
requestType, name, email, whatsapp, market, vehicle, materialType, urgency, message.

Vehicle materials:
${formatVehicleContext(vehicleMaterials)}

General materials:
${formatGeneralContext(generalMaterials)}
`;

  const conversationText = messages
    .map(message => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
    .join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${ASSISTANT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
                  text: `${conversationText}\n\nReturn JSON only with this shape: {"reply":"...","requestDraft":null or {"requestType":"...","name":"...","email":"...","whatsapp":"...","market":"...","vehicle":"...","materialType":"...","urgency":"...","message":"..."}}`,
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

    if (!response.ok) {
      return NextResponse.json(
        {
          reply:
            language === "zh"
              ? "Marketing Assistant 暂时有点忙。你也可以直接使用 Request 页面提交需求。"
              : "Marketing Assistant is temporarily busy. You can also submit your request from the Request page.",
          requestDraft: null,
        },
        { status: 200 }
      );
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
    const parsed = extractJson(text);

    if (!parsed?.reply) {
      return NextResponse.json({
        reply:
          language === "zh"
            ? "我暂时没能整理出可靠回答。你可以换一种方式再问我。"
            : "I could not prepare a reliable answer yet. Please try asking another way.",
        requestDraft: null,
      });
    }

    return NextResponse.json({
      reply: parsed.reply,
      requestDraft: parsed.requestDraft || null,
    });
  } catch {
    return NextResponse.json({
      reply:
        language === "zh"
          ? "Marketing Assistant 暂时无法连接。请稍后再试，或直接提交 Request 表单。"
          : "Marketing Assistant cannot connect right now. Please try again later or use the Request form.",
      requestDraft: null,
    });
  }
}
