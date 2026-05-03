"use client";

import { useState, useEffect } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";

const dict = {
  English: {
    heading1: "Set your", heading2: "goals",
    sub1: "Choose the areas you want to focus on", sub2: "and add your goals with timelines.",
    fitness: "Fitness goals",
    placeholder: "e.g., Go for a 10 min walk",
    days: "days",
    add: "Add another goal",
    info: "You can add multiple fitness goals. We'll create a gentle, step-by-step plan for you.",
    skip: "Skip", continue: "Continue"
  },
  Hindi: {
    heading1: "अपने", heading2: "लक्ष्य निर्धारित करें",
    sub1: "जिन क्षेत्रों पर आप ध्यान केंद्रित करना चाहते हैं उन्हें चुनें", sub2: "और समय सीमा के साथ अपने लक्ष्य जोड़ें।",
    fitness: "फिटनेस लक्ष्य",
    placeholder: "उदाहरण: 10 मिनट टहलें",
    days: "दिन",
    add: "एक और लक्ष्य जोड़ें",
    info: "आप कई फिटनेस लक्ष्य जोड़ सकते हैं। हम आपके लिए एक आसान, चरण-दर-चरण योजना बनाएंगे।",
    skip: "छोड़ें", continue: "आगे बढ़ें"
  },
  Marathi: {
    heading1: "तुमची", heading2: "ध्येये निश्चित करा",
    sub1: "तुम्हाला लक्ष केंद्रित करायचे असलेले क्षेत्र निवडा", sub2: "आणि वेळेसह तुमची ध्येये जोडा.",
    fitness: "फिटनेस ध्येये",
    placeholder: "उदा. 10 मिनिटे चालायला जा",
    days: "दिवस",
    add: "आणखी एक ध्येय जोडा",
    info: "तुम्ही अनेक फिटनेस ध्येये जोडू शकता. आम्ही तुमच्यासाठी एक सोपा, टप्प्याटप्प्याने प्लॅन बनवू.",
    skip: "वगळा", continue: "पुढे जा"
  }
};

