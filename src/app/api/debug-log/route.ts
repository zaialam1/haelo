import { appendFile, mkdir } from "node:fs/promises";
import { NextResponse } from "next/server";
import path from "node:path";

const LOG_PATH = path.join(
  process.cwd(),
  ".cursor",
  "debug-9e8ce3.log",
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await mkdir(path.dirname(LOG_PATH), { recursive: true });
    await appendFile(LOG_PATH, `${JSON.stringify(body)}\n`, "utf8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "fail" },
      { status: 500 },
    );
  }
}
