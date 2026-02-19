# Scheduler

A calendar-based event scheduling app with email notifications. Built with Next.js, MongoDB, and Resend.

## Features

### Event Management
- **Create events** – Add events with title, description, date, time, color, priority, and assigned members (Kasali)
- **Edit events** – Update existing events via the event dialog
- **Delete events** – Remove events from the calendar
- **View by month** – Navigate between months with Previous/Next or jump to Today

### Calendar
- **Calendar grid** – Monthly view showing all events by date
- **Event sidebar** – List of events for the selected date or all events for the current month
- **Event colors** – Blue, Teal, Amber, Rose, Slate
- **Priorities** – Low, Medium, High with visual badges

### Kasali (Assignees)
- Assign events to predefined members: Sir Earl, Sir JM, Maam Mae, Sir Mark, Sir Jey, Maam Shaira

### Email Notifications
- **Daily digest** – Sends an HTML email summarizing today’s events
- **Auto-notify on open** – On app load, checks for un-notified events and sends an email
- **Vercel cron** – Runs daily at 6:00 AM (cron: `0 6 * * *`) to send notifications
- **Resend** – Uses Resend API for sending emails

---

## Tech Stack

- **Framework:** Next.js
- **Database:** MongoDB
- **Email:** Resend API
- **Data fetching:** SWR

---

## API Endpoints

### Events (`/api/events`)

| Method | Description |
|--------|-------------|
| `GET`  | Fetch events. Optional query: `?month=0&year=2026` for a specific month (month is 0-indexed) |
| `POST` | Create event. Body: `{ title, description, date, time, color?, priority?, kasali? }` |
| `PUT`  | Update event. Body: `{ _id, title, description, date, time, color?, priority?, kasali? }` |
| `DELETE` | Delete event. Query: `?id=<eventId>` |

### Notify (`/api/notify`)

| Method | Description |
|--------|-------------|
| `GET`  | Check for today’s un-notified events and send email digest via Resend |
| `POST` | Same as GET (backwards compatibility) |

Optional: Set `CRON_SECRET` in env and send `Authorization: Bearer <CRON_SECRET>` for cron auth.

---

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://...
RESEND_API_KEY=re_...
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `RESEND_API_KEY` | Yes | Resend API key for sending emails |
| `CRON_SECRET` | No | Optional secret for protecting `/api/notify` when used with Vercel Cron |

---

## Setup

1. Clone the repo and install dependencies:
   ```bash
   pnpm install
   ```

2. Add a `.env` file with `MONGODB_URI` and `RESEND_API_KEY`.

3. Run the dev server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

---

## Resend Setup

- Create an account at [resend.com](https://resend.com)
- Create an API key in the dashboard
- Free tier: 3,000 emails/month
- **Testing mode:** You can only send to the Resend account email until you verify a domain at [resend.com/domains](https://resend.com/domains)
- Change `RECIPIENT` in `app/api/notify/route.ts` or verify a domain to send to any address

---

## Deployment (Vercel)

- Configure `MONGODB_URI` and `RESEND_API_KEY` in Vercel environment variables
- Vercel Cron runs `/api/notify` daily at 6:00 AM (configured in `vercel.json`)
