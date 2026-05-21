"use server";

import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { z } from "zod";

import { db, isLiveDatabase, schema } from "@/db";

const SignSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(40, "keep it under 40 chars"),
  message: z
    .string()
    .trim()
    .min(1, "say something")
    .max(240, "keep it under 240 chars"),
});

export type GuestbookFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "message", string>>;
  /** Bumped on success so the client can reset the form. */
  version: number;
};

const SLOW_FAKE_NETWORK_MS = process.env.NODE_ENV === "production" ? 0 : 250;

export async function signGuestbook(
  prev: GuestbookFormState,
  formData: FormData,
): Promise<GuestbookFormState> {
  const parsed = SignSchema.safeParse({
    name: formData.get("name"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: GuestbookFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "name" | "message" | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "fix the highlighted fields",
      fieldErrors,
      version: prev.version,
    };
  }

  if (SLOW_FAKE_NETWORK_MS) await new Promise((r) => setTimeout(r, SLOW_FAKE_NETWORK_MS));

  // Demo mode: no real DB configured. Pretend it worked so the UI still
  // demonstrates the optimistic flow without crashing.
  if (!isLiveDatabase) {
    console.warn(
      "[guestbook] DATABASE_URL not pointing at a remote DB — accepting submission without persistence.",
    );
    return { ok: true, version: prev.version + 1 };
  }

  try {
    await db.insert(schema.guestbook).values(parsed.data);
  } catch (err) {
    console.error("[guestbook] insert failed:", err);
    return {
      ok: false,
      error: "couldn't save that — try again in a sec",
      version: prev.version,
    };
  }

  revalidatePath("/", "page");

  return { ok: true, version: prev.version + 1 };
}

export async function getRecentEntries(limit = 8) {
  if (!isLiveDatabase) return [];
  try {
    return await db
      .select()
      .from(schema.guestbook)
      .orderBy(desc(schema.guestbook.createdAt))
      .limit(limit);
  } catch (err) {
    console.error("[guestbook] read failed:", err);
    return [];
  }
}
