"use client";

import { useState } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";

const fields = [
  {
    key: "name",
    label: "What should I call you?",
    placeholder: "e.g., Diviya",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    key: "free_time",
    label: "How much free time daily?",
    placeholder: "e.g., 1 hour",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
  {
    key: "preferred_time",
    label: "When do you prefer to focus?",
    placeholder: "e.g., Evening",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.07 19.07l.71.71M3 12H2M22 12h-1M4.92 19.07l.71-.7M18.36 4.93l.71-.71"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
  },
  {
    key: "constraint",
    label: "Any constraints I should know?",
    placeholder: "e.g., College, Part-time job",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", free_time: "", preferred_time: "", constraint: "" });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await post("/onboarding", form);
    router.push("/goal");
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
          font-size: clamp(36px, 9vw, 48px);
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
        .ob-input-wrap.focused .ob-icon { color: #5b3fcf; }

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

        <button className="ob-skip" onClick={() => router.push("/goal")}>Skip</button>

        <div className="ob-card">
          <h1 className="ob-heading">
            Let's get to<br />know <em>you</em>
          </h1>
          <p className="ob-sub">
            This helps me create a plan<br />that fits perfectly for you.
          </p>

          <div className="ob-fields">
            {fields.map(({ key, label, placeholder, icon }) => (
              <div className="ob-field" key={key}>
                <label className="ob-label">{label}</label>
                <div className={`ob-input-wrap${focused === key ? " focused" : ""}`}>
                  <span className="ob-icon">{icon}</span>
                  <input
                    className="ob-input"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>
            ))}
          </div>

          <button className="ob-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="ob-spinner" />
            ) : (
              <>
                Continue
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