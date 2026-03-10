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
  fish: "#74b9ff", fishBg: "rgba(116,185,255,0.12)",
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";

const stepsMeta = [
  { id: 0, label: "Read", title: "Read the Question" },
  { id: 1, label: "Setup", title: "Understand the Metric" },
  { id: 2, label: "Solve", title: "Calculate Each Brand" },
  { id: 3, label: "Verify", title: "Compare All Five" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

const fishcakes = [
  { name: "Arctic", fish: 45, potato: 40, coating: 15, weight: 100, cost: 3.00 },
  { name: "Banquet", fish: 40, potato: 50, coating: 10, weight: 100, cost: 2.50 },
  { name: "Chilco", fish: 55, potato: 35, coating: 10, weight: 150, cost: 5.00 },
  { name: "Dyner", fish: 50, potato: 35, coating: 15, weight: 150, cost: 4.00 },
  { name: "Evertop", fish: 35, potato: 45, coating: 20, weight: 50, cost: 1.00 },
];

const calcFishPerPound = (f) => {
  const fishGrams = (f.fish / 100) * f.weight * 2;
  return fishGrams / f.cost;
};

const bestName = "Dyner";

/* ───────── Composition Bar (horizontal stacked bar showing fish/potato/coating) ───────── */
function CompositionBar({ f, compact }) {
  return (
    <div style={{ display: "flex", height: compact ? 20 : 28, borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <div style={{ width: `${f.fish}%`, background: "rgba(116,185,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? 9 : 10, fontWeight: 700, color: "#0f1117", overflow: "hidden", whiteSpace: "nowrap" }}>
        {f.fish > 20 && `${f.fish}%`}
      </div>
      <div style={{ width: `${f.potato}%`, background: "rgba(253,203,110,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? 9 : 10, fontWeight: 700, color: "#0f1117", overflow: "hidden", whiteSpace: "nowrap" }}>
        {f.potato > 20 && `${f.potato}%`}
      </div>
      <div style={{ width: `${f.coating}%`, background: "rgba(139,141,154,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? 9 : 10, fontWeight: 700, color: "#0f1117", overflow: "hidden", whiteSpace: "nowrap" }}>
        {f.coating > 15 && `${f.coating}%`}
      </div>
    </div>
  );
}

/* ───────── Fish Per Pound Bar Chart ───────── */
function FishPerPoundChart({ calculatedSet }) {
  const maxVal = 37.5;
  const revealedCakes = calculatedSet ? fishcakes.filter(f => calculatedSet.has(f.name)) : fishcakes;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {revealedCakes.map(f => {
        const val = calcFishPerPound(f);
        const pct = (val / maxVal) * 100;
        const isBest = f.name === bestName;
        return (
          <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: isBest ? C.ok : C.text, minWidth: 60, textAlign: "right" }}>{f.name}</span>
            <div style={{ flex: 1, height: 24, borderRadius: 6, background: C.border + "44", position: "relative", overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: 6,
                background: isBest ? `linear-gradient(90deg, ${C.ok}88, ${C.ok})` : `linear-gradient(90deg, ${C.fish}66, ${C.fish}aa)`,
                transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#0f1117" }}>{val.toFixed(1)}g/£</span>
              </div>
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
      label: "Identify the metric",
      why: "We need grams of fish per pound spent. Each pack contains 2 fishcakes, so we need to account for both.",
      math: <span>fish per £ = (fish% × weight × 2) / cost</span>,
      color: C.ps,
    },
    {
      label: "Calculate for each brand",
      why: "Apply the formula to all five. Multiply fish percentage by weight to get grams of fish per fishcake, double it for the pack, then divide by cost.",
      math: null,
      table: true,
      color: C.calc,
    },
    {
      label: "Compare",
      why: "The highest value wins. Dyner gives 37.5g of fish per pound, which beats all the others.",
      math: <span><strong style={{ color: C.ok }}>Dyner: 37.5g per £</strong> is the best value</span>,
      conclusion: "Ester should buy Dyner. The answer is D.",
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
                {s.math && (
                  <div style={{
                    background: "#1e2030", border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: "12px 18px", fontSize: 17, color: C.white, fontFamily: mathFont,
                    textAlign: "center", letterSpacing: 0.5, lineHeight: 1.8,
                  }}>{s.math}</div>
                )}
                {s.table && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12 }}>
                      <thead>
                        <tr>
                          {["Brand", "Fish%", "Weight", "× 2", "Cost", "Fish per £"].map(h => (
                            <th key={h} style={{ padding: "8px 8px", textAlign: "center", color: C.muted, fontSize: 10, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fishcakes.map(f => {
                          const fishG = (f.fish / 100) * f.weight;
                          const fishPack = fishG * 2;
                          const perPound = fishPack / f.cost;
                          const isBest = f.name === bestName;
                          return (
                            <tr key={f.name}>
                              <td style={{ padding: "8px 8px", fontWeight: 700, color: isBest ? C.ok : C.text, borderBottom: `1px solid ${C.border}` }}>{f.name}</td>
                              <td style={{ padding: "8px 8px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.fish}%</td>
                              <td style={{ padding: "8px 8px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.weight}g</td>
                              <td style={{ padding: "8px 8px", textAlign: "center", color: C.fish, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{fishPack}g</td>
                              <td style={{ padding: "8px 8px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>£{f.cost.toFixed(2)}</td>
                              <td style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: isBest ? C.ok : C.text, borderBottom: `1px solid ${C.border}` }}>{perPound.toFixed(1)}g</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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

/* ───────── Brand Explorer (Verify step) ───────── */
function BrandExplorer() {
  const [selected, setSelected] = useState(null);
  const [calculated, setCalculated] = useState(new Set());

  const handleSelect = (name) => {
    setSelected(name);
    setCalculated(prev => new Set(prev).add(name));
  };

  const current = selected ? fishcakes.find(f => f.name === selected) : null;
  const revealedCount = fishcakes.filter(f => calculated.has(f.name)).length;

  return (
    <div>
      {/* Brand selector */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Select a brand to calculate</span>

        <div style={{ display: "flex", gap: 8 }}>
          {fishcakes.map(f => {
            const isSelected = selected === f.name;
            const wasDone = calculated.has(f.name);
            const isBest = f.name === bestName && wasDone;
            return (
              <button key={f.name} onClick={() => handleSelect(f.name)} style={{
                flex: 1, padding: "12px 4px", borderRadius: 10, cursor: "pointer",
                border: `2px solid ${isSelected ? C.accent : isBest ? C.ok + "66" : wasDone ? C.muted + "44" : C.border}`,
                background: isSelected ? C.accent + "15" : isBest ? C.ok + "08" : C.card,
                transition: "all 0.2s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? C.accent : isBest ? C.ok : C.text }}>{f.name}</span>
                <span style={{ fontSize: 10, color: isBest ? C.ok : wasDone ? C.muted : C.muted + "66", fontWeight: 600 }}>
                  {wasDone ? `${calcFishPerPound(f).toFixed(1)}g/£` : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculation detail for selected brand */}
      {current && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{current.name}</span>
            <span style={{ fontSize: 12, color: C.muted }}>£{current.cost.toFixed(2)} for 2 × {current.weight}g</span>
          </div>

          {/* Composition bar */}
          <div style={{ marginBottom: 14 }}>
            <CompositionBar f={current} compact={false} />
            <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 10, color: C.muted }}>
              <span><span style={{ color: C.fish }}>■</span> Fish {current.fish}%</span>
              <span><span style={{ color: C.assum }}>■</span> Potato {current.potato}%</span>
              <span><span style={{ color: C.muted }}>■</span> Coating {current.coating}%</span>
            </div>
          </div>

          {/* Step-by-step calculation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.muted, minWidth: 130 }}>Fish per fishcake</span>
              <span style={{ fontSize: 13, color: C.text }}>{current.fish}% × {current.weight}g = <strong style={{ color: C.fish }}>{(current.fish / 100 * current.weight).toFixed(0)}g</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.muted, minWidth: 130 }}>Fish per pack (× 2)</span>
              <span style={{ fontSize: 13, color: C.text }}>{(current.fish / 100 * current.weight).toFixed(0)}g × 2 = <strong style={{ color: C.fish }}>{(current.fish / 100 * current.weight * 2).toFixed(0)}g</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.muted, minWidth: 130 }}>Divide by cost</span>
              <span style={{ fontSize: 13, color: C.text }}>{(current.fish / 100 * current.weight * 2).toFixed(0)}g / £{current.cost.toFixed(2)} = <strong style={{ color: current.name === bestName ? C.ok : C.fish }}>{calcFishPerPound(current).toFixed(1)}g per £</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Running comparison chart */}
      {revealedCount >= 2 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            Comparison ({revealedCount} of 5 calculated)
          </span>
          <FishPerPoundChart calculatedSet={calculated} />

          {revealedCount === 5 && (
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: C.conclBg, border: `1px solid ${C.ok}44` }}>
              <p style={{ margin: 0, fontSize: 13, color: C.ok, lineHeight: 1.6 }}>
                <strong>Perfect!</strong> Dyner gives the most fish per pound at 37.5g/£, beating Evertop (35g/£) by a clear margin.
              </p>
            </div>
          )}
        </div>
      )}
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
  { letter: "A", text: "Arctic", ok: false, expl: "Arctic: 45% of 100g = 45g per fishcake, 90g per pack, costing £3.00. That is 30g of fish per pound." },
  { letter: "B", text: "Banquet", ok: false, expl: "Banquet: 40% of 100g = 40g per fishcake, 80g per pack, costing £2.50. That is 32g of fish per pound." },
  { letter: "C", text: "Chilco", ok: false, expl: "Chilco: 55% of 150g = 82.5g per fishcake, 165g per pack, costing £5.00. That is 33g of fish per pound." },
  { letter: "D", text: "Dyner", ok: true, expl: "Dyner: 50% of 150g = 75g per fishcake, 150g per pack, costing £4.00. That is 37.5g of fish per pound, the highest of all five." },
  { letter: "E", text: "Evertop", ok: false, expl: "Evertop: 35% of 50g = 17.5g per fishcake, 35g per pack, costing £1.00. That is 35g of fish per pound. Close, but Dyner is higher." },
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
            <span style={{ fontSize: 12, color: C.ps }}>Best Value Comparison</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 25</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 25</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 14px" }}>
                Five popular makes of fishcake are shown in the table below, with comparisons of their ingredients, the weight of each type and the cost for a pack of two.
              </p>
            </div>

            <div style={{ overflowX: "auto", marginBottom: 14 }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ padding: "8px 10px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontStyle: "italic" }}>type</th>
                    <th colSpan={3} style={{ padding: "8px 10px", textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontStyle: "italic" }}>ingredients in fishcake</th>
                    <th rowSpan={2} style={{ padding: "8px 10px", textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontStyle: "italic" }}>weight of each fishcake</th>
                    <th rowSpan={2} style={{ padding: "8px 10px", textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontStyle: "italic" }}>cost of pack of 2 fishcakes</th>
                  </tr>
                  <tr>
                    <th style={{ padding: "6px 10px", textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontStyle: "italic" }}>fish</th>
                    <th style={{ padding: "6px 10px", textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontStyle: "italic" }}>potato</th>
                    <th style={{ padding: "6px 10px", textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontStyle: "italic" }}>coating</th>
                  </tr>
                </thead>
                <tbody>
                  {fishcakes.map(f => (
                    <tr key={f.name}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.name}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.fish}%</td>
                      <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.potato}%</td>
                      <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.coating}%</td>
                      <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.weight} g</td>
                      <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>£{f.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 6px" }}>Ester wants to buy the fishcakes that contain the <strong style={{ color: C.assum }}>greatest amount of fish per pound spent</strong>.</p>
              <p style={{ margin: 0 }}>Which make of fishcake should Ester buy?</p>
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Data table</span>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Type", "Fish", "Potato", "Coating", "Weight", "Cost (pack of 2)"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fishcakes.map(f => (
                      <tr key={f.name}>
                        <td style={{ padding: "8px 10px", fontWeight: 700, color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.name}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: C.fish, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{f.fish}%</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.potato}%</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.coating}%</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>{f.weight}g</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: C.text, borderBottom: `1px solid ${C.border}` }}>£{f.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>What we need to calculate</span>
              <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: "0 0 12px" }}>
                The question asks for the most fish <strong style={{ color: C.white }}>per pound spent</strong>. Cheaper fishcakes are not automatically better if they contain less fish. Similarly, a high fish percentage does not help if the fishcake is small or expensive. We need to combine all three factors.
              </p>
              <div style={{
                background: "#1e2030", border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "12px 18px", fontSize: 16, color: C.white, fontFamily: mathFont,
                textAlign: "center", letterSpacing: 0.5, lineHeight: 1.8,
              }}>
                fish per £ = (fish% × weight × 2 fishcakes) ÷ cost
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>NOTE</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  You cannot just pick the highest fish percentage (Chilco at 55%) or the cheapest pack (Evertop at £1.00). The weights and costs differ, so you have to do the full calculation for each.
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
                  Click each brand to see its calculation broken down. A comparison chart builds as you go.
                </p>
              </div>
            </div>
            <BrandExplorer />
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "Which make of fishcake should Ester buy?"
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Fish per pound comparison</span>
              <FishPerPoundChart calculatedSet={null} />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 14 }}>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}><strong style={{ color: C.assum }}>Click each option</strong> to see the calculation:</p>
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