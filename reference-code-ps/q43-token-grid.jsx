import { useState, useEffect } from "react";

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
  gridWhite: "#e2e2e8",
  gridGrey: "#6b6d7a",
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";

const stepsMeta = [
  { id: 0, label: "Read", title: "Read the Question" },
  { id: 1, label: "Setup", title: "Understand the Scoring" },
  { id: 2, label: "Solve", title: "Find the Best Square" },
  { id: 3, label: "Verify", title: "Explore All Positions" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

/* ── Grid data ─────────────────────────────── */
const GRID = [
  [3, 1, 5, 1, 2],
  [1, 2, 0, 4, 5],
  [2, 1, 2, 3, 1],
  [1, 2, 2, 5, 2],
  [5, 4, 3, 2, 4],
];

// White/grey pattern from the paper: grey cells form two diagonals (an X shape)
// Grey where r==c (main diagonal) or r+c==4 (anti-diagonal)
// All other cells are white
const isWhite = (r, c) => !(r === c || r + c === 4);

// Score calculation for placing a token at (r, c)
function calcScore(r, c) {
  let base = 0;
  let bonus = 0;
  const details = [];
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
      const tokens = GRID[nr][nc];
      const w = isWhite(nr, nc);
      base += tokens;
      if (w) bonus += 1;
      details.push({ r: nr, c: nc, tokens, white: w, pts: tokens + (w ? 1 : 0) });
    }
  }
  return { base, bonus, total: base + bonus, details };
}

// Precompute all scores
const ALL_SCORES = [];
for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 5; c++) {
    const s = calcScore(r, c);
    ALL_SCORES.push({ r, c, ...s });
  }
}
ALL_SCORES.sort((a, b) => b.total - a.total);
const MAX_SCORE = ALL_SCORES[0].total;

