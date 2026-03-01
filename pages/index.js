// pages/index.js — AI Concept Coach (MVP)
// Full Hindi/English UI · Groq-powered · Stepwise teaching

import { useState } from "react";
import Head from "next/head";

// ─── Subject data ───────────────────────────────────────────────────────────────
const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "Economics", "History", "English", "Computer Science"];
const ALL_SUBJECTS = [...SUBJECTS, "Other"];

const SUBJECT_ICON = {
  "Physics": "⚛️", "Chemistry": "🧪", "Mathematics": "📐", "Biology": "🌿",
  "Economics": "📊", "History": "📜", "English": "📖", "Computer Science": "💻",
  "Other": "🔍",
};

// Hindi names for every subject bubble
const SUBJECT_HI = {
  "Physics": "भौतिकी",
  "Chemistry": "रसायन विज्ञान",
  "Mathematics": "गणित",
  "Biology": "जीव विज्ञान",
  "Economics": "अर्थशास्त्र",
  "History": "इतिहास",
  "English": "अंग्रेज़ी",
  "Computer Science": "कंप्यूटर विज्ञान",
  "Other": "अन्य",
  "General": "सामान्य",
};

const subLabel = (sub, lang) => lang === "Hindi" ? (SUBJECT_HI[sub] || sub) : sub;

// ─── Example questions (English + Hindi) ───────────────────────────────────────
const EXAMPLES = {
  English: [
    ["Why does ice float on water?", "Physics"],
    ["What caused World War I?", "History"],
    ["How does photosynthesis work?", "Biology"],
    ["Explain opportunity cost with an example.", "Economics"],
    ["What is the difference between a stack and a queue?", "Computer Science"],
    ["How does binary search work?", "Computer Science"],
  ],
  Hindi: [
    ["बर्फ पानी पर क्यों तैरती है?", "Physics"],
    ["प्रथम विश्व युद्ध के क्या कारण थे?", "History"],
    ["प्रकाश संश्लेषण कैसे काम करता है?", "Biology"],
    ["अवसर लागत को उदाहरण सहित समझाएं।", "Economics"],
    ["स्टैक और क्यू में क्या अंतर है?", "Computer Science"],
    ["बाइनरी सर्च कैसे काम करता है?", "Computer Science"],
  ],
};

