// pages/api/solve.js
// AI Concept Coach — Groq API (llama-3.3-70b-versatile)
// Requires: GROQ_API_KEY in .env.local

const SUBJECTS = [
  "Physics", "Chemistry", "Mathematics", "Biology",
  "Economics", "History", "English", "Computer Science"
];

// ─── Per-subject teaching style ─────────────────────────────────────────────────
const SUBJECT_STYLE = {
  "Computer Science": `
- Start with a relatable real-life analogy (e.g. a queue at a ticket counter).
- Connect the analogy to the programming concept step by step.
- Introduce ONE concept per hint only.
- Use plain English first; short pseudocode only after the intuition is clear.
- Never assume prior CS knowledge.`,

  "Mathematics": `
- Begin with the simplest possible numeric example.
- Show the pattern visually before stating any rule.
- Explain WHY each step works, not just what to do.`,

  "Physics": `
- Anchor each hint in an everyday physical scenario.
- Build intuition through cause-and-effect before touching numbers.
- Introduce formulas only in the final answer, never in hints.`,

  "Chemistry": `
- Start with atoms or molecules students can visualise.
- Use analogies for bonds and reactions (e.g. puzzle pieces, magnets).
- Explain WHY something happens before naming the phenomenon.`,

  "Biology": `
- Connect every idea to the human body or daily life first.
- Teach FUNCTION before MECHANISM.
- Keep language simple and concrete.`,

  "Economics": `
- Use everyday buying/selling/choice examples first.
- Show the concept in action before naming or defining it.`,

  "History": `
- Present events as cause-effect stories, not isolated facts.
- Build context in this order: when → where → who → why.`,

  "English": `
- Show concrete text examples first.
- Name the literary or grammar concept only after showing it in action.
- Keep language vivid and relatable.`
};

// ─── Language instruction ───────────────────────────────────────────────────────
function langInstruction(isHindi) {
  return isHindi
    ? `LANGUAGE RULE — HIGHEST PRIORITY:
All JSON string values MUST be written entirely in Hindi using Devanagari script.
JSON keys stay in English. No English words inside any value string.
conceptTag, every item in steps[], and finalAnswer must all be pure Hindi.`
    : `Language: Clear, friendly English. Avoid jargon. If a technical term must appear, explain it immediately in plain words.`;
}

// ─── SOLVE system prompt ────────────────────────────────────────────────────────
function buildSolveSystem(subject, isHindi) {
  const style = SUBJECT_STYLE[subject] || `Use real-world analogies. Assume complete beginner level.`;
  const lang  = langInstruction(isHindi);

  return `${lang}

You are a PATIENT, ENCOURAGING AI tutor. The student has ZERO prior knowledge of this topic.
Your ONLY job in this response is to write 4 HINTS that build understanding step by step.

Subject style guide:
${style}

════════════════════════════════════════
HINT RULES — READ CAREFULLY
════════════════════════════════════════

Hint 1 — Anchor:
  • Open with a relatable everyday analogy or scenario.
  • Do NOT introduce the concept name yet.
  • Do NOT mention the answer or any part of the answer.
  • 2–3 sentences only.

Hint 2 — Bridge:
  • Connect the analogy from Hint 1 to the actual concept.
  • Introduce the concept name and define it simply.
  • End with a guiding question that makes the student think about the next piece.
  • Do NOT give the answer or any conclusion yet.
  • 2–3 sentences only.

Hint 3 — Deepen:
  • Give ONE small, concrete example (a number, a scenario, a short analogy extension).
  • The example should illustrate the concept from Hint 2 — NOT solve the original question.
  • Do NOT reveal why the original question resolves the way it does.
  • 2–3 sentences only.

Hint 4 — Strengthen:
  • Clarify a common misconception or edge case related to the concept.
  • OR extend understanding with a "what if" variation.
  • Do NOT state the final conclusion or answer for the original question.
  • 2–3 sentences only.

finalAnswer:
  • Only here may you give the complete, unified explanation.
  • Tie all 4 hints together.
  • Explain the full answer clearly and thoroughly.

════════════════════════════════════════
WHAT YOU MUST NEVER DO IN ANY HINT:
  ✗ State the final answer or conclusion
  ✗ Give the key formula or numeric result that solves the question
  ✗ Write phrases like "so the answer is", "therefore", "in conclusion", "this means that [final conclusion]"
  ✗ Reveal why the original question resolves as it does
════════════════════════════════════════

Return ONLY valid raw JSON with no extra text before or after:
{
  "conceptTag": "2–4 word concept label",
  "steps": ["Hint 1 text", "Hint 2 text", "Hint 3 text", "Hint 4 text"],
  "finalAnswer": "Complete structured explanation."
}`;
}

