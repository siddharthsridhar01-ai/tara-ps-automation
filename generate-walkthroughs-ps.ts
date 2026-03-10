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
// DIRECTORIES
// ============================================================
const OUTPUT_DIR = path.join(process.cwd(), "generated-walkthroughs-ps");
const REF_DIR = path.join(process.cwd(), "reference-code-ps");
const SCREENSHOT_DIR = path.join(process.cwd(), "question-screenshots");
const DATA_FILE = path.join(process.cwd(), "tsa-2022-ps-extracted.json");

function loadRef(filename: string): string {
  const fp = path.join(REF_DIR, filename);
  if (fs.existsSync(fp)) return fs.readFileSync(fp, "utf-8");
  console.warn(`  Warning: reference file ${filename} not found, skipping`);
  return "";
}

function loadScreenshot(qNum: number): string | null {
  const fp = path.join(SCREENSHOT_DIR, `q${qNum}.png`);
  if (fs.existsSync(fp)) {
    const buffer = fs.readFileSync(fp);
    return buffer.toString("base64");
  }
  console.warn(`  Warning: screenshot q${qNum}.png not found`);
  return null;
}

function loadStructuredData(qNum: number): string {
  if (!fs.existsSync(DATA_FILE)) return "";
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const q = data.questions.find((q: any) => q.qNum === qNum);
  if (!q) return "";
  return JSON.stringify(q, null, 2);
}

// ============================================================
// SYSTEM PROMPT
// ============================================================
const SYSTEM_PROMPT = `You are building an interactive walkthrough component for AceAdmissions, a UK admissions test prep website. Each walkthrough guides a student step-by-step through a TSA Problem Solving question.

You will receive:
1. A SCREENSHOT of the actual question from the exam paper. This is the ground truth for all visual data. Reproduce every table, chart, and visual element exactly as shown.
2. STRUCTURED DATA extracted from the question for exact numerical values.
3. REFERENCE CODE showing the exact style to match.

CRITICAL INSTRUCTIONS:
- Respond with ONLY a single React component code block. No explanation text.
- Use "export default function App()" syntax.
- Only import { useState, useEffect } from "react" at the top.
- Use inline styles only. No Tailwind, no CSS modules.
- No required props. Fully self-contained.
- NEVER use unicode escape sequences like \\u2190, \\u2192, \\u00b7, \\u2713, \\u2717. Always use the actual characters: ←, →, ·, ✓, ✗.
- Read ALL visual data (tables, charts, pie charts, bar charts, grids, diagrams) directly from the screenshot.

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
- Keep it natural. This is a polished university admissions prep website.
- Do NOT draw attention to animation mechanics. Let visuals speak.
- Use "Perfect!" not "Verified!" for correct verify interactions.
- Dark mode only.

=== REPRODUCING VISUAL DATA FROM THE SCREENSHOT ===
- Copy question wording EXACTLY. Do not paraphrase or add information.
- TABLES: reproduce every row and column exactly as shown.
- PIE CHARTS: read slice proportions. Read step = no number labels. Setup/Solve = with labels.
- BAR CHARTS: read segment widths/values. Use horizontal stacked bars if original shows horizontal.
- GRIDS: read every cell value and colour pattern (white vs grey) from the image.
- SCATTER PLOTS: read each point's coordinates. Note any incorrectly plotted points.
- DIAGRAMS: reproduce topology and all labelled values.

=== 5-STEP STRUCTURE (EVERY WALKTHROUGH) ===

Steps: Read → Setup → Solve → Verify → Answer

HEADER: TARA gradient badge | "Problem Solving" | · | [Topic Tag in C.ps blue]
"Interactive Walkthrough" in Palatino italic 24px. "TSA 2022 · Question [number]"

STEP NAV: Numbered column buttons. Active = solid purple, completed = faded purple, future = "#1e2030". Font size 10 for label, 14 for number.

--- STEP 0: READ ---
- Copy question wording EXACTLY from screenshot. Reproduce all tables/charts/data.
- Highlight the ask in C.assum amber. Label as "Question [number]".
- NO vocab tooltips.

--- STEP 1: SETUP ---
- Present what is given. Never reveal the answer.
- Numbered step cards. Include charts/tables for reference.
- Badges: STRATEGY (blue), KEY POINT (amber), WATCH OUT (amber), METHOD (amber), NOTE (blue).

--- STEP 2: SOLVE ---
- AlgebraWalkthrough component. Progressive reveal.
- 30px numbered circles with 2px solid border. Connector lines between steps.
- "Reveal next step →" purple gradient button at marginLeft: 42.
- Green conclusion box at end.

--- STEP 3: VERIFY ---
- Genuinely different from Solve. TRY IT badge.
- Patterns: Option Explorer, Preset Buttons, Free Input, Statement Checker, Interactive Grid.
- Dashes for unattempted. "Perfect!" on correct.

--- STEP 4: ANSWER ---
- Question in italic "#252839" box. "Click each option" with C.assum bold.
- OptionCard: C.card background, 1px border, borderRadius 12. 28px badge. Stagger 100ms.
- Expanded: borderLeft 3px solid. "CORRECT: "/"INCORRECT: " bold prefix.

--- NAV ---
- Previous outline, Next purple gradient, Final green gradient "✓ Back to Question Review".
- onClick={() => {}} for final button.

=== NON-NEGOTIABLE ===
1. VERIFIED CORRECT ANSWER is always right.
2. No vocab tooltips.
3. Read step = exact question text from screenshot.
4. Pie charts in Read = no labels. Labels in Setup/Solve.
5. Math font for equations ONLY.
6. Don't describe animation mechanics.
7. SVG labels must be fully visible.
8. Verify genuinely different from Solve.
9. OptionCard: C.card background, 1px solid border.
10. Final button: onClick={() => {}}.

Respond with ONLY the React code. No other text.`;

