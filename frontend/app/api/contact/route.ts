import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

const CONTACT_FROM = "AQUASMART Mini <contact@aquasmartmini.com>";
const CONTACT_TO = "qacustodio@up.edu.ph";

type ContactPayload = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  organization?: unknown;
  subject?: unknown;
  message?: unknown;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_SECRET;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid contact form payload." },
      { status: 400 },
    );
  }

  const firstName = readString(payload.firstName);
  const lastName = readString(payload.lastName);
  const email = readString(payload.email);
  const organization = readString(payload.organization);
  const subject = readString(payload.subject) || "General Inquiry";
  const message = readString(payload.message);
  const senderName = [firstName, lastName].filter(Boolean).join(" ") || "Guest";

  if (!email || !message) {
    return NextResponse.json(
      { error: "Email address and message are required." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);
  const escapedSenderName = escapeHtml(senderName);
  const escapedEmail = escapeHtml(email);
  const escapedOrganization = escapeHtml(organization || "Not provided");
  const escapedSubject = escapeHtml(subject);
  const escapedMessage = escapeHtml(message).replace(/\n/g, "<br />");

  try {
    const [teamEmail, confirmationEmail] = await Promise.all([
      resend.emails.send({
        from: CONTACT_FROM,
        to: CONTACT_TO,
        replyTo: email,
        subject: `AQUASMART Contact: ${subject}`,
        text: [
          `Name: ${senderName}`,
          `Email: ${email}`,
          `Organization: ${organization || "Not provided"}`,
          `Inquiry Type: ${subject}`,
          "",
          message,
        ].join("\n"),
        html: `
          <h2>AQUASMART contact form message</h2>
          <p><strong>Name:</strong> ${escapedSenderName}</p>
          <p><strong>Email:</strong> ${escapedEmail}</p>
          <p><strong>Organization:</strong> ${escapedOrganization}</p>
          <p><strong>Inquiry Type:</strong> ${escapedSubject}</p>
          <hr />
          <p>${escapedMessage}</p>
        `,
      }),
      resend.emails.send({
        from: CONTACT_FROM,
        to: email,
        replyTo: CONTACT_TO,
        subject: "We received your AQUASMART message",
        text: [
          `Hi ${senderName},`,
          "",
          "Thank you for contacting AQUASMART Mini. We received your message and will review it soon.",
          "",
          "Here is a copy of your message:",
          "",
          `Inquiry Type: ${subject}`,
          `Organization: ${organization || "Not provided"}`,
          "",
          message,
          "",
          "Best,",
          "AQUASMART Mini",
        ].join("\n"),
        html: `
          <p>Hi ${escapedSenderName},</p>
          <p>Thank you for contacting AQUASMART Mini. We received your message and will review it soon.</p>
          <p><strong>Here is a copy of your message:</strong></p>
          <p><strong>Inquiry Type:</strong> ${escapedSubject}</p>
          <p><strong>Organization:</strong> ${escapedOrganization}</p>
          <blockquote style="border-left: 4px solid #1fa3c9; margin: 16px 0; padding-left: 16px;">
            ${escapedMessage}
          </blockquote>
          <p>Best,<br />AQUASMART Mini</p>
        `,
      }),
    ]);

    const error = teamEmail.error || confirmationEmail.error;

    if (error) {
      return NextResponse.json(
        { error: error.message || "Unable to send your message." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send your message.",
      },
      { status: 502 },
    );
  }
}
