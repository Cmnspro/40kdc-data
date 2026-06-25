/**
 * The committed, sanitized ATC 2026 event snapshot (BCP-pull shape, no tokens),
 * validated into the shared OpponentData model. The lists are already public on
 * BCP; this snapshot keeps only name / faction / list text.
 */
import { loadOpponents, type OpponentData } from "../../../_shared/opponents";
import raw from "../data/atc-2026.json";

export const atcData: OpponentData =
  loadOpponents(raw) ?? { event: { id: "", name: null, teamEvent: true }, teams: [] };
