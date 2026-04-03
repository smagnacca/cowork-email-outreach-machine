# Quiz → Google Sheets Integration Setup

## What this does
When a lead submits the quiz at `ceo-sales-60-second-quiz-outreach.netlify.app`, their email + all answers + score get appended to a new **Quiz_Leads** tab in your existing Google Sheet.

## Files to add to repo: `smagnacca/CEO_Sales_60_Second-Quiz-Outreach`

| File | Destination in repo |
|------|---------------------|
| `netlify/functions/submit-lead.js` | `netlify/functions/submit-lead.js` |
| Add 3 lines from `frontend-snippet.js` | Inside your quiz's submit handler |

---

## Step 1 — Add Netlify env variable (ONE TIME)

In Netlify dashboard → Site settings → Environment variables → Add:

| Key | Value |
|-----|-------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | *(paste the full JSON from the email-outreach-machine GitHub secret)* |

> You already have this secret in `smagnacca/email-outreach-machine` → Settings → Secrets. Just copy the value.

---

## Step 2 — Create "Quiz_Leads" tab in Google Sheet

Open your Google Sheet and add a new tab named exactly: **Quiz_Leads**

Add these headers in Row 1:
`Timestamp | Email | Score | Q1 | Q2 | Q3 | Q4`

The service account `emailbot@email-robot-491000.iam.gserviceaccount.com` already has edit access to this sheet ✅

---

## Step 3 — Copy the Netlify Function

Copy `netlify/functions/submit-lead.js` into the quiz repo at the same path.

No `package.json` changes needed — uses only Node.js built-in `crypto` + native `fetch`.

---

## Step 4 — Update the quiz's submit handler

In your quiz's JavaScript (wherever the Submit button triggers results), add the 3 lines from `frontend-snippet.js`. Adjust variable names to match what your code uses for email, score, and answers array.

---

## Step 5 — Push & deploy

Push to GitHub → Netlify auto-deploys → test with a real submission.

**Verify:** Check the Quiz_Leads tab in your Google Sheet — a new row should appear within seconds of form submission.

---

## Column mapping in Sheet

| Col | Data |
|-----|------|
| A | Timestamp (ISO) |
| B | Email |
| C | Score (0–100) |
| D | Q1 answer |
| E | Q2 answer |
| F | Q3 answer |
| G | Q4 answer |
