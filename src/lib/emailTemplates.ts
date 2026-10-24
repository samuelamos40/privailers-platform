/**
 * Official Email Templates for Privailers Data Consult Learning Platform
 * Fully responsive, cross-client compatible HTML with inline CSS.
 */

interface PaymentReceiptParams {
    studentName: string;
    courseName: string;
    amountPaid: number;
    reference: string;
    paidAt?: string;
    classroomUrl?: string;
}

interface WelcomeEmailParams {
    studentName: string;
    loginUrl?: string;
}

interface LiveClassEmailParams {
    studentName: string;
    sessionTitle: string;
    instructorName: string;
    scheduledAt: string;
    meetingUrl: string;
}

export function getPaymentReceiptEmail({
    studentName,
    courseName,
    amountPaid,
    reference,
    paidAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    classroomUrl = 'https://privailers.com/student/courses'
}: PaymentReceiptParams): { subject: string; html: string } {
    const formattedAmount = `₦${amountPaid.toLocaleString('en-NG')}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - Privailers Data Consult</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(6, 30, 72, 0.08); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #061e48; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                Privailers Data Consult
              </h1>
              <p style="color: #00a89c; margin: 6px 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Learning Platform • Official Receipt
              </p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #ecfdf5; color: #10b981; font-size: 28px; font-weight: 700; margin-bottom: 12px;">
                ✓
              </div>
              <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #061e48;">
                Payment Confirmed & Enrolled!
              </h2>
              <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.5;">
                Hello <strong>${studentName}</strong>, thank you for investing in your career with Privailers. Your payment has been verified and your course access is unlocked immediately.
              </p>
            </td>
          </tr>

          <!-- Receipt Details Box -->
          <tr>
            <td style="padding: 16px 40px 24px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 12px; font-size: 13px; color: #64748b; font-weight: 600;">Course / Bootcamp</td>
                  <td style="padding: 8px 12px; font-size: 14px; color: #061e48; font-weight: 700; text-align: right;">${courseName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0;">Amount Paid</td>
                  <td style="padding: 8px 12px; font-size: 16px; color: #00a89c; font-weight: 800; text-align: right; border-top: 1px solid #e2e8f0;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0;">Payment Reference</td>
                  <td style="padding: 8px 12px; font-size: 12px; font-family: monospace; color: #475569; text-align: right; border-top: 1px solid #e2e8f0;">${reference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0;">Payment Provider</td>
                  <td style="padding: 8px 12px; font-size: 13px; color: #061e48; font-weight: 600; text-align: right; border-top: 1px solid #e2e8f0;">Paystack (Verified)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0;">Date</td>
                  <td style="padding: 8px 12px; font-size: 13px; color: #475569; text-align: right; border-top: 1px solid #e2e8f0;">${paidAt}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${classroomUrl}" style="display: inline-block; background-color: #00a89c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 10px rgba(0, 168, 156, 0.3);">
                Go to My Classroom & Start Learning →
              </a>
              <p style="margin: 16px 0 0; font-size: 13px; color: #94a3b8;">
                Your verified digital certificate will be generated automatically upon course completion.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 6px;">
                © ${new Date().getFullYear()} Privailers Data Consult Ltd. All rights reserved.
              </p>
              <p style="margin: 0;">
                Need help with your course? Reach us at <a href="mailto:info@privailers.com" style="color: #00a89c; text-decoration: none; font-weight: 600;">info@privailers.com</a>
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

    return {
        subject: `Enrollment Confirmed: ${courseName} (Receipt #${reference.slice(-8).toUpperCase()})`,
        html
    };
}

export function getWelcomeEmail({
    studentName,
    loginUrl = 'https://privailers.com/login'
}: WelcomeEmailParams): { subject: string; html: string } {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Privailers</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(6, 30, 72, 0.08); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #061e48; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Privailers Data Consult</h1>
              <p style="color: #00a89c; margin: 6px 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Welcome to Africa's Premier Data Academy
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 16px; font-size: 22px; color: #061e48; font-weight: 700;">Welcome, ${studentName}! 🎉</h2>
              <p style="margin: 0 0 16px; font-size: 15px; color: #475569; line-height: 1.6;">
                We are thrilled to welcome you to our community of future data analysts, engineers, and scientists. Your student account is now active.
              </p>
              <div style="background-color: #f8fafc; border-left: 4px solid #00a89c; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px; font-weight: 700; color: #061e48;">What you can do right now:</p>
                <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.6;">
                  <li>Explore hands-on self-paced courses and live cohort bootcamps</li>
                  <li>Track your project milestones and portfolio submissions</li>
                  <li>Attend live interactive masterclasses with senior instructors</li>
                  <li>Earn verifiable, industry-standard digital certificates</li>
                </ul>
              </div>
              <div style="text-align: center; padding-top: 16px;">
                <a href="${loginUrl}" style="display: inline-block; background-color: #061e48; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px;">
                  Access Student Portal →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              © ${new Date().getFullYear()} Privailers Data Consult Ltd. • <a href="mailto:info@privailers.com" style="color: #00a89c; text-decoration: none;">info@privailers.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return {
        subject: `Welcome to Privailers Data Consult, ${studentName}! 🚀`,
        html
    };
}

export function getLiveClassAnnouncementEmail({
    studentName,
    sessionTitle,
    instructorName,
    scheduledAt,
    meetingUrl
}: LiveClassEmailParams): { subject: string; html: string } {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Class Announcement</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(6, 30, 72, 0.08); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #061e48; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Privailers Live Masterclass</h1>
              <p style="color: #f97316; margin: 6px 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                🔴 Upcoming Session Alert
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #061e48; font-weight: 700;">Hello ${studentName},</h2>
              <p style="margin: 0 0 20px; font-size: 15px; color: #475569; line-height: 1.6;">
                A new live learning session has been scheduled for all students. Join the interactive broadcast to ask questions and learn hands-on.
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 10px; font-size: 17px; color: #061e48; font-weight: 700;">${sessionTitle}</h3>
                <p style="margin: 0 0 6px; font-size: 14px; color: #64748b;"><strong>Instructor:</strong> ${instructorName}</p>
                <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>Date & Time:</strong> ${scheduledAt}</p>
              </div>

              <div style="text-align: center;">
                <a href="${meetingUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);">
                  Join Live Session →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              © ${new Date().getFullYear()} Privailers Data Consult Ltd. • <a href="mailto:info@privailers.com" style="color: #00a89c; text-decoration: none;">info@privailers.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return {
        subject: `🔴 Live Session Alert: ${sessionTitle}`,
        html
    };
}
