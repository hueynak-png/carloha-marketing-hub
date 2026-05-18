"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MarketingAssistant.module.css";

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi, I am Marketing Assistant. Ask me about vehicle materials, broken links, or marketing support requests.",
};

const quickPrompts = [
  "Which Chery Q materials are available?",
  "I need a brochure for Tiggo 9",
  "Report a broken link",
];

function draftSummary(draft) {
  return [
    ["Request Type", draft.requestType],
    ["Name", draft.name],
    ["Email", draft.email],
    ["WhatsApp", draft.whatsapp],
    ["Market / Dealer", draft.market],
    ["Vehicle", draft.vehicle],
    ["Material Type", draft.materialType],
    ["Urgency", draft.urgency],
    ["Details", draft.message],
  ].filter(([, value]) => String(value || "").trim());
}

export default function MarketingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [requestDraft, setRequestDraft] = useState(null);
  const panelRef = useRef(null);

  const canSubmitDraft = useMemo(() => {
    if (!requestDraft) return false;
    return ["requestType", "name", "email", "message"].every(field =>
      String(requestDraft[field] || "").trim()
    );
  }, [requestDraft]);

  const showQuickPrompts = messages.every(message => message.role !== "user");

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
          content: result.reply || "I could not prepare an answer yet.",
        },
      ]);
      setRequestDraft(result.requestDraft || null);
      setStatus("idle");
    } catch {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content:
            "Marketing Assistant is temporarily busy. Please try again later or submit the request form.",
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
          content: "Request submitted. The marketing team will review it soon.",
        },
      ]);
      setRequestDraft(null);
      setStatus("idle");
    } catch (error) {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: error.message || "The request could not be submitted. Please try again later.",
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
      <button className={styles.launcher} type="button" onClick={toggleAssistant} aria-label="Ask Marketing Assistant">
        <span>Ask</span>
        <strong>Marketing Assistant</strong>
      </button>

      {isOpen ? (
        <section className={styles.panel} ref={panelRef} aria-label="Marketing Assistant">
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>Carloha AI</p>
              <h2>Marketing Assistant</h2>
            </div>
            <button className={styles.closeButton} type="button" onClick={toggleAssistant} aria-label="Close assistant">
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
                {message.content}
              </div>
            ))}

            {status === "thinking" ? (
              <div className={`${styles.message} ${styles.assistantMessage}`}>Thinking...</div>
            ) : null}

            {requestDraft ? (
              <div className={styles.draftCard}>
                <strong>Confirm request</strong>
                <dl>
                  {draftSummary(requestDraft).map(([label, value]) => (
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
                  {status === "submitting" ? "Submitting..." : "Submit Request"}
                </button>
                {!canSubmitDraft ? (
                  <p>Please provide name, email, request type, and details before submitting.</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {showQuickPrompts ? (
            <div className={styles.quickPrompts}>
              {quickPrompts.map(prompt => (
                <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <form className={styles.inputBar} onSubmit={handleSubmit}>
            <input
              aria-label="Ask Marketing Assistant"
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="Ask Marketing Assistant..."
            />
            <button type="submit" disabled={status === "thinking"}>
              Send
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
