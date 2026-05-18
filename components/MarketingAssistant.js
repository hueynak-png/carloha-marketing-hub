"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MarketingAssistant.module.css";
import useLanguage from "./useLanguage";

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi, I am Marketing Assistant. Ask me about vehicle materials, broken links, or marketing support requests.",
};

const quickPromptPool = {
  EN: [
    "Which Tiggo 9 materials are available?",
    "I need a brochure for Tiggo 9",
    "Where can I find Himla materials?",
    "Where can I find iCAUR V23 videos?",
    "Which materials are available for Tiggo 4?",
    "Where can I find official vehicle photos?",
    "How do I report a broken link?",
    "How can I request new materials?",
    "The Google Drive link does not open",
    "Where can I find dealer guidelines?"
  ],
  CN: [
    "Tiggo 9 有哪些资料？",
    "我需要 Tiggo 9 的手册",
    "在哪里找 Himla 的资料？",
    "iCAUR V23 的视频在哪里？",
    "Tiggo 4 有哪些资料？",
    "在哪里找官方车型图片？",
    "如何反馈失效链接？",
    "如何申请新资料？",
    "Google Drive 链接打不开怎么办？",
    "经销商指引在哪里？"
  ]
};

function getRandomPrompts(pool = [], count = 3) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

const copy = {
  EN: {
    launcherSmall: "Ask",
    launcherTitle: "Marketing Assistant",
    kicker: "Carloha AI",
    title: "Marketing Assistant",
    close: "Close assistant",
    welcome:
      "Hi, I am Marketing Assistant. Ask me about vehicle materials, broken links, or marketing support requests.",
    quickPrompts: quickPromptPool.EN,
    thinking: "Thinking...",
    confirm: "Confirm request",
    submit: "Submit Request",
    submitting: "Submitting...",
    missingFields: "Please provide name, email, request type, and details before submitting.",
    placeholder: "Ask Marketing Assistant...",
    send: "Send",
    fallback: "I could not prepare an answer yet.",
    busy: "Marketing Assistant is temporarily busy. Please try again later or submit the request form.",
    submitted: "Request submitted. The marketing team will review it soon.",
    submitError: "The request could not be submitted. Please try again later.",
    labels: {
      requestType: "Request Type",
      name: "Name",
      email: "Email",
      whatsapp: "WhatsApp",
      market: "Market / Dealer",
      vehicle: "Vehicle",
      materialType: "Material Type",
      urgency: "Urgency",
      message: "Details",
    },
  },
  CN: {
    launcherSmall: "咨询",
    launcherTitle: "市场助手",
    kicker: "Carloha AI",
    title: "市场助手",
    close: "关闭助手",
    welcome: "你好，我是市场助手。你可以询问车型资料、失效链接或市场支持需求。",
    quickPrompts: quickPromptPool.CN,
    thinking: "正在思考...",
    confirm: "确认需求",
    submit: "提交需求",
    submitting: "提交中...",
    missingFields: "提交前请补充姓名、邮箱、需求类型和需求详情。",
    placeholder: "询问市场助手...",
    send: "发送",
    fallback: "我暂时还没有整理出答案。",
    busy: "市场助手暂时忙碌，请稍后再试，或直接提交需求表。",
    submitted: "需求已提交，市场团队会尽快查看。",
    submitError: "需求提交失败，请稍后再试。",
    labels: {
      requestType: "需求类型",
      name: "姓名",
      email: "邮箱",
      whatsapp: "WhatsApp",
      market: "市场 / 经销商",
      vehicle: "车型",
      materialType: "资料类型",
      urgency: "紧急程度",
      message: "详情",
    },
  },
};

function draftSummary(draft, labels) {
  return [
    [labels.requestType, draft.requestType],
    [labels.name, draft.name],
    [labels.email, draft.email],
    [labels.whatsapp, draft.whatsapp],
    [labels.market, draft.market],
    [labels.vehicle, draft.vehicle],
    [labels.materialType, draft.materialType],
    [labels.urgency, draft.urgency],
    [labels.message, draft.message],
  ].filter(([, value]) => String(value || "").trim());
}