// ─── Full UI string dictionary ──────────────────────────────────────────────────
const UI = {
  English: {
    appTitle: "AI Concept Coach",
    appSubtitle: "Stepwise tutoring · Answer & learn · Mastery tracking",
    selectSubject: "Select a Subject",
    yourQuestion: "Your Question",
    qPlaceholder: "e.g. Why does ice float on water?",
    otherPlaceholder: "Ask anything — we'll figure out the subject!",
    otherTip: "🔍 No worries! Just type your question and we'll automatically detect the subject for you.",
    startSolving: "Start Solving →",
    tryExample: "Try an example:",
    hintOf: (n, total) => `HINT ${n} OF ${total}`,
    finalAnswerLabel: "✅ FINAL ANSWER",
    yourAnswer: "Your Answer:",
    answerPlaceholder: "Type your answer based on the hint above...",
    checkingAnswer: "⏳ Checking your answer...",
    submitAnswer: "Submit Answer →",
    correctLabel: "✅ CORRECT!",
    incorrectLabel: "❌ NOT QUITE",
    continueBtn: "Great! Continue →",
    tryAgain: "🔄 Try again:",
    retryPlaceholder: "Refine your answer...",
    checkingShort: "⏳ Checking...",
    nextHint: "Next Hint →",
    revealAnswer: "Reveal Answer",
    skipNextHint: "Skip → Next Hint",
    skipReveal: "Skip → Reveal Answer",
    autoDetected: "🔍 auto-detected",
    inLang: "English",
    mismatchTitle: "⚠️ SUBJECT MISMATCH DETECTED",
    mismatchBody: (sel, det) =>
      `You selected "${sel}", but your question appears to be about "${det}". You may have chosen the wrong subject.`,
    mismatchTip: `💡 Tip: If you are unsure about the subject, use the "Other" option and we will automatically detect it for you.`,
    useOther: `Use "Other" (auto-detect)`,
    proceedWith: (s) => `Proceed with ${s} anyway`,
    howConfident: "How confident were you?",
    confSubtitle: (correct) => correct
      ? "You answered correctly! Rate how confident you felt."
      : "You needed the full answer. How confident were you?",
    confLabel: (n) => `Confidence: ${n}/5`,
    notSure: "😟 Not sure",
    veryConf: "😎 Very confident",
    submitBtn: "Submit →",
    tryAnother: "← Try Another Question",
    masteryTitle: "📊 Concept Mastery",
    attempts: (c, i) => `${c} correct · ${i} incorrect · ${c + i} attempt${c + i !== 1 ? "s" : ""}`,
    masteryLabels: { notStarted: "Not Started", beginner: "Beginner ★", developing: "Developing ★★", strong: "Strong ★★★" },
    loadingHints: "Preparing your hints...",
    detectingSubj: "Detecting subject from your question...",
    poweredBy: "AI Concept Coach · Powered by Groq (llama-3.3-70b)",
    confFeedback: {
      ok_correct: "✅ Great calibration! You knew it and trusted yourself.",
      under: "📈 Underconfidence detected — you got it right but doubted yourself. Trust your instincts!",
      over: "⚠️ Overconfidence detected — confident but you needed the full answer. Review this concept!",
      ok_wrong: "📚 You recognised the gap — that awareness is the first step to mastery. Keep going!",
    },
  },
  Hindi: {
    appTitle: "AI अवधारणा कोच",
    appSubtitle: "चरण-दर-चरण ट्यूटरिंग · उत्तर दें और सीखें · निपुणता ट्रैकिंग",
    selectSubject: "विषय चुनें",
    yourQuestion: "आपका प्रश्न",
    qPlaceholder: "उदाहरण: बर्फ पानी पर क्यों तैरती है?",
    otherPlaceholder: "कुछ भी पूछें — हम विषय खुद पता लगा लेंगे!",
    otherTip: "🔍 कोई चिंता नहीं! बस अपना सवाल लिखें, हम विषय अपने आप पहचान लेंगे।",
    startSolving: "सीखना शुरू करें →",
    tryExample: "उदाहरण आज़माएं:",
    hintOf: (n, total) => `संकेत ${n} / ${total}`,
    finalAnswerLabel: "✅ अंतिम उत्तर",
    yourAnswer: "आपका उत्तर:",
    answerPlaceholder: "ऊपर दिए संकेत के आधार पर अपना उत्तर लिखें...",
    checkingAnswer: "⏳ आपका उत्तर जाँचा जा रहा है...",
    submitAnswer: "उत्तर जमा करें →",
    correctLabel: "✅ सही!",
    incorrectLabel: "❌ पूरी तरह सही नहीं",
    continueBtn: "बहुत अच्छा! आगे बढ़ें →",
    tryAgain: "🔄 फिर से प्रयास करें:",
    retryPlaceholder: "अपना उत्तर सुधारें...",
    checkingShort: "⏳ जाँच रहे हैं...",
    nextHint: "अगला संकेत →",
    revealAnswer: "उत्तर देखें",
    skipNextHint: "छोड़ें → अगला संकेत",
    skipReveal: "छोड़ें → उत्तर देखें",
    autoDetected: "🔍 स्वतः पहचाना",
    inLang: "हिंदी में",
    mismatchTitle: "⚠️ गलत विषय चुना गया",
    mismatchBody: (sel, det) =>
      `आपने "${subLabel(sel, "Hindi")}" चुना, लेकिन आपका प्रश्न "${subLabel(det, "Hindi")}" से संबंधित लगता है। शायद आपने गलत विषय चुना।`,
    mismatchTip: `💡 सुझाव: अगर आप विषय को लेकर अनिश्चित हैं, तो "अन्य" चुनें और हम स्वतः पहचान लेंगे।`,
    useOther: `"अन्य" चुनें (स्वतः पहचान)`,
    proceedWith: (s) => `${subLabel(s, "Hindi")} के साथ जारी रखें`,
    howConfident: "आप कितने आश्वस्त थे?",
    confSubtitle: (correct) => correct
      ? "आपने सही उत्तर दिया! बताएं आप कितने आश्वस्त थे।"
      : "आपको पूरा उत्तर देखना पड़ा। आप कितने आश्वस्त थे?",
    confLabel: (n) => `आत्मविश्वास: ${n}/5`,
    notSure: "😟 बिल्कुल नहीं",
    veryConf: "😎 बहुत आश्वस्त",
    submitBtn: "जमा करें →",
    tryAnother: "← दूसरा प्रश्न पूछें",
    masteryTitle: "📊 अवधारणा निपुणता",
    attempts: (c, i) => `${c} सही · ${i} गलत · ${c + i} प्रयास`,
    masteryLabels: { notStarted: "शुरू नहीं", beginner: "शुरुआती ★", developing: "विकासशील ★★", strong: "मजबूत ★★★" },
    loadingHints: "आपके संकेत तैयार किए जा रहे हैं...",
    detectingSubj: "आपके प्रश्न से विषय पहचाना जा रहा है...",
    poweredBy: "AI अवधारणा कोच · Groq द्वारा संचालित (llama-3.3-70b)",
    confFeedback: {
      ok_correct: "✅ बेहतरीन! आप जानते थे और खुद पर भरोसा किया।",
      under: "📈 कम आत्मविश्वास! आपने सही किया लेकिन संदेह किया। अपने आप पर विश्वास करें!",
      over: "⚠️ अत्यधिक आत्मविश्वास! आप निश्चित थे पर पूरा उत्तर देखना पड़ा। इस अवधारणा को दोहराएं!",
      ok_wrong: "📚 आपने अपनी कमज़ोरी पहचानी — यह जागरूकता ही निपुणता की पहली सीढ़ी है।",
    },
  },
};

