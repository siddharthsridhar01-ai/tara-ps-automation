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
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";

const stepsMeta = [
  { id: 0, label: "Read", title: "Read the Question" },
  { id: 1, label: "Setup", title: "Identify the Approach" },
  { id: 2, label: "Solve", title: "Find All Possible Scores" },
  { id: 3, label: "Verify", title: "Test Each Option" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

/* ── Score data ─────────────────────────────── */
const POINTS = [10, 6, 3, 1];
const PLACES = ["1st", "2nd", "3rd", "4th"];

// Precompute all achievable scores with their combinations
function getAllScores() {
  const scores = new Map(); // score -> [combination]
  scores.set(0, [[]]);

  // 1 event
  for (const p of POINTS) {
    if (!scores.has(p)) scores.set(p, []);
    scores.get(p).push([p]);
  }

  // 2 events
  for (const p1 of POINTS) {
    for (const p2 of POINTS) {
      const s = p1 + p2;
      if (!scores.has(s)) scores.set(s, []);
      scores.get(s).push([p1, p2]);
    }
  }

  // 3 events
  for (const p1 of POINTS) {
    for (const p2 of POINTS) {
      for (const p3 of POINTS) {
        const s = p1 + p2 + p3;
        if (!scores.has(s)) scores.set(s, []);
        scores.get(s).push([p1, p2, p3]);
      }
    }
  }

  return scores;
}

const ALL_SCORES = getAllScores();
const MAX_SCORE = 30; // 10+10+10

/* ── Option Checker for Verify step ─────────────────────────────── */
function OptionChecker() {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(new Set());

  const options = [
    { value: 15, canAchieve: true, how: "10 + 3 + 1 + 1 = 15? No, max 3 events. 10 + 3 + 1 = 14... Actually: 6 + 6 + 3 = 15.", combo: [6, 6, 3] },
    { value: 22, canAchieve: true, how: "10 + 6 + 6 = 22.", combo: [10, 6, 6] },
    { value: 24, canAchieve: false, how: null, combo: null },
    { value: 27, canAchieve: false, how: null, combo: null },
    { value: 31, canAchieve: false, how: null, combo: null },
  ];

  const handleSelect = (idx) => {
    setSelected(idx);
    setChecked(prev => new Set(prev).add(idx));
  };

  const current = selected !== null ? options[selected] : null;

  // For impossible scores, show why no combination works
  const getClosest = (target) => {
    const combos3 = [];
    for (const p1 of POINTS) {
      for (const p2 of POINTS) {
        for (const p3 of POINTS) {
          if (p1 >= p2 && p2 >= p3) {
            combos3.push({ combo: [p1, p2, p3], total: p1 + p2 + p3 });
          }
        }
      }
    }
    combos3.sort((a, b) => Math.abs(a.total - target) - Math.abs(b.total - target));
    return combos3.filter(c => Math.abs(c.total - target) <= 3).slice(0, 4);
  };

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Test each answer option</span>
        <div style={{ display: "flex", gap: 8 }}>
          {options.map((opt, idx) => {
            const isSelected = selected === idx;
            const wasDone = checked.has(idx);
            const isPossible = opt.canAchieve && wasDone;
            const isImpossible = !opt.canAchieve && wasDone;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} style={{
                flex: 1, padding: "14px 4px", borderRadius: 10, cursor: "pointer",
                border: `2px solid ${isSelected ? C.accent : isPossible ? C.ok + "66" : isImpossible ? C.fail + "66" : C.border}`,
                background: isSelected ? C.accent + "15" : isImpossible ? C.fail + "08" : C.card,
                transition: "all 0.2s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: isSelected ? C.accent : isImpossible ? C.fail : C.text, fontFamily: mathFont }}>{opt.value}</span>
                <span style={{ fontSize: 10, color: isPossible ? C.ok : isImpossible ? C.fail : C.muted + "66", fontWeight: 600 }}>
                  {wasDone ? (opt.canAchieve ? "Possible ✓" : "Impossible ✗") : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {current && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: current.canAchieve ? C.ok : C.fail, fontFamily: mathFont }}>{current.value}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: current.canAchieve ? C.ok : C.fail }}>
              {current.canAchieve ? "Achievable" : "Not achievable"}
            </span>
          </div>

          {current.canAchieve ? (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: C.conclBg, border: `1px solid ${C.ok}44` }}>
              <p style={{ margin: 0, fontSize: 13, color: C.ok, lineHeight: 1.6 }}>
                <strong>{current.combo.join(" + ")} = {current.value}</strong>
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 12px" }}>
                No combination of up to 3 values from {"{"}10, 6, 3, 1{"}"} sums to {current.value}. The closest 3-event totals:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {getClosest(current.value).map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.text, fontFamily: mathFont, flex: 1 }}>
                      {c.combo.join(" + ")} = {c.total}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.total === current.value ? C.ok : C.fail }}>
                      {c.total === current.value ? "✓" : `off by ${Math.abs(c.total - current.value)}`}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 8, background: C.failBg, border: `1px solid ${C.fail}44`, marginTop: 10 }}>
                <p style={{ margin: 0, fontSize: 13, color: C.fail, lineHeight: 1.6 }}>
                  No combination reaches exactly {current.value}.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Solve Walkthrough ─────────────────────────────── */
