"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown, Send } from "lucide-react";

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
  const [selectedSubject, setSelectedSubject] = useState(inquiryTypes[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const currentIndex = inquiryTypes.indexOf(selectedSubject);

    if (event.key === "Escape" || event.key === "Tab") {
      setIsOpen(false);
      if (event.key === "Escape") {
        event.preventDefault();
        triggerRef.current?.focus();
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % inquiryTypes.length;
      setSelectedSubject(inquiryTypes[nextIndex]);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex =
        (currentIndex - 1 + inquiryTypes.length) % inquiryTypes.length;
      setSelectedSubject(inquiryTypes[prevIndex]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }

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
      setSelectedSubject(inquiryTypes[0]);
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
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      onReset={() => setSelectedSubject(inquiryTypes[0])}
    >
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

      <div className={styles.field}>
        <label
          className={styles.fieldLabel}
          id="subject-label"
          htmlFor="subject-trigger"
        >
          Subject
        </label>
        <div
          className={`${styles.selectContainer} ${
            isOpen ? styles.selectContainerOpen : ""
          }`}
          ref={dropdownRef}
        >
          <button
            type="button"
            id="subject-trigger"
            ref={triggerRef}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby="subject-label subject-trigger"
            aria-controls="subject-listbox"
            className={`${styles.selectTrigger} ${
              isOpen ? styles.selectTriggerOpen : ""
            }`}
            onClick={() => setIsOpen((prev) => !prev)}
            onKeyDown={handleTriggerKeyDown}
          >
            <span className={styles.selectValue}>{selectedSubject}</span>
            <ChevronDown
              size={18}
              strokeWidth={2.3}
              className={`${styles.selectIcon} ${
                isOpen ? styles.selectIconRotated : ""
              }`}
              aria-hidden="true"
            />
          </button>
          <input type="hidden" name="subject" value={selectedSubject} />

          {isOpen ? (
            <ul
              id="subject-listbox"
              role="listbox"
              aria-labelledby="subject-label"
              className={styles.selectMenu}
            >
              {inquiryTypes.map((type) => {
                const isSelected = type === selectedSubject;
                return (
                  <li
                    key={type}
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.selectOption} ${
                      isSelected ? styles.selectOptionSelected : ""
                    }`}
                    onClick={() => {
                      setSelectedSubject(type);
                      setIsOpen(false);
                      triggerRef.current?.focus();
                    }}
                  >
                    <span>{type}</span>
                    {isSelected ? (
                      <Check
                        size={16}
                        strokeWidth={2.4}
                        className={styles.checkIcon}
                        aria-hidden="true"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

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
