"use client";

import { useState } from "react";
import styles from "./RequestForm.module.css";
import useLanguage from "./useLanguage";

const copy = {
  EN: {
    requestType: "Request Type",
    requestTypes: [
      ["New material request", "New material request"],
      ["Broken link report", "Broken link report"],
      ["Product question", "Product question"],
      ["Marketing execution question", "Marketing execution question"],
      ["Other", "Other"],
    ],
    urgency: "Urgency",
    urgencies: [
      ["Normal", "Normal"],
      ["Urgent", "Urgent"],
      ["Planning ahead", "Planning ahead"],
    ],
    name: "Name",
    email: "Email",
    whatsapp: "WhatsApp",
    market: "Market / Dealer",
    vehicle: "Vehicle",
    vehiclePlaceholder: "e.g. Tiggo 9",
    materialType: "Material Type",
    materialPlaceholder: "e.g. Brochure, video, price list",
    details: "Request Details",
    detailsPlaceholder: "Tell us what you need, where it will be used, and any deadline.",
    submit: "Submit Request",
    submitting: "Submitting...",
    success: "Request submitted. The marketing team will review it soon.",
    submitError: "Unable to submit request.",
  },
  CN: {
    requestType: "需求类型",
    requestTypes: [
      ["New material request", "新资料需求"],
      ["Broken link report", "失效链接反馈"],
      ["Product question", "产品资料问题"],
      ["Marketing execution question", "市场执行问题"],
      ["Other", "其他"],
    ],
    urgency: "紧急程度",
    urgencies: [
      ["Normal", "普通"],
      ["Urgent", "紧急"],
      ["Planning ahead", "提前规划"],
    ],
    name: "姓名",
    email: "邮箱",
    whatsapp: "WhatsApp",
    market: "市场 / 经销商",
    vehicle: "车型",
    vehiclePlaceholder: "例如：Tiggo 9",
    materialType: "资料类型",
    materialPlaceholder: "例如：手册、视频、价格表",
    details: "需求详情",
    detailsPlaceholder: "请说明你需要什么资料、用途以及截止时间。",
    submit: "提交需求",
    submitting: "提交中...",
    success: "需求已提交，市场团队会尽快查看。",
    submitError: "提交失败，请稍后再试。",
  },
};

const initialState = {
  requestType: "New material request",
  name: "",
  email: "",
  whatsapp: "",
  market: "",
  vehicle: "",
  materialType: "",
  urgency: "Normal",
  message: "",
};

export default function RequestForm() {
  const language = useLanguage();
  const t = copy[language] || copy.EN;
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function submitRequest(event) {
    event.preventDefault();
    setStatus("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t.submitError);
      }

      setForm(initialState);
      setStatus("success");
      setFeedback(t.success);
    } catch (error) {
      setStatus("error");
      setFeedback(language === "CN" ? t.submitError : error.message);
    }
  }

  return (
    <form className={styles.requestForm} onSubmit={submitRequest}>
      <div className={styles.formGrid}>
        <label>
          {t.requestType}
          <select name="requestType" value={form.requestType} onChange={updateField}>
            {t.requestTypes.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label>
          {t.urgency}
          <select name="urgency" value={form.urgency} onChange={updateField}>
            {t.urgencies.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label>
          {t.name}
          <input name="name" value={form.name} onChange={updateField} required />
        </label>

        <label>
          {t.email}
          <input name="email" type="email" value={form.email} onChange={updateField} required />
        </label>

        <label>
          {t.whatsapp}
          <input name="whatsapp" value={form.whatsapp} onChange={updateField} />
        </label>

        <label>
          {t.market}
          <input name="market" value={form.market} onChange={updateField} />
        </label>

        <label>
          {t.vehicle}
          <input name="vehicle" value={form.vehicle} onChange={updateField} placeholder={t.vehiclePlaceholder} />
        </label>

        <label>
          {t.materialType}
          <input name="materialType" value={form.materialType} onChange={updateField} placeholder={t.materialPlaceholder} />
        </label>
      </div>

      <label>
        {t.details}
        <textarea
          name="message"
          value={form.message}
          onChange={updateField}
          rows={6}
          required
          placeholder={t.detailsPlaceholder}
        />
      </label>

      <div className={styles.formActions}>
        <button className={`primaryLink ${styles.submitButton}`} type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? t.submitting : t.submit}
        </button>
        {feedback ? (
          <p className={`${styles.formStatus} ${status === "error" ? styles.error : styles.success}`}>
            {feedback}
          </p>
        ) : null}
      </div>
    </form>
  );
}
