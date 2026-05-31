import { NextResponse } from "next/server";
import { renderInSandbox } from "@/lib/sandbox";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { html } = (await req.json()) as { html: string };
    if (!html) {
      return NextResponse.json({ error: "Missing html field in request body" }, { status: 400 });
    }
    const files = [{ rel: "index.html", content: Buffer.from(html) }];
    const { mp4 } = await renderInSandbox(files);

    // Return raw binary — caller handles storage (avoids Vercel Blob store config)
    return new Response(mp4, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": mp4.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[/api/render] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Render failed" },
      { status: 500 },
    );
  }
}
