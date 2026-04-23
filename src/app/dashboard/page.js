"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

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
  <div>
    <h1>Today’s Tasks</h1>

    {loading ? (
      <p>Loading...</p>
    ) : tasks && tasks.length > 0 ? (
      <div>
        {tasks.map((t, i) => (
          <div key={i} style={{ marginBottom: "20px" }}>
            <p><b>{t.goal}</b></p>
            <p>{t.task}</p>
            <p>{t.time_minutes} mins</p>
            <p>{t.suggested_time}</p>
          </div>
        ))}
      </div>
    ) : (
      <p>No tasks available</p>
    )}

    <button onClick={() => router.push(`/reflection?goalId=${goalId}`)}>
      End Day
    </button>
  </div>
);
}