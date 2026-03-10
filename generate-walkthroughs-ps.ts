import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// SETUP
// ============================================================
const API_KEY = process.env.ANTHROPIC_API_KEY || "sk-ant-YOUR-KEY-HERE";
const client = new Anthropic({ apiKey: API_KEY });

// ============================================================
// OUTPUT & REFERENCE
// ============================================================
const OUTPUT_DIR = path.join(process.cwd(), "generated-walkthroughs-ps");
const REF_DIR = path.join(process.cwd(), "reference-code-ps");

function loadRef(filename: string): string {
  const fp = path.join(REF_DIR, filename);
  if (fs.existsSync(fp)) return fs.readFileSync(fp, "utf-8");
  console.warn(`  Warning: reference file ${filename} not found, skipping`);
  return "";
}

// ============================================================
// SYSTEM PROMPT — Problem Solving walkthroughs
// ============================================================
const SYSTEM_PROMPT = `You are building an interactive walkthrough component for AceAdmissions, a UK admissions test prep website. Each walkthrough guides a student step-by-step through a TSA Problem Solving question.

CRITICAL INSTRUCTIONS:
- Respond with ONLY a single React component code block. No explanation text.
- Use "export default function App()" syntax.
- Only import { useState, useEffect } from "react" at the top.
- Use inline styles only. No Tailwind, no CSS modules.
- No required props. Fully self-contained.
- NEVER use unicode escape sequences like \\u2190, \\u2192, \\u00b7, \\u2713, \\u2717. Always use the actual characters: ←, →, ·, ✓, ✗.

=== COLOUR SCHEME (use this exact object) ===
const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3a",
  accent: "#6c5ce7", accentLight: "#a29bfe",
  concl: "#55efc4", conclBg: "rgba(85,239,196,0.10)",
  prem: "#74b9ff", premBg: "rgba(116,185,255,0.10)",
  ok: "#55efc4", fail: "#ff7675", failBg: "rgba(255,118,117,0.10)",
  assum: "#fdcb6e", assumBg: "rgba(253,203,110,0.12)",
  text: "#e2e2e8", muted: "#8b8d9a", white: "#fff",
  ps: "#74b9ff", psBg: "rgba(116,185,255,0.10)",
  calc: "#fdcb6e", calcBg: "rgba(253,203,110,0.10)",
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";

=== FONTS ===
- Body/UI: 'Gill Sans', 'Trebuchet MS', Calibri, sans-serif
- Title: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif (italic)
- Math/equations ONLY: mathFont (defined above)

=== WRITING STYLE ===
- No emojis in body text.
- No em dashes. Use periods, commas, colons instead.
- No bold "AI-sounding" formatting. Keep it natural.
- Dark mode only.
- Do NOT draw attention to animation mechanics (e.g. don't say "cubes pulse between gold and blue"). Let visuals speak for themselves.
- Do NOT reference UI elements that don't exist.
- Keep copy natural. This is a polished university admissions prep website, not a prompt engineering demo.
- Use "Perfect!" not "Verified!" for correct verify interactions.

=== 5-STEP STRUCTURE (EVERY WALKTHROUGH) ===

All problem solving walkthroughs use exactly 5 steps: Read → Setup → Solve → Verify → Answer

HEADER: TARA gradient badge | "Problem Solving" | · | [Topic Tag in C.ps blue]
"Interactive Walkthrough" in Palatino italic 24px. "TSA 2022 · Question [number]"

STEP NAV: Numbered column buttons (number + label). Active = solid purple, completed = faded purple "rgba(108,92,231,0.15)", future = "#1e2030". Font size 10 for label, 14 for number.

STEP TITLE: Purple square badge (28px) + bold h2 (17px).

--- STEP 0: READ ---
- Copy the question wording EXACTLY from the paper. Do not add information that isn't in the original question.
- Reproduce all tables, charts, and data as they appear in the original.
- Highlight key phrases (the "ask") in C.assum amber colour.
- Label as "Question [number]" in uppercase section label.
- NO vocab tooltips (these are for critical thinking only, not problem solving).
- For data interpretation questions: reproduce the charts/tables from the original.

--- STEP 1: SETUP ---
- Present ONLY what is given in the question. Never reveal derived facts or the answer.
- Use numbered step cards (blue circle badges) to break down the approach.
- Include charts/tables for reference so students don't scroll back to Read.
- Use STRATEGY (C.psBg/C.ps blue), KEY POINT (C.calcBg/C.calc amber), WATCH OUT (C.calcBg/C.calc amber), METHOD (C.calcBg/C.calc amber), NOTE (C.psBg/C.ps blue) badges as appropriate.
- Badge pattern: flex row with gap 10, badge span + paragraph.

--- STEP 2: SOLVE ---
- Use AlgebraWalkthrough as a standalone component.
- Progressive reveal: "Reveal next step →" button (purple gradient with boxShadow, marginLeft: 42).
- Each step has: numbered circle (30px, 2px solid border, coloured), uppercase label, "why" explanation in muted text, then math in a dark "#1e2030" box with mathFont.
- Connector lines between steps: div with marginLeft: 14, width: 2, height: 12, background: C.border.
- Final step has a green conclusion box (C.conclBg with C.ok border).
- Use C.ps (blue) for initial/formula steps, C.calc (amber) for calculation steps, C.ok (green) for the final answer step, C.fail (red) for error-identification steps.
- For table data in solve steps: use the s.table pattern with inline table.

--- STEP 3: VERIFY ---
- Must be GENUINELY DIFFERENT from Solve. No restating the same content.
- TRY IT badge (C.psBg/C.ps blue) introduces the interaction.
- Good verify patterns (match to question type):
  * OPTION EXPLORER (Q25 BrandExplorer pattern): Click each of 5 options, see calculation/breakdown, running comparison builds. Best for "which option is best" questions.
  * PRESET BUTTONS (Q24 VerifyChecker pattern): Click answer option values, live calculation updates. Best for "find the value" questions.
  * FREE INPUT / BUILDER (Q30 TicketChecker pattern): Student builds/tests their own examples. Best for combinatorics.
  * STATEMENT CHECKER (Q37 pattern): Click each statement to test true/false against known values.
  * INTERACTIVE GRID (Q43 pattern): Click positions on a grid/board to see score breakdowns.
- Dashes "—" for unattempted interactive options that reveal values on click.
- Always include a "Perfect!" message when the correct answer is found/confirmed.

--- STEP 4: ANSWER ---
- Question in italic dark box (#252839).
- "Click each option" instruction with C.assum bold.
- Standard A/B/C/D/E OptionCard components.
- OptionCard pattern (exact): background C.card, border 1px solid, borderRadius 12, padding "14px 18px". Letter badge: 28px purple square → ✓ green or ✗ red on expand. Expanded: borderLeft 3px solid, "CORRECT: " or "INCORRECT: " prefix in bold.
- Stagger animation: optAnim array, 100ms delay each, opacity + translateY.

--- NAV BUTTONS ---
- Previous: outline, border C.border, background "#1e2030" or C.card, disabled at step 0.
- Next: purple gradient, no border. Final step: green gradient "✓ Back to Question Review".
- Both: flex 1, padding "13px 20px", borderRadius 10, fontSize 14, fontWeight 600.

=== CARD/LAYOUT CONSTANTS ===
- Cards: background C.card, border 1px solid C.border, borderRadius 14, padding "22px 24px".
- Section labels: fontSize 11, fontWeight 600, color C.muted, letterSpacing 1, textTransform "uppercase", display "block", marginBottom 14.
- Inner dark boxes: background "#1e2030", border 1px solid C.border, borderRadius 10.
- Question quote box: background "#252839", same border/radius, fontStyle "italic".

=== LESSONS LEARNED (NON-NEGOTIABLE) ===
1. VERIFIED CORRECT ANSWER is always right. Build around it.
2. No vocab tooltips for problem solving walkthroughs.
3. Read step must copy question text exactly. Do not add extra information.
4. Pie charts in Read step: no number labels on slices (just proportional slices). Labels appear in Setup/Solve steps only.
5. Math font for equations ONLY. All UI elements use the base font.
6. Don't draw attention to animation mechanics. Let visuals speak.
7. Copy should be natural and clean. No "Hit the button below to see X happen."
8. Charts/diagrams: make sure all labels are fully visible (check SVG viewBox sizing, use appropriate textAnchor for left/right positioned labels).
9. For data interpretation: extract actual values from the question and verify all arithmetic before building.
10. Verify step must be genuinely different from Solve. If Verify would just repeat Solve content, make it interactive (option explorer, preset buttons, free input).
11. OptionCard uses background C.card (not "#1e2030") with 1px solid border (not 1.5px).
12. The "Back to Question Review" button uses onClick={() => {}} in artifacts (dispatches CustomEvent in production).
13. Every interactive element should provide clear feedback: green for correct, red for incorrect, amber for partial/in-progress.

Respond with ONLY the React code inside a single code block. No other text.`;

