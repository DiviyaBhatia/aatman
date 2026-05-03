"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { useRouter } from "next/navigation";

const dict = {
  English: {
    confirmReset: "Start fresh? This will clear all your goals and progress.",
    today: "Today's",
    actionPlan: "Action Plan",
    min: "min",
    startFresh: "Start fresh",
    completeActivity: "Complete Activity",
    reflection: "Reflection",
    submitReflection: "Submit Reflection",
    submitting: "Submitting...",
    loading: "Loading tasks...",
    close: "Close",
    nextDay: "Next Day"
  },
  Hindi: {
    confirmReset: "क्या आप सब कुछ रीसेट करना चाहते हैं? इससे आपकी सारी प्रगति मिट जाएगी।",
    today: "आज की",
    actionPlan: "कार्य योजना",
    min: "मिनट",
    startFresh: "नया शुरू करें",
    completeActivity: "गतिविधि पूरी करें",
    reflection: "विचार",
    submitReflection: "जमा करें",
    submitting: "जमा किया जा रहा है...",
    loading: "लोड हो रहा है...",
    close: "बंद करें",
    nextDay: "अगला दिन"
  },
  Marathi: {
    confirmReset: "तुम्हाला सर्व काही रिसेट करायचे आहे का? यामुळे तुमची सर्व प्रगती नष्ट होईल.",
    today: "आजचा",
    actionPlan: "अॅक्शन प्लॅन",
    min: "मिनिटे",
    startFresh: "नवीन सुरुवात करा",
    completeActivity: "क्रियाकलाप पूर्ण करा",
    reflection: "विचार",
    submitReflection: "सबमिट करा",
    submitting: "सबमिट होत आहे...",
    loading: "लोड होत आहे...",
    close: "बंद करा",
    nextDay: "पुढचा दिवस"
  }
};

const DOMAIN_ICONS = {
  knowledge: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  fitness: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M3 10h18M3 14h18"/>
      <rect x="1" y="8" width="3" height="8" rx="1.5"/>
      <rect x="20" y="8" width="3" height="8" rx="1.5"/>
    </svg>
  ),
};

const API = "https://aatman-backend-9yq2.onrender.com";

export default function Dashboard() {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTask, setActiveTask] = useState(null);
  const [reflectionQs, setReflectionQs] = useState([]);
  const [reflectionAns, setReflectionAns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [lang, setLang] = useState("English");
  const [recordingIndex, setRecordingIndex] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("preferred_language");
      if (savedLang) setLang(savedLang);
    }
  }, []);

  const t = dict[lang] || dict.English;

  const handleReset = async () => {
    if (!confirm(t.confirmReset)) return;
    setResetting(true);
    try {
      await fetch(`${API}/reset`, { method: "POST" });
      router.push("/onboarding");
    } catch (err) {
      console.error("Reset failed:", err);
      setResetting(false);
    }
  };

