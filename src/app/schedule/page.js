"use client";

import { useEffect, useState, Suspense } from "react";
import { post } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

const dict = {
  English: {
    title1: "Build your", title2: "schedule",
    placeholder: "Type or speak your answer...",
    alertFill: "Answer all questions",
    loading: "Preparing your schedule…",
    generating: "Generating your final plan...",
    submit: "Finalize plan"
  },
  Hindi: {
    title1: "अपना", title2: "शेड्यूल बनाएं",
    placeholder: "अपना उत्तर टाइप करें या बोलें...",
    alertFill: "सभी प्रश्नों के उत्तर दें",
    loading: "आपका शेड्यूल तैयार हो रहा है…",
    generating: "आपकी अंतिम योजना तैयार की जा रही है...",
    submit: "योजना पक्की करें"
  },
  Marathi: {
    title1: "तुमचे", title2: "शेड्युल बनवा",
    placeholder: "तुमचे उत्तर टाइप करा किंवा बोला...",
    alertFill: "सर्व प्रश्नांची उत्तरे द्या",
    loading: "तुमचे शेड्युल तयार होत आहे…",
    generating: "तुमचा अंतिम प्लॅन तयार होत आहे...",
    submit: "प्लॅन निश्चित करा"
  }
};

function ScheduleInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawGoalId = searchParams.get("goalId");
  const goalId = rawGoalId ? Number(rawGoalId) : null; // ✅ CRITICAL FIX

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lang, setLang] = useState("English");
  const [recordingIndex, setRecordingIndex] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("preferred_language");
      if (savedLang) setLang(savedLang);
    }
    async function fetchScheduleQuestions() {
      if (!goalId) {
        alert("Missing goalId. Navigation broke.");
        return;
      }

      try {
        const res = await post("/generate-schedule-questions", {
          goalId
        });

        setQuestions(res.questions || []);
      } catch (err) {
        console.error("Schedule fetch error:", err);
        alert("Failed to load schedule questions");
      } finally {
        setLoading(false);
      }
    }

    fetchScheduleQuestions();
  }, [goalId]);

  const handleChange = (index, value) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const t = dict[lang] || dict.English;

  const startListening = (index) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const langCode = lang === "Hindi" ? "hi-IN" : lang === "Marathi" ? "mr-IN" : "en-IN";
    recognition.lang = langCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setRecordingIndex(index);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleChange(index, (answers[index] ? answers[index] + " " : "") + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setRecordingIndex(null);
    };

    recognition.onend = () => {
      setRecordingIndex(null);
    };

    recognition.start();
  };

  const handleSubmit = async () => {
    if (answers.filter(Boolean).length !== questions.length) {
      alert(t.alertFill);
      return;
    }

    if (!goalId) {
      alert("Invalid goalId");
      return;
    }

    setSubmitting(true);

    try {
      // ✅ Save schedule
      await post("/submit-schedule", {
        goalId,
        answers
      });

      // ✅ Generate plan AFTER schedule
      await post("/generate-plan");

      // ✅ Move to dashboard WITH goalId (important for today-task later)
      router.push(`/dashboard?goalId=${goalId}`);

    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong while saving schedule");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading schedule...</div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sc-root { min-height: 100dvh; background: #faf8f5; font-family: 'DM Sans', sans-serif; position: relative; overflow-x: hidden; padding-bottom: 110px; }
        .sc-blob { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
        .sc-blob-1 { width: 380px; height: 380px; background: #ede8ff; top: -100px; right: -100px; opacity: 0.5; }
        .sc-blob-2 { width: 300px; height: 300px; background: #fde8d8; bottom: 60px; left: -80px; opacity: 0.4; }
        .sc-inner { position: relative; z-index: 1; max-width: 540px; margin: 0 auto; padding: 56px 24px 0; }
        .sc-heading { font-family: 'Instrument Serif', serif; font-size: clamp(38px, 10vw, 52px); font-weight: 400; color: #1a1425; text-align: center; letter-spacing: -0.025em; margin-bottom: 36px; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .sc-heading em { font-style: italic; color: #5b3fcf; }
        .sc-card { background: #fff; border: 1.5px solid #e8e2f4; border-radius: 20px; overflow: hidden; animation: fadeUp 0.45s 0.06s cubic-bezier(0.22,1,0.36,1) both; }
        .sc-q-block { padding: 20px; border-bottom: 1px solid #f5f0fc; }
        .sc-q-block:last-child { border-bottom: none; }
        .sc-q-text { font-size: 15px; font-weight: 500; color: #1a1425; line-height: 1.5; margin-bottom: 10px; letter-spacing: -0.005em; }
        .sc-input { width: 100%; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 300; color: #1a1425; background: #f7f4ff; border: 1px solid #ebe5f8; border-radius: 12px; padding: 14px 16px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none; }
        .sc-input:focus { border-color: #7c5cdb; box-shadow: 0 0 0 3px rgba(92,63,207,0.09); }
        .sc-mic-btn {
          background: #f0eaff; border: 1px solid #d4c4f9; border-radius: 50%; width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: #5b3fcf;
          flex-shrink: 0; transition: all 0.2s;
        }
        .sc-mic-btn:hover { background: #e3d6fc; }
        .sc-mic-btn.recording {
          background: #ffeaec; border-color: #fca5a5; color: #ef4444; animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .sc-footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 10; padding: 14px 24px 28px; background: rgba(250,248,245,0.95); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid #f0eaf8; }
        .sc-footer-inner { max-width: 540px; margin: 0 auto; display: flex; }
        .sc-btn { flex: 1; padding: 17px 24px; background: #4f35b8; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; letter-spacing: 0.02em; border: none; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(79,53,184,0.28); }
        .sc-btn:hover:not(:disabled) { background: #3f28a0; box-shadow: 0 6px 28px rgba(79,53,184,0.36); transform: translateY(-1px); }
        .sc-btn:active:not(:disabled) { transform: translateY(0); }
        .sc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="sc-root">
        <div className="sc-blob sc-blob-1" />
        <div className="sc-blob sc-blob-2" />

        <div className="sc-inner">
          <h1 className="sc-heading">{t.title1} <em>{t.title2}</em></h1>

          <div className="sc-card">
           {questions.map((q, i) => (
  <div className="sc-q-block" key={i}>
    <p className="sc-q-text">{q.question}</p>

    {q.type === "number" ? (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() =>
            handleChange(i, Math.max(q.min, (answers[i] ?? q.default) - 1))
          }
        >
          -
        </button>

        <span style={{ minWidth: "60px", textAlign: "center" }}>
          {answers[i] ?? q.default}
        </span>

        <button
          onClick={() =>
            handleChange(i, Math.min(q.max, (answers[i] ?? q.default) + 1))
          }
        >
          +
        </button>
      </div>
    ) : q.type === "select" ? (
      <>
        <select
          className="sc-input"
          value={answers[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
        >
          <option value="">Select</option>
          {q.options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {answers[i] === "other" && (
          <input
            className="sc-input"
            placeholder="Enter your own time"
            onChange={(e) => handleChange(i, e.target.value)}
          />
        )}
      </>
    ) : (
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          className="sc-input"
          placeholder={t.placeholder}
          value={answers[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
        />
        <button 
          className={`sc-mic-btn ${recordingIndex === i ? 'recording' : ''}`}
          onClick={() => startListening(i)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
        </button>
      </div>
    )}
  </div>
))}
          </div>
        </div>

        <div className="sc-footer">
          <div className="sc-footer-inner">
            <button className="sc-btn" onClick={handleSubmit} disabled={submitting}>
              {t.submit}
              <span style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Schedule() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScheduleInner />
    </Suspense>
  );
}