function SolveWalkthrough() {
  const [revealed, setRevealed] = useState(0);

  const steps = [
    {
      label: "List all 3-event totals",
      why: "The maximum score comes from 3 events. With values 10, 6, 3, 1, list all distinct sums of three picks (repeats allowed, order doesn't matter):",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 14 }}>
          <span>10+10+10 = 30 &nbsp; 10+10+6 = 26 &nbsp; 10+10+3 = 23</span>
          <span>10+10+1 = 21 &nbsp; 10+6+6 = 22 &nbsp; 10+6+3 = 19</span>
          <span>10+6+1 = 17 &nbsp;&nbsp; 10+3+3 = 16 &nbsp; 10+3+1 = 14</span>
          <span>10+1+1 = 12 &nbsp;&nbsp; 6+6+6 = 18 &nbsp;&nbsp;&nbsp; 6+6+3 = 15</span>
          <span>6+6+1 = 13 &nbsp;&nbsp;&nbsp;&nbsp; 6+3+3 = 12 &nbsp;&nbsp;&nbsp; 6+3+1 = 10</span>
          <span>6+1+1 = 8 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3+3+3 = 9 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3+3+1 = 7</span>
          <span>3+1+1 = 5 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1+1+1 = 3</span>
        </div>
      ),
      color: C.ps,
    },
    {
      label: "Include 1 and 2 event scores",
      why: "Students can also enter fewer events:",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 14 }}>
          <span>1 event: 10, 6, 3, 1</span>
          <span>2 events: 20, 16, 11, 12, 9, 7, 6, 4, 2</span>
        </div>
      ),
      after: "Combining all: every integer from 0 to 23 is achievable, plus 26 and 30.",
      color: C.calc,
    },
    {
      label: "Find the first gap",
      why: "Working upward from the answer options: 15 = 6+6+3 ✓, 22 = 10+6+6 ✓, 23 = 10+10+3 ✓. But 24 cannot be made from any combination of up to 3 values from {10, 6, 3, 1}.",
      math: <span>24 is <strong style={{ color: C.fail }}>not achievable</strong>. The closest are 23 and 26.</span>,
      conclusion: "The lowest score that is not possible is 24. The answer is C.",
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
                {s.after && <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{s.after}</p>}
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
  { letter: "A", text: "15", ok: false, expl: "15 is achievable: 6 + 6 + 3 = 15. So this score IS possible." },
  { letter: "B", text: "22", ok: false, expl: "22 is achievable: 10 + 6 + 6 = 22. So this score IS possible." },
  { letter: "C", text: "24", ok: true, expl: "24 cannot be made from any combination of up to 3 values from {10, 6, 3, 1}. The nearest 3-event totals are 23 (10+10+3) and 26 (10+10+6). This is the lowest impossible score among the options." },
  { letter: "D", text: "27", ok: false, expl: "27 is also not achievable, but 24 is lower. The question asks for the LOWEST impossible score." },
  { letter: "E", text: "31", ok: false, expl: "31 is also not achievable (max is 30 = 10+10+10), but 24 is lower." },
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
            <span style={{ fontSize: 12, color: C.ps }}>Combinatorics</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 46</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 46</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>On Sports Day at St Jude's College points are awarded in each event as follows:</p>
            </div>

            {/* Points table */}
            <div style={{ background: "#1e2030", borderRadius: 10, padding: "12px 18px", marginBottom: 14, maxWidth: 220 }}>
              {PLACES.map((place, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 14, color: C.text }}>{place} place</span>
                  <span style={{ fontSize: 14, color: C.assum, fontWeight: 600, fontFamily: mathFont }}>{POINTS[i]} {POINTS[i] === 1 ? "point" : "points"}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>Each student may enter a maximum of <strong style={{ color: C.white }}>three</strong> events.</p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: C.assum }}>What is the lowest score that is <em>not</em> possible for a student to achieve?</strong>
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>What we need</span>
              <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: "0 0 14px" }}>
                Find all possible totals from choosing up to 3 values from {"{"}10, 6, 3, 1{"}"} (with repeats allowed). Then find the lowest positive integer that cannot be made.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: 13, color: C.text }}>List all achievable scores (0, 1, 2, or 3 events)</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>2</span>
                  <span style={{ fontSize: 13, color: C.text }}>Check each answer option against the list</span>
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>STRATEGY</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Since the options are 15, 22, 24, 27, 31, you only need to check whether each of these is achievable. Start from the lowest option and work up: the first one that cannot be made is the answer.
                </p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.calcBg, border: `1px solid ${C.calc}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.calc, fontWeight: 700, whiteSpace: "nowrap" }}>KEY POINT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  A student can place in any position in any event, and the same position can be achieved in multiple events. So {"{"}10, 10, 6{"}"} is a valid combination.
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
                  Click each answer option to see if it can be achieved. For impossible scores, the closest achievable totals are shown.
                </p>
              </div>
            </div>
            <OptionChecker />
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "What is the lowest score that is not possible for a student to achieve?"
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Achievable scores (0–30)</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {Array.from({ length: 31 }, (_, i) => i).map(n => {
                  const possible = ALL_SCORES.has(n);
                  return (
                    <div key={n} style={{
                      width: 32, height: 28, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
                      background: possible ? C.conclBg : C.failBg,
                      border: `1px solid ${possible ? C.ok + "33" : C.fail + "33"}`,
                      fontSize: 11, fontWeight: 600, color: possible ? C.ok : C.fail,
                    }}>{n}</div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: C.muted }}>
                <span><span style={{ color: C.ok }}>■</span> Achievable</span>
                <span><span style={{ color: C.fail }}>■</span> Not achievable</span>
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
