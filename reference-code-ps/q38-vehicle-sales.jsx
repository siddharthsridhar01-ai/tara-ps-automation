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
  { id: 1, label: "Setup", title: "Identify What to Find" },
  { id: 2, label: "Solve", title: "Calculate Vehicles Sold" },
  { id: 3, label: "Verify", title: "Test Each Bar Chart" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

/* ── Vehicle data ─────────────────────────────── */
const CATS = ["Hatchback", "Saloon", "Utility", "Estate", "People carrier"];
const VCOL = ["#5b8def", "#ef6b6b", "#f0c75e", "#6bcf8e", "#c084fc"];
const START = [12, 8, 6, 4, 2]; // total 32
const END = [1, 2, 2, 2, 1];    // total 8
const SOLD = [11, 6, 4, 2, 1];  // total 24

const BARS = [
  { label: "bar 1", vals: [10, 6, 4, 3, 1] },
  { label: "bar 2", vals: [11, 4, 6, 2, 1] },
  { label: "bar 3", vals: [6, 4, 12, 1, 2] },
  { label: "bar 4", vals: [11, 6, 4, 2, 1] },  // correct
  { label: "bar 5", vals: [4, 11, 6, 1, 2] },
];

/* ── Pie Chart SVG ─────────────────────────────── */
function PieChart({ values, total, size = 170, showLabels = false }) {
  const cx = size / 2, cy = size / 2, r = size * 0.4;
  let cum = -Math.PI / 2;
  const slices = values.map((val, i) => {
    const angle = (val / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cum);
    const y1 = cy + r * Math.sin(cum);
    const x2 = cx + r * Math.cos(cum + angle);
    const y2 = cy + r * Math.sin(cum + angle);
    const large = angle > Math.PI ? 1 : 0;
    const mid = cum + angle / 2;
    const lx = cx + r * 0.6 * Math.cos(mid);
    const ly = cy + r * 0.6 * Math.sin(mid);
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    cum += angle;
    return { d, color: VCOL[i], val, lx, ly, show: val / total > 0.07 };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.d} fill={s.color} stroke={C.card} strokeWidth="2" />
          {showLabels && s.show && <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central" fill="rgba(0,0,0,0.75)" fontSize="11" fontWeight="700" fontFamily="'Gill Sans', sans-serif">{s.val}</text>}
        </g>
      ))}
    </svg>
  );
}

/* ── Legend ─────────────────────────────── */
function Legend() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 11, color: C.muted, marginTop: 10 }}>
      {CATS.map((c, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: VCOL[i], display: "inline-block" }} />{c}
        </span>
      ))}
    </div>
  );
}

/* ── Horizontal stacked bar (matching the paper's layout) ─────────────────────────────── */
function HBar({ vals, showNums = false, highlight = false }) {
  const total = vals.reduce((a, b) => a + b, 0);
  return (
    <div style={{
      display: "flex", height: 28, borderRadius: 5, overflow: "hidden",
      border: `1px solid ${highlight ? C.ok + "66" : C.border}`,
      transition: "all 0.3s",
    }}>
      {vals.map((v, i) => {
        const pct = (v / 24) * 100; // 24 is max total
        return (
          <div key={i} style={{
            width: `${pct}%`, background: VCOL[i] + (highlight ? "" : "cc"),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.7)",
            overflow: "hidden", whiteSpace: "nowrap", minWidth: v > 0 ? 4 : 0,
            transition: "width 0.4s ease",
          }}>
            {showNums && v > 0 && pct > 6 ? v : ""}
          </div>
        );
      })}
    </div>
  );
}

