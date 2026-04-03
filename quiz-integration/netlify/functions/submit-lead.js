// Netlify Function: submit-lead.js
// Receives quiz form data → appends row to Google Sheets (Quiz_Leads tab)
// No npm packages needed — uses Node built-in crypto + fetch (Node 18+)

const { createSign } = require("crypto");

const SHEET_ID = "1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE";
const SHEET_TAB = "Quiz_Leads";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

// --- Google JWT auth (no googleapis package needed) ---
function makeJWT(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");
  const sigInput = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(sigInput);
  const sig = sign.sign(serviceAccount.private_key, "base64url");
  return `${sigInput}.${sig}`;
}

async function getAccessToken(serviceAccount) {
  const jwt = makeJWT(serviceAccount);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data));
  return data.access_token;
}

async function appendRow(token, values) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_TAB)}!A1:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [values] }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Sheets append failed: " + err);
  }
  return res.json();
}

// --- Main handler ---
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

  try {
    const body = JSON.parse(event.body || "{}");
    const { email, score, answers } = body;

    if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: "Email required" }) };

    // Parse service account from env
    const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const token = await getAccessToken(sa);

    // Build row: Timestamp, Email, Score, Q1, Q2, Q3, Q4
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      email,
      score ?? "",
      answers?.[0] ?? "",
      answers?.[1] ?? "",
      answers?.[2] ?? "",
      answers?.[3] ?? "",
    ];

    await appendRow(token, row);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("submit-lead error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