//   useEffect(() => {
//     async function fetchTask() {
//       if (!goalId) return;
//       try {
//         const res = await get(`/today-task`);
//         setTasks(res.tasks || []);
//       } catch (err) {
//         console.error("Error fetching task:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchTask();
//   }, [goalId]);
useEffect(() => {
  async function fetchTask() {
    try {
      const res = await get("/today-task");
      setTasks(res.tasks || []);
    } catch (err) {
      console.error("Error fetching task:", err);
    } finally {
      setLoading(false);
    }
  }

  fetchTask();
}, []);
  const openModal = async (t) => {
    setActiveTask(t);
    const res = await fetch(`${API}/generate-reflection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: t.goalId }),
    });
    const data = await res.json();
    setReflectionQs(data.questions || []);
    setReflectionAns([]);
    setShowModal(true);
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
      const updated = [...reflectionAns];
      updated[index] = (updated[index] ? updated[index] + " " : "") + transcript;
      setReflectionAns(updated);
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

const handleSubmitReflection = async () => {
  if (!activeTask) return;

  setSubmitting(true);

  await fetch(`${API}/evaluate-day`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goalId: activeTask.goalId,
      answers: reflectionAns
    })
  });

  // ✅ fetch updated tasks
  const res = await get("/today-task");
  setTasks(res.tasks || []);

  setSubmitting(false);
  setShowModal(false);
};

const handleIncomplete = async () => {
  if (!activeTask) return;

  await fetch(`${API}/mark-incomplete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goalId: activeTask.goalId
    })
  });

  // ✅ ALWAYS sync with backend
  const res = await get("/today-task");
  setTasks(res.tasks || []);

  setShowModal(false);
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root { min-height: 100dvh; background: #faf8f5; font-family: 'DM Sans', sans-serif; position: relative; overflow-x: hidden; padding-bottom: 60px; }
        .db-blob { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
        .db-blob-1 { width: 380px; height: 380px; background: #ede8ff; top: -100px; right: -100px; opacity: 0.5; }
        .db-blob-2 { width: 300px; height: 300px; background: #fde8d8; bottom: 40px; left: -80px; opacity: 0.4; }

        .db-inner { position: relative; z-index: 1; max-width: 500px; margin: 0 auto; padding: 56px 24px 0; }

        .db-header {
          margin-bottom: 32px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }

        .db-header-left { display: flex; flex-direction: column; gap: 4px; }

        .db-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 8vw, 46px);
          font-weight: 400; color: #1a1425;
          letter-spacing: -0.015em; line-height: 1.1;
        }
        .db-title em { font-style: italic; color: #5b3fcf; }

        .db-date {
          font-size: 14px; color: #9b8ecf; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase;
        }

        .db-reset-btn {
          background: #fff;
          border: 1.5px solid #e8e2f4;
          color: #e8a0a0;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .db-reset-btn:hover { background: #fff0f0; border-color: #fca5a5; color: #d85a5a; }

        .db-mic-btn {
          background: #f0eaff; border: 1px solid #d4c4f9; border-radius: 50%; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: #5b3fcf;
          flex-shrink: 0; transition: all 0.2s;
        }
        .db-mic-btn:hover { background: #e3d6fc; }
        .db-mic-btn.recording {
          background: #ffeaec; border-color: #fca5a5; color: #ef4444; animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .db-task-card { background: #fff; border: 1.5px solid #e8e2f4; border-radius: 20px; padding: 20px; margin-bottom: 16px; animation: fadeUp 0.45s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .db-domain-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 99px; background: #ede8ff; color: #5b3fcf; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: capitalize; }
        .db-duration { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: #8a8099; }
        .db-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .db-card-title { font-size: 18px; font-weight: 500; color: #1a1425; margin-bottom: 16px; line-height: 1.4; }
        .db-empty { text-align: center; font-size: 15px; color: #8a8099; padding: 40px 0; }

        .db-btn { width: 100%; padding: 17px 24px; background: #4f35b8; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; letter-spacing: 0.02em; border: none; border-radius: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(79,53,184,0.28); }
        .db-btn:hover { background: #3f28a0; box-shadow: 0 6px 28px rgba(79,53,184,0.36); }
        .db-btn-arrow { width: 22px; height: 22px; background: rgba(255,255,255,0.18); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        .modal-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-end; justify-content: center; animation: overlayIn 0.25s ease both; }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-backdrop { position: absolute; inset: 0; background: rgba(26, 20, 37, 0.45); backdrop-filter: blur(4px); }
        .modal-sheet { position: relative; z-index: 1; width: 100%; max-width: 540px; background: #faf8f5; border-radius: 28px 28px 0 0; overflow: hidden; animation: sheetUp 0.38s cubic-bezier(0.22,1,0.36,1) both; max-height: 92dvh; display: flex; flex-direction: column; }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .db-modal-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .db-modal-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; }
        .db-modal-title { font-family: 'Instrument Serif', serif; font-size: 24px; color: #1a1425; }
        .db-modal-close { background: none; border: none; cursor: pointer; color: #9b8ecf; }
        .db-modal-body { overflow-y: auto; padding: 0 24px 24px; }
        .db-q-block { margin-bottom: 24px; }
        .db-q-text { font-size: 15px; color: #1a1425; margin-bottom: 12px; font-weight: 500; }
        .db-input { width: 100%; padding: 12px; background: #fff; border: 1.5px solid #e8e2f4; border-radius: 12px; font-family: inherit; }
        .db-modal-footer { padding: 24px; border-top: 1px solid #e8e2f4; background: #faf8f5; }
        .db-spinner { width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-top-color: #5b3fcf; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="db-root">
        <div className="db-blob db-blob-1" />
        <div className="db-blob db-blob-2" />

        <div className="db-inner">
          <div className="db-header">
            <div className="db-header-left">
              <span className="db-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              <h1 className="db-title">{t.today} <em>{t.actionPlan}</em></h1>
            </div>
            <button className="db-reset-btn" onClick={handleReset} disabled={resetting}>
              {resetting ? t.loading : t.startFresh}
            </button>
          </div>

          {loading ? (
            <div className="db-empty">{t.loading}</div>
          ) : tasks && tasks.length > 0 ? (
            <div className="db-task-list">
              {tasks.map((tItem, i) => (
                <div className="db-task-card" key={i} style={{ animationDelay: `${i * 0.08 + 0.1}s` }}>
                  <div className="db-card-header">
                    {tItem.domain && (
                      <span className="db-domain-pill">
                        {DOMAIN_ICONS[tItem.domain] ?? null}
                        {tItem.domain}
                      </span>
                    )}
                    {tItem.time_minutes && (
                      <span className="db-duration">
                        {tItem.time_minutes} {t.min}
                      </span>
                    )}
                  </div>
                  <h2 className="db-card-title">{tItem.task}</h2>
                  <button className="db-btn" onClick={() => openModal(tItem)}>
                    {t.completeActivity}
                    <span className="db-btn-arrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="db-empty">No tasks today.</div>
          )}

          <button
            className="db-btn"
            style={{ marginTop: '32px' }}
            onClick={async () => {
              setLoading(true);
              await fetch(`${API}/generate-plan`, { method: "POST" });
              const res = await get("/today-task");
              setTasks(res.tasks || []);
              setLoading(false);
            }}
          >
            {t.nextDay}
            <span className="db-btn-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
          <div className="modal-sheet">
            <div className="db-modal-content">
              <div className="db-modal-header">
                <h2 className="db-modal-title">{t.reflection}</h2>
                <button className="db-modal-close" onClick={() => setShowModal(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="db-modal-body">
                {reflectionQs.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#9b8ecf' }}>
                    <div className="db-spinner" style={{ borderColor: 'rgba(91,63,207,0.2)', borderTopColor: '#5b3fcf', margin: '0 auto 16px' }} />
                    {t.loading}
                  </div>
                ) : (
                  <div className="db-q-list">
                    {reflectionQs.map((q, i) => (
                      <div className="db-q-block" key={i}>
                        <p className="db-q-text">{q}</p>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            className="db-input"
                            value={reflectionAns[i] || ""}
                            onChange={(e) => {
                              const arr = [...reflectionAns];
                              arr[i] = e.target.value;
                              setReflectionAns(arr);
                            }}
                            onFocus={() => setFocusedIdx(i)}
                            onBlur={() => setFocusedIdx(null)}
                            placeholder="Your answer..."
                          />
                          <button 
                            className={`db-mic-btn ${recordingIndex === i ? 'recording' : ''}`}
                            onClick={() => startListening(i)}
                            title="Speak answer"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {reflectionQs.length > 0 && (
                <div className="db-modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="db-btn" style={{ width: '100%', animation: 'none', transform: 'none' }} onClick={handleSubmitReflection} disabled={submitting}>
                    {submitting ? t.submitting : t.submitReflection}
                  </button>
                  <button className="db-btn" style={{ width: '100%', background: 'transparent', color: '#9b8ecf', border: '1.5px solid #e0d8f4', boxShadow: 'none' }} onClick={handleIncomplete}>
                    Couldn't complete this
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}