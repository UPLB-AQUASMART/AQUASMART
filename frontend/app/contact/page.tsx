import type { Metadata } from "next";
import Image from "next/image";
import { Globe2, Mail, MapPin, Send } from "lucide-react";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact | AQUASMART Mini",
  description:
    "Contact AQUASMART Mini for research collaboration, partnerships, data access, and groundwater education inquiries.",
};

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "aquasmart.philippines@gmail.com",
    href: "mailto:aquasmart.philippines@gmail.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Luzon, Philippines",
    caption: "Field operations across Central Luzon",
  },
  {
    icon: Globe2,
    label: "Partners",
    value: "UNESCO, FAO, Nestle, SWP, EuroGeosciences",
  },
];

const inquiryTypes = [
  "Research Collaboration",
  "Partnership Inquiry",
  "Data Access Request",
  "Learning Module Inquiry",
  "General Inquiry",
];

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <SiteNav activeLabel="Contact" />

      <section className={styles.contactSection} aria-labelledby="contact-title">
        <div className={styles.backdropRingOne} aria-hidden="true" />
        <div className={styles.backdropRingTwo} aria-hidden="true" />

        <div className={styles.shell}>
          <aside className={styles.infoPanel}>
            <div className={styles.waterVisual} aria-hidden="true">
              <Image
                src="/assets/nsp-ezgif.com-gif-maker.gif"
                alt=""
                fill
                sizes="(max-width: 960px) 100vw, 520px"
                unoptimized
              />
            </div>
            <span className={styles.badge}>Get In Touch</span>
            <h1 id="contact-title">
              Let&apos;s Build Water
              <span>Intelligence Together</span>
            </h1>
            <p className={styles.description}>
              Whether you&apos;re a researcher, farmer, policymaker, educator,
              or potential partner, we&apos;d love to hear from you. AQUASMART
              Mini is open to collaborations that advance sustainable
              groundwater and agricultural water management.
            </p>

            <div className={styles.detailList} aria-label="Contact details">
              {contactDetails.map((detail) => {
                const Icon = detail.icon;
                const content = (
                  <>
                    <span className={styles.detailLabel}>{detail.label}</span>
                    <span className={styles.detailValue}>{detail.value}</span>
                    {detail.caption ? (
                      <span className={styles.detailCaption}>{detail.caption}</span>
                    ) : null}
                  </>
                );

                return (
                  <div className={styles.detailItem} key={detail.label}>
                    <span className={styles.iconBox} aria-hidden="true">
                      <Icon size={20} strokeWidth={2.2} />
                    </span>
                    {detail.href ? (
                      <a className={styles.detailContent} href={detail.href}>
                        {content}
                      </a>
                    ) : (
                      <div className={styles.detailContent}>{content}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <section className={styles.formPanel} aria-labelledby="message-title">
            <span className={styles.formKicker}>Contact Form</span>
            <h2 id="message-title">Send Us a Message</h2>
            <p>
              Share your inquiry, research interest, or collaboration idea. The
              AQUASMART team will review your message and respond as soon as
              possible.
            </p>

            <form
              className={styles.form}
              action="mailto:aquasmart.philippines@gmail.com"
              method="post"
              encType="text/plain"
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

              <button className={styles.submitButton} type="submit">
                Send Message
                <Send size={18} strokeWidth={2.3} />
              </button>
            </form>
          </section>
        </div>
      </section>

      <SiteFooter className={styles.footer} />
    </main>
  );
}