// ============================================================
// QUESTION DEFINITIONS
// ============================================================
interface Question {
  qNum: number;
  id: string;
  answer: string;
  topicTag: string;
  refFiles: string[];
}

const questions: Question[] = [
  { qNum: 2,  id: "tsa-q2-ps",  answer: "B", topicTag: "Systematic Testing",      refFiles: ["q30-prize-draw.jsx"] },
  { qNum: 6,  id: "tsa-q6-ps",  answer: "B", topicTag: "Mixtures & Ratios",       refFiles: ["q25-fishcakes.jsx"] },
  { qNum: 7,  id: "tsa-q7-ps",  answer: "C", topicTag: "Table Reading",            refFiles: ["q44-cat-mouse.jsx"] },
  { qNum: 8,  id: "tsa-q8-ps",  answer: "B", topicTag: "Data Interpretation",      refFiles: ["q38-vehicle-sales.jsx"] },
  { qNum: 12, id: "tsa-q12-ps", answer: "A", topicTag: "Value for Money",          refFiles: ["q25-fishcakes.jsx"] },
  { qNum: 13, id: "tsa-q13-ps", answer: "B", topicTag: "Table Reading & Logic",    refFiles: ["q44-cat-mouse.jsx"] },
  { qNum: 14, id: "tsa-q14-ps", answer: "C", topicTag: "Simultaneous Equations",   refFiles: ["q37-ball-game.jsx"] },
  { qNum: 18, id: "tsa-q18-ps", answer: "D", topicTag: "Travel Costs",             refFiles: ["q24-race-timing.jsx"] },
  { qNum: 19, id: "tsa-q19-ps", answer: "B", topicTag: "Scheduling & Logic",       refFiles: ["q44-cat-mouse.jsx"] },
  { qNum: 20, id: "tsa-q20-ps", answer: "B", topicTag: "Data Interpretation",      refFiles: ["q38-vehicle-sales.jsx"] },
  { qNum: 24, id: "tsa-q24-ps", answer: "C", topicTag: "Speed, Distance & Time",   refFiles: ["q24-race-timing.jsx"] },
  { qNum: 25, id: "tsa-q25-ps", answer: "D", topicTag: "Best Value Comparison",    refFiles: ["q25-fishcakes.jsx"] },
  { qNum: 26, id: "tsa-q26-ps", answer: "E", topicTag: "Chart Reading",            refFiles: ["q26-politician-salaries.jsx"] },
  { qNum: 30, id: "tsa-q30-ps", answer: "C", topicTag: "Combinatorics",            refFiles: ["q30-prize-draw.jsx"] },
  { qNum: 31, id: "tsa-q31-ps", answer: "E", topicTag: "Systematic Testing",       refFiles: ["q46-sports-day.jsx"] },
  { qNum: 32, id: "tsa-q32-ps", answer: "C", topicTag: "Spatial Reasoning",        refFiles: ["q32-painted-cube.jsx"] },
  { qNum: 36, id: "tsa-q36-ps", answer: "E", topicTag: "Proportional Reasoning",   refFiles: ["q25-fishcakes.jsx"] },
  { qNum: 37, id: "tsa-q37-ps", answer: "C", topicTag: "Simultaneous Equations",   refFiles: ["q37-ball-game.jsx"] },
  { qNum: 38, id: "tsa-q38-ps", answer: "D", topicTag: "Data Interpretation",      refFiles: ["q38-vehicle-sales.jsx"] },
  { qNum: 42, id: "tsa-q42-ps", answer: "D", topicTag: "Systematic Testing",       refFiles: ["q46-sports-day.jsx"] },
  { qNum: 43, id: "tsa-q43-ps", answer: "E", topicTag: "Optimisation",             refFiles: ["q43-token-grid.jsx"] },
  { qNum: 44, id: "tsa-q44-ps", answer: "D", topicTag: "Logical Deduction",        refFiles: ["q44-cat-mouse.jsx"] },
  { qNum: 46, id: "tsa-q46-ps", answer: "C", topicTag: "Combinatorics",            refFiles: ["q46-sports-day.jsx"] },
  { qNum: 48, id: "tsa-q48-ps", answer: "C", topicTag: "Simultaneous Equations",   refFiles: ["q37-ball-game.jsx"] },
  { qNum: 50, id: "tsa-q50-ps", answer: "D", topicTag: "Logical Deduction",        refFiles: ["q50-ring-road.jsx"] },
];

