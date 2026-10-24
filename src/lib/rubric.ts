export interface RubricItem {
  id: string;
  short: string;
  text: string;
  /** How a score of 0 reads in a list of mistakes. */
  miss: string;
  /** Only scored in multi-issue rounds. */
  multiIssueOnly?: boolean;
  /** Pre-filled from the prep form. */
  autoFromPrep?: boolean;
}

export const RUBRIC: RubricItem[] = [
  { id: "prep", short: "Prepared", text: "Prepared BATNA and reservation value before starting", miss: "Started without a written BATNA and reservation value", autoFromPrep: true },
  { id: "firstOffer", short: "First offer", text: "First offer had a justification, or deliberately waited for information", miss: "Made a first offer without a justification or without information" },
  { id: "questions", short: "Questions", text: "Asked at least three questions about interests before making an offer", miss: "Made an offer before asking three questions about their interests" },
  { id: "concessions", short: "Concessions", text: "Did not make a unilateral concession; labeled concessions", miss: "Conceded unilaterally, or without labelling the concession" },
  { id: "package", short: "Package", text: "Discussed issues as a package", miss: "Negotiated the issues one at a time", multiIssueOnly: true },
  { id: "pressure", short: "Pressure", text: "Handled pressure or tactics without reacting (ignored, questioned, or re-anchored)", miss: "Reacted to pressure or a tactic instead of ignoring, questioning or re-anchoring" },
  { id: "relationship", short: "Relationship", text: "Protected the relationship (no blame, gave face)", miss: "Damaged the relationship: blamed, or gave no face" },
];

export const NOT_APPLICABLE = -1;