// ─── Mastery Logic ──────────────────────────────────────────────────────────────
function getMastery(correct, incorrect, labels) {
  const total = correct + incorrect;
  if (total === 0) return { label: labels.notStarted, pct: 5, color: "#cbd5e1" };
  const rate = correct / total;
  if (rate >= 0.7 && total >= 3) return { label: labels.strong, pct: 100, color: "#22c55e" };
  if (rate >= 0.4 || total >= 2) return { label: labels.developing, pct: 55, color: "#f59e0b" };
  return { label: labels.beginner, pct: 20, color: "#ef4444" };
}

// ─── Theme System ───────────────────────────────────────────────────────────────
const LIGHT = {
  pageBg: "linear-gradient(135deg,#f0f4ff 0%,#faf5ff 50%,#f0fdf4 100%)",
  cardBg: "#ffffff", cardBorder: "#e2e8f0", cardShadow: "0 2px 12px rgba(0,0,0,0.06)",
  text: "#1e293b", textMuted: "#6b7280", textFaint: "#9ca3af",
  inputBg: "#ffffff", inputBorder: "#e2e8f0",
  hintActive: { bg: "#eef2ff", border: "#a5b4fc" }, hintPast: { bg: "#f8fafc", border: "#f1f5f9" },
  bubbleDef: { bg: "#ffffff", border: "#e2e8f0", color: "#6b7280" },
  bubbleSel: { bg: "linear-gradient(135deg,#eef2ff,#ede9fe)", border: "#6366f1", color: "#4338ca" },
  bubbleOtherSel: { bg: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "#f59e0b", color: "#92400e" },
  accent: "#4f46e5", accentGrad: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  chip: { bg: "#ede9fe", color: "#6d28d9" }, toggleBg: "#f1f5f9", toggleText: "#475569",
  successBg: "#f0fdf4", successBorder: "#86efac", successText: "#15803d",
  errorBg: "#fff5f5", errorBorder: "#fca5a5", errorText: "#dc2626",
  warnBg: "#fef3c7", warnBorder: "#fde68a", warnText: "#92400e",
  mismatchBg: "#fef2f2", mismatchBorder: "#fecaca", mismatchText: "#991b1b",
  cfOver: { bg: "#fff7ed", border: "#fed7aa" }, cfUnder: { bg: "#eff6ff", border: "#bfdbfe" }, cfOk: { bg: "#f0fdf4", border: "#bbf7d0" },
};

const DARK = {
  pageBg: "linear-gradient(135deg,#0d0f1a 0%,#111827 50%,#0d1117 100%)",
  cardBg: "#1a1d2e", cardBorder: "#2d3148", cardShadow: "0 2px 20px rgba(0,0,0,0.4)",
  text: "#e2e8f0", textMuted: "#94a3b8", textFaint: "#64748b",
  inputBg: "#0f1117", inputBorder: "#2d3148",
  hintActive: { bg: "#1e1f3a", border: "#6366f1" }, hintPast: { bg: "#14151f", border: "#1e2030" },
  bubbleDef: { bg: "#14151f", border: "#2d3148", color: "#64748b" },
  bubbleSel: { bg: "linear-gradient(135deg,#1e1f3a,#27193f)", border: "#6366f1", color: "#a5b4fc" },
  bubbleOtherSel: { bg: "linear-gradient(135deg,#2d2510,#3d3010)", border: "#f59e0b", color: "#fde68a" },
  accent: "#818cf8", accentGrad: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  chip: { bg: "#27193f", color: "#c4b5fd" }, toggleBg: "#0f1117", toggleText: "#94a3b8",
  successBg: "#052e16", successBorder: "#166534", successText: "#4ade80",
  errorBg: "#2d0f0f", errorBorder: "#7f1d1d", errorText: "#f87171",
  warnBg: "#1c1506", warnBorder: "#78350f", warnText: "#fbbf24",
  mismatchBg: "#2d0f0f", mismatchBorder: "#7f1d1d", mismatchText: "#f87171",
  cfOver: { bg: "#1c1305", border: "#78350f" }, cfUnder: { bg: "#0c1a2e", border: "#1e3a5f" }, cfOk: { bg: "#052e16", border: "#166534" },
};

