"use client";

import { useEffect, useState, Suspense } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const dict = {
  English: {
    heading1: "Reflect on your", heading2: "day",
    placeholder: "Type or speak your thoughts...",
    submit: "Submit",
    loading: "Loading reflection...",
    submitting: "Submitting..."
  },
  Hindi: {
    heading1: "अपने", heading2: "दिन पर विचार करें",
    placeholder: "अपने विचार टाइप करें या बोलें...",
    submit: "जमा करें",
    loading: "लोड हो रहा है...",
    submitting: "जमा किया जा रहा है..."
  },
  Marathi: {
    heading1: "तुमच्या", heading2: "दिवसावर विचार करा",
    placeholder: "तुमचे विचार टाइप करा किंवा बोला...",
    submit: "सबमिट करा",
    loading: "लोड होत आहे...",
    submitting: "सबमिट होत आहे..."
  }
};

function ReflectionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [goalId, setGoalId] = useState(null);

  useEffect(() => {
    const raw = searchParams.get("goalId");
    if (raw) setGoalId(Number(raw));
  }, [searchParams]);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recordingIndex, setRecordingIndex] = useState(null);
  const [lang, setLang] = useState("English");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("preferred_language");
      if (savedLang) setLang(savedLang);
    }
  }, []);

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


 useEffect(() => {
  if (!goalId) return;

  async function fetchReflection() {
    try {
      const res = await post("/generate-reflection", { goalId });
      setQuestions(res.questions || []);
      setAnswers(new Array(res.questions.length).fill(""));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  fetchReflection();
}, [goalId]);

  const handleChange = (i, value) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[i] = value;
      return updated;
    });
  };

 const handleSubmit = async () => {
  if (!goalId) {
    alert("Missing goalId");
    return;
  }

  if (answers.filter(Boolean).length !== questions.length) {
    alert("Answer all questions");
    return;
  }

  setSubmitting(true);

  try {
   await post("/submit-reflection", {
  goalId,
  answers
});

await post("/evaluate-day", {
  goalId
});

    router.push(`/dashboard?goalId=${goalId}`);

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return <div>{t.loading}</div>;
  }

  if (!goalId) {
  return <div>Loading...</div>;
}

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rf-root { min-height: 100dvh; background: #faf8f5; font-family: 'DM Sans', sans-serif; position: relative; overflow-x: hidden; padding-bottom: 110px; }
        .rf-blob { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
        .rf-blob-1 { width: 380px; height: 380px; background: #ede8ff; top: -100px; right: -100px; opacity: 0.5; }
        .rf-blob-2 { width: 300px; height: 300px; background: #fde8d8; bottom: 60px; left: -80px; opacity: 0.4; }
        .rf-inner { position: relative; z-index: 1; max-width: 500px; margin: 0 auto; padding: 56px 24px 0; }
        .rf-heading { font-family: 'Instrument Serif', serif; font-size: clamp(38px, 10vw, 52px); font-weight: 400; color: #1a1425; text-align: center; letter-spacing: -0.025em; margin-bottom: 36px; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .rf-heading em { font-style: italic; color: #5b3fcf; }
        .rf-card { background: #fff; border: 1.5px solid #e8e2f4; border-radius: 20px; padding: 24px; animation: fadeUp 0.45s 0.06s cubic-bezier(0.22,1,0.36,1) both; }
        .rf-q-block { margin-bottom: 24px; }
        .rf-q-block:last-child { margin-bottom: 0; }
        .rf-q-text { font-size: 15px; font-weight: 500; color: #1a1425; line-height: 1.5; margin-bottom: 10px; letter-spacing: -0.005em; }
        .rf-input { width: 100%; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 300; color: #1a1425; background: #f7f4ff; border: 1px solid #ebe5f8; border-radius: 12px; padding: 14px 16px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none; }
        .rf-input:focus { border-color: #7c5cdb; box-shadow: 0 0 0 3px rgba(92,63,207,0.09); }
        .rf-footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 10; padding: 14px 24px 28px; background: rgba(250,248,245,0.95); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid #f0eaf8; }
        .rf-footer-inner { max-width: 500px; margin: 0 auto; display: flex; }
        .rf-btn { flex: 1; padding: 17px 24px; background: #4f35b8; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; letter-spacing: 0.02em; border: none; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(79,53,184,0.28); }
        .rf-btn:hover:not(:disabled) { background: #3f28a0; box-shadow: 0 6px 28px rgba(79,53,184,0.36); transform: translateY(-1px); }
        .rf-btn:active:not(:disabled) { transform: translateY(0); }
        .rf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        .rf-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rf-mic-btn {
          background: #f0eaff;
          border: 1px solid #d4c4f9;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #5b3fcf;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .rf-mic-btn:hover { background: #e3d6fc; }
        .rf-mic-btn.recording {
          background: #ffeaec;
          border-color: #fca5a5;
          color: #ef4444;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .rf-lang-select {
          display: none;
        }
      `}</style>
      
      <div className="rf-root">
        <div className="rf-blob rf-blob-1" />
        <div className="rf-blob rf-blob-2" />

        <div className="rf-inner">
          <h1 className="rf-heading">{t.heading1} <em>{t.heading2}</em></h1>

          <div className="rf-card">
            {questions.map((q, i) => (
              <div className="rf-q-block" key={i}>
                <p className="rf-q-text">{q}</p>
                <div className="rf-input-wrap">
                  <input
                    className="rf-input"
                    value={answers[i] || ""}
                    onChange={e => handleChange(i, e.target.value)}
                    placeholder={t.placeholder}
                  />
                  <button 
                    className={`rf-mic-btn ${recordingIndex === i ? 'recording' : ''}`}
                    onClick={() => startListening(i)}
                    title="Speak answer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="22"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rf-footer">
          <div className="rf-footer-inner">
            <button className="rf-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t.submitting : t.submit}
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

export default function Reflection() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReflectionInner />
    </Suspense>
  );
}