// ============================================================
// GENERATE ONE WALKTHROUGH
// ============================================================
async function generateOne(q: Question, index: number, total: number): Promise<void> {
  console.log(`\n[${index + 1}/${total}] Generating: ${q.id} (Q${q.qNum}, ${q.topicTag}, answer: ${q.answer})`);

  const screenshot = loadScreenshot(q.qNum);
  if (!screenshot) {
    console.error(`  SKIPPED: No screenshot found for Q${q.qNum}`);
    return;
  }
  console.log(`  Screenshot: q${q.qNum}.png loaded (${(screenshot.length * 0.75 / 1024).toFixed(0)}KB)`);

  const refs = q.refFiles.map((f) => loadRef(f)).filter((r) => r.length > 0);
  console.log(`  Reference files: ${refs.length > 0 ? q.refFiles.join(", ") : "none"}`);

  const refBlock = refs.length > 0
    ? `\n\n=== REFERENCE CODE (match this style exactly) ===\n${refs.join("\n\n---\n\n")}\n=== END REFERENCE CODE ===`
    : "";

  const structuredData = loadStructuredData(q.qNum);
  const dataBlock = structuredData
    ? `\n\n=== STRUCTURED DATA (verified values — use to cross-check your reading of the screenshot) ===\n${structuredData}\n=== END STRUCTURED DATA ===`
    : "";

  const textPrompt = `Build an interactive walkthrough for this problem solving question.

The SCREENSHOT above shows the exact question from the TSA 2022 exam paper. Read ALL text, tables, charts, diagrams, and visual data directly from this image. This is the ground truth.

QUESTION NUMBER: ${q.qNum}
TOPIC TAG: ${q.topicTag}
SOURCE: TSA 2022
VERIFIED CORRECT ANSWER: ${q.answer}
${dataBlock}
${refBlock}

INSTRUCTIONS:
1. Read the question text EXACTLY from the screenshot. Do not paraphrase.
2. Reproduce ALL visual elements (tables, charts, grids, diagrams) with exact values from the image.
3. Solve the question yourself and verify your answer matches ${q.answer}.
4. Build the complete 5-step walkthrough (Read → Setup → Solve → Verify → Answer).
5. Follow every rule in the system prompt. Match the reference code style exactly.

Output ONLY the React code in a single code block.`;

  const userContent: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: screenshot,
      },
    },
    {
      type: "text",
      text: textPrompt,
    },
  ];

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    let code = text.trim();
    code = code.replace(/^```[\w]*\s*\n?/, "");
    code = code.replace(/\n?```\s*$/, "");
    code = code.trim();

    const outPath = path.join(OUTPUT_DIR, `${q.id}.jsx`);
    fs.writeFileSync(outPath, code, "utf-8");
    console.log(`  ✓ Saved: ${outPath} (${code.length} chars)`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ERROR on ${q.id}: ${msg}`);

    const errPath = path.join(OUTPUT_DIR, `${q.id}.error.txt`);
    fs.writeFileSync(errPath, msg, "utf-8");
  }
}

// ============================================================
// MAIN
// Usage:
//   npx tsx generate-walkthroughs-ps.ts          — generate all 25
//   npx tsx generate-walkthroughs-ps.ts q48 q42  — generate specific ones
//   npx tsx generate-walkthroughs-ps.ts 18 42 48 — also works without 'q' prefix
// ============================================================
async function main() {
  console.log("=== TARA Problem Solving Walkthrough Generator ===");
  console.log(`Output:      ${OUTPUT_DIR}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
  console.log(`References:  ${REF_DIR}`);
  console.log(`Data file:   ${DATA_FILE}`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    console.error("\n✗ ERROR: question-screenshots/ folder not found.");
    console.error("  Add PNG screenshots named q2.png, q6.png, ... q50.png");
    process.exit(1);
  }

  // Count available screenshots
  const availableScreenshots = questions.filter(q => 
    fs.existsSync(path.join(SCREENSHOT_DIR, `q${q.qNum}.png`))
  );
  console.log(`Screenshots: ${availableScreenshots.length}/${questions.length} available`);

  if (!fs.existsSync(REF_DIR)) {
    console.warn("\n⚠ WARNING: reference-code-ps/ not found. Quality may be lower.\n");
  } else {
    const refFiles = fs.readdirSync(REF_DIR).filter(f => f.endsWith(".jsx"));
    console.log(`References:  ${refFiles.length} JSX files`);
  }

  if (!fs.existsSync(DATA_FILE)) {
    console.warn("⚠ WARNING: tsa-2022-ps-extracted.json not found. Using screenshots only.\n");
  }

  // Parse CLI args
  const args = process.argv.slice(2);
  let toGenerate: Question[];

  if (args.length > 0) {
    const requestedNums = args.map(a => parseInt(a.replace(/^q/i, ""), 10)).filter(n => !isNaN(n));
    toGenerate = questions.filter(q => requestedNums.includes(q.qNum));
    if (toGenerate.length === 0) {
      console.error(`\n✗ No matching questions for: ${args.join(", ")}`);
      console.error(`  Available: ${questions.map(q => `q${q.qNum}`).join(", ")}`);
      process.exit(1);
    }
    console.log(`\nGenerating ${toGenerate.length} question(s): ${toGenerate.map(q => `Q${q.qNum}`).join(", ")}\n`);
  } else {
    toGenerate = questions;
    console.log(`\nGenerating ALL ${toGenerate.length} questions\n`);
  }

  for (let i = 0; i < toGenerate.length; i++) {
    await generateOne(toGenerate[i], i, toGenerate.length);

    if (i < toGenerate.length - 1) {
      console.log("  Waiting 5s...");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  console.log(`\n=== COMPLETE: ${toGenerate.length} walkthroughs in ${OUTPUT_DIR} ===`);
}

main().catch(console.error);