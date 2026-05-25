const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

function getHeaders() {
  const token = localStorage.getItem("inv_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get: (path) => fetch(`${BASE}${path}`, { headers: getHeaders() }).then(handle),
  post: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handle),
  put: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handle),
  del: (path) =>
    fetch(`${BASE}${path}`, { method: "DELETE", headers: getHeaders() }).then(handle),
};