/* ── Grid component ─────────────────────────────── */
function GameGrid({ selected, onSelect, showScores }) {
  return (
    <div style={{ display: "inline-grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
      {GRID.map((row, r) => row.map((val, c) => {
        const w = isWhite(r, c);
        const isSel = selected && selected[0] === r && selected[1] === c;
        const score = showScores ? calcScore(r, c).total : null;
        const isMax = showScores && score === MAX_SCORE;
        return (
          <div key={`${r}-${c}`} onClick={() => onSelect && onSelect(r, c)} style={{
            width: 56, height: 56, borderRadius: 6,
            background: isSel ? C.accent + "33" : w ? "rgba(240,240,245,0.15)" : "rgba(80,82,100,0.40)",
            border: `2px solid ${isSel ? C.accent : isMax ? C.ok + "66" : w ? "rgba(240,240,245,0.25)" : "rgba(80,82,100,0.50)"}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: onSelect ? "pointer" : "default", transition: "all 0.2s", position: "relative",
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: isSel ? C.accent : C.text, fontFamily: mathFont }}>{val}</span>
            {showScores && (
              <span style={{ fontSize: 9, fontWeight: 700, color: isMax ? C.ok : C.muted, position: "absolute", bottom: 2 }}>{score}pts</span>
            )}
          </div>
        );
      }))}
    </div>
  );
}

/* ── Solve Walkthrough ─────────────────────────────── */
function SolveWalkthrough() {
  const [revealed, setRevealed] = useState(0);

  const steps = [
    {
      label: "Understand the scoring formula",
      why: "When you place a token, you score 1 point per token on each adjacent square (horizontally or vertically), plus 1 extra point for each adjacent square that is white.",
      math: <span>Score = Σ(adjacent tokens) + (number of white adjacent squares)</span>,
      color: C.ps,
    },
    {
      label: "Identify high-value neighbours",
      why: "To maximise your score, place next to squares with the most tokens. The highest values on the board are 5 (appearing at four positions). Squares adjacent to multiple 5s will score highest.",
      math: <span>Look for squares surrounded by high-value, preferably white, neighbours</span>,
      color: C.calc,
    },
    {
      label: "Check the best candidate: row 2, col 3",
      why: "The empty square (0 tokens) in the middle of the grid is surrounded by high-value neighbours. Its adjacent squares are: above (5, white), below (2, grey), left (2, grey), right (4, grey).",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 15 }}>
          <span>Above: 5 tokens + 1 (white) = 6</span>
          <span>Below: 2 tokens = 2</span>
          <span>Left: 2 tokens = 2</span>
          <span>Right: 4 tokens = 4</span>
          <span style={{ color: C.ok }}>Total = 6 + 2 + 2 + 4 = <strong>14</strong></span>
        </div>
      ),
      conclusion: "The maximum score is 14. No other square scores higher. The answer is E.",
      color: C.ok,
    },
  ];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 16 }}>Step-by-step solution</span>

      {steps.map((s, i) => {
        if (i > revealed) return null;
        return (
          <div key={i} style={{ marginBottom: 20, animation: "fadeSlideIn 0.4s ease-out" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: s.color + "22", border: `2px solid ${s.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: s.color,
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{s.why}</p>
                <div style={{
                  background: "#1e2030", border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: "12px 18px", fontSize: 17, color: C.white, fontFamily: mathFont,
                  textAlign: "center", letterSpacing: 0.5, lineHeight: 1.8,
                }}>{s.math}</div>
                {s.conclusion && (
                  <div style={{
                    marginTop: 10, padding: "10px 14px", borderRadius: 8,
                    background: C.conclBg, border: `1px solid ${C.ok}44`,
                    fontSize: 13.5, color: C.ok, fontWeight: 600, lineHeight: 1.5,
                  }}>{s.conclusion}</div>
                )}
              </div>
            </div>
            {i < revealed && i < steps.length - 1 && (
              <div style={{ marginLeft: 14, width: 2, height: 12, background: C.border }} />
            )}
          </div>
        );
      })}

      {revealed < steps.length - 1 && (
        <button onClick={() => setRevealed(p => p + 1)} style={{
          marginTop: 4, padding: "11px 22px", borderRadius: 10, border: "none",
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
          color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, marginLeft: 42,
          boxShadow: "0 4px 16px rgba(108,92,231,0.25)",
        }}>Reveal next step →</button>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Verify: Interactive Grid Explorer ─────────────────────────────── */
function GridExplorer() {
  const [selected, setSelected] = useState(null);
  const score = selected ? calcScore(selected[0], selected[1]) : null;

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Click any square to calculate its score</span>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <GameGrid selected={selected} onSelect={(r, c) => setSelected([r, c])} showScores={false} />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 11, color: C.muted }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "rgba(226,226,232,0.12)", border: "1px solid rgba(226,226,232,0.2)", verticalAlign: "middle", marginRight: 4 }} />White (+1 bonus)</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "rgba(107,109,122,0.12)", border: "1px solid rgba(107,109,122,0.2)", verticalAlign: "middle", marginRight: 4 }} />Grey (no bonus)</span>
        </div>
      </div>

      {score && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
              Placing at row {selected[0] + 1}, col {selected[1] + 1} (value: {GRID[selected[0]][selected[1]]})
            </span>
            <span style={{
              fontSize: 18, fontWeight: 700, fontFamily: mathFont,
              color: score.total === MAX_SCORE ? C.ok : C.text,
            }}>{score.total} pts</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {score.details.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.muted, minWidth: 100 }}>({d.r + 1},{d.c + 1}) = {d.tokens} tokens</span>
                <span style={{ fontSize: 12, color: d.white ? C.assum : C.muted, fontWeight: 600 }}>
                  {d.white ? "white (+1)" : "grey"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: mathFont, marginLeft: "auto" }}>
                  {d.pts}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, marginTop: 8, background: score.total === MAX_SCORE ? C.conclBg : "#1e2030", border: `1px solid ${score.total === MAX_SCORE ? C.ok + "44" : C.border}` }}>
            <span style={{ fontSize: 13, color: C.muted }}>
              Base: {score.base} + White bonus: {score.bonus}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: score.total === MAX_SCORE ? C.ok : C.text, fontFamily: mathFont }}>
              = {score.total}
              {score.total === MAX_SCORE && " ✓ Maximum!"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Option Card ─────────────────────────────── */
function OptionCard({ o, expanded, animate, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, border: `1px solid ${expanded ? (o.ok ? C.ok + "66" : C.fail + "66") : C.border}`,
      borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "all 0.3s",
      opacity: animate ? 1 : 0, transform: animate ? "translateY(0)" : "translateY(12px)",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{
          background: expanded ? (o.ok ? C.ok : C.fail) : C.accent,
          borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: C.white, flexShrink: 0,
        }}>{expanded ? (o.ok ? "✓" : "✗") : o.letter}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{o.text}</p>
          {expanded && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, fontSize: 13, lineHeight: 1.6,
              background: o.ok ? C.conclBg : C.failBg, color: o.ok ? C.ok : C.fail,
              borderLeft: `3px solid ${o.ok ? C.ok : C.fail}`,
            }}>
              {o.ok ? <span style={{ fontWeight: 700 }}>CORRECT: </span> : <span style={{ fontWeight: 700 }}>INCORRECT: </span>}
              {o.expl}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const opts = [
  { letter: "A", text: "10", ok: false, expl: "Several positions score more than 10. This is achievable but not the maximum." },
  { letter: "B", text: "11", ok: false, expl: "Multiple positions score 11 or more. This is not the maximum." },
  { letter: "C", text: "12", ok: false, expl: "Some positions score 12, but higher scores are achievable." },
  { letter: "D", text: "13", ok: false, expl: "13 is achievable at several positions, but the maximum is one point higher." },
  { letter: "E", text: "14", ok: true, expl: "The maximum score of 14 is achieved by placing on the optimal square, where the adjacent tokens sum to a high total and multiple adjacent squares are white, each giving an extra point." },
];

/* ═══════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════ */
export default function App() {
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [optAnim, setOptAnim] = useState([false, false, false, false, false]);

  useEffect(() => {
    if (step === 4) {
      [0, 1, 2, 3, 4].forEach(i => {
        setTimeout(() => setOptAnim(p => { const n = [...p]; n[i] = true; return n; }), i * 100);
      });
    } else { setOptAnim([false, false, false, false, false]); setExpanded(null); }
  }, [step]);

  const lastStep = stepsMeta.length - 1;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Gill Sans', 'Trebuchet MS', Calibri, sans-serif", letterSpacing: 0.2, padding: "24px 16px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.white, letterSpacing: 1 }}>TARA</span>
            <span style={{ fontSize: 12, color: C.muted }}>Problem Solving</span>
            <span style={{ fontSize: 12, color: C.muted }}>·</span>
            <span style={{ fontSize: 12, color: C.ps }}>Optimisation</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 43</p>
        </div>

        {/* Step nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {stepsMeta.map(s => (
            <button key={s.id} onClick={() => setStep(s.id)} style={{
              flex: 1, minWidth: 0,
              background: step === s.id ? C.accent : step > s.id ? "rgba(108,92,231,0.15)" : "#1e2030",
              border: `1px solid ${step === s.id ? C.accent : step > s.id ? C.accent + "44" : C.border}`,
              borderRadius: 10, padding: "10px 4px", cursor: "pointer", transition: "all 0.3s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: step === s.id ? C.white : step > s.id ? C.accentLight : C.muted, lineHeight: 1 }}>{s.id + 1}</span>
              <span style={{ fontSize: 10, fontWeight: step === s.id ? 700 : 500, color: step === s.id ? C.white : step > s.id ? C.accentLight : C.muted, whiteSpace: "nowrap" }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ background: C.accent, borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.white }}>{step + 1}</span>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.white, margin: 0 }}>{stepsMeta[step].title}</h2>
        </div>

        {/* Step 0: Read */}
        {step === 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 43</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>
                In a game, players take it in turns to place tokens onto squares of a grid. The squares on the grid are coloured white and grey. When a player places a token they score one point for every token on an adjacent square (either horizontally or vertically). For every adjacent square that is <strong style={{ color: C.white }}>white</strong> an extra point is scored.
              </p>
              <p style={{ margin: "0 0 14px" }}>
                The diagram below shows a position in one game. The number on each square shows the number of tokens currently placed on that square:
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <GameGrid showScores={false} />
            </div>

            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: 0 }}>
                <strong style={{ color: C.assum }}>What is the maximum number of points that could be scored when the next token is placed on the board?</strong>
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Scoring rules</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 20 }}>📍</span>
                  <span style={{ fontSize: 13, color: C.text }}>Place a token on <strong style={{ color: C.white }}>any</strong> square (even one with tokens already)</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 20 }}>🔢</span>
                  <span style={{ fontSize: 13, color: C.text }}>Score <strong style={{ color: C.ps }}>1 point per token</strong> on each adjacent square (up/down/left/right)</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 20 }}>⬜</span>
                  <span style={{ fontSize: 13, color: C.text }}>Score <strong style={{ color: C.assum }}>+1 extra</strong> for each adjacent square that is white</span>
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>STRATEGY</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  To maximise points, look for squares with high-value neighbours that are also white. Corner and edge squares have fewer adjacents (2 or 3), so interior squares (4 adjacents) generally score higher.
                </p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.calcBg, border: `1px solid ${C.calc}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.calc, fontWeight: 700, whiteSpace: "nowrap" }}>KEY POINT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  The number already on the square you place on does not affect your score. Only the numbers on adjacent squares matter, plus their colours.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Solve */}
        {step === 2 && <SolveWalkthrough />}

        {/* Step 3: Verify */}
        {step === 3 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>TRY IT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Click any square on the grid to see its score breakdown. Try to find the position that scores {MAX_SCORE}.
                </p>
              </div>
            </div>
            <GridExplorer />
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "What is the maximum number of points that could be scored when the next token is placed on the board?"
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>All scores</span>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <GameGrid showScores={true} />
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 14 }}>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}><strong style={{ color: C.assum }}>Click each option</strong> to see the reasoning:</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {opts.map((o, i) => (
                <OptionCard key={o.letter} o={o} expanded={expanded === o.letter} animate={optAnim[i]} onClick={() => setExpanded(p => p === o.letter ? null : o.letter)} />
              ))}
            </div>
          </>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 12, paddingBottom: 32 }}>
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
            flex: 1, padding: "13px 20px", borderRadius: 10, border: `1px solid ${C.border}`,
            background: step === 0 ? C.card : "#1e2030",
            color: step === 0 ? C.muted : C.text, fontSize: 14, fontWeight: 600,
            cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.4 : 1,
          }}>← Previous</button>
          {step < lastStep ? (
            <button onClick={() => setStep(step + 1)} style={{
              flex: 1, padding: "13px 20px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
              color: C.white, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Next →</button>
          ) : (
            <button onClick={() => {}} style={{
              flex: 1, padding: "13px 20px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${C.ok}, #2ecc71)`,
              color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>✓ Back to Question Review</button>
          )}
        </div>
      </div>
    </div>
  );
}
