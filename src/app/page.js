"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  const selectLanguage = (lang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_language", lang);
    }
    router.push("/onboarding");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lang-root {
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

        .lang-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .lang-blob-1 { width: 360px; height: 360px; background: #ede8ff; top: -80px; right: -80px; opacity: 0.6; }
        .lang-blob-2 { width: 280px; height: 280px; background: #fde8d8; bottom: -60px; left: -60px; opacity: 0.5; }

        .lang-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .lang-heading {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 9vw, 48px);
          font-weight: 400;
          line-height: 1.1;
          color: #1a1425;
          text-align: center;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }
        .lang-heading em {
          font-style: italic;
          color: #5b3fcf;
        }

        .lang-btn {
          width: 100%;
          padding: 17px 24px;
          background: #fff;
          color: #4f35b8;
          font-family: 'DM Sans', sans-serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.02em;
          border: 1.5px solid #e8e2f4;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, transform 0.15s, border-color 0.2s;
          animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lang-btn:nth-child(2) { animation-delay: 0.1s; }
        .lang-btn:nth-child(3) { animation-delay: 0.2s; }
        
        .lang-btn:hover {
          background: #f7f4ff;
          border-color: #7c5cdb;
          transform: translateY(-2px);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="lang-root">
        <div className="lang-blob lang-blob-1" />
        <div className="lang-blob lang-blob-2" />

        <div className="lang-card">
          <h1 className="lang-heading">Choose your <em>Language</em></h1>
          <button className="lang-btn" onClick={() => selectLanguage("English")}>English</button>
          <button className="lang-btn" onClick={() => selectLanguage("Hindi")}>हिंदी (Hindi)</button>
          <button className="lang-btn" onClick={() => selectLanguage("Marathi")}>मराठी (Marathi)</button>
        </div>
      </div>
    </>
  );
}