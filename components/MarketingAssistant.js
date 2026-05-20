"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MarketingAssistant.module.css";
import useLanguage from "./useLanguage";
import { getLocalizedCopy } from "../lib/siteCopy";

function getRandomPrompts(pool = [], count = 3) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

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

function sourceLabel(source, labels) {
  return labels[source.kind] || source.kind;
}

export default function MarketingAssistant() {
  const language = useLanguage();
  const t = getLocalizedCopy("marketingAssistant", language);
  const randomizedQuickPrompts = useMemo(
    () => getRandomPrompts(t.quickPrompts, 3),
    [t]
  );
  const welcomeMessage = useMemo(
    () => ({ role: "assistant", content: t.welcome }),
    [t]
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

  useEffect(() => {
    setMessages(current => {
      if (!current.length) return [welcomeMessage];
      if (current.length === 1 && current[0].role === "assistant") {
        return [welcomeMessage];
      }
      return current;
    });
  }, [welcomeMessage]);

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
          sources: result.sources || [],
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
          sources: [],
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
          language,
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
          sources: [],
        },
      ]);
      setRequestDraft(null);
      setStatus("idle");
    } catch (error) {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: error.message || t.submitError,
          sources: [],
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
    <div className={`${styles.assistant} ${isOpen ? styles.open : ""}`}>
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
              <div key={`${message.role}-${index}`} className={styles.messageBlock}>
                <div
                  className={`${styles.message} ${
                    message.role === "user" ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  {index === 0 && message.role === "assistant" ? t.welcome : message.content}
                </div>
                {message.role === "assistant" && message.sources?.length ? (
                  <div className={styles.sourcesCard}>
                    <strong>{t.sources}</strong>
                    <ul>
                      {message.sources.map((source, sourceIndex) => (
                        <li key={`${source.title}-${sourceIndex}`}>
                          <span>{sourceLabel(source, t.sourceLabels)}</span>
                          {source.url ? (
                            <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                          ) : (
                            <em>{source.title}</em>
                          )}
                          {source.subtitle ? <small>{source.subtitle}</small> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
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
