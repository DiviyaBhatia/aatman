"use client";

import { useState, useEffect } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";

const dict = {
  English: {
    heading1: "Let's get to", heading2: "know", heading3: "you",
    sub1: "This helps me create a plan", sub2: "that fits perfectly for you.",
    name_label: "What should I call you?", name_ph: "e.g., John Doe",
    time_label: "How much free time daily?",
    pref_label: "When do you prefer to focus?",
    constraint_label: "Any constraints I should know?", constraint_ph: "e.g., Joint pain",
    skip: "Skip", continue: "Continue", select_time: "Select time",
    morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Night"
  },
  Hindi: {
    heading1: "आइए आपको", heading2: "करीब से", heading3: "जानें",
    sub1: "इससे मुझे आपके लिए एक बेहतरीन", sub2: "प्लान बनाने में मदद मिलेगी।",
    name_label: "मैं आपको क्या कहकर बुलाऊं?", name_ph: "उदाहरण: रमेश",
    time_label: "रोजाना कितना खाली समय होता है?",
    pref_label: "आप किस समय व्यायाम करना पसंद करेंगे?",
    constraint_label: "क्या मुझे किसी समस्या के बारे में पता होना चाहिए?", constraint_ph: "उदाहरण: घुटने में दर्द",
    skip: "छोड़ें", continue: "आगे बढ़ें", select_time: "समय चुनें",
    morning: "सुबह", afternoon: "दोपहर", evening: "शाम", night: "रात"
  },
  Marathi: {
    heading1: "चला तुमची", heading2: "ओळख", heading3: "करून घेऊया",
    sub1: "यामुळे मला तुमच्यासाठी एक", sub2: "उत्तम प्लॅन बनवण्यात मदत होईल.",
    name_label: "मी तुम्हाला काय म्हणून हाक मारू?", name_ph: "उदा. रमेश",
    time_label: "दररोज किती मोकळा वेळ असतो?",
    pref_label: "तुम्हाला कोणत्या वेळी व्यायाम करायला आवडेल?",
    constraint_label: "कोणत्याही शारीरिक समस्या आहेत का?", constraint_ph: "उदा. गुडघे दुखी",
    skip: "वगळा", continue: "पुढे जा", select_time: "वेळ निवडा",
    morning: "सकाळ", afternoon: "दुपार", evening: "संध्याकाळ", night: "रात्र"
  }
};