export default function MarketingAssistant() {
  const language = useLanguage();
 const randomizedQuickPrompts = useMemo(
  () => getRandomPrompts(t.quickPrompts, 3),
  [language]
);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [requestDraft, setRequestDraft] = useState(null);
  const panelRef = useRef(null);

  const showQuickPrompts = messages.every(message => message.role !== "user");

  const canSubmitDraft = useMemo(() => {
    if (!requestDraft) return false;
    return ["requestType", "name", "email", "message"].every(field =>
      String(requestDraft[field] || "").trim()
    );
  }, [requestDraft]);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isOpen]);

  function toggleAssistant() {
    setIsOpen(current => !current);
  }

  async function sendMessage(nextInput = input) {
    const content = String(nextInput || "").trim();
    if (!content || status === "thinking") return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setStatus("thinking");
    setRequestDraft(null);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Assistant request failed.");
      }

      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: result.reply || t.fallback,
        },
      ]);
      setRequestDraft(result.requestDraft || null);
      setStatus("idle");
    } catch {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: t.busy,
        },
      ]);
      setStatus("idle");
    }
  }

  async function submitDraft() {
    if (!requestDraft || status === "submitting") return;
    setStatus("submitting");

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: requestDraft.requestType || "New material request",
          name: requestDraft.name || "",
          email: requestDraft.email || "",
          whatsapp: requestDraft.whatsapp || "",
          market: requestDraft.market || "",
          vehicle: requestDraft.vehicle || "",
          materialType: requestDraft.materialType || "",
          urgency: requestDraft.urgency || "Normal",
          message: requestDraft.message || "",
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit request.");
      }

      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: t.submitted,
        },
      ]);
      setRequestDraft(null);
      setStatus("idle");
    } catch (error) {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: language === "CN" ? t.submitError : error.message || t.submitError,
        },
      ]);
      setStatus("idle");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className={styles.assistant}>
      <button className={styles.launcher} type="button" onClick={toggleAssistant} aria-label={t.launcherTitle}>
        <span>{t.launcherSmall}</span>
        <strong>{t.launcherTitle}</strong>
      </button>

      {isOpen ? (
        <section className={styles.panel} ref={panelRef} aria-label={t.launcherTitle}>
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>{t.kicker}</p>
              <h2>{t.title}</h2>
            </div>
            <button className={styles.closeButton} type="button" onClick={toggleAssistant} aria-label={t.close}>
              x
            </button>
          </header>

          <div className={styles.messages}>
            {messages.map((message, index) => (
              <div
                className={`${styles.message} ${
                  message.role === "user" ? styles.userMessage : styles.assistantMessage
                }`}
                key={`${message.role}-${index}`}
              >
                {index === 0 && message.role === "assistant" ? t.welcome : message.content}
              </div>
            ))}

            {status === "thinking" ? (
              <div className={`${styles.message} ${styles.assistantMessage}`}>{t.thinking}</div>
            ) : null}

            {requestDraft ? (
              <div className={styles.draftCard}>
                <strong>{t.confirm}</strong>
                <dl>
                  {draftSummary(requestDraft, t.labels).map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  className={styles.confirmButton}
                  type="button"
                  onClick={submitDraft}
                  disabled={!canSubmitDraft || status === "submitting"}
                >
                  {status === "submitting" ? t.submitting : t.submit}
                </button>
                {!canSubmitDraft ? (
                  <p>{t.missingFields}</p>
                ) : null}
              </div>
            ) : null}
          </div>

{showQuickPrompts ? (
  <div className={styles.quickPrompts}>
    {randomizedQuickPrompts.map(prompt => (
      <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
        {prompt}
      </button>
    ))}
  </div>
) : null}

          <form className={styles.inputBar} onSubmit={handleSubmit}>
            <input
              aria-label={t.launcherTitle}
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder={t.placeholder}
            />
            <button type="submit" disabled={status === "thinking"}>
              {t.send}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
