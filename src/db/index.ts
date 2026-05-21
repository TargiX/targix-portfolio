import "server-only";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const rawUrl = process.env.DATABASE_URL ?? "file:./local.db";
const isFileUrl = rawUrl.startsWith("file:");
const isProd = process.env.NODE_ENV === "production";

/** True when we have a remote DB we can actually write to.
 *  In prod, file:// URLs are useless (read-only serverless FS) — treat them as "not live".
 *  In dev, a local SQLite file is perfectly live. */
export const isLiveDatabase = !(isProd && isFileUrl);

const url = isLiveDatabase ? rawUrl : ":memory:";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };
