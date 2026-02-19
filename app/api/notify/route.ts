import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { format } from "date-fns";

const RECIPIENT = "tokagawa.marketing.21@gmail.com";
const FROM_EMAIL = "Scheduler <onboarding@resend.dev>";

async function getCollection() {
  const client = await getClientPromise();
  const db = client.db("scheduler");
  return db.collection("events");
}

async function sendNotifications() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { error: "RESEND_API_KEY is not configured", status: 500 };
  }

  const collection = await getCollection();

  const today = format(new Date(), "yyyy-MM-dd");
  const todayEvents = await collection
    .find({ date: today, notified: { $ne: true } })
    .sort({ time: 1 })
    .toArray();

  if (todayEvents.length === 0) {
    return {
      message: "No new events to notify about today",
      notified: 0,
    };
  }

  const eventRows = todayEvents
    .map((event) => {
      const priority = (event.priority || "medium").toUpperCase();
      const kasali =
        event.kasali && event.kasali.length > 0
          ? event.kasali.join(", ")
          : "None assigned";
      return `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #edf2f7;font-weight:600;color:#1a202c;">
          ${event.title}
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #edf2f7;color:#4a5568;">
          ${event.time}
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #edf2f7;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.05em;
            ${priority === "HIGH" ? "background:#fed7d7;color:#c53030;" : priority === "MEDIUM" ? "background:#fefcbf;color:#b7791f;" : "background:#c6f6d5;color:#276749;"}">
            ${priority}
          </span>
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #edf2f7;color:#4a5568;font-size:13px;">
          ${kasali}
        </td>
      </tr>`;
    })
    .join("");

  const htmlBody = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#3b5bdb;padding:24px 28px;border-radius:8px 8px 0 0;">
      <h1 style="color:#ffffff;font-size:20px;margin:0;">Scheduler - Today's Events</h1>
      <p style="color:#dbe4ff;font-size:14px;margin:6px 0 0;">
        ${format(new Date(), "EEEE, MMMM d, yyyy")} &mdash; ${todayEvents.length} event${todayEvents.length !== 1 ? "s" : ""} scheduled
      </p>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f7fafc;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#718096;">Event</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#718096;">Time</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#718096;">Priority</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#718096;">Kasali</th>
          </tr>
        </thead>
        <tbody>
          ${eventRows}
        </tbody>
      </table>
    </div>
    <p style="color:#a0aec0;font-size:12px;text-align:center;margin-top:16px;">
      Sent automatically from your Scheduler app
    </p>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: RECIPIENT,
      subject: `Scheduler: ${todayEvents.length} event${todayEvents.length !== 1 ? "s" : ""} today - ${format(new Date(), "MMM d, yyyy")}`,
      html: htmlBody,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Resend API error: ${res.status}`);
  }

  const ids = todayEvents.map((e) => e._id);
  await collection.updateMany(
    { _id: { $in: ids } },
    { $set: { notified: true } }
  );

  return {
    message: `Notification sent for ${todayEvents.length} event(s)`,
    notified: todayEvents.length,
  };
}

// GET handler - called by Vercel Cron and by the client auto-check
export async function GET(request: Request) {
  try {
    // Verify cron secret in production if set
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        // Allow calls without auth header from client-side (no secret sent)
        // but block calls with wrong secret
        if (authHeader) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }

    const result = await sendNotifications();
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/notify error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

// POST handler - kept for backwards compat
export async function POST() {
  try {
    const result = await sendNotifications();
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/notify error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
