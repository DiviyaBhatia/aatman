"use client";

import { useEffect, useState } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";


export default function Reflection() {
  const router = useRouter();
const searchParams = useSearchParams();
const rawGoalId = searchParams.get("goalId");
const goalId = rawGoalId ? Number(rawGoalId) : null;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReflection() {
      try {
        const res = await post("/generate-reflection");
        setQuestions(res.questions || []);
      } catch (err) {
        console.error("Reflection fetch error:", err);
        alert("Failed to load reflection questions");
      } finally {
        setLoading(false);
      }
    }

    fetchReflection();
  }, []);

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
    await post("/evaluate-day", {
      goalId,
      answers
    });

    await post("/generate-plan");

    router.push(`/dashboard?goalId=${goalId}`);

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return <div>Loading reflection...</div>;
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
      `}</style>
      
      <div className="rf-root">
        <div className="rf-blob rf-blob-1" />
        <div className="rf-blob rf-blob-2" />

        <div className="rf-inner">
          <h1 className="rf-heading">Reflect on your <em>day</em></h1>

          <div className="rf-card">
            {questions.map((q, i) => (
              <div className="rf-q-block" key={i}>
                <p className="rf-q-text">{q}</p>
                <input
                  className="rf-input"
                  value={answers[i] || ""}
                  onChange={e => handleChange(i, e.target.value)}
                  placeholder="Type your thoughts..."
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rf-footer">
          <div className="rf-footer-inner">
            <button className="rf-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
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