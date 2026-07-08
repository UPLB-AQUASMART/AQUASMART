import { NextResponse } from "next/server";

const DEFAULT_API_ORIGIN = "http://127.0.0.1:8000";

function getApiOrigins() {
  const configuredOrigins = [
    process.env.AQUASMART_API_URL ||
      process.env.NEXT_PUBLIC_AQUASMART_API_URL ||
      process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean) as string[];
  const origins =
    process.env.NODE_ENV === "development"
      ? [DEFAULT_API_ORIGIN, ...configuredOrigins]
      : [...configuredOrigins, DEFAULT_API_ORIGIN];
  return Array.from(new Set(origins));
}

export async function GET() {
  let lastError = "Unable to reach the AQUASMART Python API.";

  for (const apiOrigin of getApiOrigins()) {
    try {
      const response = await fetch(`${apiOrigin}/simulation/demo-scene`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (response.ok || response.status !== 404) {
        return NextResponse.json(payload, {
          status: response.status,
        });
      }
      lastError = `HTTP ${response.status} from ${apiOrigin}`;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error.message
          : "Unable to reach the AQUASMART Python API.";
    }
  }

  return NextResponse.json(
    {
      error: "Simulation backend unavailable",
      detail: lastError,
    },
    { status: 502 },
  );
}
