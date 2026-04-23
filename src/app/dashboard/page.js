"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Read goalId from URL and convert to number
  const rawGoalId = searchParams.get("goalId");
  const goalId = rawGoalId ? Number(rawGoalId) : null;

const [tasks, setTasks] = useState([]);  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTask() {
      if (!goalId) {
        alert("Missing goalId. Something broke in navigation.");
        return;
      }

      try {
        // ✅ Send goalId to backend
        const res = await get(`/today-task`);
setTasks(res.tasks || []);     } catch (err) {
        console.error("Error fetching task:", err);
        alert("Failed to load today's task");
      } finally {
        setLoading(false);
      }
    }

    fetchTask();
  }, [goalId]);

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
        .db-heading em { font-style: italic; color: #5b3fcf; }
        .db-task-card { background: #fff; border: 1.5px solid #e8e2f4; border-radius: 20px; padding: 20px; margin-bottom: 16px; animation: fadeUp 0.45s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .db-domain-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 99px; background: #ede8ff; color: #5b3fcf; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: capitalize; }
        .db-task-goal { font-size: 13px; font-weight: 500; color: #7c5cdb; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .db-task-title { font-size: 18px; font-weight: 500; color: #1a1425; margin-bottom: 12px; line-height: 1.4; letter-spacing: -0.01em; }
        .db-task-meta { display: flex; gap: 12px; }
        .db-meta-pill { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f7f4ff; border-radius: 10px; font-size: 13px; color: #5a4a8a; font-weight: 400; }
        .db-empty { text-align: center; font-size: 15px; color: #8a8099; padding: 40px 0; animation: fadeUp 0.45s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .db-btn { width: 100%; padding: 17px 24px; background: #4f35b8; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; letter-spacing: 0.02em; border: none; border-radius: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(79,53,184,0.28); margin-top: 32px; animation: fadeUp 0.45s 0.2s cubic-bezier(0.22,1,0.36,1) both; }
        .db-btn:hover { background: #3f28a0; box-shadow: 0 6px 28px rgba(79,53,184,0.36); transform: translateY(-1px); }
        .db-btn:active { transform: translateY(0); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="db-root">
        <div className="db-blob db-blob-1" />
        <div className="db-blob db-blob-2" />
        
        <div className="db-inner">
          <h1 className="db-heading">Today's <em>Tasks</em></h1>

          {loading ? (
            <div className="db-empty">Loading tasks...</div>
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
                    <span className="db-task-goal" style={{ marginBottom: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                      {t.goal}
                    </span>
                  </div>
                  <div className="db-task-title">{t.task}</div>
                  <div className="db-task-meta">
                    <span className="db-meta-pill">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {t.time_minutes} mins
                    </span>
                    <span className="db-meta-pill">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {t.suggested_time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="db-empty">No tasks available today. Take a break!</div>
          )}

          <button className="db-btn" onClick={() => router.push(`/reflection?goalId=${goalId}`)}>
            End Day
            <span style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}