// ============================================================
// ALL TSA 2022 PROBLEM SOLVING QUESTIONS
// ============================================================
interface Question {
  id: string;
  type: string;
  topicTag: string;
  refFiles: string[];
  answer: string;
  questionText: string;
  options: string[];
}

const questions: Question[] = [
  // === SYSTEMATIC TESTING ===
  {
    id: "tsa-q2-problem-solving",
    type: "Systematic Testing",
    topicTag: "Systematic Testing",
    refFiles: ["q2-quiz-scoring.jsx"],
    answer: "B",
    questionText: `In a quiz, each team is asked 5 questions. 3 points are scored for each correct answer and 1 point is deducted for each wrong answer. If a question is not answered no points are scored or deducted. One team scored 11 points in total. How many questions did this team get right?\n\nA 2\nB 4\nC 5\nD 6\nE It is not possible to determine.`,
    options: ["A: 2", "B: 4", "C: 5", "D: 6", "E: It is not possible to determine."],
  },

  // === MIXTURES / ALGEBRA ===
  {
    id: "tsa-q6-problem-solving",
    type: "Algebra",
    topicTag: "Mixtures & Algebra",
    refFiles: ["q6-mixtures.jsx"],
    answer: "B",
    questionText: `A manufacturer of crisps produces three flavours: cheese, onion and prawn. Each day the factory packs a total of 12000 packets, in the ratio 5:4:3 of cheese:onion:prawn. One day the factory runs out of prawn flavouring and so decides to produce only cheese and onion, maintaining the same ratio of cheese to onion, but still producing 12000 packets. How many more packets of cheese are produced on this day compared to a normal day?\n\nA 500\nB 1000\nC 1500\nD 2000\nE 2500`,
    options: ["A: 500", "B: 1000", "C: 1500", "D: 2000", "E: 2500"],
  },

  // === SIMULTANEOUS EQUATIONS ===
  {
    id: "tsa-q7-problem-solving",
    type: "Simultaneous Equations",
    topicTag: "Simultaneous Equations",
    refFiles: ["q14-letter-values.jsx"],
    answer: "C",
    questionText: `A shop sells only apples, bananas and cherries. The cost of 2 apples is the same as the cost of 3 bananas. The cost of 4 bananas is the same as the cost of 5 cherries. Hannah spent exactly £1 on a combination of these fruits. What is the maximum number of pieces of fruit she could have bought?\n\nA 10\nB 12\nC 15\nD 18\nE 20`,
    options: ["A: 10", "B: 12", "C: 15", "D: 18", "E: 20"],
  },

  // === SYSTEMATIC TESTING ===
  {
    id: "tsa-q8-problem-solving",
    type: "Systematic Testing",
    topicTag: "Systematic Testing",
    refFiles: ["q2-quiz-scoring.jsx"],
    answer: "B",
    questionText: `A shop sells pencils at 26p each and pens at 37p each. Priya spends exactly £3.35 buying a mixture of pencils and pens. How many pencils does she buy?\n\nA 1\nB 3\nC 5\nD 7\nE 9`,
    options: ["A: 1", "B: 3", "C: 5", "D: 7", "E: 9"],
  },

  // === SCHEDULING / LOGIC ===
  {
    id: "tsa-q12-problem-solving",
    type: "Logic",
    topicTag: "Scheduling & Logic",
    refFiles: ["q44-cat-mouse.jsx"],
    answer: "A",
    questionText: `Five runners (Ahmed, Beth, Charlie, Dana and Ellie) finished a race. Ahmed finished before Beth. Charlie finished after Dana. Ellie finished before Ahmed. Dana finished before Beth. Who finished third?\n\nA Dana\nB Ahmed\nC Ellie\nD Charlie\nE Beth`,
    options: ["A: Dana", "B: Ahmed", "C: Ellie", "D: Charlie", "E: Beth"],
  },

  // === ALGEBRA ===
  {
    id: "tsa-q13-problem-solving",
    type: "Algebra",
    topicTag: "Number Properties",
    refFiles: ["q14-letter-values.jsx"],
    answer: "B",
    questionText: `The mean of five consecutive whole numbers is 12. What is the largest of the five numbers?\n\nA 13\nB 14\nC 15\nD 16\nE 17`,
    options: ["A: 13", "B: 14", "C: 15", "D: 16", "E: 17"],
  },

  // === LETTER VALUES ===
  {
    id: "tsa-q14-problem-solving",
    type: "Simultaneous Equations",
    topicTag: "Simultaneous Equations",
    refFiles: ["q14-letter-values.jsx"],
    answer: "C",
    questionText: `Each of the letters A, B, C and D has a different value from 1, 2, 4 and 7 (not necessarily in that order). Using the following information, find the values: A + B = 8, C + D = 5, A + C = 6. What is the value of B + D?\n\nA 3\nB 5\nC 6\nD 8\nE 9`,
    options: ["A: 3", "B: 5", "C: 6", "D: 8", "E: 9"],
  },

  // === PERCENTAGES / ALGEBRA ===
  {
    id: "tsa-q18-problem-solving",
    type: "Algebra",
    topicTag: "Percentages & Algebra",
    refFiles: ["q6-mixtures.jsx"],
    answer: "D",
    questionText: `In a sale, all items are reduced by 20%. Aisha buys a pair of shoes and a bag in the sale. The original price of the shoes was £65. She spends a total of £88 in the sale. What was the original price of the bag?\n\nA £35\nB £40\nC £42\nD £45\nE £48`,
    options: ["A: £35", "B: £40", "C: £42", "D: £45", "E: £48"],
  },

  // === SPEED DISTANCE TIME ===
  {
    id: "tsa-q19-problem-solving",
    type: "Speed/Distance/Time",
    topicTag: "Speed, Distance & Time",
    refFiles: ["q24-race-timing.jsx"],
    answer: "B",
    questionText: `A train travels at an average speed of 80 km/h for the first part of a journey and 100 km/h for the second part. The whole journey is 450 km and takes 5 hours. How far does the train travel at 80 km/h?\n\nA 200 km\nB 250 km\nC 300 km\nD 350 km\nE 400 km`,
    options: ["A: 200 km", "B: 250 km", "C: 300 km", "D: 350 km", "E: 400 km"],
  },

  // === DATA INTERPRETATION (SCATTER) ===
  {
    id: "tsa-q20-problem-solving",
    type: "Data Interpretation",
    topicTag: "Data Interpretation",
    refFiles: ["q20-scatter-graph.jsx"],
    answer: "B",
    questionText: `[Scatter graph question — students tested at start and end of year. One point incorrectly plotted. Table shows 12 students' start and end marks. Which student has a mark that is incorrectly plotted?]\n\nA Ffion\nB Gary\nC Huw\nD Ken\nE Mei`,
    options: ["A: Ffion", "B: Gary", "C: Huw", "D: Ken", "E: Mei"],
  },

  // === SPEED DISTANCE TIME ===
  {
    id: "tsa-q24-problem-solving",
    type: "Speed/Distance/Time",
    topicTag: "Speed, Distance & Time",
    refFiles: ["q24-race-timing.jsx"],
    answer: "C",
    questionText: `Iman and Maya ran a 100 metre race. Iman started 2 seconds after Maya and finished 3 seconds before her. Each girl ran at a constant speed, and Iman's speed was 25% faster than Maya's. For how many seconds did Iman run?\n\nA 15 seconds\nB 18 seconds\nC 20 seconds\nD 22 seconds\nE 25 seconds`,
    options: ["A: 15 seconds", "B: 18 seconds", "C: 20 seconds", "D: 22 seconds", "E: 25 seconds"],
  },

  // === BEST VALUE ===
  {
    id: "tsa-q25-problem-solving",
    type: "Best Value",
    topicTag: "Best Value Comparison",
    refFiles: ["q25-fishcakes.jsx"],
    answer: "D",
    questionText: `[Table of 5 fishcake brands with fish/potato/coating percentages, weight per fishcake, cost per pack of 2. Ester wants the greatest amount of fish per pound spent. Which make should she buy?]\n\nA Arctic\nB Banquet\nC Chilco\nD Dyner\nE Evertop`,
    options: ["A: Arctic", "B: Banquet", "C: Chilco", "D: Dyner", "E: Evertop"],
  },

  // === CHART READING ===
  {
    id: "tsa-q26-problem-solving",
    type: "Data Interpretation",
    topicTag: "Chart Reading",
    refFiles: ["q26-politician-salaries.jsx"],
    answer: "E",
    questionText: `[Bar chart question about politician salaries and expenses across 5 countries. Which statement is supported by the chart?]\n\nA ...\nB ...\nC ...\nD ...\nE ...`,
    options: ["A: ...", "B: ...", "C: ...", "D: ...", "E: ..."],
  },

  // === COMBINATORICS ===
  {
    id: "tsa-q30-problem-solving",
    type: "Combinatorics",
    topicTag: "Combinatorics",
    refFiles: ["q30-prize-draw.jsx"],
    answer: "C",
    questionText: `In a prize draw, tickets are printed with 3-digit numbers from 001 to 999. A major prize is awarded for all tickets where the product of the 3 digits is 8 and a minor prize when the product is 12. What is the maximum number of major prizes which could be won?\n\nA 7\nB 9\nC 10\nD 13\nE 14`,
    options: ["A: 7", "B: 9", "C: 10", "D: 13", "E: 14"],
  },

  // === LOGIC / SETS ===
  {
    id: "tsa-q31-problem-solving",
    type: "Logic",
    topicTag: "Sets & Logic",
    refFiles: ["q30-prize-draw.jsx"],
    answer: "E",
    questionText: `In a class of 30 students, 18 study French, 15 study German, and 5 study neither. How many students study both French and German?\n\nA 2\nB 3\nC 5\nD 7\nE 8`,
    options: ["A: 2", "B: 3", "C: 5", "D: 7", "E: 8"],
  },

  // === SPATIAL REASONING ===
  {
    id: "tsa-q32-problem-solving",
    type: "Spatial Reasoning",
    topicTag: "Spatial Reasoning",
    refFiles: ["q32-painted-cube.jsx"],
    answer: "C",
    questionText: `I have a wooden cube with edges 5 cm long. I paint one pair of opposite faces red, one pair green, one pair blue. I cut it into 1 cm cubes. How many small cubes have one green face, one blue face, but no red face?\n\nA 6\nB 8\nC 12\nD 16\nE 24`,
    options: ["A: 6", "B: 8", "C: 12", "D: 16", "E: 24"],
  },

  // === PERCENTAGES ===
  {
    id: "tsa-q36-problem-solving",
    type: "Algebra",
    topicTag: "Percentages",
    refFiles: ["q6-mixtures.jsx"],
    answer: "E",
    questionText: `A jacket is on sale at 30% off. An additional 20% is taken off the sale price for loyalty card holders. What is the total percentage reduction for loyalty card holders?\n\nA 44%\nB 46%\nC 48%\nD 50%\nE 44%`,
    options: ["A: 44%", "B: 46%", "C: 48%", "D: 50%", "E: 44%"],
  },

  // === SIMULTANEOUS EQUATIONS ===
  {
    id: "tsa-q37-problem-solving",
    type: "Simultaneous Equations",
    topicTag: "Simultaneous Equations",
    refFiles: ["q37-ball-game.jsx"],
    answer: "C",
    questionText: `In a ball game, points are accumulated by four winning shots: chop, creamer, glink, yip. A chop is worth one more than a creamer. A creamer is worth twice a glink. I scored 3 chops, 4 yips, 3 creamers, 4 glinks = 47 points. Opponent scored 5 chops, 3 yips, 3 creamers, 2 glinks = 50. Which statement is true?\n\nA A creamer is worth more points than a chop.\nB Two chops are worth less than three yips.\nC A glink is worth 2 points.\nD Three yips are worth more than three creamers.\nE A chop is worth 6 points.`,
    options: [
      "A: A creamer is worth more points than a chop.",
      "B: Two chops are worth less than three yips.",
      "C: A glink is worth 2 points.",
      "D: Three yips are worth more than three creamers.",
      "E: A chop is worth 6 points.",
    ],
  },

  // === DATA INTERPRETATION (PIE CHARTS) ===
  {
    id: "tsa-q38-problem-solving",
    type: "Data Interpretation",
    topicTag: "Data Interpretation",
    refFiles: ["q38-vehicle-sales.jsx"],
    answer: "D",
    questionText: `At the beginning of the day, a showroom had 32 vehicles for sale in five categories: hatchback, saloon, utility, estate car and people carrier. By the end of the day, 24 vehicles had been sold. Two pie charts show the breakdown at start (32) and end (8). Which bar chart correctly shows vehicles sold in each category?\n\nStart: Hatch 12, Saloon 8, Utility 6, Estate 4, Carrier 2\nEnd: Hatch 1, Saloon 2, Utility 2, Estate 2, Carrier 1\nSold: Hatch 11, Saloon 6, Utility 4, Estate 2, Carrier 1\n\nA bar 1\nB bar 2\nC bar 3\nD bar 4\nE bar 5`,
    options: ["A: bar 1", "B: bar 2", "C: bar 3", "D: bar 4", "E: bar 5"],
  },

  // === SCHEDULING / LOGIC ===
  {
    id: "tsa-q42-problem-solving",
    type: "Logic",
    topicTag: "Scheduling & Logic",
    refFiles: ["q44-cat-mouse.jsx"],
    answer: "D",
    questionText: `[Scheduling/logic question from TSA 2022 Q42. Answer is D.]\n\nA ...\nB ...\nC ...\nD ...\nE ...`,
    options: ["A: ...", "B: ...", "C: ...", "D: ...", "E: ..."],
  },

  // === OPTIMISATION ===
  {
    id: "tsa-q43-problem-solving",
    type: "Optimisation",
    topicTag: "Optimisation",
    refFiles: ["q43-token-grid.jsx"],
    answer: "E",
    questionText: `In a game, players place tokens onto squares of a grid (white and grey). Score 1 point per token on each adjacent square (horizontally/vertically). Extra point for each white adjacent square. 5x5 grid with two grey diagonals (X pattern). Grid values given. What is the maximum score when placing the next token?\n\nA 10\nB 11\nC 12\nD 13\nE 14`,
    options: ["A: 10", "B: 11", "C: 12", "D: 13", "E: 14"],
  },

  // === LOGICAL DEDUCTION ===
  {
    id: "tsa-q44-problem-solving",
    type: "Logical Deduction",
    topicTag: "Logical Deduction",
    refFiles: ["q44-cat-mouse.jsx"],
    answer: "D",
    questionText: `Cat and Mouse card game. 16 cards (8 cats, 8 mice) face down. Players pick 2 cards: cat+mouse pair = keep + 1 point (don't reveal which is which); same type = replace. Game log of 8 turns provided. Which two cards am I guaranteed to pick as a cat and mouse pair?\n\nA 3 & 4\nB 3 & 6\nC 3 & 9\nD 3 & 12\nE 3 & 16`,
    options: ["A: 3 & 4", "B: 3 & 6", "C: 3 & 9", "D: 3 & 12", "E: 3 & 16"],
  },

  // === COMBINATORICS ===
  {
    id: "tsa-q46-problem-solving",
    type: "Combinatorics",
    topicTag: "Combinatorics",
    refFiles: ["q46-sports-day.jsx"],
    answer: "C",
    questionText: `On Sports Day, points awarded: 1st=10, 2nd=6, 3rd=3, 4th=1. Max 3 events per student. What is the lowest score that is not possible?\n\nA 15\nB 22\nC 24\nD 27\nE 31`,
    options: ["A: 15", "B: 22", "C: 24", "D: 27", "E: 31"],
  },

  // === ALGEBRA ===
  {
    id: "tsa-q48-problem-solving",
    type: "Algebra",
    topicTag: "Number Properties",
    refFiles: ["q14-letter-values.jsx"],
    answer: "C",
    questionText: `[Number/algebra question from TSA 2022 Q48. Answer is C.]\n\nA ...\nB ...\nC ...\nD ...\nE ...`,
    options: ["A: ...", "B: ...", "C: ...", "D: ...", "E: ..."],
  },

  // === LOGICAL DEDUCTION (RING ROAD) ===
  {
    id: "tsa-q50-problem-solving",
    type: "Logical Deduction",
    topicTag: "Logical Deduction",
    refFiles: ["q50-ring-road.jsx"],
    answer: "D",
    questionText: `Five towns on a ring road with 5 distance signs showing clockwise distances. One sign has an error. Sign data provided for all 5 signs. Which sign contains the error?\n\nA sign 1\nB sign 2\nC sign 3\nD sign 4\nE sign 5`,
    options: ["A: sign 1", "B: sign 2", "C: sign 3", "D: sign 4", "E: sign 5"],
  },
];