export default function GoalPage() {
  const router = useRouter();
  const [goals, setGoals] = useState([{ text: "", timeline: 30 }]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("English");
  const [recordingIndex, setRecordingIndex] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("preferred_language");
      if (savedLang) setLang(savedLang);
    }
  }, []);

  const t = dict[lang] || dict.English;

  const handleChange = (i, field, value) => {
    const updated = [...goals];
    updated[i] = { ...updated[i], [field]: value };
    setGoals(updated);
  };

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
      const updated = [...goals];
      updated[index] = { ...updated[index], text: (updated[index].text ? updated[index].text + " " : "") + transcript };
      setGoals(updated);
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

  const addGoal = () => setGoals(p => [...p, { text: "", timeline: 30 }]);

  const removeGoal = (i) => {
    if (goals.length === 1) return;
    setGoals(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setLoading(true);
    for (const g of goals) {
      if (!g.text || !g.timeline) continue;
      await post("/start-goal", { goal: g.text, timeline: g.timeline });
    }
    router.push("/questions");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .gp-root {
          min-height: 100dvh;
          background: #faf8f5;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 0 0 48px;
        }

        .gp-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .gp-blob-1 { width: 380px; height: 380px; background: #ede8ff; top: -100px; right: -100px; opacity: 0.55; }
        .gp-blob-2 { width: 300px; height: 300px; background: #fde8d8; bottom: 40px; left: -80px; opacity: 0.45; }

        .gp-skip {
          position: absolute; top: 24px; right: 28px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
          color: #9b8ecf; background: none; border: none; cursor: pointer;
          letter-spacing: 0.01em; z-index: 2; transition: color 0.2s;
        }
        .gp-skip:hover { color: #5b3fcf; }

        .gp-inner {
          position: relative; z-index: 1;
          max-width: 460px; margin: 0 auto;
          padding: 56px 24px 0;
          display: flex; flex-direction: column; gap: 0;
        }

        .gp-heading {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(38px, 10vw, 52px);
          font-weight: 400; line-height: 1.05;
          color: #1a1425; text-align: center;
          letter-spacing: -0.025em; margin-bottom: 14px;
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .gp-heading em { font-style: italic; color: #5b3fcf; }

        .gp-sub {
          font-size: 15px; color: #8a8099; text-align: center;
          line-height: 1.65; font-weight: 300; margin-bottom: 36px;
          letter-spacing: 0.01em;
          animation: fadeUp 0.5s 0.07s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .gp-goal-section {
          margin-bottom: 24px;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        .gp-goal-header {
          display: flex; align-items: center; gap: 9px;
          margin-bottom: 14px;
        }
        .gp-goal-header-icon { color: #7c5cdb; display: flex; align-items: center; }
        .gp-goal-header-text {
          font-family: 'Instrument Serif', serif;
          font-size: 20px; font-weight: 400; color: #1a1425; letter-spacing: -0.01em;
        }

        .gp-goal-list {
          background: #fff; border: 1.5px solid #e8e2f4;
          border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
        }

        .gp-goal-row {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border-bottom: 1px solid #f0eaf8;
          transition: background 0.15s;
        }
        .gp-goal-row:last-child { border-bottom: none; }
        .gp-goal-row:hover { background: #fdfcff; }

        .gp-drag-handle {
          color: #d4cce8; cursor: grab; flex-shrink: 0;
          display: flex; align-items: center;
        }

        .gp-goal-input {
          flex: 1; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300; color: #1a1425;
          background: #f7f4ff; border: 1px solid #ebe5f8;
          border-radius: 10px; padding: 10px 13px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .gp-goal-input::placeholder { color: #c4bdd8; }
        .gp-goal-input:focus { border-color: #7c5cdb; box-shadow: 0 0 0 3px rgba(92,63,207,0.09); }

        .gp-mic-btn {
          background: #f0eaff; border: 1px solid #d4c4f9; border-radius: 50%; width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: #5b3fcf;
          flex-shrink: 0; transition: all 0.2s;
        }
        .gp-mic-btn:hover { background: #e3d6fc; }
        .gp-mic-btn.recording {
          background: #ffeaec; border-color: #fca5a5; color: #ef4444; animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .gp-timeline-wrap {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .gp-timeline-input {
          width: 52px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 400; color: #1a1425; text-align: center;
          background: #f7f4ff; border: 1px solid #ebe5f8;
          border-radius: 10px; padding: 10px 8px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .gp-timeline-input:focus { border-color: #7c5cdb; box-shadow: 0 0 0 3px rgba(92,63,207,0.09); }
        .gp-days-label { font-size: 13px; color: #9b8ecf; font-weight: 400; }

        .gp-remove-btn {
          background: none; border: none; cursor: pointer;
          color: #e8a0a0; padding: 4px; border-radius: 6px;
          display: flex; align-items: center;
          transition: color 0.15s, background 0.15s; flex-shrink: 0;
        }
        .gp-remove-btn:hover { color: #d85a5a; background: #fff0f0; }
        .gp-remove-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .gp-add-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 14px; border-top: 1.5px dashed #ddd4f9;
          background: none; border-left: none; border-right: none; border-bottom: none;
          width: 100%; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; color: #7c5cdb;
          letter-spacing: 0.01em;
          transition: background 0.15s, color 0.15s;
          border-radius: 0 0 16px 16px;
        }
        .gp-add-btn:hover { background: #f7f4ff; color: #4f35b8; }

        .gp-info {
          display: flex; align-items: flex-start; gap: 11px;
          background: #f0ecff; border-radius: 14px; padding: 14px 16px;
          margin-bottom: 28px;
          animation: fadeUp 0.45s 0.2s cubic-bezier(0.22,1,0.36,1) both;
        }
        .gp-info-icon { color: #7c5cdb; flex-shrink: 0; margin-top: 1px; }
        .gp-info-text { font-size: 13.5px; color: #5a4a8a; line-height: 1.6; font-weight: 300; }

        .gp-btn {
          width: 100%; padding: 17px 24px;
          background: #4f35b8; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500;
          letter-spacing: 0.02em; border: none; border-radius: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(79,53,184,0.28);
          animation: fadeUp 0.45s 0.25s cubic-bezier(0.22,1,0.36,1) both;
        }
        .gp-btn:hover:not(:disabled) {
          background: #3f28a0; box-shadow: 0 6px 28px rgba(79,53,184,0.36);
          transform: translateY(-1px);
        }
        .gp-btn:active:not(:disabled) { transform: translateY(0); }
        .gp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .gp-btn-arrow {
          width: 22px; height: 22px; background: rgba(255,255,255,0.18);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .gp-spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="gp-root">
        <div className="gp-blob gp-blob-1" />
        <div className="gp-blob gp-blob-2" />
        <button className="gp-skip" onClick={() => router.push("/questions")}>{t.skip}</button>

        <div className="gp-inner">
          <h1 className="gp-heading">
            {t.heading1}<br /><em>{t.heading2}</em>
          </h1>
          <p className="gp-sub">
            {t.sub1}<br />{t.sub2}
          </p>

          <div className="gp-goal-section">
            <div className="gp-goal-header">
              <span className="gp-goal-header-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.5 6.5h11M6.5 17.5h11M3 10h18M3 14h18"/>
                  <rect x="1" y="8" width="3" height="8" rx="1.5"/><rect x="20" y="8" width="3" height="8" rx="1.5"/>
                </svg>
              </span>
              <span className="gp-goal-header-text">{t.fitness}</span>
            </div>

            <div className="gp-goal-list">
              {goals.map((g, i) => (
                <div className="gp-goal-row" key={i}>
                  <span className="gp-drag-handle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                      <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                      <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                  </span>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                    <input
                      className="gp-goal-input"
                      placeholder={t.placeholder}
                      value={g.text}
                      onChange={e => handleChange(i, "text", e.target.value)}
                    />
                    <button 
                      className={`gp-mic-btn ${recordingIndex === i ? 'recording' : ''}`}
                      onClick={() => startListening(i)}
                      title="Speak goal"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
                    </button>
                  </div>

                  <div className="gp-timeline-wrap">
                    <input
                      type="number"
                      min="1"
                      className="gp-timeline-input"
                      value={g.timeline}
                      onChange={e => handleChange(i, "timeline", Number(e.target.value))}
                    />
                    <span className="gp-days-label">{t.days}</span>
                  </div>

                  <button
                    className="gp-remove-btn"
                    onClick={() => removeGoal(i)}
                    disabled={goals.length === 1}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              ))}

              <button className="gp-add-btn" onClick={addGoal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                {t.add}
              </button>
            </div>
          </div>

          <div className="gp-info">
            <span className="gp-info-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
            </span>
            <p className="gp-info-text">
              {t.info}
            </p>
          </div>

          <button className="gp-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="gp-spinner" />
            ) : (
              <>
                {t.continue}
                <span className="gp-btn-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}