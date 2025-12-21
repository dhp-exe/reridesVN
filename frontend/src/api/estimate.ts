const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function estimateRide(pickup: any, destination: any) {
  const response = await fetch(`${API_BASE}/api/estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pickup,
      destination,
    }),
  });

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return response.json();
}
