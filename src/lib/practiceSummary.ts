import type { PracticeRound } from "./types";

/** One-line score summary for lists and the personal page. */
export function practiceSummary(pr: PracticeRound): string {
  const s = pr.scores;
  if (pr.status !== "revealed") return pr.status === "prep" ? "prep form open" : `${pr.messages.length} messages so far`;
  if (!s) return "no score";
  if (s.kind === "single") {
    if (s.price == null) return "no deal";
    const mine = pr.side === "seller" ? s.sellerShare : s.buyerShare;
    return `€${s.price} · your share ${Math.round((mine ?? 0) * 100)}%${s.inZopa ? "" : " · outside ZOPA"}`;
  }
  if (s.kind === "points") {
    if (s.joint == null) return "no deal";
    const mine = pr.side === "seller" ? s.seller : s.buyer;
    return `${mine} pts · joint ${s.joint}/${s.maxJoint}${s.onFrontier ? " · efficient" : ""}`;
  }
  if (s.kind === "investigation") return s.found ? `found the interest${s.minutes != null ? ` in ${s.minutes} min` : ""}` : "did not find the interest";
  return s.bestAnswer ? "turned the demand into a trade" : "did not trade";
}
