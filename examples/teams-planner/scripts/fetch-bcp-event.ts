/**
 * fetch-bcp-event.ts — PRIVATE, local-only opponent-data acquisition for ATC prep.
 *
 * This is NOT part of the shipped teams-planner app. It pulls a Best Coast Pairings
 * (BCP) event's teams / players / army-lists into a sanitized JSON the app ingests.
 * BCP is aggressive about API limits, so every request is serialized, delayed, and
 * backed off; per-player list fetches are cached on disk so a re-run resumes instead
 * of re-hitting the API.
 *
 * Auth: pass the short-lived Bearer access token via env, never on the CLI:
 *   BCP_TOKEN=... node --experimental-strip-types scripts/fetch-bcp-event.ts <eventId>
 *
 * Probe first (ONE request) to confirm the response shape before a full pull:
 *   BCP_TOKEN=... node --experimental-strip-types scripts/fetch-bcp-event.ts --probe=event   <eventId>
 *   BCP_TOKEN=... node --experimental-strip-types scripts/fetch-bcp-event.ts --probe=players  <eventId>
 *   BCP_TOKEN=... node --experimental-strip-types scripts/fetch-bcp-event.ts --probe=teams    <eventId>
 *
 * Full pull (one or more events; cached output under .bcp/<eventId>.json):
 *   BCP_TOKEN=... node --experimental-strip-types scripts/fetch-bcp-event.ts <eventId> [<eventId>...] [--refresh]
 *
 * Tuning via env: BCP_DELAY_MS (default 1500), BCP_MAX_RETRIES (default 5).
 */

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = "https://newprod-api.bestcoastpairings.com/v1";
const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, "..", ".bcp");
const RAW_DIR = join(CACHE_DIR, "raw");

const DELAY_MS = Number(process.env.BCP_DELAY_MS ?? 1500);
const MAX_RETRIES = Number(process.env.BCP_MAX_RETRIES ?? 5);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function token(): string {
  const t = process.env.BCP_TOKEN;
  if (!t) {
    console.error("ERROR: set BCP_TOKEN env var to your BCP Bearer access token.");
    process.exit(1);
  }
  return t.trim();
}

function headers(): Record<string, string> {
  return {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    authorization: `Bearer ${token()}`,
    "client-id": "web-app",
    "content-type": "application/json",
    env: "bcp",
    origin: "https://www.bestcoastpairings.com",
    referer: "https://www.bestcoastpairings.com/",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
  };
}

let lastReqAt = 0;

/** Serialized, delayed, backed-off GET. Returns parsed JSON. */
async function api(path: string, params: Record<string, unknown> = {}): Promise<any> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const since = Date.now() - lastReqAt;
    if (since < DELAY_MS) await sleep(DELAY_MS - since);
    lastReqAt = Date.now();

    let res: Response;
    try {
      res = await fetch(url, { headers: headers() });
    } catch (err) {
      const backoff = Math.min(30_000, DELAY_MS * 2 ** attempt);
      console.error(`  network error on ${url.pathname} — backoff ${backoff}ms (attempt ${attempt + 1})`);
      await sleep(backoff);
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      // Auth failure (expired/invalid token), not a rate limit — abort the whole run
      // fast rather than backing off on every remaining request.
      const body = await res.text().catch(() => "");
      const err = new Error(`HTTP ${res.status} (auth) on ${url.pathname} — BCP_TOKEN is invalid or expired. ${body.slice(0, 200)}`);
      (err as any).auth = true;
      throw err;
    }
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : Math.min(60_000, DELAY_MS * 2 ** attempt);
      console.error(`  HTTP ${res.status} on ${url.pathname}${url.search} — backoff ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(backoff);
      continue;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} on ${url}\n${body.slice(0, 500)}`);
    }
    return res.json();
  }
  throw new Error(`exhausted ${MAX_RETRIES} retries on ${url}`);
}

/** Extract the row array from BCP's various envelopes. The /players endpoint
 *  returns { active: [...], deleted: [...] }; others use bare arrays or {data}. */
function rows(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.active)) return payload.active;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

// ── probe ─────────────────────────────────────────────────────────────────────

