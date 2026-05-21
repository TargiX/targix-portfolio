import { getRecentEntries } from "@/app/actions/guestbook";
import { GuestbookForm } from "@/components/forms/guestbook-form";
import { isLiveDatabase } from "@/db";

/** Server Component — fetches the latest entries on the server (RSC),
 *  then hands them as initial state to the client form for optimistic updates. */
export async function Guestbook() {
  const entries = await getRecentEntries(8);
  return (
    <div className="space-y-3">
      {!isLiveDatabase && (
        <div className="flex items-center gap-2 rounded-sm border border-dashed border-line bg-bg-2/30 px-3 py-1.5 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
          <span className="inline-block size-1.5 rounded-full bg-amber-400/70" />
          demo mode · DATABASE_URL not set — submissions accepted but not persisted
        </div>
      )}
      <GuestbookForm initial={entries} />
    </div>
  );
}
