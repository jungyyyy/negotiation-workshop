import type { PointsTable } from "./scenarios";
import { pointsFor, type FullScenario } from "./scenarioSecrets";
import type { FrontierDeal, Round, Scores } from "./types";

/** Every combination of options, with both sides' points. */
export function allDeals(table: PointsTable): FrontierDeal[] {
  let combos: Record<string, string>[] = [{}];
  for (const issue of table.issues) {
    const next: Record<string, string>[] = [];
    for (const c of combos) for (const o of issue.options) next.push({ ...c, [issue.key]: o.value });
    combos = next;
  }
  return combos.map((deal) => {
    const seller = pointsFor(table, deal, "seller") ?? 0;
    const buyer = pointsFor(table, deal, "buyer") ?? 0;
    return { deal, seller, buyer, joint: seller + buyer };
  });
}

/** Deals no other deal dominates (weakly better for both, strictly for one). */
export function paretoFrontier(deals: FrontierDeal[]): FrontierDeal[] {
  return deals.filter(
    (d) =>
      !deals.some(
        (o) => o !== d && o.seller >= d.seller && o.buyer >= d.buyer && (o.seller > d.seller || o.buyer > d.buyer),
      ),
  );
}

export function maxJointPoints(table: PointsTable): number {
  return Math.max(...allDeals(table).map((d) => d.joint));
}

export function computeScores(scenario: FullScenario, round: Round): Scores | undefined {
  const deal = round.deal ?? {};
  const noDeal = !!round.noDeal;

  if (scenario.kind === "single" && scenario.single) {
    const { sellerRv, buyerRv, unit } = scenario.single;
    const price = !noDeal && typeof deal.price === "number" ? deal.price : null;
    const width = buyerRv - sellerRv;
    return {
      kind: "single",
      unit,
      sellerRv,
      buyerRv,
      price,
      inZopa: price != null && price >= sellerRv && price <= buyerRv,
      sellerShare: price != null ? (price - sellerRv) / width : null,
      buyerShare: price != null ? (buyerRv - price) / width : null,
    };
  }

  if (scenario.kind === "points" && scenario.points) {
    const table = scenario.points;
    const deals = allDeals(table);
    const maxJoint = Math.max(...deals.map((d) => d.joint));
    const frontier = paretoFrontier(deals)
      .filter((d) => d.seller >= table.sellerBatna && d.buyer >= table.buyerBatna)
      .sort((a, b) => b.seller - a.seller);
    const seller = noDeal ? null : pointsFor(table, deal, "seller");
    const buyer = noDeal ? null : pointsFor(table, deal, "buyer");
    const joint = seller != null && buyer != null ? seller + buyer : null;
    const onFrontier =
      seller != null && buyer != null && frontier.some((f) => f.seller === seller && f.buyer === buyer);
    const improvements =
      seller != null && buyer != null && joint != null
        ? frontier.filter((f) => f.seller >= seller && f.buyer >= buyer && f.joint > joint)
        : [];
    return {
      kind: "points",
      seller,
      buyer,
      joint,
      maxJoint,
      leftOnTable: joint != null ? maxJoint - joint : null,
      sellerBatna: table.sellerBatna,
      buyerBatna: table.buyerBatna,
      beatsBatna: seller != null && buyer != null ? { seller: seller >= table.sellerBatna, buyer: buyer >= table.buyerBatna } : null,
      onFrontier,
      frontier,
      improvements,
    };
  }

  if (scenario.kind === "investigation") {
    const minutes =
      round.startedAt && round.submittedAt ? Math.round(((round.submittedAt - round.startedAt) / 60_000) * 10) / 10 : null;
    return {
      kind: "investigation",
      found: deal.found === true,
      minutes,
      question: typeof deal.question === "string" ? deal.question : "",
      concessions: typeof deal.concessions === "string" ? deal.concessions : "",
    };
  }

  if (scenario.kind === "drill") {
    const penalty = typeof deal.penalty === "number" ? deal.penalty : null;
    const bonus = deal.bonus === true;
    return { kind: "drill", penalty, bonus, bestAnswer: bonus && penalty != null && penalty >= 500 };
  }

  return undefined;
}
