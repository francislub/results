import nodemailer from "nodemailer"
import { renderAsync } from "@react-email/render"
import { ReportEmailTemplate } from "@/components/email/report-email-template"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendReportCardEmail({
  to,
  subject,
  reportData,
  senderName,
  message,
}: {
  to: string
  subject: string
  reportData: any
  senderName: string
  message?: string
}) {
  try {
    // Render the email template with the report data
    // Using renderAsync instead of render to properly handle the Promise
    const emailHtml = await renderAsync(
      ReportEmailTemplate({
        reportData,
        senderName,
        message,
      }),
    )

    // Send the email
    const info = await transporter.sendMail({
      from: `"Vurra Secondary School" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailHtml,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function generateReportPdf(reportData: any): Promise<Buffer> {
  // This is a placeholder for PDF generation
  // In a real implementation, you would use a library like puppeteer or jspdf
  // to convert the report HTML to a PDF

  // For now, we'll just return a dummy buffer
  return Buffer.from("PDF content would be here")
}
