/**
 * The committed, sanitized ATC event snapshots (event-pull shape, no tokens),
 * validated into the shared OpponentData model. Each keeps name / faction / list
 * text plus, for a concluded event, team standings. Two variants ship: the
 * 8-player event (`8s`, the default) and the 5-player event (`5s`); the viewer
 * toggles between them.
 */
import { loadOpponents, type OpponentData } from "../../../_shared/opponents";
import raw8s from "../data/atc-2026.json";
import raw5s from "../data/atc-5s.json";

const EMPTY: OpponentData = { event: { id: "", name: null, teamEvent: true }, teams: [] };

export type AtcVariant = "8s" | "5s";
export const ATC_VARIANTS: AtcVariant[] = ["8s", "5s"];

export const atcByVariant: Record<AtcVariant, OpponentData> = {
  "8s": loadOpponents(raw8s) ?? EMPTY,
  "5s": loadOpponents(raw5s) ?? EMPTY,
};
