"use client";

import { useState, useEffect } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function GoalDetails() {
  const router = useRouter();

  const [domains, setDomains] = useState([]);
  const [goals, setGoals] = useState({});
  const [timeline, setTimeline] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("domains")) || [];
    setDomains(stored);
  }, []);

  const handleChange = (domain, value) => {
    setGoals({ ...goals, [domain]: value });
  };

  const handleSubmit = async () => {
    for (let d of domains) {
      await post("/start-goal", {
        goal: goals[d],
        timeline,
        domain: d
      });
    }

    router.push("/questions");
  };

  return (
    <div>
      <h1>Set Your Goals</h1>

      {domains.includes("knowledge") && (
        <div>
          <p>Knowledge Goal</p>
          <input onChange={e => handleChange("knowledge", e.target.value)} />
        </div>
      )}

      {domains.includes("fitness") && (
        <div>
          <p>Fitness Goal</p>
          <input onChange={e => handleChange("fitness", e.target.value)} />
        </div>
      )}

      <input
        placeholder="Timeline (days)"
        onChange={e => setTimeline(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Continue
      </button>
    </div>
  );
}