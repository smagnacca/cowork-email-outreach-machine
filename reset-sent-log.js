// reset-sent-log.js
// Clears all data rows from the Sent Log tab so the campaign restarts from Contact #1.
// Run via GitHub Actions: "Reset Sent Log" workflow (manual trigger only).

const { google } = require('googleapis');

const SHEET_ID     = '1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE';
const SENT_LOG_TAB = 'Sent Log';

async function main() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SENT_LOG_TAB}!A:A`,
  });
  const rows = res.data.values || [];
  console.log(`Found ${rows.length} rows in Sent Log (including header).`);

  if (rows.length <= 1) {
    console.log('Sent Log is already empty — nothing to clear.');
    return;
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${SENT_LOG_TAB}!A2:Z`,
  });

  console.log(`✅ Sent Log cleared (${rows.length - 1} data rows removed). Campaign will restart from Contact #1 on next run.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
