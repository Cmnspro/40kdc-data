/**
 * The committed, sanitized ATC 2026 event snapshot (event-pull shape, no tokens),
 * validated into the shared OpponentData model. The snapshot keeps only name /
 * faction / list text.
 */
import { loadOpponents, type OpponentData } from "../../../_shared/opponents";
import raw from "../data/atc-2026.json";

export const atcData: OpponentData =
  loadOpponents(raw) ?? { event: { id: "", name: null, teamEvent: true }, teams: [] };
