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
  high: "#55efc4", highBg: "rgba(85,239,196,0.12)",
  low: "#fd79a8", lowBg: "rgba(253,121,168,0.12)",
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";

const stepsMeta = [
  { id: 0, label: "Read", title: "Read the Question" },
  { id: 1, label: "Setup", title: "Identify the Right Data" },
  { id: 2, label: "Solve", title: "Find Highest and Lowest" },
  { id: 3, label: "Verify", title: "Calculate the Difference" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

const countries = [
  { name: "Italy", salary: 182.0, gdpMult: 4.9 },
  { name: "Israel", salary: 114.8, gdpMult: 3.2 },
  { name: "Hong Kong", salary: 130.7, gdpMult: 3.4 },
  { name: "United States", salary: 174.0, gdpMult: 2.9 },
  { name: "Japan", salary: 149.7, gdpMult: 3.5 },
  { name: "Singapore", salary: 154.0, gdpMult: 3.3 },
  { name: "Australia", salary: 201.2, gdpMult: 3.3 },
  { name: "Canada", salary: 154.0, gdpMult: 3.3 },
  { name: "New Zealand", salary: 112.5, gdpMult: 2.9 },
  { name: "Germany", salary: 119.5, gdpMult: 2.5 },
  { name: "Ireland", salary: 120.4, gdpMult: 1.8 },
  { name: "Britain", salary: 105.4, gdpMult: 2.4 },
  { name: "Pakistan", salary: 3.5, gdpMult: 2.5 },
  { name: "Saudi Arabia", salary: 64.0, gdpMult: 2.4 },
  { name: "Malaysia", salary: 25.3, gdpMult: 2.3 },
  { name: "France", salary: 85.9, gdpMult: 2.0 },
];

const maxSalary = Math.max(...countries.map(c => c.salary)); // 201.2 Australia
const minSalary = Math.min(...countries.map(c => c.salary)); // 3.5 Pakistan

/* ───────── Salary Chart (TARA styled horizontal bar) ───────── */
function SalaryChart({ highlightMode }) {
  // highlightMode: "none" | "all" | "extremes"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {countries.map(c => {
        const pct = (c.salary / maxSalary) * 100;
        const isHigh = c.salary === maxSalary;
        const isLow = c.salary === minSalary;
        const barCol = highlightMode === "extremes" && isHigh ? C.high :
                       highlightMode === "extremes" && isLow ? C.low :
                       C.muted;
        const textCol = highlightMode === "extremes" && isHigh ? C.high :
                        highlightMode === "extremes" && isLow ? C.low :
                        C.text;
        const bgOp = highlightMode === "extremes" && (isHigh || isLow) ? "22" : "00";

        return (
          <div key={c.name} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "3px 0",
            background: (isHigh ? C.high : isLow ? C.low : "transparent") + bgOp,
            borderRadius: 6,
            transition: "all 0.3s",
          }}>
            <span style={{ fontSize: 11, color: textCol, minWidth: 40, textAlign: "right", fontWeight: 600 }}>
              {c.salary.toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: textCol, minWidth: 85, fontWeight: isHigh || isLow ? 700 : 400 }}>
              {c.name}
            </span>
            <div style={{ flex: 1, height: 14, borderRadius: 3, background: C.border + "44", overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: 3,
                background: isHigh && highlightMode === "extremes" ? `linear-gradient(90deg, ${C.high}66, ${C.high})` :
                            isLow && highlightMode === "extremes" ? `linear-gradient(90deg, ${C.low}66, ${C.low})` :
                            `linear-gradient(90deg, ${C.muted}44, ${C.muted}88)`,
                transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── Algebra Walkthrough ───────── */
function AlgebraWalkthrough() {
  const [revealed, setRevealed] = useState(0);

  const steps = [
    {
      label: "Find the highest salary",
      why: "Scan the $'000 column on the left of the chart. The largest number is the highest salary.",
      math: <span><strong style={{ color: C.high }}>Australia: $201.2k</strong> = $201,200</span>,
      color: C.high,
    },
    {
      label: "Find the lowest salary",
      why: "The smallest number in the $'000 column is the lowest salary.",
      math: <span><strong style={{ color: C.low }}>Pakistan: $3.5k</strong> = $3,500</span>,
      color: C.low,
    },
    {
      label: "Calculate the difference",
      why: "Subtract the lowest from the highest. Remember the values are in thousands of dollars.",
      math: <span>$201,200 − $3,500 = <strong style={{ color: C.ok }}>$197,700</strong></span>,
      conclusion: "The difference is $197,700. The answer is E.",
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

/* ───────── Option Card ───────── */
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
  { letter: "A", text: "$96,100", ok: false, expl: "This would be the difference between Australia ($201,200) and Britain ($105,400). But Britain is not the lowest salary." },
  { letter: "B", text: "$115,300", ok: false, expl: "This does not correspond to the difference between any obvious pair. Likely a misread of the chart values." },
  { letter: "C", text: "$175,900", ok: false, expl: "This would be the difference between Italy ($182,000) and Malaysia ($25,300) at $156,700, or a misread. Not the correct pair." },
  { letter: "D", text: "$178,500", ok: false, expl: "This would be the difference between Italy ($182,000) and Pakistan ($3,500). But Italy is not the highest salary; Australia is." },
  { letter: "E", text: "$197,700", ok: true, expl: "Australia has the highest salary at $201,200 (= $201.2k) and Pakistan has the lowest at $3,500 (= $3.5k). The difference is $201,200 - $3,500 = $197,700." },
];

/* ───────── Main App ───────── */
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
            <span style={{ fontSize: 12, color: C.ps }}>Chart Reading</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 26</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 26</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 14px" }}>
                The following chart shows the average salary of politicians in selected countries in absolute terms on the left (in thousands of dollars) and as a multiple of their country's gross domestic product (GDP) per person on the right.
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Average salary ($'000)</span>
              </div>
              <SalaryChart highlightMode="none" />
            </div>

            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: 0 }}>What is the difference between the <strong style={{ color: C.assum }}>highest and lowest average salaries</strong> of politicians in the countries listed above?</p>
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Average salary ($'000)</span>
              <SalaryChart highlightMode="none" />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.calcBg, border: `1px solid ${C.calc}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.calc, fontWeight: 700, whiteSpace: "nowrap" }}>WATCH OUT</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>
                    The chart shows <strong style={{ color: C.white }}>two different things</strong>: absolute salary ($'000) on the left, and GDP multiples on the right. The question asks about <strong style={{ color: C.assum }}>average salaries</strong>, so we only need the $'000 figures.
                  </p>
                  <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    Also note the values are in <strong style={{ color: C.white }}>thousands</strong>. So 201.2 means $201,200, not $201.20.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>STRATEGY</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Scan down the salary column to find the highest and lowest values. Then subtract and convert from $'000 to full dollars.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Solve */}
        {step === 2 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Salaries with highest and lowest highlighted</span>
              <SalaryChart highlightMode="extremes" />
              <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                <div style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: C.highBg, border: `1px solid ${C.high}44` }}>
                  <div style={{ fontSize: 11, color: C.high, fontWeight: 700, marginBottom: 4 }}>HIGHEST</div>
                  <div style={{ fontSize: 15, color: C.white, fontWeight: 700 }}>Australia: $201.2k</div>
                  <div style={{ fontSize: 12, color: C.muted }}>= $201,200</div>
                </div>
                <div style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: C.lowBg, border: `1px solid ${C.low}44` }}>
                  <div style={{ fontSize: 11, color: C.low, fontWeight: 700, marginBottom: 4 }}>LOWEST</div>
                  <div style={{ fontSize: 15, color: C.white, fontWeight: 700 }}>Pakistan: $3.5k</div>
                  <div style={{ fontSize: 12, color: C.muted }}>= $3,500</div>
                </div>
              </div>
            </div>

            <AlgebraWalkthrough />
          </>
        )}

        {/* Step 3: Verify */}
        {step === 3 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Quick check</span>
            <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: "0 0 14px" }}>
              Common mistakes on this question include reading from the GDP multiple bars instead of the salary figures, or subtracting the wrong pair (e.g. Italy instead of Australia).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Australia (highest)", val: 201.2, full: "$201,200", col: C.high },
                { label: "Pakistan (lowest)", val: 3.5, full: "$3,500", col: C.low },
              ].map(r => (
                <div key={r.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px", borderRadius: 10, background: "#1e2030", border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 13, color: r.col, fontWeight: 600 }}>{r.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: C.muted }}>${r.val}k</span>
                    <span style={{ fontSize: 13, color: C.muted }}>=</span>
                    <span style={{ fontSize: 14, color: C.white, fontWeight: 700 }}>{r.full}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: "14px 18px", borderRadius: 10,
              background: "#1e2030", border: `1px solid ${C.ok}44`,
              textAlign: "center",
            }}>
              <span style={{ fontSize: 14, color: C.muted }}>$201,200 − $3,500 = </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.ok }}>$197,700</span>
            </div>
          </div>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "What is the difference between the highest and lowest average salaries of politicians in the countries listed above?"
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