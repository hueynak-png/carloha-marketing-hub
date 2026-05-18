"use client";

import { useState } from "react";
import styles from "./RequestForm.module.css";

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
        throw new Error(result.error || "Unable to submit request.");
      }

      setForm(initialState);
      setStatus("success");
      setFeedback("Request submitted. The marketing team will review it soon.");
    } catch (error) {
      setStatus("error");
      setFeedback(error.message);
    }
  }

  return (
    <form className={styles.requestForm} onSubmit={submitRequest}>
      <div className={styles.formGrid}>
        <label>
          Request Type
          <select name="requestType" value={form.requestType} onChange={updateField}>
            <option>New material request</option>
            <option>Broken link report</option>
            <option>Product question</option>
            <option>Marketing execution question</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Urgency
          <select name="urgency" value={form.urgency} onChange={updateField}>
            <option>Normal</option>
            <option>Urgent</option>
            <option>Planning ahead</option>
          </select>
        </label>

        <label>
          Name
          <input name="name" value={form.name} onChange={updateField} required />
        </label>

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} required />
        </label>

        <label>
          WhatsApp
          <input name="whatsapp" value={form.whatsapp} onChange={updateField} />
        </label>

        <label>
          Market / Dealer
          <input name="market" value={form.market} onChange={updateField} />
        </label>

        <label>
          Vehicle
          <input name="vehicle" value={form.vehicle} onChange={updateField} placeholder="e.g. Tiggo 9" />
        </label>

        <label>
          Material Type
          <input name="materialType" value={form.materialType} onChange={updateField} placeholder="e.g. Brochure, video, price list" />
        </label>
      </div>

      <label>
        Request Details
        <textarea
          name="message"
          value={form.message}
          onChange={updateField}
          rows={6}
          required
          placeholder="Tell us what you need, where it will be used, and any deadline."
        />
      </label>

      <div className={styles.formActions}>
        <button className={`primaryLink ${styles.submitButton}`} type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting..." : "Submit Request"}
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