async function probe(kind: string, eventId: string): Promise<void> {
  let data: any;
  if (kind === "event") data = await api(`/events/${eventId}`);
  else if (kind === "players") data = await api(`/events/${eventId}/players`, { limit: 5, expand: "armyList" });
  else if (kind === "teams") data = await api(`/events/${eventId}/teams`, { limit: 5 });
  else {
    console.error(`unknown probe kind "${kind}" — use event | players | teams`);
    process.exit(1);
  }

  await mkdir(RAW_DIR, { recursive: true });
  const out = join(RAW_DIR, `probe-${kind}-${eventId}.json`);
  await writeFile(out, JSON.stringify(data, null, 2));

  console.log(JSON.stringify(data, null, 2).slice(0, 12_000));
  const r = rows(data);
  console.log("\n──────── SHAPE ────────");
  console.log("payload top-level:", Array.isArray(data) ? `array[${data.length}]` : Object.keys(data));
  if (r.length) {
    console.log(`row[0] keys:`, Object.keys(r[0]));
    // surface any field that plausibly holds list text
    for (const [k, v] of Object.entries(r[0])) {
      if (typeof v === "string" && v.length > 80) console.log(`  long-string field "${k}" (${v.length} chars)`);
    }
  }
  console.log(`\nraw written → ${out}`);
}

// ── full pull (shape confirmed/adjusted after probe) ────────────────────────────

interface OutPlayer { id: string; name: string; faction: string | null; armyListText: string | null }
interface OutTeam { id: string; name: string; players: OutPlayer[] }
interface OutEvent { event: { id: string; name: string | null; teamEvent: boolean }; teams: OutTeam[] }

/** Fetch all active players. The endpoint respects `limit` but exposes no cursor,
 *  so we request a limit well above any team-event headcount and read `active`. */
async function fetchPlayers(eventId: string): Promise<any[]> {
  const LIMIT = 1000;
  const payload = await api(`/events/${eventId}/players`, { limit: LIMIT });
  const active = rows(payload);
  if (active.length >= LIMIT) {
    console.error(`  WARNING: got ${active.length} players == limit; the event may have more (no cursor available).`);
  }
  return active;
}

function playerName(p: any): string {
  if (p.user) return `${p.user.firstName ?? ""} ${p.user.lastName ?? ""}`.trim() || "—";
  if (typeof p.name === "string" && p.name.trim()) return p.name.trim();
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "—";
}