/* ── Bar chart display (all 5 bars, like the paper) ─────────────────────────────── */
function BarChartDisplay({ showNums, highlightIdx }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {BARS.map((b, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: highlightIdx === idx ? C.ok : C.muted, minWidth: 40, textAlign: "right" }}>{b.label}</span>
          <div style={{ flex: 1 }}>
            <HBar vals={b.vals} showNums={showNums} highlight={highlightIdx === idx} />
          </div>
        </div>
      ))}
      {/* X-axis labels */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ minWidth: 40 }} />
        <div style={{ flex: 1, display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, paddingTop: 2 }}>
          {[0, 5, 10, 15, 20, 25].map(v => <span key={v}>{v}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ── Solve: Algebra Walkthrough ─────────────────────────────── */
function AlgebraWalkthrough() {
  const [revealed, setRevealed] = useState(0);

  const steps = [
    {
      label: "Total vehicles sold",
      why: "The question states 24 vehicles were sold, leaving 32 − 24 = 8 at the end of the day.",
      math: <span>32 − 24 = <strong style={{ color: C.ok }}>8</strong> vehicles remaining</span>,
      color: C.ps,
    },
    {
      label: "Read start pie chart",
      why: "The first pie chart shows proportions of 32 vehicles. Reading each slice:",
      math: <span>Hatch: 12 &nbsp;·&nbsp; Saloon: 8 &nbsp;·&nbsp; Utility: 6 &nbsp;·&nbsp; Estate: 4 &nbsp;·&nbsp; Carrier: 2</span>,
      color: C.calc,
    },
    {
      label: "Read end pie chart",
      why: "The second pie chart shows proportions of 8 remaining vehicles:",
      math: <span>Hatch: 1 &nbsp;·&nbsp; Saloon: 2 &nbsp;·&nbsp; Utility: 2 &nbsp;·&nbsp; Estate: 2 &nbsp;·&nbsp; Carrier: 1</span>,
      color: C.calc,
    },
    {
      label: "Subtract to find sold",
      why: "For each category: start count minus end count gives vehicles sold.",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Hatch: 12 − 1 = 11</span>
          <span>Saloon: 8 − 2 = 6</span>
          <span>Utility: 6 − 2 = 4</span>
          <span>Estate: 4 − 2 = 2</span>
          <span>Carrier: 2 − 1 = 1</span>
        </div>
      ),
      color: C.calc,
    },
    {
      label: "Check total",
      why: "The five sold values should sum to 24.",
      math: <span>11 + 6 + 4 + 2 + 1 = <strong style={{ color: C.ok }}>24 ✓</strong></span>,
      conclusion: "The sold breakdown is: hatch 11, saloon 6, utility 4, estate 2, carrier 1. This matches bar 4. The answer is D.",
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

/* ── Verify: Bar Chart Explorer (Q25 BrandExplorer pattern) ─────────────────────────────── */
function BarChartExplorer() {
  const [selected, setSelected] = useState(null);
  const [calculated, setCalculated] = useState(new Set());

  const handleSelect = (idx) => {
    setSelected(idx);
    setCalculated(prev => new Set(prev).add(idx));
  };

  const current = selected !== null ? BARS[selected] : null;
  const revealedCount = BARS.filter((_, i) => calculated.has(i)).length;

  return (
    <div>
      {/* Bar chart selector */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Select a bar chart to check</span>

        <div style={{ display: "flex", gap: 8 }}>
          {BARS.map((b, idx) => {
            const isSelected = selected === idx;
            const wasDone = calculated.has(idx);
            const isCorrect = idx === 3 && wasDone;
            const wasWrong = wasDone && idx !== 3;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} style={{
                flex: 1, padding: "12px 4px", borderRadius: 10, cursor: "pointer",
                border: `2px solid ${isSelected ? C.accent : isCorrect ? C.ok + "66" : wasWrong ? C.fail + "33" : C.border}`,
                background: isSelected ? C.accent + "15" : isCorrect ? C.ok + "08" : C.card,
                transition: "all 0.2s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? C.accent : isCorrect ? C.ok : C.text }}>{b.label}</span>
                <span style={{ fontSize: 10, color: isCorrect ? C.ok : wasWrong ? C.fail : wasDone ? C.muted : C.muted + "66", fontWeight: 600 }}>
                  {wasDone ? (idx === 3 ? "Match ✓" : "No match") : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail for selected bar */}
      {current && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{current.label}</span>
            <span style={{ fontSize: 12, color: C.muted, fontFamily: mathFont }}>{current.vals.join(", ")}</span>
          </div>

          {/* The bar itself */}
          <div style={{ marginBottom: 14 }}>
            <HBar vals={current.vals} showNums={true} highlight={selected === 3} />
          </div>

          {/* Category-by-category comparison */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CATS.map((cat, ci) => {
              const match = current.vals[ci] === SOLD[ci];
              return (
                <div key={ci} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: VCOL[ci], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.muted, minWidth: 100 }}>{cat}</span>
                  <span style={{ fontSize: 13, color: C.text, flex: 1 }}>
                    Target: <strong style={{ color: C.assum }}>{SOLD[ci]}</strong>
                    &nbsp;&nbsp;Bar shows: <strong style={{ color: match ? C.ok : C.fail }}>{current.vals[ci]}</strong>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: match ? C.ok : C.fail }}>
                    {match ? "✓" : "✗"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Result */}
          {(() => {
            const allMatch = current.vals.every((v, i) => v === SOLD[i]);
            return (
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 8,
                background: allMatch ? C.conclBg : C.failBg,
                border: `1px solid ${allMatch ? C.ok + "44" : C.fail + "44"}`,
              }}>
                <p style={{ margin: 0, fontSize: 13, color: allMatch ? C.ok : C.fail, lineHeight: 1.6 }}>
                  {allMatch ? (
                    <><strong>Perfect!</strong> Every category matches the calculated sold values.</>
                  ) : (
                    <>
                      <strong>Does not match.</strong>{" "}
                      {current.vals.map((v, i) => v !== SOLD[i] ? `${CATS[i]} should be ${SOLD[i]} not ${v}` : null).filter(Boolean).join("; ")}.
                    </>
                  )}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Running comparison */}
      {revealedCount >= 2 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            Comparison ({revealedCount} of 5 checked)
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BARS.map((b, idx) => {
              if (!calculated.has(idx)) return null;
              const mismatches = b.vals.reduce((n, v, i) => n + (v !== SOLD[i] ? 1 : 0), 0);
              const isCorrect = mismatches === 0;
              const pct = ((5 - mismatches) / 5) * 100;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? C.ok : C.text, minWidth: 40, textAlign: "right" }}>{b.label}</span>
                  <div style={{ flex: 1, height: 24, borderRadius: 6, background: C.border + "44", position: "relative", overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 6,
                      background: isCorrect ? `linear-gradient(90deg, ${C.ok}88, ${C.ok})` : `linear-gradient(90deg, ${C.ps}44, ${C.ps}88)`,
                      transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#0f1117" }}>{5 - mismatches}/5</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isCorrect ? C.ok : C.fail, minWidth: 55 }}>
                    {isCorrect ? "Match" : `${mismatches} wrong`}
                  </span>
                </div>
              );
            })}
          </div>

          {revealedCount === 5 && (
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: C.conclBg, border: `1px solid ${C.ok}44` }}>
              <p style={{ margin: 0, fontSize: 13, color: C.ok, lineHeight: 1.6 }}>
                <strong>Perfect!</strong> Only bar 4 matches all five sold values.
              </p>
            </div>
          )}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{o.text}</p>
          </div>
          <HBar vals={o.vals} showNums={expanded} highlight={expanded && o.ok} />
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
  { letter: "A", text: "bar 1", vals: [10, 6, 4, 3, 1], ok: false,
    expl: "Hatchback shows 10 instead of 11, and estate shows 3 instead of 2. Two categories are wrong." },
  { letter: "B", text: "bar 2", vals: [11, 4, 6, 2, 1], ok: false,
    expl: "Saloon and utility are swapped: it shows saloon as 4 and utility as 6, but the correct sold values are saloon 6 and utility 4." },
  { letter: "C", text: "bar 3", vals: [6, 4, 12, 1, 2], ok: false,
    expl: "Utility shows 12, which is the starting count for hatchback, not the number of utility vehicles sold. Numbers from the wrong chart have been used." },
  { letter: "D", text: "bar 4", vals: [11, 6, 4, 2, 1], ok: true,
    expl: "Hatchback 12 − 1 = 11, saloon 8 − 2 = 6, utility 6 − 2 = 4, estate 4 − 2 = 2, people carrier 2 − 1 = 1. Every category matches and the total is 24." },
  { letter: "E", text: "bar 5", vals: [4, 11, 6, 1, 2], ok: false,
    expl: "The correct numbers are assigned to the wrong categories. Hatchback shows 4 and saloon shows 11, the reverse of the true sold values." },
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
            <span style={{ fontSize: 12, color: C.ps }}>Data Interpretation</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 38</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 38</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>
                At the beginning of the day, a showroom had <strong style={{ color: C.white }}>32 vehicles</strong> for sale. The vehicles were advertised in five categories: hatchback, saloon, utility, estate car and people carrier. By the end of the day, <strong style={{ color: C.white }}>24 vehicles had been sold</strong>.
              </p>
              <p style={{ margin: "0 0 14px" }}>
                The first chart shows a comparison of the numbers of vehicles in each category in the showroom at the beginning of the day, and the second chart shows a comparison of the numbers in the same categories in the showroom at the end of the day.
              </p>
            </div>

            {/* Pie charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 10 }}>
              <div style={{ background: "#1e2030", borderRadius: 10, padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.ps, marginBottom: 10 }}>Beginning of the day (32)</div>
                <PieChart values={START} total={32} />
              </div>
              <div style={{ background: "#1e2030", borderRadius: 10, padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.ps, marginBottom: 10 }}>End of the day (8)</div>
                <PieChart values={END} total={8} />
              </div>
            </div>
            <Legend />

            <div style={{ marginTop: 14, fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 14px" }}>
                <strong style={{ color: C.assum }}>Which one of the following shows a comparison of the numbers of cars in each category that were sold?</strong>
              </p>
            </div>

            {/* All 5 bar charts */}
            <div style={{ background: "#1e2030", borderRadius: 10, padding: "16px 18px" }}>
              <BarChartDisplay showNums={false} highlightIdx={null} />
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>What we need</span>
              <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: "0 0 14px" }}>
                Find the number of each vehicle type sold, then match to one of the five bar charts. This is a two-part problem:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: 13, color: C.text }}>Read off each vehicle type count from both pie charts</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>2</span>
                  <span style={{ fontSize: 13, color: C.text }}>Subtract end from start to get the number sold per type</span>
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.calcBg, border: `1px solid ${C.calc}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.calc, fontWeight: 700, whiteSpace: "nowrap" }}>KEY POINT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  The pie charts show proportions, not raw numbers. Multiply each slice fraction by the total (32 or 8) to get actual counts.
                </p>
              </div>
            </div>

            {/* Pie charts for reference */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Charts for reference</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "#1e2030", borderRadius: 10, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ps, marginBottom: 8 }}>Start (32)</div>
                  <PieChart values={START} total={32} size={150} showLabels={true} />
                </div>
                <div style={{ background: "#1e2030", borderRadius: 10, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ps, marginBottom: 8 }}>End (8)</div>
                  <PieChart values={END} total={8} size={150} showLabels={true} />
                </div>
              </div>
              <Legend />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.calcBg, border: `1px solid ${C.calc}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.calc, fontWeight: 700, whiteSpace: "nowrap" }}>WATCH OUT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  The trap options use the same five numbers assigned to different categories. Read the pie chart patterns carefully and match each slice to its vehicle type before subtracting.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Solve */}
        {step === 2 && <AlgebraWalkthrough />}

        {/* Step 3: Verify */}
        {step === 3 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>TRY IT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Click each bar chart to see its values compared against the target (11, 6, 4, 2, 1). A comparison builds as you go.
                </p>
              </div>
            </div>
            <BarChartExplorer />
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "Which one of the following shows a comparison of the numbers of cars in each category that were sold?"
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Correct bar chart (bar 4)</span>
              <BarChartDisplay showNums={true} highlightIdx={3} />
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