// ─── EVALUATE system prompt ─────────────────────────────────────────────────────
function buildEvalSystem(isHindi) {
  const lang = isHindi
    ? `Write ALL feedback entirely in Hindi (Devanagari script). No English words in the feedback value.`
    : `Write in warm, supportive English.`;

  return `${lang}

You are evaluating whether a student understood the concept introduced in the most recent hint.

Rules:
- Set correct = true if the student grasped the core idea, even partially or imperfectly.
- Set correct = false only if the student is clearly on the wrong track.
- feedback must be at most 2 sentences.
- Reference something specific from their answer — do not give generic praise or criticism.
- If incorrect, give ONE gentle nudge toward the right idea without revealing the full answer.
- Be warm and encouraging regardless of whether they are right or wrong.

Return ONLY valid raw JSON:
{ "correct": boolean, "close": boolean, "feedback": "..." }`;
}

// ─── DETECT subject ─────────────────────────────────────────────────────────────
const DETECT_SYSTEM = `You are a subject classifier for a school tutoring app.
Given a student question, identify which single subject it belongs to.
Choose ONLY from: ${SUBJECTS.join(", ")}, General.
Return ONLY valid raw JSON: { "subject": "<subject>" }`;

// ─── MISMATCH check ─────────────────────────────────────────────────────────────
const MISMATCH_SYSTEM = `You are a subject classifier for a school tutoring app.
Given a student question and their selected subject, decide if the question actually belongs to a different subject.
Return ONLY valid raw JSON: { "mismatch": boolean, "detected": "<subject>" }
Use the detected field to name the actual subject of the question.
Only set mismatch = true if you are confident the question belongs to a clearly different subject.`;

// ─── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const action = req.query.action || "solve";

  try {
    if (action === "detect") {
      const { question } = req.body;
      const raw = await callGroq({
        system: DETECT_SYSTEM,
        user: `Question: "${question}"`,
        json: true,
        temp: 0.1,
      });
      return res.status(200).json(safeParseJSON(raw));
    }

    if (action === "check-mismatch") {
      const { question, selectedSubject } = req.body;
      const raw = await callGroq({
        system: MISMATCH_SYSTEM,
        user: `Selected subject: "${selectedSubject}"\nQuestion: "${question}"`,
        json: true,
        temp: 0.1,
      });
      return res.status(200).json(safeParseJSON(raw));
    }

    if (action === "solve") {
      const { question, subject, language } = req.body;
      const isHindi = language === "Hindi";

      const raw = await callGroq({
        system: buildSolveSystem(subject || "General", isHindi),
        user: `Student's question: "${question}"\n\nNow write exactly 4 hints following all the rules above. Do NOT answer the question in any hint.`,
        json: true,
        temp: 0.5,
      });

      const parsed = safeParseJSON(raw);
      return res.status(200).json({
        conceptTag:  parsed.conceptTag  || "Concept",
        steps:       (parsed.steps || []).slice(0, 4),
        finalAnswer: parsed.finalAnswer || "",
      });
    }

    if (action === "evaluate") {
      const { question, hintsShown, userAnswer, language } = req.body;
      const isHindi = language === "Hindi";

      const raw = await callGroq({
        system: buildEvalSystem(isHindi),
        user: `Original question: "${question}"
Hint(s) the student has seen:
${hintsShown}
Student's answer: "${userAnswer}"`,
        json: true,
        temp: 0.3,
      });

      return res.status(200).json(safeParseJSON(raw));
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── Groq API caller ────────────────────────────────────────────────────────────
async function callGroq({ system, user, json = false, temp = 0.3 }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing GROQ_API_KEY — add it to .env.local (get a free key at console.groq.com)");

  const body = {
    model: "llama-3.3-70b-versatile",
    temperature: temp,
    messages: [
      { role: "system", content: system },
      { role: "user",   content: user   },
    ],
  };

  if (json) body.response_format = { type: "json_object" };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content)
    throw new Error("Empty Groq response: " + JSON.stringify(data));

  return data.choices[0].message.content;
}

// ─── Safe JSON parser ───────────────────────────────────────────────────────────
function safeParseJSON(raw) {
  try {
    return JSON.parse(raw.trim());
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Invalid JSON from model: " + raw.slice(0, 200));
  }
}
