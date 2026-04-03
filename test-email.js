// ============================================================
// test-email.js — sends one sample email to Scott for review
// ============================================================

const sgMail = require('@sendgrid/mail');

const FROM_EMAIL      = 'scott@scottmagnacca.com';
const FROM_NAME       = 'Scott Roberts';
const QUIZ_URL        = 'https://ceo-sales-60-second-quiz-outreach.netlify.app/';
const EMAIL_HEADER_IMG = 'https://ceo-sales-60-second-quiz-outreach.netlify.app/email-header.png';

const html = `<!DOCTYPE html>
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
    <p>Hi [FirstName],</p>
    <p>I came across your profile and was impressed by what you're building at <strong>[Company]</strong>.</p>
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

async function main() {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to:      'scott.magnacca1@gmail.com',
    from:    { email: FROM_EMAIL, name: FROM_NAME },
    subject: 'ceo-sales-60-second-quiz-outreach HTML email',
    html,
  });
  console.log('Test email sent to scott.magnacca1@gmail.com');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
