import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

import { createR2Client, getR2BucketName } from "@/lib/r2";

const DEFAULT_CONTENT_TYPE = "application/octet-stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing file key." }, { status: 400 });
  }

  try {
    const r2 = createR2Client();
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: getR2BucketName(),
        Key: key,
      }),
    );

    if (!object.Body) {
      return NextResponse.json({ error: "File has no body." }, { status: 404 });
    }

    return new NextResponse(object.Body.transformToWebStream(), {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${encodeURIComponent(key.split("/").at(-1) ?? "module-file")}"`,
        "Content-Type": object.ContentType ?? DEFAULT_CONTENT_TYPE,
      },
    });
  } catch (error) {
    console.error("Unable to load module file from R2:", error);
    return NextResponse.json(
      { error: "Unable to load module file." },
      { status: 502 },
    );
  }
}
