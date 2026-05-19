"use client";

import { useState } from "react";
import styles from "./RequestForm.module.css";
import useLanguage from "./useLanguage";
import { getLocalizedCopy } from "../lib/siteCopy";

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
  website: "",
};

export default function RequestForm({ vehicles = [], materialTypes = [] }) {
  const language = useLanguage();
  const t = getLocalizedCopy("requestForm", language);
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
        body: JSON.stringify({ ...form, language }),
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
      setFeedback(error.message || t.submitError);
    }
  }

  return (
    <form className={styles.requestForm} onSubmit={submitRequest}>
      <p className={styles.helperText}>{t.requestHelper}</p>

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
          <input name="name" value={form.name} onChange={updateField} required maxLength={80} />
        </label>

        <label>
          {t.email}
          <input name="email" type="email" value={form.email} onChange={updateField} required maxLength={120} />
        </label>

        <label>
          {t.whatsapp}
          <input name="whatsapp" value={form.whatsapp} onChange={updateField} maxLength={40} />
        </label>

        <label>
          {t.market}
          <input name="market" value={form.market} onChange={updateField} maxLength={120} />
        </label>

        <label>
          {t.vehicle}
          <input
            name="vehicle"
            value={form.vehicle}
            onChange={updateField}
            placeholder={t.vehiclePlaceholder}
            maxLength={80}
            list="vehicle-options"
          />
          <small>{t.vehicleHint}</small>
        </label>

        <label>
          {t.materialType}
          <input
            name="materialType"
            value={form.materialType}
            onChange={updateField}
            placeholder={t.materialPlaceholder}
            maxLength={120}
            list="material-type-options"
          />
          <small>{t.materialHint}</small>
        </label>
      </div>

      <datalist id="vehicle-options">
        {vehicles.map(vehicle => <option key={vehicle} value={vehicle} />)}
      </datalist>
      <datalist id="material-type-options">
        {materialTypes.map(type => <option key={type} value={type} />)}
      </datalist>

      <div className={styles.honeypot} aria-hidden="true">
        <label>
          {t.spamTrap}
          <input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={updateField} />
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
          maxLength={1200}
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
