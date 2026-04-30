const BASE_URL = "https://aatman-backend-9yq2.onrender.com";

export async function post(endpoint, data) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  return res.json();
}

export async function get(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  return res.json();
}