const makeStyles = (t) => ({
  page:      { minHeight: "100vh", background: t.pageBg, padding: "32px 16px", fontFamily: "'Georgia','Times New Roman',serif", transition: "background 0.3s" },
  wrap:      { maxWidth: 660, margin: "0 auto" },
  card:      { background: t.cardBg, borderRadius: 20, border: `1px solid ${t.cardBorder}`, padding: "28px 32px", marginBottom: 16, boxShadow: t.cardShadow, transition: "background 0.3s,border-color 0.3s" },
  h1:        { fontSize: 28, fontWeight: 700, color: t.accent, margin: 0, letterSpacing: "-0.5px" },
  label:     { fontSize: 13, fontWeight: 600, color: t.textMuted, marginBottom: 6, display: "block", fontFamily: "sans-serif" },
  textarea:  { width: "100%", border: `1.5px solid ${t.inputBorder}`, borderRadius: 10, padding: "10px 12px", fontSize: 15, color: t.text, outline: "none", fontFamily: "sans-serif", resize: "none", boxSizing: "border-box", lineHeight: 1.6, background: t.inputBg, transition: "background 0.3s,border-color 0.3s" },
  btnPrimary:{ width: "100%", background: t.accentGrad, color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif" },
  chip:      { display: "inline-block", background: t.chip.bg, color: t.chip.color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontFamily: "sans-serif", fontWeight: 600, marginLeft: 8 },
  hintBox:   (active) => ({ borderRadius: 14, padding: "16px 18px", border: `1.5px solid ${active ? t.hintActive.border : t.hintPast.border}`, background: active ? t.hintActive.bg : t.hintPast.bg, marginBottom: 10, transition: "all 0.2s" }),
  cfBox:     (type) => {
    const map = { over: t.cfOver, under: t.cfUnder, ok: t.cfOk };
    const b = map[type] || t.cfOk;
    return { borderRadius: 14, padding: "16px 18px", border: `1.5px solid ${b.border}`, background: b.bg, marginBottom: 16 };
  },
});

// ─── Language Toggle ────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang, t }) {
  return (
    <div style={{ display: "inline-flex", border: `1.5px solid ${t.cardBorder}`, borderRadius: 12, overflow: "hidden", marginTop: 10 }}>
      {[["English", "🇬🇧"], ["Hindi", "🇮🇳"]].map(([l, flag]) => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: "7px 18px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontSize: 14, fontWeight: 600,
          background: lang === l ? t.accentGrad : t.cardBg, color: lang === l ? "white" : t.textMuted, transition: "all 0.2s",
        }}>
          {flag} {l === "Hindi" ? "हिंदी" : "English"}
        </button>
      ))}
    </div>
  );
}

