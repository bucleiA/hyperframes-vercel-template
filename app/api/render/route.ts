import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
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

    const blob = await put("renders/render.mp4", mp4, {
      access: "public",
      contentType: "video/mp4",
      addRandomSuffix: true,
      allowOverwrite: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[/api/render] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Render failed" },
      { status: 500 },
    );
  }
}
