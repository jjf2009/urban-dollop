import { constants } from "node:fs";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { EMPTY_STATE, normalizeState } from "@/lib/state";

// Touches the filesystem, so it must run on Node and never be prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "focusmode.json");

/** Serializes writes so two overlapping saves cannot interleave. */
let writeQueue: Promise<unknown> = Promise.resolve();

async function readState() {
  try {
    await access(DATA_FILE, constants.F_OK);
  } catch {
    return EMPTY_STATE;
  }
  try {
    return normalizeState(JSON.parse(await readFile(DATA_FILE, "utf8")));
  } catch {
    // Unreadable or malformed file: start clean rather than fail the request.
    return EMPTY_STATE;
  }
}

async function writeState(state: unknown) {
  await mkdir(DATA_DIR, { recursive: true });
  // Write to a sibling temp file then rename — rename is atomic on POSIX, so
  // a crash mid-write can never leave a half-written focusmode.json behind.
  const temp = `${DATA_FILE}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(normalizeState(state), null, 2)}\n`, "utf8");
  await rename(temp, DATA_FILE);
}

export async function GET() {
  return Response.json(await readState(), {
    headers: { "cache-control": "no-store" },
  });
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const next = normalizeState(body);
  writeQueue = writeQueue.then(() => writeState(next)).catch(() => {});
  try {
    await writeQueue;
  } catch {
    return Response.json({ error: "Could not write state" }, { status: 500 });
  }
  return Response.json(next, { headers: { "cache-control": "no-store" } });
}
