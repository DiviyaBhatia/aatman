"use client";

import { useState } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";

const DOMAINS = [
  {
    key: "knowledge",
    label: "Knowledge",
    placeholder: "e.g., Read 10 books",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    key: "fitness",
    label: "Fitness",
    placeholder: "e.g., Do 20 push-ups daily",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11M6.5 17.5h11M3 10h18M3 14h18"/>
        <rect x="1" y="8" width="3" height="8" rx="1.5"/><rect x="20" y="8" width="3" height="8" rx="1.5"/>
      </svg>
    ),
  },
];

export default function GoalPage() {
  const router = useRouter();
  const [domains, setDomains] = useState({ knowledge: false, fitness: false });
  const [goals, setGoals] = useState({
    knowledge: [{ text: "", timeline: 30 }],
    fitness: [{ text: "", timeline: 30 }],
  });
  const [loading, setLoading] = useState(false);

  const toggleDomain = (d) => setDomains(p => ({ ...p, [d]: !p[d] }));

  const handleChange = (domain, i, field, value) => {
    const updated = [...goals[domain]];
    updated[i] = { ...updated[i], [field]: value };
    setGoals(p => ({ ...p, [domain]: updated }));
  };

  const addGoal = (domain) =>
    setGoals(p => ({ ...p, [domain]: [...p[domain], { text: "", timeline: 30 }] }));

  const removeGoal = (domain, i) => {
    if (goals[domain].length === 1) return;
    setGoals(p => ({ ...p, [domain]: p[domain].filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    for (const domain of Object.keys(domains)) {
      if (!domains[domain]) continue;
      for (const g of goals[domain]) {
        if (!g.text || !g.timeline) continue;
        await post("/start-goal", { goal: g.text, timeline: g.timeline, domain });
      }
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

        /* ---- DOMAIN TOGGLES ---- */
        .gp-section-label {
          font-size: 12px; font-weight: 500; letter-spacing: 0.1em;
          color: #b0a5cc; text-transform: uppercase; margin-bottom: 12px;
        }

        .gp-domains {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          margin-bottom: 32px;
          animation: fadeUp 0.5s 0.12s cubic-bezier(0.22,1,0.36,1) both;
        }

        .gp-domain-btn {
          position: relative;
          display: flex; align-items: center; gap: 12px;
          padding: 16px 16px;
          background: #fff; border: 1.5px solid #e8e2f4;
          border-radius: 16px; cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .gp-domain-btn:hover { border-color: #c4b8ef; }
        .gp-domain-btn.active {
          border-color: #7c5cdb;
          background: #f7f4ff;
          box-shadow: 0 0 0 4px rgba(92,63,207,0.07);
        }

        .gp-domain-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: #ede8ff; color: #5b3fcf; flex-shrink: 0;
          transition: background 0.2s;
        }
        .gp-domain-btn.active .gp-domain-icon { background: #ddd4f9; }

        .gp-domain-name {
          font-size: 15px; font-weight: 500; color: #1a1425; letter-spacing: 0.01em;
        }

        .gp-check {
          position: absolute; top: 10px; right: 10px;
          width: 20px; height: 20px; border-radius: 6px;
          background: #5b3fcf;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: scale(0.7);
          transition: opacity 0.18s, transform 0.18s;
        }
        .gp-domain-btn.active .gp-check { opacity: 1; transform: scale(1); }

        /* ---- GOAL SECTIONS ---- */
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

        /* ---- INFO BANNER ---- */
        .gp-info {
          display: flex; align-items: flex-start; gap: 11px;
          background: #f0ecff; border-radius: 14px; padding: 14px 16px;
          margin-bottom: 28px;
          animation: fadeUp 0.45s 0.2s cubic-bezier(0.22,1,0.36,1) both;
        }
        .gp-info-icon { color: #7c5cdb; flex-shrink: 0; margin-top: 1px; }
        .gp-info-text { font-size: 13.5px; color: #5a4a8a; line-height: 1.6; font-weight: 300; }

        /* ---- CTA ---- */
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
        <button className="gp-skip" onClick={() => router.push("/questions")}>Skip</button>

        <div className="gp-inner">
          <h1 className="gp-heading">
            Set your<br /><em>goals</em>
          </h1>
          <p className="gp-sub">
            Choose the areas you want to focus on<br />and add your goals with timelines.
          </p>

          {/* DOMAIN SELECTOR */}
          <p className="gp-section-label">Choose domains</p>
          <div className="gp-domains">
            {DOMAINS.map(({ key, label, icon }) => (
              <button
                key={key}
                className={`gp-domain-btn${domains[key] ? " active" : ""}`}
                onClick={() => toggleDomain(key)}
              >
                <span className="gp-domain-icon">{icon}</span>
                <span className="gp-domain-name">{label}</span>
                <span className="gp-check">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5"/>
                  </svg>
                </span>
              </button>
            ))}
          </div>

          {/* GOAL SECTIONS */}
          {DOMAINS.map(({ key, label, icon, placeholder }) =>
            domains[key] ? (
              <div className="gp-goal-section" key={key}>
                <div className="gp-goal-header">
                  <span className="gp-goal-header-icon">{icon}</span>
                  <span className="gp-goal-header-text">{label} goals</span>
                </div>

                <div className="gp-goal-list">
                  {goals[key].map((g, i) => (
                    <div className="gp-goal-row" key={i}>
                      <span className="gp-drag-handle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                          <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                          <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                        </svg>
                      </span>

                      <input
                        className="gp-goal-input"
                        placeholder={placeholder}
                        value={g.text}
                        onChange={e => handleChange(key, i, "text", e.target.value)}
                      />

                      <div className="gp-timeline-wrap">
                        <input
  type="number"
  min="1"
  className="gp-timeline-input"
  value={g.timeline}
  onChange={e =>
    handleChange(key, i, "timeline", Number(e.target.value))
  }
/>
                        <span className="gp-days-label">days</span>
                      </div>

                      <button
                        className="gp-remove-btn"
                        onClick={() => removeGoal(key, i)}
                        disabled={goals[key].length === 1}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}

                  <button className="gp-add-btn" onClick={() => addGoal(key)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add another goal
                  </button>
                </div>
              </div>
            ) : null
          )}

          {/* INFO BANNER */}
          <div className="gp-info">
            <span className="gp-info-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
            </span>
            <p className="gp-info-text">
              You can add multiple goals in each domain. We'll create a personalised plan for each of them.
            </p>
          </div>

          {/* CTA */}
          <button className="gp-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="gp-spinner" />
            ) : (
              <>
                Continue
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