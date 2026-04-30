"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { useRouter } from "next/navigation";

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

  const handleReset = async () => {
    if (!confirm("Start fresh? This will clear all your goals and progress.")) return;
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
        .db-heading { font-family: 'Instrument Serif', serif; font-size: clamp(38px, 10vw, 52px); font-weight: 400; color: #1a1425; text-align: center; letter-spacing: -0.025em; margin-bottom: 36px; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; line-height: 1.1; }

        .db-topbar { position: relative; z-index: 1; max-width: 500px; margin: 0 auto; padding: 20px 24px 0; display: flex; justify-content: flex-end; }
        .db-reset-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(255,255,255,0.8); border: 1.5px solid #e8e2f4; border-radius: 99px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #8a7ab8; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(8px); }
        .db-reset-btn:hover:not(:disabled) { background: #fff; border-color: #c4b8e8; color: #5b3fcf; box-shadow: 0 2px 12px rgba(91,63,207,0.12); }
        .db-reset-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .db-reset-spinner { width: 12px; height: 12px; border: 1.5px solid rgba(91,63,207,0.3); border-top-color: #5b3fcf; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .db-heading em { font-style: italic; color: #5b3fcf; }

        .db-task-card { background: #fff; border: 1.5px solid #e8e2f4; border-radius: 20px; padding: 20px; margin-bottom: 16px; animation: fadeUp 0.45s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .db-domain-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 99px; background: #ede8ff; color: #5b3fcf; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: capitalize; }
        .db-task-goal { font-size: 13px; font-weight: 500; color: #7c5cdb; letter-spacing: 0.05em; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
        .db-task-title { font-size: 18px; font-weight: 500; color: #1a1425; margin-bottom: 12px; line-height: 1.4; letter-spacing: -0.01em; }
        .db-task-meta { display: flex; gap: 12px; }
        .db-meta-pill { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f7f4ff; border-radius: 10px; font-size: 13px; color: #5a4a8a; font-weight: 400; }
        .db-empty { text-align: center; font-size: 15px; color: #8a8099; padding: 40px 0; }

        .db-btn { width: 100%; padding: 17px 24px; background: #4f35b8; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; letter-spacing: 0.02em; border: none; border-radius: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(79,53,184,0.28); margin-top: 16px; }
        .db-btn:hover { background: #3f28a0; box-shadow: 0 6px 28px rgba(79,53,184,0.36); transform: translateY(-1px); }
        .db-btn:active { transform: translateY(0); }
        .db-btn-arrow { width: 22px; height: 22px; background: rgba(255,255,255,0.18); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        .db-end-btn { margin-top: 32px; animation: fadeUp 0.45s 0.2s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        /* ── MODAL OVERLAY ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          display: flex; align-items: flex-end; justify-content: center;
          animation: overlayIn 0.25s ease both;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-backdrop {
          position: absolute; inset: 0;
          background: rgba(26, 20, 37, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ── MODAL SHEET ── */
        .modal-sheet {
          position: relative; z-index: 1;
          width: 100%; max-width: 540px;
          background: #faf8f5;
          border-radius: 28px 28px 0 0;
          overflow: hidden;
          animation: sheetUp 0.38s cubic-bezier(0.22,1,0.36,1) both;
          max-height: 92dvh;
          display: flex; flex-direction: column;
        }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        /* drag handle */
        .modal-handle {
          width: 36px; height: 4px; border-radius: 99px;
          background: #d4cce8; margin: 14px auto 0; flex-shrink: 0;
        }

        /* blobs inside modal */
        .modal-blob {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none; z-index: 0;
        }
        .modal-blob-1 { width: 260px; height: 260px; background: #ede8ff; top: -80px; right: -60px; opacity: 0.5; }
        .modal-blob-2 { width: 200px; height: 200px; background: #fde8d8; bottom: 80px; left: -60px; opacity: 0.4; }

        .modal-scroll {
          position: relative; z-index: 1;
          overflow-y: auto; flex: 1;
          padding: 28px 24px 12px;
          -webkit-overflow-scrolling: touch;
        }

        .modal-heading {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(30px, 8vw, 40px);
          font-weight: 400; line-height: 1.1;
          color: #1a1425; text-align: center;
          letter-spacing: -0.025em;
          margin-bottom: 32px;
        }
        .modal-heading em { font-style: italic; color: #5b3fcf; }

        /* questions card */
        .modal-card {
          background: #fff; border: 1.5px solid #e8e2f4;
          border-radius: 20px; overflow: hidden;
          margin-bottom: 16px;
        }

        .modal-q-block {
          padding: 20px 20px;
          border-bottom: 1px solid #f5f0fc;
        }
        .modal-q-block:last-child { border-bottom: none; }

        .modal-q-label {
          font-size: 15px; font-weight: 500; color: #1a1425;
          line-height: 1.5; margin-bottom: 12px; letter-spacing: -0.005em;
        }

        .modal-textarea {
          width: 100%;
          min-height: 72px;
          padding: 13px 15px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300; color: #1a1425;
          background: #f7f4ff;
          border: 1.5px solid #ebe5f8;
          border-radius: 12px; outline: none; resize: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          line-height: 1.6;
          -webkit-appearance: none;
        }
        .modal-textarea::placeholder { color: #c4bdd8; }
        .modal-textarea:focus {
          border-color: #7c5cdb;
          box-shadow: 0 0 0 3px rgba(92,63,207,0.09);
          background: #fff;
        }

        /* footer inside modal */
        .modal-footer {
          position: relative; z-index: 1;
          padding: 12px 24px 32px;
          border-top: 1px solid #f0eaf8;
          background: rgba(250,248,245,0.95);
          backdrop-filter: blur(10px);
          display: flex; flex-direction: column; gap: 10px;
          flex-shrink: 0;
        }

        .modal-btn-primary {
          width: 100%; padding: 17px 24px;
          background: #4f35b8; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500;
          letter-spacing: 0.02em; border: none; border-radius: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(79,53,184,0.28);
        }
        .modal-btn-primary:hover:not(:disabled) { background: #3f28a0; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(79,53,184,0.36); }
        .modal-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .modal-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .modal-btn-ghost {
          width: 100%; padding: 14px 24px;
          background: transparent; color: #9b8ecf;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 400;
          border: 1.5px solid #e0d8f4; border-radius: 14px; cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .modal-btn-ghost:hover { border-color: #b8aed8; color: #5b3fcf; background: #f7f4ff; }

        .modal-btn-arrow {
          width: 22px; height: 22px; background: rgba(255,255,255,0.18);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .modal-spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="db-root">
        <div className="db-blob db-blob-1" />
        <div className="db-blob db-blob-2" />

        {/* ── TOP BAR with Reset ── */}
        <div className="db-topbar">
          <button
            className="db-reset-btn"
            onClick={handleReset}
            disabled={resetting}
            title="Clear all data and start over"
          >
            {resetting ? (
              <div className="db-reset-spinner" />
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            )}
            {resetting ? "Resetting…" : "Start Fresh"}
          </button>
        </div>

        <div className="db-inner">
          <h1 className="db-heading">Today's <em>Tasks</em></h1>

          {loading ? (
            <div className="db-empty">Loading tasks…</div>
          ) : tasks && tasks.length > 0 ? (
            <div>
              {tasks.map((t, i) => (
                <div key={i} className="db-task-card">
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
                    {t.domain && (
                      <span className="db-domain-pill">
                        {DOMAIN_ICONS[t.domain] ?? null}
                        {t.domain}
                      </span>
                    )}
                    <span className="db-task-goal">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                      </svg>
                      {t.goal}
                    </span>
                  </div>
                  <div className="db-task-title">{t.task}</div>
                  <div className="db-task-meta">
                    <span className="db-meta-pill">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {t.time_minutes} mins
                    </span>
                    <span className="db-meta-pill">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {t.suggested_time}
                    </span>
                  </div>
                  <button className="db-btn" onClick={() => openModal(t)}>
                    Mark as Done
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
            <div className="db-empty">No tasks today. Take a break!</div>
          )}

         <button
  className="db-btn db-end-btn"
onClick={async () => {
  setLoading(true);

  await fetch(`${API}/generate-plan`, {
    method: "POST"
  });

  const res = await get("/today-task");
  setTasks(res.tasks || []);

  setLoading(false);
}}
>
  Next Day
  <span className="db-btn-arrow">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </span>
</button>
        </div>
      </div>

      {/* ── REFLECTION MODAL ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />

          <div className="modal-sheet">
            <div className="modal-blob modal-blob-1" />
            <div className="modal-blob modal-blob-2" />

            {/* drag handle */}
            <div className="modal-handle" />

            {/* scrollable content */}
            <div className="modal-scroll">
              <h2 className="modal-heading">
                Reflect on your <em>day</em>
              </h2>

              <div className="modal-card">
                {reflectionQs.map((q, i) => (
                  <div className="modal-q-block" key={i}>
                    <p className="modal-q-label">{q}</p>
                    <textarea
                      className="modal-textarea"
                      placeholder="Type your thoughts…"
                      value={reflectionAns[i] || ""}
                      onFocus={() => setFocusedIdx(i)}
                      onBlur={() => setFocusedIdx(null)}
                      onChange={(e) => {
                        const updated = [...reflectionAns];
                        updated[i] = e.target.value;
                        setReflectionAns(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* sticky footer buttons */}
            <div className="modal-footer">
              <button
                className="modal-btn-primary"
                onClick={handleSubmitReflection}
                disabled={submitting}
              >
                {submitting ? (
                  <div className="modal-spinner" />
                ) : (
                  <>
                    Submit
                    <span className="modal-btn-arrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </>
                )}
              </button>
              <button className="modal-btn-ghost" onClick={handleIncomplete}>
                Couldn't complete this
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}