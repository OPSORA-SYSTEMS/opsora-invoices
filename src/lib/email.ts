import { Resend } from "resend";
import { Invoice } from "@/types";
import { format } from "date-fns";

const getResend = () => new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "invoices@opsorasystems.com";
const FROM_NAME = "Opsora Systems";
const REPLY_TO = "rajbarot@opsorasystems.com";

function buildInvoiceEmailHTML(invoice: Invoice, isReminder = false): string {
  const dueDate = format(new Date(invoice.dueDate), "MMMM d, yyyy");
  const issueDate = format(new Date(invoice.issueDate), "MMMM d, yyyy");
  const subject = isReminder
    ? `Payment Reminder: Invoice ${invoice.number} from Opsora Systems`
    : `Invoice ${invoice.number} from Opsora Systems`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a0a2e;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Opsora Systems</h1>
              <p style="margin:8px 0 0;color:#f8b4d9;font-size:14px;">Vancouver, BC, Canada</p>
            </td>
          </tr>

          <!-- Pink accent bar -->
          <tr>
            <td style="background-color:#e91e8c;height:4px;"></td>
          </tr>

          <!-- Subject line -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              ${isReminder ? `<p style="margin:0 0 8px;color:#e91e8c;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Payment Reminder</p>` : ""}
              <h2 style="margin:0;color:#1a0a2e;font-size:22px;font-weight:600;">${isReminder ? "Your payment is overdue" : `Invoice ${invoice.number}`}</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                Dear ${invoice.client.name}${invoice.client.company ? ` (${invoice.client.company})` : ""},
              </p>
              ${isReminder
      ? `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                  This is a friendly reminder that payment for Invoice <strong style="color:#1a0a2e;">${invoice.number}</strong> was due on <strong style="color:#1a0a2e;">${dueDate}</strong> and remains outstanding.
                </p>`
      : `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                  Please find attached Invoice <strong style="color:#1a0a2e;">${invoice.number}</strong> for your records.
                </p>`
    }

              <!-- Invoice details box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf2f8;border:1px solid #f3d4e8;border-radius:8px;margin:24px 0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Invoice Number</td>
                        <td style="padding:6px 0;color:#1a0a2e;font-size:14px;font-weight:600;text-align:right;">${invoice.number}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Issue Date</td>
                        <td style="padding:6px 0;color:#1a0a2e;font-size:14px;text-align:right;">${issueDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Due Date</td>
                        <td style="padding:6px 0;color:#${isReminder ? "dc2626" : "1a0a2e"};font-size:14px;font-weight:${isReminder ? "600" : "400"};text-align:right;">${dueDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;border-top:1px solid #f3d4e8;"></td>
                        <td style="padding:6px 0;border-top:1px solid #f3d4e8;"></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Amount Due (CAD)</td>
                        <td style="padding:6px 0;color:#e91e8c;font-size:20px;font-weight:700;text-align:right;">$${invoice.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                The PDF invoice is attached to this email for your records.
              </p>

              ${invoice.notes ? `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;"><strong>Note:</strong> ${invoice.notes}</p>` : ""}

              <p style="margin:16px 0 0;color:#374151;font-size:14px;line-height:1.6;padding:16px;background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;">
                If you have any questions, please contact us at <a href="mailto:rajbarot@opsorasystems.com" style="color:#e91e8c;text-decoration:none;">rajbarot@opsorasystems.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1a0a2e;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#f8b4d9;font-size:13px;">Opsora Systems &bull; Vancouver, BC, Canada</p>
              <p style="margin:8px 0 0;color:#6b7280;font-size:12px;">
                <a href="mailto:rajbarot@opsorasystems.com" style="color:#e91e8c;text-decoration:none;">rajbarot@opsorasystems.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendInvoiceEmail(
  invoice: Invoice,
  pdfBuffer: Buffer
): Promise<void> {
  const resend = getResend();

  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to: invoice.client.email,
    subject: `Invoice ${invoice.number} from Opsora Systems`,
    html: buildInvoiceEmailHTML(invoice, false),
    attachments: [
      {
        filename: `Invoice-${invoice.number}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

export async function sendReminderEmail(invoice: Invoice): Promise<void> {
  const resend = getResend();

  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to: invoice.client.email,
    subject: `Payment Reminder: Invoice ${invoice.number} from Opsora Systems`,
    html: buildInvoiceEmailHTML(invoice, true),
  });
}

export async function testSMTPConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: FROM_EMAIL,
      subject: "SMTP Test - Opsora Invoice System",
      html: "<p>Email configuration is working correctly.</p>",
    });

    if (result.error) {
      return { success: false, message: result.error.message };
    }

    return { success: true, message: "Email connection successful!" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
