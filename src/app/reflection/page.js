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
    <div>
      <h1>Reflection</h1>

      {questions.map((q, i) => (
        <div key={i}>
          <p>{q}</p>
          <input
            value={answers[i] || ""}
            onChange={e => handleChange(i, e.target.value)}
          />
        </div>
      ))}

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}