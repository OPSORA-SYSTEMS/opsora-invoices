import cron from "node-cron";
import prisma from "./prisma";
import { sendReminderEmail } from "./email";
import { Invoice } from "@/types";

let cronStarted = false;

export function startCronJobs() {
  if (cronStarted) return;
  cronStarted = true;

  // Run daily at 9am
  cron.schedule("0 9 * * *", async () => {
    console.log("[CRON] Running daily reminder check...");
    await processReminders();
  });

  console.log("[CRON] Daily reminder job scheduled for 9:00 AM");
}

export async function processReminders() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      console.error("[CRON] Settings not found");
      return;
    }

    const reminderDays = settings.reminderDays
      .split(",")
      .map((d) => parseInt(d.trim()))
      .filter((d) => !isNaN(d) && d > 0);

    if (reminderDays.length === 0) {
      console.log("[CRON] No reminder days configured");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all unpaid/overdue invoices with past due dates
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["sent", "overdue"] },
        dueDate: { lt: new Date() },
      },
      include: {
        client: true,
        items: true,
        reminders: true,
      },
    });

    console.log(`[CRON] Found ${overdueInvoices.length} overdue invoices`);

    for (const invoice of overdueInvoices) {
      const dueDate = new Date(invoice.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysSinceDue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if today matches a reminder day
      if (!reminderDays.includes(daysSinceDue)) continue;

      // Check if we already sent a reminder for this day
      const alreadySent = invoice.reminders.some(
        (r) => r.daysAfterDue === daysSinceDue && r.sentAt !== null
      );

      if (alreadySent) {
        console.log(
          `[CRON] Reminder already sent for invoice ${invoice.number} at day ${daysSinceDue}`
        );
        continue;
      }

      try {
        // Update invoice status to overdue if not already
        if (invoice.status !== "overdue") {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: "overdue" },
          });
        }

        // Send reminder email
        const invoiceForEmail = {
          ...invoice,
          issueDate: invoice.issueDate.toISOString(),
          dueDate: invoice.dueDate.toISOString(),
          sentAt: invoice.sentAt?.toISOString() ?? null,
          paidAt: invoice.paidAt?.toISOString() ?? null,
          createdAt: invoice.createdAt.toISOString(),
          updatedAt: invoice.updatedAt.toISOString(),
          client: {
            ...invoice.client,
            createdAt: invoice.client.createdAt.toISOString(),
          },
          items: invoice.items.map((item) => ({
            ...item,
          })),
          reminders: invoice.reminders.map((r) => ({
            ...r,
            scheduledAt: r.scheduledAt.toISOString(),
            sentAt: r.sentAt?.toISOString() ?? null,
            createdAt: r.createdAt.toISOString(),
          })),
        } as Invoice;

        await sendReminderEmail(invoiceForEmail);

        // Record the reminder
        const scheduledAt = new Date(dueDate);
        scheduledAt.setDate(scheduledAt.getDate() + daysSinceDue);

        // Create or update reminder record
        const existingReminder = invoice.reminders.find(
          (r) => r.daysAfterDue === daysSinceDue
        );

        if (existingReminder) {
          await prisma.reminder.update({
            where: { id: existingReminder.id },
            data: { sentAt: new Date() },
          });
        } else {
          await prisma.reminder.create({
            data: {
              invoiceId: invoice.id,
              daysAfterDue: daysSinceDue,
              scheduledAt: scheduledAt,
              sentAt: new Date(),
            },
          });
        }

        console.log(
          `[CRON] Reminder sent for invoice ${invoice.number} (day ${daysSinceDue})`
        );
      } catch (error) {
        console.error(
          `[CRON] Failed to send reminder for invoice ${invoice.number}:`,
          error
        );
      }
    }

    console.log("[CRON] Reminder check complete");
  } catch (error) {
    console.error("[CRON] Error in processReminders:", error);
  }
}