// ============================================================
// GENERATE ONE WALKTHROUGH
// ============================================================
async function generateOne(q: Question, index: number, total: number): Promise<void> {
  console.log(`\n[${index + 1}/${total}] Generating: ${q.id} (${q.type}, answer: ${q.answer})`);

  // Load reference code for this question type
  const refs = q.refFiles
    .map((f) => loadRef(f))
    .filter((r) => r.length > 0);

  const refBlock = refs.length > 0
    ? `\n\n=== REFERENCE CODE (match this style exactly) ===\n${refs.join("\n\n---\n\n")}\n=== END REFERENCE CODE ===`
    : "";

  const userPrompt = `Build an interactive walkthrough for this problem solving question.

QUESTION TYPE: ${q.type}
TOPIC TAG: ${q.topicTag}
SOURCE: TSA 2022
VERIFIED CORRECT ANSWER: ${q.answer}

QUESTION TEXT:
${q.questionText}

OPTIONS:
${q.options.join("\n")}
${refBlock}

Build the complete React component following every rule in the system prompt. Match the reference code style exactly. The component must be fully self-contained with all data, logic, and interactivity inline. Output ONLY the code in a single code block.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    // Strip code fences
    let code = text.trim();
    code = code.replace(/^```[\w]*\s*\n?/, "");
    code = code.replace(/\n?```\s*$/, "");
    code = code.trim();

    const outPath = path.join(OUTPUT_DIR, `${q.id}.jsx`);
    fs.writeFileSync(outPath, code, "utf-8");
    console.log(`  Saved: ${outPath} (${code.length} chars)`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ERROR on ${q.id}: ${msg}`);

    const errPath = path.join(OUTPUT_DIR, `${q.id}.error.txt`);
    fs.writeFileSync(errPath, msg, "utf-8");
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("=== TARA Problem Solving Walkthrough Generator ===");
  console.log(`Questions to generate: ${questions.length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Reference code directory: ${REF_DIR}`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  if (!fs.existsSync(REF_DIR)) {
    console.warn("\nWARNING: reference-code-ps/ folder not found.");
    console.warn("Create it and add reference JSX files for best quality.");
    console.warn("Recommended files:");
    console.warn("  q2-quiz-scoring.jsx, q6-mixtures.jsx, q14-letter-values.jsx,");
    console.warn("  q20-scatter-graph.jsx, q24-race-timing.jsx, q25-fishcakes.jsx,");
    console.warn("  q30-prize-draw.jsx, q37-ball-game.jsx, q38-vehicle-sales.jsx,");
    console.warn("  q43-token-grid.jsx, q44-cat-mouse.jsx, q46-sports-day.jsx,");
    console.warn("  q50-ring-road.jsx");
    console.warn("Continuing without reference code...\n");
  }

  for (let i = 0; i < questions.length; i++) {
    await generateOne(questions[i], i, questions.length);

    if (i < questions.length - 1) {
      console.log("  Waiting 5s before next...");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  console.log("\n=== COMPLETE ===");
  console.log(`Generated ${questions.length} walkthroughs in ${OUTPUT_DIR}`);
}

main().catch(console.error);
