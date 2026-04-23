"use client";

import { useEffect, useState } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";

const DOMAIN_ICONS = {
  knowledge: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  fitness: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M3 10h18M3 14h18"/>
      <rect x="1" y="8" width="3" height="8" rx="1.5"/>
      <rect x="20" y="8" width="3" height="8" rx="1.5"/>
    </svg>
  ),
};

export default function Questions() {
  const router = useRouter();
  const [goalsData, setGoalsData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const res = await post("/generate-questions");
      setGoalsData(res.data || []);
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  const handleChange = (goalId, index, value) => {
    setAnswers(prev => {
      const updated = [...(prev[goalId] || [])];
      updated[index] = value;
      return { ...prev, [goalId]: updated };
    });
  };

  const currentGoal = goalsData[currentGoalIndex];
  const isLastGoal = currentGoalIndex === goalsData.length - 1;
  const isFirstGoal = currentGoalIndex === 0;
  const progress = goalsData.length
    ? Math.round(((currentGoalIndex + 1) / goalsData.length) * 100)
    : 0;

  const currentAnswers = currentGoal ? (answers[currentGoal.goalId] || []) : [];
  const allCurrentAnswered = currentGoal
    ? currentAnswers.filter(Boolean).length === currentGoal.questions.length
    : false;

  const handleNext = () => {
    if (!allCurrentAnswered) {
      alert("Please answer all questions before continuing.");
      return;
    }
    setCurrentGoalIndex(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentGoalIndex(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
  if (!allCurrentAnswered) {
    alert("Please answer all questions before continuing.");
    return;
  }

  setSubmitting(true);

  // ✅ faster parallel calls
  await Promise.all(
    goalsData.map(goal =>
      post("/submit-answers", {
        goalId: goal.goalId,
        answers: answers[goal.goalId] || [],
      })
    )
  );

  // ❌ REMOVE THIS (WRONG STEP)
  // await post("/generate-plan");

  // ✅ move to schedule WITH goalId
  router.push(`/schedule?goalId=${goalsData[0].goalId}`);
};

  // ── LOADING ──
  if (loading || !goalsData.length) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .ld-root {
            min-height: 100dvh; display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 16px;
            background: #faf8f5; font-family: 'DM Sans', sans-serif;
          }
          .ld-ring {
            width: 38px; height: 38px;
            border: 2.5px solid #ede8ff; border-top-color: #5b3fcf;
            border-radius: 50%; animation: spin 0.8s linear infinite;
          }
          .ld-text { font-size: 15px; color: #9b8ecf; font-weight: 300; letter-spacing: 0.02em; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="ld-root">
          <div className="ld-ring" />
          <p className="ld-text">Crafting your questions…</p>
        </div>
      </>
    );
  }

  // ── MAIN ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .qs-root {
          min-height: 100dvh;
          background: #faf8f5;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding-bottom: 110px;
        }

        .qs-blob {
          position: fixed; border-radius: 50%;
          filter: blur(90px); pointer-events: none; z-index: 0;
        }
        .qs-blob-1 { width: 380px; height: 380px; background: #ede8ff; top: -100px; right: -100px; opacity: 0.5; }
        .qs-blob-2 { width: 300px; height: 300px; background: #fde8d8; bottom: 60px; left: -80px; opacity: 0.4; }

        .qs-header {
          position: sticky; top: 0; z-index: 10;
          background: rgba(250,248,245,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid #f0eaf8;
          padding: 16px 24px 14px;
        }
        .qs-header-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .qs-header-title {
          font-family: 'Instrument Serif', serif;
          font-size: 19px; font-weight: 400; color: #1a1425;
          letter-spacing: -0.01em;
        }
        .qs-header-title em { font-style: italic; color: #5b3fcf; }
        .qs-step-label {
          font-size: 12px; color: #b0a5cc; font-weight: 400; letter-spacing: 0.04em;
        }
        .qs-progress-track {
          width: 100%; height: 4px; background: #ede8ff;
          border-radius: 99px; overflow: hidden;
        }
        .qs-progress-fill {
          height: 100%; background: #5b3fcf; border-radius: 99px;
          transition: width 0.45s cubic-bezier(0.22,1,0.36,1);
        }

        .qs-inner {
          position: relative; z-index: 1;
          max-width: 540px; margin: 0 auto;
          padding: 32px 24px 0;
        }

        .qs-goal-meta {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          margin-bottom: 20px;
          animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .qs-domain-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 99px;
          background: #ede8ff; color: #5b3fcf;
          font-size: 12px; font-weight: 500; letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .qs-goal-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px; font-weight: 400; color: #1a1425;
          letter-spacing: -0.015em; line-height: 1.2;
        }
        .qs-goal-title em { font-style: italic; color: #5b3fcf; }

        .qs-card {
          background: #fff; border: 1.5px solid #e8e2f4;
          border-radius: 20px; overflow: hidden;
          animation: fadeUp 0.45s 0.06s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .qs-q-block {
          padding: 20px;
          border-bottom: 1px solid #f5f0fc;
        }
        .qs-q-block:last-child { border-bottom: none; }

        .qs-q-num {
          font-size: 11px; font-weight: 500; letter-spacing: 0.09em;
          color: #c4b8ef; text-transform: uppercase; margin-bottom: 6px;
        }
        .qs-q-text {
          font-size: 15px; font-weight: 500; color: #1a1425;
          line-height: 1.5; margin-bottom: 14px; letter-spacing: -0.005em;
        }

        .qs-options { display: flex; flex-direction: column; gap: 8px; }

        .qs-option {
          display: flex; align-items: center; gap: 11px;
          padding: 12px 14px; border-radius: 12px;
          border: 1.5px solid #ece6f8; cursor: pointer;
          background: #fdfcff;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          user-select: none;
        }
        .qs-option:hover { border-color: #c4b8ef; background: #f9f6ff; }
        .qs-option.selected {
          border-color: #7c5cdb; background: #f3efff;
          box-shadow: 0 0 0 3px rgba(92,63,207,0.08);
        }
        .qs-option input[type="radio"] { display: none; }

        .qs-radio {
          width: 18px; height: 18px; border-radius: 50%;
          border: 1.8px solid #d4cce8; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.18s, background 0.18s;
          background: #fff;
        }
        .qs-option.selected .qs-radio { border-color: #5b3fcf; background: #5b3fcf; }
        .qs-radio-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #fff; opacity: 0; transition: opacity 0.15s;
        }
        .qs-option.selected .qs-radio-dot { opacity: 1; }

        .qs-opt-text {
          font-size: 14px; font-weight: 300; color: #3d3050; line-height: 1.5;
        }
        .qs-option.selected .qs-opt-text { color: #1a1425; font-weight: 400; }

        .qs-input { width: 100%; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 300; color: #1a1425; background: #f7f4ff; border: 1px solid #ebe5f8; border-radius: 12px; padding: 14px 16px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none; }
        .qs-input:focus { border-color: #7c5cdb; box-shadow: 0 0 0 3px rgba(92,63,207,0.09); }

        .qs-footer {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 10;
          padding: 14px 24px 28px;
          background: rgba(250,248,245,0.95);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-top: 1px solid #f0eaf8;
        }
        .qs-footer-inner {
          max-width: 540px; margin: 0 auto;
          display: flex; gap: 10px;
        }

        .qs-btn-back {
          padding: 17px 20px;
          background: #fff; color: #5b3fcf;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          border: 1.5px solid #d4cce8; border-radius: 14px; cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          transition: border-color 0.2s, background 0.2s;
          white-space: nowrap; flex-shrink: 0;
        }
        .qs-btn-back:hover { border-color: #7c5cdb; background: #f7f4ff; }

        .qs-btn-primary {
          flex: 1; padding: 17px 24px;
          background: #4f35b8; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500;
          letter-spacing: 0.02em; border: none; border-radius: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 4px 20px rgba(79,53,184,0.28);
        }
        .qs-btn-primary:hover:not(:disabled) {
          background: #3f28a0; box-shadow: 0 6px 28px rgba(79,53,184,0.36);
          transform: translateY(-1px);
        }
        .qs-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .qs-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .qs-btn-arrow {
          width: 22px; height: 22px; background: rgba(255,255,255,0.18);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .qs-spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="qs-root">
        <div className="qs-blob qs-blob-1" />
        <div className="qs-blob qs-blob-2" />

        {/* STICKY HEADER */}
        <div className="qs-header">
          <div className="qs-header-row">
            <span className="qs-header-title">Your <em>questions</em></span>
            <span className="qs-step-label">Goal {currentGoalIndex + 1} of {goalsData.length}</span>
          </div>
          <div className="qs-progress-track">
            <div className="qs-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* CONTENT — one goal at a time */}
        <div className="qs-inner">
          <div className="qs-goal-meta">
            {currentGoal.domain ? (
              <span className="qs-domain-pill">
                {DOMAIN_ICONS[currentGoal.domain] ?? null}
                {currentGoal.domain}
              </span>
            ) : null}
            <span className="qs-goal-title">{currentGoal.goal || "Your Goal"}</span>
          </div>

          <div className="qs-card">
            {currentGoal.questions.map((q, i) => {
              const selected = currentAnswers[i];
              const isString = typeof q === 'string';
              const questionText = isString ? q : q.question;
              const options = isString ? [] : (q.options || []);

              return (
                <div className="qs-q-block" key={i}>
                  <p className="qs-q-num">Question {i + 1}</p>
                  <p className="qs-q-text">{questionText}</p>
                  
                  {isString || options.length === 0 ? (
                    <input
                      className="qs-input"
                      value={selected || ""}
                      onChange={(e) => handleChange(currentGoal.goalId, i, e.target.value)}
                      placeholder="Type your answer..."
                    />
                  ) : (
                    <div className="qs-options">
                      {options.map((opt, idx) => (
                        <label
                          key={idx}
                          className={`qs-option${selected === opt ? " selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`${currentGoal.goalId}-${i}`}
                            checked={selected === opt}
                            onChange={() => handleChange(currentGoal.goalId, i, opt)}
                          />
                          <span className="qs-radio">
                            <span className="qs-radio-dot" />
                          </span>
                          <span className="qs-opt-text">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STICKY FOOTER — Back / Next / Generate */}
        <div className="qs-footer">
          <div className="qs-footer-inner">
            {!isFirstGoal && (
              <button className="qs-btn-back" onClick={handleBack}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            )}

            {!isLastGoal ? (
              <button
                className="qs-btn-primary"
                onClick={handleNext}
                disabled={!allCurrentAnswered}
              >
                Next goal
                <span className="qs-btn-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </button>
            ) : (
              <button
                className="qs-btn-primary"
                onClick={handleSubmit}
                disabled={submitting || !allCurrentAnswered}
              >
                {submitting ? (
                  <div className="qs-spinner" />
                ) : (
                  <>
                    Generate my plan
                    <span className="qs-btn-arrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}