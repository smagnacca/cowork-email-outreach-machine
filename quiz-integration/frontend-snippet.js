// ─────────────────────────────────────────────────────────────
// ADD THIS to your quiz's submit handler (wherever you currently
// show results / fireworks after the user clicks Submit).
//
// Replace the existing submit logic with this wrapper:
// ─────────────────────────────────────────────────────────────

// 1. Collect data from the quiz state (adjust variable names to match your code)
const quizData = {
  email: email,          // the email input value
  score: score,          // the computed 0-100 score
  answers: [
    answers[0],          // Q1 answer string e.g. "A" or full answer text
    answers[1],          // Q2
    answers[2],          // Q3
    answers[3],          // Q4
  ],
};

// 2. Fire-and-forget POST to Netlify Function (non-blocking — won't delay results page)
fetch("/.netlify/functions/submit-lead", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(quizData),
}).catch((err) => console.warn("Lead capture failed:", err)); // silent fail — user still sees results

// 3. Continue showing results as normal (this runs immediately, no await needed)
