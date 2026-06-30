import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_API_ORIGIN = "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const scenario = await request.json();
  const apiOrigin =
    process.env.AQUASMART_API_URL ||
    process.env.NEXT_PUBLIC_AQUASMART_API_URL ||
    DEFAULT_API_ORIGIN;

  try {
    const response = await fetch(`${apiOrigin}/simulation/top-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scenario),
      cache: "no-store",
    });

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "MODFLOW backend unavailable",
        detail:
          error instanceof Error
            ? error.message
            : "Unable to reach the AQUASMART Python API.",
      },
      { status: 502 },
    );
  }
}