export default function Onboarding() {
  const router = useRouter();
  const [lang, setLang] = useState("English");
  const [form, setForm] = useState({ name: "",  free_time: 1, preferred_time: "", constraint: "", language: "English" });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordingKey, setRecordingKey] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("preferred_language");
      if (savedLang) {
        setLang(savedLang);
        setForm(f => ({ ...f, language: savedLang }));
      }
    }
  }, []);

  const t = dict[lang] || dict.English;

  const fields = [
    {
      key: "name",
      label: t.name_label,
      placeholder: t.name_ph,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
    {
      key: "free_time",
      label: t.time_label,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
        </svg>
      ),
    },
    {
      key: "preferred_time",
      label: t.pref_label,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.07 19.07l.71.71M3 12H2M22 12h-1M4.92 19.07l.71-.7M18.36 4.93l.71-.71"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      ),
    },
    {
      key: "constraint",
      label: t.constraint_label,
      placeholder: t.constraint_ph,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      ),
    }
  ];

  const handleSubmit = async () => {
    setLoading(true);
    await post("/onboarding", form);
    router.push("/goal");
  };

  const startListening = (key) => {
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
      setRecordingKey(key);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, [key]: (prev[key] ? prev[key] + " " : "") + transcript }));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setRecordingKey(null);
    };

    recognition.onend = () => {
      setRecordingKey(null);
    };

    recognition.start();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ob-root {
          min-height: 100dvh;
          background: #faf8f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px 40px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .ob-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .ob-blob-1 { width: 360px; height: 360px; background: #ede8ff; top: -80px; right: -80px; opacity: 0.6; }
        .ob-blob-2 { width: 280px; height: 280px; background: #fde8d8; bottom: -60px; left: -60px; opacity: 0.5; }

        .ob-skip {
          position: absolute;
          top: 24px; right: 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #9b8ecf;
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.01em;
          z-index: 2;
          transition: color 0.2s;
        }
        .ob-skip:hover { color: #5b3fcf; }

        .ob-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .ob-heading {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(32px, 8vw, 44px);
          font-weight: 400;
          line-height: 1.1;
          color: #1a1425;
          text-align: center;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }
        .ob-heading em {
          font-style: italic;
          color: #5b3fcf;
        }

        .ob-sub {
          font-size: 15px;
          color: #8a8099;
          text-align: center;
          line-height: 1.6;
          font-weight: 300;
          margin-bottom: 40px;
          letter-spacing: 0.01em;
        }

        .ob-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .ob-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .ob-field:nth-child(1) { animation-delay: 0.05s; }
        .ob-field:nth-child(2) { animation-delay: 0.12s; }
        .ob-field:nth-child(3) { animation-delay: 0.19s; }
        .ob-field:nth-child(4) { animation-delay: 0.26s; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ob-label {
          font-size: 13px;
          font-weight: 500;
          color: #3d3050;
          letter-spacing: 0.02em;
          padding-left: 2px;
        }

        .ob-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ob-input-inner-wrap {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
        }

        .ob-icon {
          position: absolute;
          left: 16px;
          color: #b8aed8;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          pointer-events: none;
        }
        .ob-input-inner-wrap.focused .ob-icon { color: #5b3fcf; }

        .ob-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #1a1425;
          background: #fff;
          border: 1.5px solid #e8e2f4;
          border-radius: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .ob-input::placeholder { color: #c4bdd8; }
        .ob-input:focus {
          border-color: #7c5cdb;
          box-shadow: 0 0 0 4px rgba(92,63,207,0.08);
        }

        .ob-mic-btn {
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
        .ob-mic-btn:hover { background: #e3d6fc; }
        .ob-mic-btn.recording {
          background: #ffeaec;
          border-color: #fca5a5;
          color: #ef4444;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .ob-btn {
          width: 100%;
          padding: 17px 24px;
          background: #4f35b8;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 0.02em;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(79,53,184,0.28);
          animation: slideUp 0.45s 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        .ob-btn:hover:not(:disabled) {
          background: #3f28a0;
          box-shadow: 0 6px 28px rgba(79,53,184,0.36);
          transform: translateY(-1px);
        }
        .ob-btn:active:not(:disabled) { transform: translateY(0); }
        .ob-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ob-btn-arrow {
          width: 22px; height: 22px;
          background: rgba(255,255,255,0.18);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .ob-stepper-wrap {
          width: 100%;
          height: 48px;
          border: 1.5px solid #e8e2f4;
          border-radius: 14px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px 0 48px;
        }

        .ob-step-value {
          flex: 1;
          text-align: center;
          font-size: 15px;
          font-weight: 400;
          color: #1a1425;
        }

        .ob-step-controls {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ob-step-controls button {
          width: 28px;
          height: 20px;
          border-radius: 6px;
          border: 1px solid #e8e2f4;
          background: #faf8ff;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
        }

        .ob-step-controls button:hover {
          border-color: #7c5cdb;
          color: #5b3fcf;
        }

        .ob-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ob-root">
        <div className="ob-blob ob-blob-1" />
        <div className="ob-blob ob-blob-2" />

        <button className="ob-skip" onClick={() => router.push("/goal")}>{t.skip}</button>

        <div className="ob-card">
          <h1 className="ob-heading">
            {t.heading1} {t.heading2} <br /><em>{t.heading3}</em>
          </h1>
          <p className="ob-sub">
            {t.sub1}<br />{t.sub2}
          </p>

          <div className="ob-fields">
            {fields.map(({ key, label, placeholder, icon }) => (
              <div className="ob-field" key={key}>
                <label className="ob-label">{label}</label>
                <div className="ob-input-wrap">
                  <div className={`ob-input-inner-wrap${focused === key ? " focused" : ""}`}>
                    <span className="ob-icon">{icon}</span>
                    {key === "preferred_time" ? (
                      <select
                        className="ob-input"
                        value={form.preferred_time}
                        onChange={(e) =>
                          setForm({ ...form, preferred_time: e.target.value })
                        }
                        onFocus={() => setFocused(key)}
                        onBlur={() => setFocused(null)}
                      >
                        <option value="">{t.select_time}</option>
                        <option value="morning">{t.morning}</option>
                        <option value="afternoon">{t.afternoon}</option>
                        <option value="evening">{t.evening}</option>
                        <option value="night">{t.night}</option>
                      </select>
                    ) : key === "free_time" ? (
                      <div className="ob-stepper-wrap">
                        <span className="ob-step-value">
                          {form.free_time} hr
                        </span>
                        <div className="ob-step-controls">
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, free_time: prev.free_time + 1 }))}>+</button>
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, free_time: Math.max(1, prev.free_time - 1) }))}>−</button>
                        </div>
                      </div>
                    ) : (
                      <input
                        className="ob-input"
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                        onFocus={() => setFocused(key)}
                        onBlur={() => setFocused(null)}
                      />
                    )}
                  </div>
                  
                  {(key === "name" || key === "constraint") && (
                    <button 
                      className={`ob-mic-btn ${recordingKey === key ? 'recording' : ''}`}
                      onClick={() => startListening(key)}
                      title="Speak answer"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="ob-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="ob-spinner" />
            ) : (
              <>
                {t.continue}
                <span className="ob-btn-arrow">
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