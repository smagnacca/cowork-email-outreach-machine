// ============================================================
// Email Outreach Machine — send_emails.js
// Daily batch sender: reads 50 contacts from Google Sheets,
// sends via SendGrid, logs to Sent Log tab,
// and emails Scott a daily summary.
// Column map: A=FirstName, B=LastName, C=Title, D=Company, E=Email
// ============================================================

const { google } = require('googleapis');
const sgMail     = require('@sendgrid/mail');

// --- CONFIG ---
const SHEET_ID          = '1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE';
const CONTACTS_TAB      = 'Contacts';
const SENT_LOG_TAB      = 'Sent Log';
const BATCH_SIZE        = 50;
const FROM_EMAIL        = 'scott@scottmagnacca.com';
const FROM_NAME         = 'Scott Roberts';
const NOTIFY_EMAIL      = 'scott.magnacca1@gmail.com';
const QUIZ_URL          = 'https://ceo-sales-60-second-quiz-outreach.netlify.app/';
const EMAIL_HEADER_IMG  = 'https://ceo-sales-60-second-quiz-outreach.netlify.app/email-header.png';
const TOTAL_CONTACTS    = 1992;

// --- GOOGLE SHEETS AUTH ---
async function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Count rows already sent (Sent Log minus header row)
async function getSentCount(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SENT_LOG_TAB}!A:A`,
  });
  const rows = res.data.values || [];
  return Math.max(0, rows.length - 1);
}

// Fetch the next BATCH_SIZE contacts starting after already-sent rows
async function getNextBatch(sheets, sentCount) {
  const startRow = sentCount + 2; // +1 for 1-based indexing, +1 for header
  const endRow   = startRow + BATCH_SIZE - 1;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${CONTACTS_TAB}!A${startRow}:E${endRow}`,
  });
  return res.data.values || [];
}

// Write successful sends to Sent Log tab
async function logSentRows(sheets, rows, dateSent) {
  if (rows.length === 0) return;
  const logRows = rows.map(r => [
    dateSent,
    r[0] || '', // FirstName
    r[1] || '', // LastName
    r[4] || '', // Email
    r[3] || '', // Company
    `Quick question, ${r[0] || 'there'}`, // Subject
    'sent',
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SENT_LOG_TAB}!A:G`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: logRows },
  });
}

// Build the outreach email HTML
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

// Send daily summary notification to Scott
async function sendDailySummary(sent, skipped, failed, sentCount, dateSent) {
  const totalToDate = sentCount + sent;
  const remaining   = TOTAL_CONTACTS - totalToDate;
  const pct         = Math.round((totalToDate / TOTAL_CONTACTS) * 100);

  await sgMail.send({
    to:      NOTIFY_EMAIL,
    from:    { email: FROM_EMAIL, name: 'Email Outreach Bot' },
    subject: `✅ Daily Batch Complete — ${sent} sent (${dateSent})`,
    html: `
      <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#333;max-width:520px;">
        <h2 style="color:#1a5c2a;margin-bottom:4px;">Daily Batch Summary</h2>
        <p style="color:#888;margin-top:0;">${dateSent}</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr style="background:#f5f5f5;">
            <td style="padding:8px 14px;border:1px solid #ddd;"><strong>Sent today</strong></td>
            <td style="padding:8px 14px;border:1px solid #ddd;">${sent}</td>
          </tr>
          <tr>
            <td style="padding:8px 14px;border:1px solid #ddd;">Skipped (no email)</td>
            <td style="padding:8px 14px;border:1px solid #ddd;">${skipped}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:8px 14px;border:1px solid #ddd;">Failed</td>
            <td style="padding:8px 14px;border:1px solid #ddd;">${failed}</td>
          </tr>
          <tr>
            <td style="padding:8px 14px;border:1px solid #ddd;"><strong>Total sent to date</strong></td>
            <td style="padding:8px 14px;border:1px solid #ddd;"><strong>${totalToDate} / ${TOTAL_CONTACTS} (${pct}%)</strong></td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:8px 14px;border:1px solid #ddd;">Remaining</td>
            <td style="padding:8px 14px;border:1px solid #ddd;">${remaining}</td>
          </tr>
        </table>
        <p style="color:#888;font-size:13px;">Sent Log has been updated in Google Sheets.<br>
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

  const sentCount = await getSentCount(sheets);
  console.log(`Already sent: ${sentCount} / ${TOTAL_CONTACTS}. Fetching next batch of ${BATCH_SIZE}...`);

  if (sentCount >= TOTAL_CONTACTS) {
    console.log('🎉 Campaign complete — all contacts have been emailed!');
    return;
  }

  const batch = await getNextBatch(sheets, sentCount);
  if (batch.length === 0) {
    console.log('No more contacts found in sheet.');
    return;
  }

  const dateSent = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const successRows = [];
  let sent = 0, skipped = 0, failed = 0;

  for (let i = 0; i < batch.length; i++) {

    // At the midpoint, send Scott a live prospect copy for quality monitoring
    if (i === Math.floor(batch.length / 2)) {
      try {
        await sgMail.send({
          to:      NOTIFY_EMAIL,
          from:    { email: FROM_EMAIL, name: FROM_NAME },
          subject: 'Quick question, Scott',
          html:    buildEmailHtml(['Scott', 'Magnacca', 'CEO', 'Salesforlife', NOTIFY_EMAIL]),
        });
        console.log(`  ✓ [MONITOR COPY] ${NOTIFY_EMAIL}`);
      } catch (err) {
        console.error(`  ✗ [MONITOR COPY] ${NOTIFY_EMAIL} — ${err.message}`);
      }
    }

    const row       = batch[i];
    const email     = (row[4] || '').trim();
    const firstName = row[0] || 'there';

    if (!email || !email.includes('@')) {
      console.warn(`  ⚠ Skipped (no email): ${row[0]} ${row[1]}`);
      skipped++;
      continue;
    }

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

  // Email daily summary to Scott
  await sendDailySummary(sent, skipped, failed, sentCount, dateSent);

  console.log(`\n── Summary (${dateSent}) ─────────────────────`);
  console.log(`  Sent:          ${sent}`);
  console.log(`  Skipped:       ${skipped}`);
  console.log(`  Failed:        ${failed}`);
  console.log(`  Total to date: ${sentCount + sent} / ${TOTAL_CONTACTS}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