async function pullEvent(eventId: string, refresh: boolean): Promise<void> {
  const outPath = join(CACHE_DIR, `${eventId}.json`);
  if (existsSync(outPath) && !refresh) {
    console.log(`✓ ${eventId} already cached at ${outPath} (use --refresh to re-pull)`);
    return;
  }
  await mkdir(RAW_DIR, { recursive: true });

  console.log(`event ${eventId}: fetching metadata…`);
  const ev = await api(`/events/${eventId}`);
  const teamEvent = Boolean(ev?.teamEvent ?? ev?.isTeamEvent ?? ev?.teamGame);

  console.log(`event ${eventId}: fetching players…`);
  const players = await fetchPlayers(eventId);
  console.log(`  ${players.length} active players`);

  // Resumable army-list fetch, keyed and cached by listId (one /armylists/<id> each).
  const listCache = join(RAW_DIR, `lists-${eventId}.json`);
  const cachedLists: Record<string, string> = existsSync(listCache)
    ? JSON.parse(await readFile(listCache, "utf8"))
    : {};

  const withListId = players.filter((p) => p.listId);
  const needFetch = withListId.filter((p) => !cachedLists[p.listId]);
  console.log(
    `event ${eventId}: ${withListId.length}/${players.length} players have a list; ` +
      `${needFetch.length} to fetch, ${withListId.length - needFetch.length} already cached.`,
  );
  for (let i = 0; i < needFetch.length; i++) {
    const listId = needFetch[i].listId as string;
    try {
      const lp = await api(`/armylists/${listId}`);
      const txt: string | undefined = lp?.armyListText;
      if (txt) cachedLists[listId] = txt;
      else console.error(`  list ${listId} returned no armyListText (keys: ${Object.keys(lp ?? {}).join(",")})`);
    } catch (err) {
      if ((err as any).auth) {
        await writeFile(listCache, JSON.stringify(cachedLists, null, 2));
        console.error(`\n  ABORTING: ${(err as Error).message}`);
        console.error(`  ${i} lists cached so far — re-run with a fresh BCP_TOKEN to resume.`);
        throw err;
      }
      console.error(`  list fetch failed for ${listId}: ${(err as Error).message.split("\n")[0]}`);
    }
    if ((i + 1) % 10 === 0 || i === needFetch.length - 1) {
      await writeFile(listCache, JSON.stringify(cachedLists, null, 2));
      console.log(`  …${i + 1}/${needFetch.length} lists (cache flushed)`);
    }
  }

  // Group players by their real TEAM. The authoritative key is `teamId` (the team
  // entity id; `team.name` is 1:1 with it across the corpus). NOT `teamPlayerId` —
  // despite the field name, that is a per-round *pairing pod* id: BCP reuses one
  // value for the ~8 players seated against each other in a round, drawn from
  // several DIFFERENT teams. Keying on it buckets opponents together and names the
  // bucket after whichever member sorts first — which is exactly how "Warp Dust
  // Crusaders" players ended up filed under "Hunter Killers". Only when a player
  // carries no teamId at all (BCP team-record gaps) do we fall back to their pod,
  // then a solo bucket, so orphans group with their pod-mates instead of vanishing.
  const teamKey = (p: any): string =>
    String(p.teamId ?? p.team?.id ?? (p.teamPlayerId ? `pod:${p.teamPlayerId}` : `solo:${p.id}`));

  // Pass 1: a display name per team key — the first non-empty team.name in the
  // group (some members' rows omit it; a teammate's fills the gap).
  const teamNames = new Map<string, string>();
  for (const p of players) {
    const k = teamKey(p);
    const nm = p.team?.name ?? p.teamName;
    if (nm && !teamNames.has(k)) teamNames.set(k, nm);
  }
  // A handful of orgs field A/B teams under the same display name but distinct
  // teamIds (e.g. "Georgia Warlords"). Suffix the duplicates with a short id so two
  // genuinely-different teams don't render identically in the matrix.
  const nameUses = new Map<string, number>();
  for (const nm of teamNames.values()) nameUses.set(nm, (nameUses.get(nm) ?? 0) + 1);
  const labelFor = (key: string): string => {
    const nm = teamNames.get(key);
    if (nm) return (nameUses.get(nm) ?? 0) > 1 ? `${nm} (${key.slice(0, 4)})` : nm;
    if (key.startsWith("pod:")) return `Unrostered pod ${key.slice(4, 10)}`;
    return `Unrostered ${key.slice(5, 11)}`;
  };

  // Pass 2: bucket.
  const byTeam = new Map<string, OutTeam>();
  for (const p of players) {
    const tid = teamKey(p);
    if (!byTeam.has(tid)) byTeam.set(tid, { id: tid, name: labelFor(tid), players: [] });
    byTeam.get(tid)!.players.push({
      id: String(p.id ?? p.userId ?? p.listId),
      name: playerName(p),
      faction: p.faction?.name ?? p.subFaction?.name ?? p.army ?? null,
      armyListText: p.listId ? cachedLists[p.listId] ?? null : null,
    });
  }
  for (const t of byTeam.values()) t.players.sort((a, b) => a.name.localeCompare(b.name));

  const out: OutEvent = {
    event: { id: eventId, name: ev?.name ?? ev?.eventName ?? null, teamEvent },
    teams: [...byTeam.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
  await writeFile(outPath, JSON.stringify(out, null, 2));

  // Surface data anomalies instead of shipping them silently (a scrambled grouping
  // used to pass without a peep). None of these abort the pull — they're prompts to
  // eyeball the affected teams.
  const orphanTeams = out.teams.filter((t) => t.id.startsWith("pod:") || t.id.startsWith("solo:"));
  const orphanPlayers = orphanTeams.reduce((n, t) => n + t.players.length, 0);
  if (orphanPlayers) {
    console.error(
      `  NOTE: ${orphanPlayers} player(s) had no teamId; grouped by pairing pod / solo into ${orphanTeams.length} "Unrostered" bucket(s).`,
    );
  }
  const dupNames = [...nameUses].filter(([, n]) => n > 1).map(([n]) => n);
  if (dupNames.length) {
    console.error(`  NOTE: shared team name(s) across distinct teamIds, id-suffixed: ${dupNames.join(", ")}`);
  }
  const oversized = out.teams.filter((t) => t.players.length > 8);
  if (oversized.length) {
    console.error(
      `  NOTE: ${oversized.length} team(s) exceed 8 players (reserves / merged registration): ` +
        oversized.map((t) => `${t.name}=${t.players.length}`).join(", "),
    );
  }

  const withLists = out.teams.flatMap((t) => t.players).filter((p) => p.armyListText).length;
  console.log(`✓ wrote ${outPath}: ${out.teams.length} teams, ${players.length} players, ${withLists} with list text`);
}

// ── entry ───────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const probeArg = args.find((a) => a.startsWith("--probe"));
  const refresh = args.includes("--refresh");
  const ids = args.filter((a) => !a.startsWith("--"));

  if (probeArg) {
    const kind = probeArg.includes("=") ? probeArg.split("=")[1] : "event";
    if (!ids[0]) { console.error("probe needs an <eventId>"); process.exit(1); }
    await probe(kind, ids[0]);
    return;
  }

  if (!ids.length) {
    console.error("usage: fetch-bcp-event.ts [--probe=event|players|teams] <eventId> [<eventId>...] [--refresh]");
    process.exit(1);
  }
  for (const id of ids) await pullEvent(id, refresh);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
