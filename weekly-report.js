// ============================================================
// Email Outreach Machine — weekly-report.js
// Weekly campaign performance analysis.
// Reads all tabs from Google Sheets, calculates metrics,
// and emails a summary report to Scott.
// ============================================================

const { google } = require('googleapis');
const sgMail     = require('@sendgrid/mail');

// --- CONFIG ---
const SHEET_ID       = '1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE';
const FROM_EMAIL     = 'scott@scottmagnacca.com';
const FROM_NAME      = 'Email Outreach Bot';
const NOTIFY_EMAIL   = 'scott.magnacca1@gmail.com';
const TOTAL_CONTACTS = 2488;

// --- GOOGLE SHEETS AUTH ---
async function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

// --- FETCH TAB DATA ---
async function getTabData(sheets, tab, range) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tab}!${range}`,
    });
    return res.data.values || [];
  } catch (err) {
    console.warn(`  Could not read tab "${tab}": ${err.message}`);
    return [];
  }
}

// --- MAIN ---
async function main() {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const sheets = await getSheets();

  const today = new Date();
  const reportDate = today.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Calculate "this week" window (last 7 days)
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  console.log(`Generating weekly report for ${reportDate}...`);

  // --- Fetch all tabs ---
  const sentLogRows   = await getTabData(sheets, 'Sent Log', 'A:L');
  const contactRows   = await getTabData(sheets, 'Contacts', 'A:E');
  const quizLeadRows  = await getTabData(sheets, 'Quiz_Leads', 'A:I');
  const aiQuizRows    = await getTabData(sheets, 'AI_IQ_Quiz_Leads', 'A:T');
  const referralRows  = await getTabData(sheets, 'Referrals', 'A:G');

  // --- Sent Log Analysis ---
  const sentData = sentLogRows.slice(1); // skip header
  const totalSent = sentData.length;

  // Count sends by date and find this week's sends
  const sendsByDate = {};
  let thisWeekSent = 0;
  for (const row of sentData) {
    const dateStr = row[0] || '';
    if (dateStr) {
      sendsByDate[dateStr] = (sendsByDate[dateStr] || 0) + 1;
      // Try to parse date for week comparison
      const d = new Date(dateStr);
      if (!isNaN(d.getTime()) && d >= weekAgo) {
        thisWeekSent++;
      }
    }
  }

  // --- Quiz Leads Analysis ---
  const quizData = quizLeadRows.slice(1);
  const aiQuizData = aiQuizRows.slice(1);

  // Filter out test entries
  const testPatterns = ['test', 'scott', 'magnacca'];
  const isTest = (row, emailIdx, nameIdx) => {
    const email = (row[emailIdx] || '').toLowerCase();
    const name  = (row[nameIdx] || '').toLowerCase();
    return testPatterns.some(p => email.includes(p) || name.includes(p));
  };

  const realQuizLeads = quizData.filter(r => !isTest(r, 2, 1));
  const realAiQuizLeads = aiQuizData.filter(r => !isTest(r, 2, 1));
  const totalRealLeads = realQuizLeads.length + realAiQuizLeads.length;

  // This week's quiz leads
  let thisWeekQuizLeads = 0;
  for (const r of [...quizData, ...aiQuizData]) {
    const ts = r[0] || '';
    if (ts) {
      const d = new Date(ts);
      if (!isNaN(d.getTime()) && d >= weekAgo && !isTest(r, 2, 1)) {
        thisWeekQuizLeads++;
      }
    }
  }

  // --- Referrals ---
  const referralData = referralRows.slice(1);
  const totalReferrals = referralData.length;

  // --- Contacts remaining ---
  const totalContacts = contactRows.length - 1; // minus header
  const remaining = totalContacts - totalSent;
  const pctComplete = ((totalSent / totalContacts) * 100).toFixed(1);

  // --- Conversion rate ---
  const conversionRate = totalSent > 0
    ? ((totalRealLeads / totalSent) * 100).toFixed(2)
    : '0.00';

  // --- Build email ---
  const statusEmoji = totalRealLeads > 0 ? '🟢' : '🔴';
  const weekSummary = thisWeekSent > 0
    ? `${thisWeekSent} emails sent this week`
    : 'No emails sent this week';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <h1 style="color:#1a5c2a;margin-bottom:4px;">Weekly Campaign Report</h1>
  <p style="color:#888;margin-top:0;">${reportDate}</p>

  <h2 style="margin-top:28px;">Campaign Snapshot</h2>
  <table style="border-collapse:collapse;width:100%;margin:12px 0;">
    <tr style="background:#f5f5f5;">
      <td style="padding:10px 14px;border:1px solid #ddd;"><strong>Total Emails Sent</strong></td>
      <td style="padding:10px 14px;border:1px solid #ddd;"><strong>${totalSent}</strong> / ${totalContacts} (${pctComplete}%)</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;border:1px solid #ddd;">Sent This Week</td>
      <td style="padding:10px 14px;border:1px solid #ddd;">${thisWeekSent}</td>
    </tr>
    <tr style="background:#f5f5f5;">
      <td style="padding:10px 14px;border:1px solid #ddd;">Remaining</td>
      <td style="padding:10px 14px;border:1px solid #ddd;">${remaining}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;border:1px solid #ddd;">${statusEmoji} Real Quiz Completions</td>
      <td style="padding:10px 14px;border:1px solid #ddd;"><strong>${totalRealLeads}</strong> (${thisWeekQuizLeads} this week)</td>
    </tr>
    <tr style="background:#f5f5f5;">
      <td style="padding:10px 14px;border:1px solid #ddd;">Referrals</td>
      <td style="padding:10px 14px;border:1px solid #ddd;">${totalReferrals}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;border:1px solid #ddd;">Conversion Rate</td>
      <td style="padding:10px 14px;border:1px solid #ddd;">${conversionRate}%</td>
    </tr>
  </table>

  <h2 style="margin-top:28px;">Sends by Date (Last 14 Days)</h2>
  <table style="border-collapse:collapse;width:100%;margin:12px 0;">
    <tr style="background:#1a5c2a;color:white;">
      <th style="padding:8px 14px;border:1px solid #ddd;text-align:left;">Date</th>
      <th style="padding:8px 14px;border:1px solid #ddd;text-align:right;">Emails</th>
    </tr>
    ${Object.entries(sendsByDate)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 14)
      .map(([d, c], i) => `
    <tr style="${i % 2 ? 'background:#f5f5f5;' : ''}">
      <td style="padding:6px 14px;border:1px solid #ddd;">${d}</td>
      <td style="padding:6px 14px;border:1px solid #ddd;text-align:right;">${c}</td>
    </tr>`).join('')}
  </table>

  <h2 style="margin-top:28px;">Quiz Submissions (All Time)</h2>
  <p><strong>Quiz_Leads:</strong> ${quizData.length} total (${realQuizLeads.length} real)<br>
  <strong>AI_IQ_Quiz_Leads:</strong> ${aiQuizData.length} total (${realAiQuizLeads.length} real)</p>

  ${totalRealLeads === 0 ? `
  <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:16px;margin:16px 0;">
    <strong>⚠️ Zero Real Conversions</strong><br>
    No real prospects have completed the quiz yet. Review the improvement plan in <code>analysis_2026-04-07.md</code>.<br>
    Priority actions: (1) Replace contact list, (2) Enable tracking, (3) Rewrite copy.
  </div>` : ''}

  <h2 style="margin-top:28px;">Action Items Status</h2>
  <table style="border-collapse:collapse;width:100%;margin:12px 0;">
    <tr style="background:#1a5c2a;color:white;">
      <th style="padding:8px 14px;border:1px solid #ddd;text-align:left;">#</th>
      <th style="padding:8px 14px;border:1px solid #ddd;text-align:left;">Action</th>
      <th style="padding:8px 14px;border:1px solid #ddd;text-align:left;">Priority</th>
    </tr>
    <tr><td style="padding:6px 14px;border:1px solid #ddd;">1</td><td style="padding:6px 14px;border:1px solid #ddd;">Replace contact list (target tech/SaaS execs)</td><td style="padding:6px 14px;border:1px solid #ddd;color:red;"><strong>CRITICAL</strong></td></tr>
    <tr style="background:#f5f5f5;"><td style="padding:6px 14px;border:1px solid #ddd;">2</td><td style="padding:6px 14px;border:1px solid #ddd;">Enable SendGrid open + click tracking</td><td style="padding:6px 14px;border:1px solid #ddd;color:orange;"><strong>HIGH</strong></td></tr>
    <tr><td style="padding:6px 14px;border:1px solid #ddd;">3</td><td style="padding:6px 14px;border:1px solid #ddd;">Rewrite email copy + add credibility signals</td><td style="padding:6px 14px;border:1px solid #ddd;color:orange;"><strong>HIGH</strong></td></tr>
    <tr style="background:#f5f5f5;"><td style="padding:6px 14px;border:1px solid #ddd;">4</td><td style="padding:6px 14px;border:1px solid #ddd;">Fix Sent Log column mapping</td><td style="padding:6px 14px;border:1px solid #ddd;">MEDIUM</td></tr>
    <tr><td style="padding:6px 14px;border:1px solid #ddd;">5</td><td style="padding:6px 14px;border:1px solid #ddd;">Add follow-up email sequence</td><td style="padding:6px 14px;border:1px solid #ddd;">MEDIUM</td></tr>
  </table>

  <p style="color:#888;font-size:13px;margin-top:28px;border-top:1px solid #eee;padding-top:16px;">
    Auto-generated by Email Outreach Bot<br>
    <a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}" style="color:#1a5c2a;">View Google Sheet</a> ·
    <a href="https://github.com/smagnacca/email-outreach-machine" style="color:#1a5c2a;">View GitHub Repo</a>
  </p>
</body>
</html>`;

  // --- Send report ---
  await sgMail.send({
    to: NOTIFY_EMAIL,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `📊 Weekly Campaign Report — ${reportDate} | ${totalSent} sent, ${totalRealLeads} conversions`,
    html,
  });

  console.log(`✅ Weekly report sent to ${NOTIFY_EMAIL}`);
  console.log(`   Total sent: ${totalSent} | This week: ${thisWeekSent} | Real leads: ${totalRealLeads}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
