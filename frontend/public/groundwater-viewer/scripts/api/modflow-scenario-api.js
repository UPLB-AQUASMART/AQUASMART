/*
  API helper for requesting MODFLOW/FloPy top-view scenario output.

  The first endpoint is the same-origin Next.js proxy. The localhost fallback
  keeps the standalone viewer usable when opened outside Next.js.
*/

export async function fetchScenarioTopView(config) {
  const apiCandidates = [
    "/api/simulation/top-view",
    "http://localhost:8000/simulation/top-view",
  ];
  for (const url of apiCandidates) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Scenario API unavailable at ${url}`, error);
    }
  }
  return null;
}

