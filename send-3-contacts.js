// ============================================================
// send-3-contacts.js — sends the outreach HTML email to exactly
// 3 specific test contacts and logs them to the Sent Log tab.
// ============================================================

const { google } = require('googleapis');
const sgMail     = require('@sendgrid/mail');

// --- CONFIG ---
const SHEET_ID         = '1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE';
const SENT_LOG_TAB     = 'Sent Log';
const FROM_EMAIL       = 'scott@scottmagnacca.com';
const FROM_NAME        = 'Scott Roberts';
const NOTIFY_EMAIL     = 'scott.magnacca1@gmail.com';
const QUIZ_URL         = 'https://ceo-sales-60-second-quiz-outreach.netlify.app/';
const EMAIL_HEADER_IMG = 'https://ceo-sales-60-second-quiz-outreach.netlify.app/email-header.png';

// --- 3 TEST CONTACTS ---
// Format: [FirstName, LastName, Title, Company, CompanyAlt, Email]
const TEST_CONTACTS = [
  ['Scott', 'Magnacca', 'CEO', 'Salesforlife', '', 'scott.magnacca1@gmail.com'],
  ['Scott', 'Magnacca', 'CEO', 'Salesforlife', '', 'smagnacca@babson.edu'],
  ['Mitchell', 'Haber',    'VP',  'IRALOGIX',     '', 'mhaber@iralogix.com'],
];

// --- GOOGLE SHEETS AUTH ---
async function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Write successful sends to Sent Log tab
async function logSentRows(sheets, rows, dateSent) {
  if (rows.length === 0) return;
  const logRows = rows.map(r => [
    dateSent,
    r[0] || '',  // FirstName
    r[1] || '',  // LastName
    r[5] || '',  // Email
    r[3] || '',  // Company
    `Quick question, ${r[0] || 'there'}`,  // Subject
    'sent',
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SENT_LOG_TAB}!A:G`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: logRows },
  });
  console.log(`  📋 ${rows.length} row(s) appended to Sent Log tab`);
}

// Build the outreach email HTML (same template as send_emails.js)
function buildEmailHtml(row) {
  const firstName = row[0] || 'there';
  const company   = row[3] || 'your company';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#333;max-width:580px;margin:0 auto;padding:0;">
  <div style="margin:0;padding:0;line-height:0;">
    <img src="${EMAIL_HEADER_IMG}" alt="What's Your AI Risk Score?" style="width:100%;max-width:580px;height:auto;display:block;border:0;" />
  </div>
  <div style="padding:28px 32px 32px 32px;">
    <p>Hi ${firstName},</p>
    <p>I came across your profile and was impressed by what you're building at <strong>${company}</strong>.</p>
    <p>I put together a quick 60-second AI quiz that helps executives like yourself pinpoint exactly where AI can create the most leverage in your business — without the jargon or fluff.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${QUIZ_URL}" style="background-color:#1a5c2a;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;font-size:16px;">
        Take the 60-Second AI Quiz →
      </a>
    </p>
    <p>Takes under a minute. No email required to see your results.</p>
    <p>Worth a look?</p>
    <p style="margin-top:32px;border-top:1px solid #eeeeee;padding-top:20px;">
      Scott Roberts<br>
      <a href="https://scottmagnacca.com" style="color:#1a5c2a;">scottmagnacca.com</a>
    </p>
  </div>
</body>
</html>`;
}

// Send summary notification to Scott
async function sendSummary(sent, failed, dateSent) {
  await sgMail.send({
    to:      NOTIFY_EMAIL,
    from:    { email: FROM_EMAIL, name: 'Email Outreach Bot' },
    subject: `✅ 3-Contact Test Complete — ${sent} sent (${dateSent})`,
    html: `
      <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#333;max-width:520px;">
        <h2 style="color:#1a5c2a;">3-Contact Test Batch — Results</h2>
        <p style="color:#888;">${dateSent}</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr style="background:#f5f5f5;">
            <td style="padding:8px 14px;border:1px solid #ddd;"><strong>Sent</strong></td>
            <td style="padding:8px 14px;border:1px solid #ddd;">${sent}</td>
          </tr>
          <tr>
            <td style="padding:8px 14px;border:1px solid #ddd;">Failed</td>
            <td style="padding:8px 14px;border:1px solid #ddd;">${failed}</td>
          </tr>
        </table>
        <p><strong>Contacts:</strong><br>
          scott.magnacca1@gmail.com<br>
          smagnacca@babson.edu<br>
          mhaber@iralogix.com
        </p>
        <p style="color:#888;font-size:13px;">Sent Log updated in Google Sheets.<br>
        <a href="https://docs.google.com/spreadsheets/d/1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE" style="color:#1a5c2a;">View Google Sheet →</a></p>
      </div>
    `,
  });
  console.log(`  📧 Summary email sent to ${NOTIFY_EMAIL}`);
}

// --- MAIN ---
async function main() {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const sheets = await getSheets();

  const dateSent = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  console.log(`Sending to ${TEST_CONTACTS.length} test contacts...`);

  const successRows = [];
  let sent = 0, failed = 0;

  for (const row of TEST_CONTACTS) {
    const email     = row[5].trim();
    const firstName = row[0];

    try {
      await sgMail.send({
        to:      email,
        from:    { email: FROM_EMAIL, name: FROM_NAME },
        subject: `Quick question, ${firstName}`,
        html:    buildEmailHtml(row),
      });
      console.log(`  ✓ ${email}`);
      successRows.push(row);
      sent++;
    } catch (err) {
      console.error(`  ✗ ${email} — ${err.message}`);
      failed++;
    }
  }

  // Log to Sent Log tab
  await logSentRows(sheets, successRows, dateSent);

  // Send summary to Scott
  await sendSummary(sent, failed, dateSent);

  console.log(`\n── Test Batch Summary (${dateSent}) ──────────`);
  console.log(`  Sent:    ${sent}`);
  console.log(`  Failed:  ${failed}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
