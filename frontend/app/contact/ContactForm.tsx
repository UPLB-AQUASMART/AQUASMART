"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

import styles from "./page.module.css";

const inquiryTypes = [
  "Research Collaboration",
  "Partnership Inquiry",
  "Data Access Request",
  "Learning Module Inquiry",
  "General Inquiry",
];

type SubmitState = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState("sending");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to send your message.");
      }

      form.reset();
      setSubmitState("sent");
      setStatusMessage(
        "Message sent. We also emailed you a confirmation copy.",
      );
    } catch (error) {
      setSubmitState("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to send your message right now.",
      );
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <label className={styles.field}>
          <span>First Name</span>
          <input name="firstName" placeholder="Juan" type="text" />
        </label>
        <label className={styles.field}>
          <span>Last Name</span>
          <input name="lastName" placeholder="Dela Cruz" type="text" />
        </label>
      </div>

      <label className={styles.field}>
        <span>Email Address</span>
        <input
          name="email"
          placeholder="juan@example.com"
          required
          type="email"
        />
      </label>

      <label className={styles.field}>
        <span>Organization / Affiliation</span>
        <input
          name="organization"
          placeholder="University, LGU, NGO, farm, or company"
          type="text"
        />
      </label>

      <label className={styles.field}>
        <span>Subject</span>
        <select name="subject" defaultValue="Research Collaboration">
          {inquiryTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>Message</span>
        <textarea
          name="message"
          placeholder="Tell us about your inquiry, research interest, or collaboration idea."
          required
          rows={5}
        />
      </label>

      <button
        className={styles.submitButton}
        disabled={submitState === "sending"}
        type="submit"
      >
        {submitState === "sending" ? "Sending..." : "Send Message"}
        <Send size={18} strokeWidth={2.3} />
      </button>

      {statusMessage ? (
        <p
          className={
            submitState === "error" ? styles.formError : styles.formSuccess
          }
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