// ─── Dark Mode Toggle ───────────────────────────────────────────────────────────
function DarkToggle({ dark, setDark, t }) {
  return (
    <button onClick={() => setDark(d => !d)} style={{ background: t.toggleBg, border: `1.5px solid ${t.cardBorder}`, borderRadius: 12, padding: "7px 16px", cursor: "pointer", fontFamily: "sans-serif", fontSize: 14, fontWeight: 600, color: t.toggleText, marginTop: 10, marginLeft: 8, transition: "all 0.2s" }}>
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

// ─── Answer Input ───────────────────────────────────────────────────────────────
function AnswerInput({ onSubmit, evaluating, ui, t, S }) {
  const [val, setVal] = useState("");
  const submit = () => { if (val.trim()) { onSubmit(val.trim()); setVal(""); } };
  return (
    <div style={{ marginTop: 16, borderTop: `1.5px dashed ${t.hintActive.border}`, paddingTop: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: t.accent, marginBottom: 8, display: "block", fontFamily: "sans-serif" }}>
        💬 {ui.yourAnswer}
      </label>
      <textarea value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder={ui.answerPlaceholder} rows={3} disabled={evaluating}
        style={{ ...S.textarea, border: `1.5px solid ${t.hintActive.border}` }} />
      <button onClick={submit} disabled={!val.trim() || evaluating}
        style={{ ...S.btnPrimary, marginTop: 10, opacity: (!val.trim() || evaluating) ? 0.45 : 1, background: evaluating ? "#6b7280" : t.accentGrad }}>
        {evaluating ? ui.checkingAnswer : ui.submitAnswer}
      </button>
    </div>
  );
}

// ─── Answer Result Banner ───────────────────────────────────────────────────────
function AnswerResult({ result, onNextHint, onReveal, onProceed, onRetry, evaluating, hasMoreHints, ui, t, S }) {
  const [retryVal, setRetryVal] = useState("");
  if (!result) return null;
  const { correct, feedback } = result;
  const submitRetry = () => { if (retryVal.trim()) { onRetry(retryVal.trim()); setRetryVal(""); } };
  return (
    <div style={{ borderRadius: 14, padding: "16px 18px", marginTop: 14, border: `1.5px solid ${correct ? t.successBorder : t.errorBorder}`, background: correct ? t.successBg : t.errorBg }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", fontFamily: "sans-serif", marginBottom: 8, color: correct ? t.successText : t.errorText }}>
        {correct ? ui.correctLabel : ui.incorrectLabel}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: t.text, margin: "0 0 14px 0" }}>{feedback}</p>
      {correct ? (
        <button onClick={onProceed} style={S.btnPrimary}>{ui.continueBtn}</button>
      ) : (
        <>
          <div style={{ borderTop: `1.5px dashed ${t.errorBorder}`, paddingTop: 14, marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: t.errorText, marginBottom: 8, display: "block", fontFamily: "sans-serif" }}>
              {ui.tryAgain}
            </label>
            <textarea value={retryVal} onChange={e => setRetryVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitRetry(); } }}
              placeholder={ui.retryPlaceholder} rows={2} disabled={evaluating}
              style={{ ...S.textarea, border: `1.5px solid ${t.errorBorder}` }} />
            <button onClick={submitRetry} disabled={!retryVal.trim() || evaluating}
              style={{ ...S.btnPrimary, marginTop: 8, opacity: (!retryVal.trim() || evaluating) ? 0.45 : 1, background: evaluating ? "#6b7280" : t.accentGrad }}>
              {evaluating ? ui.checkingShort : ui.submitAnswer}
            </button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {hasMoreHints && (
              <button onClick={onNextHint} style={{ flex: 1, background: t.hintActive.bg, color: t.accent, border: `1.5px solid ${t.hintActive.border}`, borderRadius: 12, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif" }}>
                {ui.nextHint}
              </button>
            )}
            <button onClick={onReveal} style={{ flex: 1, background: t.accentGrad, color: "white", border: "none", borderRadius: 12, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif" }}>
              {ui.revealAnswer}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Subject Mismatch Banner ────────────────────────────────────────────────────
function MismatchBanner({ selectedSubject, detectedSubject, onProceed, onSwitchToOther, ui, t }) {
  return (
    <div style={{ borderRadius: 14, padding: "18px 20px", border: `1.5px solid ${t.mismatchBorder}`, background: t.mismatchBg, marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", color: t.mismatchText, fontFamily: "sans-serif", marginBottom: 8 }}>
        {ui.mismatchTitle}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: t.text, margin: "0 0 12px 0", fontFamily: "sans-serif" }}>
        {ui.mismatchBody(selectedSubject, detectedSubject)}
      </p>
      <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 16px 0", fontFamily: "sans-serif" }}>
        {ui.mismatchTip}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onSwitchToOther} style={{ flex: 1, background: t.accentGrad, color: "white", border: "none", borderRadius: 12, padding: "11px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif", minWidth: 160 }}>
          {ui.useOther}
        </button>
        <button onClick={onProceed} style={{ flex: 1, background: "transparent", color: t.textMuted, border: `1.5px solid ${t.cardBorder}`, borderRadius: 12, padding: "11px 14px", fontSize: 14, cursor: "pointer", fontFamily: "sans-serif", minWidth: 160 }}>
          {ui.proceedWith(selectedSubject)}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [dark,           setDark]           = useState(false);
  const [subject,        setSubject]        = useState("Physics");
  const [question,       setQuestion]       = useState("");
  const [language,       setLanguage]       = useState("English");
  const [steps,          setSteps]          = useState([]);
  const [currentStep,    setCurrentStep]    = useState(0);
  const [showFinal,      setShowFinal]      = useState(false);
  const [finalAnswer,    setFinalAnswer]    = useState("");
  const [loading,        setLoading]        = useState(false);
  const [loadingMsg,     setLoadingMsg]     = useState("");
  const [evaluating,     setEvaluating]     = useState(false);
  const [phase,          setPhase]          = useState("input");
  const [answerResult,   setAnswerResult]   = useState(null);
  const [confidence,     setConfidence]     = useState(3);
  const [wasCorrect,     setWasCorrect]     = useState(null);
  const [feedback,       setFeedback]       = useState("");
  const [feedbackType,   setFeedbackType]   = useState("ok");
  const [mastery,        setMastery]        = useState({});
  const [conceptTag,     setConceptTag]     = useState("");
  const [detectedSubject,setDetectedSubject]= useState(null);
  const [activeSubject,  setActiveSubject]  = useState("Physics");
  const [mismatchInfo,   setMismatchInfo]   = useState(null);
  const [error,          setError]          = useState("");

  const t   = dark ? DARK : LIGHT;
  const S   = makeStyles(t);
  const ui  = UI[language] || UI.English;
  const examples = EXAMPLES[language] || EXAMPLES.English;

  // ── Generate hints ──────────────────────────────────────────────────────────
  const generateHints = async (subjectToUse) => {
    setLoading(true); setPhase("solving"); setActiveSubject(subjectToUse);
    setSteps([]); setCurrentStep(0); setShowFinal(false);
    setFinalAnswer(""); setAnswerResult(null); setWasCorrect(null); setError("");
    setLoadingMsg(ui.loadingHints);
    try {
      const res = await fetch("/api/solve?action=solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, subject: subjectToUse, language }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSteps(data.steps || []);
      setFinalAnswer(data.finalAnswer || "");
      setConceptTag(data.conceptTag || subjectToUse);
    } catch (e) {
      setError("Error: " + e.message);
      setPhase("input");
    }
    setLoading(false);
  };

  const startSolving = async () => {
    if (!question.trim()) return;
    setError(""); setMismatchInfo(null); setDetectedSubject(null);

    if (subject === "Other") {
      setLoading(true); setPhase("solving");
      setLoadingMsg(ui.detectingSubj);
      setLoading(false);
      const res0 = await fetch("/api/solve?action=detect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const d0 = await res0.json();
      const detected = d0.subject || "General";
      setDetectedSubject(detected);
      await generateHints(detected);
    } else {
      const res0 = await fetch("/api/solve?action=check-mismatch", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, selectedSubject: subject }),
      });
      const d0 = await res0.json();
      if (d0.mismatch) {
        setMismatchInfo({ selected: subject, detected: d0.detected });
        setPhase("mismatch");
      } else {
        await generateHints(subject);
      }
    }
  };

  const proceedWithSelected = async () => { setMismatchInfo(null); setPhase("input"); await generateHints(subject); };
  const switchToOther = async () => {
    const detected = mismatchInfo?.detected || "General";
    setSubject("Other"); setMismatchInfo(null); setDetectedSubject(detected);
    await generateHints(detected);
  };

  // ── Evaluate Answer ─────────────────────────────────────────────────────────
  const evaluateAnswer = async (userAnswer) => {
    setEvaluating(true); setAnswerResult(null);
    const hintsShown = steps.slice(0, currentStep + 1).join("\n");
    try {
      const res = await fetch("/api/solve?action=evaluate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, hintsShown, userAnswer, language }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnswerResult(data);
      if (data.correct) setWasCorrect(true);
    } catch {
      setAnswerResult({ correct: false, feedback: language === "Hindi" ? "उत्तर जाँचा नहीं जा सका — कृपया दोबारा कोशिश करें।" : "Couldn't evaluate — try rephrasing, or use a hint!" });
    }
    setEvaluating(false);
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goNextHint       = () => { setAnswerResult(null); setCurrentStep(s => Math.min(s + 1, steps.length - 1)); };
  const handleReveal     = () => { setShowFinal(true); setAnswerResult(null); if (wasCorrect === null) setWasCorrect(false); setTimeout(() => setPhase("confidence"), 400); };
  const proceedAfterCorrect = () => { setShowFinal(true); setWasCorrect(true); setTimeout(() => setPhase("confidence"), 300); };

  // ── Confidence Submit ───────────────────────────────────────────────────────
  const submitConfidence = () => {
    const tag = conceptTag || subject;
    const correct = wasCorrect === true;
    let fb = "", type = "ok";
    if (correct && confidence >= 4)       { fb = ui.confFeedback.ok_correct; type = "ok"; }
    else if (correct && confidence <= 2)  { fb = ui.confFeedback.under;      type = "under"; }
    else if (!correct && confidence >= 4) { fb = ui.confFeedback.over;       type = "over"; }
    else                                  { fb = ui.confFeedback.ok_wrong;   type = "ok"; }
    setFeedback(fb); setFeedbackType(type);
    setMastery(prev => {
      const cur = prev[tag] || { correct: 0, incorrect: 0 };
      return { ...prev, [tag]: { correct: cur.correct + (correct ? 1 : 0), incorrect: cur.incorrect + (correct ? 0 : 1) } };
    });
    setPhase("done");
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    setPhase("input"); setQuestion(""); setSteps([]); setCurrentStep(0);
    setShowFinal(false); setFinalAnswer(""); setConfidence(3);
    setWasCorrect(null); setFeedback(""); setConceptTag(""); setError("");
    setAnswerResult(null); setDetectedSubject(null); setMismatchInfo(null);
  };

  const masteryEntries = Object.entries(mastery);
  const displaySubject  = detectedSubject || activeSubject || subject;

  return (
    <>
      <Head>
        <title>AI Concept Coach</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={S.page}>
        <div style={S.wrap}>

          {/* ── HEADER ── */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🧠</div>
            <h1 style={S.h1}>{ui.appTitle}</h1>
            <p style={{ color: t.textMuted, fontSize: 14, marginTop: 4, fontFamily: "sans-serif" }}>
              {ui.appSubtitle}
            </p>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginTop: 4 }}>
              <LangToggle lang={language} setLang={setLanguage} t={t} />
              <DarkToggle dark={dark} setDark={setDark} t={t} />
            </div>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div style={{ background: t.errorBg, border: `1.5px solid ${t.errorBorder}`, borderRadius: 14, padding: "14px 18px", marginBottom: 16, color: t.errorText, fontFamily: "sans-serif", fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* ── MISMATCH BANNER ── */}
          {phase === "mismatch" && mismatchInfo && (
            <MismatchBanner
              selectedSubject={mismatchInfo.selected}
              detectedSubject={mismatchInfo.detected}
              onProceed={proceedWithSelected}
              onSwitchToOther={switchToOther}
              ui={ui} t={t}
            />
          )}

          {/* ── INPUT CARD ── */}
          {(phase === "input" || phase === "mismatch") && (
            <div style={S.card}>
              {/* Subject Bubbles */}
              <div style={{ marginBottom: 22 }}>
                <label style={S.label}>{ui.selectSubject}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ALL_SUBJECTS.map(sub => {
                    const isSelected = subject === sub;
                    const isOther    = sub === "Other";
                    const bubStyle   = isSelected ? (isOther ? t.bubbleOtherSel : t.bubbleSel) : t.bubbleDef;
                    return (
                      <button key={sub} onClick={() => setSubject(sub)} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "8px 16px", borderRadius: 99,
                        border: `2px solid ${bubStyle.border}`,
                        background: bubStyle.bg, color: bubStyle.color,
                        fontWeight: isSelected ? 700 : 500, fontSize: 13,
                        cursor: "pointer", fontFamily: "sans-serif",
                        boxShadow: isSelected ? `0 0 0 3px ${isOther ? "#fde68a33" : "#6366f133"}` : "none",
                        transition: "all 0.15s ease",
                      }}>
                        <span style={{ fontSize: 15 }}>{SUBJECT_ICON[sub]}</span>
                        {subLabel(sub, language)}
                      </button>
                    );
                  })}
                </div>
                {subject === "Other" && (
                  <p style={{ fontSize: 12, color: t.warnText, marginTop: 10, fontFamily: "sans-serif", background: t.warnBg, borderRadius: 8, padding: "7px 12px", border: `1px solid ${t.warnBorder}` }}>
                    {ui.otherTip}
                  </p>
                )}
              </div>

              {/* Question Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>{ui.yourQuestion}</label>
                <textarea value={question} onChange={e => setQuestion(e.target.value)}
                  placeholder={subject === "Other" ? ui.otherPlaceholder : ui.qPlaceholder}
                  rows={3} style={S.textarea} />
              </div>

              <button onClick={startSolving} disabled={!question.trim()}
                style={{ ...S.btnPrimary, opacity: question.trim() ? 1 : 0.45 }}>
                {ui.startSolving}
              </button>

              {/* Example Questions */}
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, color: t.textFaint, marginBottom: 10, fontFamily: "sans-serif" }}>
                  {ui.tryExample}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {examples.map(([q, sub]) => (
                    <button key={q} onClick={() => { setQuestion(q); setSubject(sub); }}
                      style={{ background: t.hintActive.bg, color: t.accent, border: `1px solid ${t.hintActive.border}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, fontFamily: "sans-serif", cursor: "pointer", fontWeight: 500 }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SOLVING CARD ── */}
          {phase !== "input" && phase !== "mismatch" && (
            <div style={S.card}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.accent, fontFamily: "sans-serif", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                  {SUBJECT_ICON[displaySubject] || "📚"} {subLabel(displaySubject, language)}
                </span>
                {detectedSubject && (
                  <span style={{ background: t.warnBg, border: `1px solid ${t.warnBorder}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontFamily: "sans-serif", fontWeight: 600, color: t.warnText }}>
                    {ui.autoDetected}
                  </span>
                )}
                {conceptTag && <span style={S.chip}>{conceptTag}</span>}
                <span style={{ marginLeft: "auto", fontSize: 11, color: t.textFaint, fontFamily: "sans-serif" }}>
                  {ui.inLang}
                </span>
              </div>
              <p style={{ color: t.text, fontSize: 17, fontWeight: 500, marginBottom: 22, lineHeight: 1.6 }}>{question}</p>

              {/* Loading */}
              {loading && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <span className="spin" style={{ fontSize: 32, display: "block", marginBottom: 12 }}>⚙️</span>
                  <p style={{ color: t.textMuted, fontFamily: "sans-serif" }}>{loadingMsg}</p>
                </div>
              )}

              {/* Steps */}
              {!loading && steps.length > 0 && (
                <>
                  {/* Past hints (dimmed) */}
                  {steps.slice(0, currentStep).map((step, i) => (
                    <div key={i} style={S.hintBox(false)}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, fontFamily: "sans-serif", letterSpacing: "0.8px", marginBottom: 4 }}>
                        {ui.hintOf(i + 1, steps.length)}
                      </div>
                      <div style={{ color: t.textFaint, fontSize: 14, lineHeight: 1.6 }}>{step}</div>
                    </div>
                  ))}

                  {/* Active hint */}
                  {!showFinal && (
                    <div style={{ ...S.hintBox(true), marginBottom: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, fontFamily: "sans-serif", letterSpacing: "0.8px", marginBottom: 4 }}>
                        {ui.hintOf(currentStep + 1, steps.length)}
                      </div>
                      <div style={{ color: t.text, fontSize: 15, lineHeight: 1.7 }}>{steps[currentStep]}</div>

                      {!answerResult && phase === "solving" && (
                        <AnswerInput onSubmit={evaluateAnswer} evaluating={evaluating} ui={ui} t={t} S={S} />
                      )}

                      {answerResult && phase === "solving" && (
                        <AnswerResult result={answerResult} onNextHint={goNextHint} onReveal={handleReveal}
                          onProceed={proceedAfterCorrect} onRetry={evaluateAnswer} evaluating={evaluating}
                          hasMoreHints={currentStep < steps.length - 1} ui={ui} t={t} S={S} />
                      )}

                      {!answerResult && !evaluating && phase === "solving" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          {currentStep < steps.length - 1 && (
                            <button onClick={goNextHint} style={{ flex: 1, background: "transparent", color: t.textFaint, border: `1.5px solid ${t.cardBorder}`, borderRadius: 10, padding: "9px", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>
                              {ui.skipNextHint}
                            </button>
                          )}
                          <button onClick={handleReveal} style={{ flex: 1, background: "transparent", color: t.textFaint, border: `1.5px solid ${t.cardBorder}`, borderRadius: 10, padding: "9px", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>
                            {ui.skipReveal}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final answer */}
                  {showFinal && (
                    <div style={{ borderRadius: 14, padding: "16px 18px", border: `1.5px solid ${t.successBorder}`, background: t.successBg, marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.successText, fontFamily: "sans-serif", letterSpacing: "0.8px", marginBottom: 6 }}>
                        {ui.finalAnswerLabel}
                      </div>
                      <div style={{ color: t.text, fontSize: 15, lineHeight: 1.8 }}>{finalAnswer}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── CONFIDENCE CARD ── */}
          {phase === "confidence" && (
            <div style={S.card}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>🎯</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 6, marginTop: 0 }}>
                {ui.howConfident}
              </h2>
              <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.textMuted, marginBottom: 20 }}>
                {ui.confSubtitle(wasCorrect)}
              </p>
              <div style={{ marginBottom: 24 }}>
                <label style={S.label}>
                  {ui.confLabel(confidence)}
                </label>
                <input type="range" min={1} max={5} value={confidence}
                  onChange={e => setConfidence(Number(e.target.value))} style={{ width: "100%", accentColor: "#4f46e5" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: t.textFaint, fontFamily: "sans-serif", marginTop: 4 }}>
                  <span>{ui.notSure}</span><span>{ui.veryConf}</span>
                </div>
              </div>
              <button onClick={submitConfidence} style={S.btnPrimary}>{ui.submitBtn}</button>
            </div>
          )}

          {/* ── DONE CARD ── */}
          {phase === "done" && (
            <div style={S.card}>
              <div style={S.cfBox(feedbackType)}>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, fontFamily: "sans-serif", color: t.text }}>{feedback}</p>
              </div>
              <button onClick={reset} style={S.btnPrimary}>{ui.tryAnother}</button>
            </div>
          )}

          {/* ── MASTERY CARD ── */}
          {masteryEntries.length > 0 && (
            <div style={S.card}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: t.textMuted, letterSpacing: "0.8px", fontFamily: "sans-serif", textTransform: "uppercase", marginTop: 0, marginBottom: 18 }}>
                {ui.masteryTitle}
              </h2>
              {masteryEntries.map(([tag, { correct, incorrect }]) => {
                const m = getMastery(correct, incorrect, ui.masteryLabels);
                return (
                  <div key={tag} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: t.text, fontSize: 15 }}>{tag}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.color, fontFamily: "sans-serif" }}>{m.label}</span>
                    </div>
                    <div style={{ height: 8, background: t.cardBorder, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 99, transition: "width 0.8s ease" }} />
                    </div>
                    <p style={{ fontSize: 12, color: t.textFaint, marginTop: 4, fontFamily: "sans-serif" }}>
                      {ui.attempts(correct, incorrect)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: 12, color: t.textFaint, fontFamily: "sans-serif", marginTop: 8 }}>
            {ui.poweredBy}
          </p>

        </div>
      </div>
    </>
  );
}
