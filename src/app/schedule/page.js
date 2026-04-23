"use client";

import { useEffect, useState } from "react";
import { post } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

export default function Schedule() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawGoalId = searchParams.get("goalId");
  const goalId = rawGoalId ? Number(rawGoalId) : null; // ✅ CRITICAL FIX

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchScheduleQuestions() {
      if (!goalId) {
        alert("Missing goalId. Navigation broke.");
        return;
      }

      try {
        const res = await post("/generate-schedule-questions", {
          goalId
        });

        setQuestions(res.questions || []);
      } catch (err) {
        console.error("Schedule fetch error:", err);
        alert("Failed to load schedule questions");
      } finally {
        setLoading(false);
      }
    }

    fetchScheduleQuestions();
  }, [goalId]);

  const handleChange = (index, value) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (answers.filter(Boolean).length !== questions.length) {
      alert("Answer all questions");
      return;
    }

    if (!goalId) {
      alert("Invalid goalId");
      return;
    }

    setSubmitting(true);

    try {
      // ✅ Save schedule
      await post("/submit-schedule", {
        goalId,
        answers
      });

      // ✅ Generate plan AFTER schedule
      await post("/generate-plan");

      // ✅ Move to dashboard WITH goalId (important for today-task later)
      router.push(`/dashboard?goalId=${goalId}`);

    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong while saving schedule");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading schedule...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Set Your Schedule</h1>

      {questions.map((q, i) => (
        <div key={i}>
          <p>{q.question}</p>

          {q.options.map((opt, idx) => (
            <label key={idx} style={{ display: "block" }}>
              <input
                type="radio"
                name={`q-${i}`}
                checked={answers[i] === opt}
                onChange={() => handleChange(i, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}