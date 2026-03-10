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
  iman: "#55efc4", imanBg: "rgba(85,239,196,0.12)",
  maya: "#fd79a8", mayaBg: "rgba(253,121,168,0.12)",
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";

const stepsMeta = [
  { id: 0, label: "Read", title: "Read the Question" },
  { id: 1, label: "Setup", title: "Map Out the Timeline" },
  { id: 2, label: "Solve", title: "Solve Algebraically" },
  { id: 3, label: "Verify", title: "Check the Answer" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

/* ───────── Timeline Visual ───────── */
function Timeline({ imanTime, mayaTime, showLabels, variableMode }) {
  const margin = { left: 60, right: 20, top: 10, bottom: 30 };
  const w = 520, h = 140;
  const plotW = w - margin.left - margin.right;

  const totalTime = mayaTime + 2; // Maya starts at 0, finishes at mayaTime; add buffer
  const toX = (t) => margin.left + (t / totalTime) * plotW;

  const mayaStart = 0;
  const mayaEnd = mayaTime;
  const imanStart = 2;
  const imanEnd = imanStart + imanTime;

  const rowY1 = 35; // Maya row
  const rowY2 = 80; // Iman row
  const barH = 24;

  const imanLabel = variableMode ? "t" : `${imanTime}s`;
  const mayaLabel = variableMode ? "t + 5" : `${mayaTime}s`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: 540, display: "block", margin: "0 auto" }}>
      {/* Time axis */}
      <line x1={margin.left} y1={h - margin.bottom} x2={w - margin.right} y2={h - margin.bottom} stroke={C.border} strokeWidth={1} />
      {!variableMode && Array.from({ length: Math.ceil(totalTime / 5) + 1 }, (_, i) => i * 5).filter(t => t <= totalTime).map(t => (
        <g key={t}>
          <line x1={toX(t)} y1={h - margin.bottom - 4} x2={toX(t)} y2={h - margin.bottom + 4} stroke={C.muted} strokeWidth={1} />
          <text x={toX(t)} y={h - 8} fill={C.muted} fontSize={9} textAnchor="middle" fontFamily="'Gill Sans', sans-serif">{t}s</text>
        </g>
      ))}

      {/* Maya bar */}
      <text x={margin.left - 8} y={rowY1 + barH / 2 + 4} fill={C.maya} fontSize={11} fontWeight={700} textAnchor="end" fontFamily="'Gill Sans', sans-serif">Maya</text>
      <rect x={toX(mayaStart)} y={rowY1} width={toX(mayaEnd) - toX(mayaStart)} height={barH} rx={6} fill={C.maya + "33"} stroke={C.maya} strokeWidth={1.5} />
      <circle cx={toX(mayaStart)} cy={rowY1 + barH / 2} r={4} fill={C.maya} />
      <circle cx={toX(mayaEnd)} cy={rowY1 + barH / 2} r={4} fill={C.maya} />

      {/* Iman bar */}
      <text x={margin.left - 8} y={rowY2 + barH / 2 + 4} fill={C.iman} fontSize={11} fontWeight={700} textAnchor="end" fontFamily="'Gill Sans', sans-serif">Iman</text>
      <rect x={toX(imanStart)} y={rowY2} width={toX(imanEnd) - toX(imanStart)} height={barH} rx={6} fill={C.iman + "33"} stroke={C.iman} strokeWidth={1.5} />
      <circle cx={toX(imanStart)} cy={rowY2 + barH / 2} r={4} fill={C.iman} />
      <circle cx={toX(imanEnd)} cy={rowY2 + barH / 2} r={4} fill={C.iman} />

      {/* 2s gap label */}
      {showLabels && (
        <>
          <line x1={toX(0)} y1={rowY2 - 2} x2={toX(2)} y2={rowY2 - 2} stroke={C.assum} strokeWidth={1} />
          <text x={toX(1)} y={rowY2 - 6} fill={C.assum} fontSize={8} textAnchor="middle" fontWeight={700} fontFamily="'Gill Sans', sans-serif">2s late</text>

          <line x1={toX(imanEnd)} y1={rowY1 + barH + 6} x2={toX(mayaEnd)} y2={rowY1 + barH + 6} stroke={C.assum} strokeWidth={1} />
          <text x={(toX(imanEnd) + toX(mayaEnd)) / 2} y={rowY1 + barH + 16} fill={C.assum} fontSize={8} textAnchor="middle" fontWeight={700} fontFamily="'Gill Sans', sans-serif">3s early</text>
        </>
      )}

      {/* Time labels on bars */}
      {showLabels && (
        <>
          <text x={(toX(mayaStart) + toX(mayaEnd)) / 2} y={rowY1 + barH / 2 + 3} fill={C.maya} fontSize={10} textAnchor="middle" fontWeight={600} fontFamily={variableMode ? mathFont : "'Gill Sans', sans-serif"}>
            {mayaLabel}
          </text>
          <text x={(toX(imanStart) + toX(imanEnd)) / 2} y={rowY2 + barH / 2 + 3} fill={C.iman} fontSize={10} textAnchor="middle" fontWeight={600} fontFamily={variableMode ? mathFont : "'Gill Sans', sans-serif"}>
            {imanLabel}
          </text>
        </>
      )}
    </svg>
  );
}

/* ───────── Algebra Walkthrough ───────── */
function AlgebraWalkthrough() {
  const [revealed, setRevealed] = useState(0);

  const steps = [
    {
      label: "Define the unknown",
      why: "We want to find how long Iman ran. Call her running time t seconds. Since Iman started 2 seconds later and finished 3 seconds earlier, Maya ran for (t + 5) seconds total.",
      math: <span>Let <em style={{ color: C.iman }}>t</em> = Iman's time. Then Maya's time = <em style={{ color: C.maya }}>t + 5</em></span>,
      color: C.ps,
    },
    {
      label: "Write the speed equations",
      why: "Both runners cover 100 metres. Speed = distance / time, and we know Iman's speed is 1.25 times Maya's speed (25% faster).",
      math: (
        <span>
          <span style={{ color: C.iman }}>100/t</span> = 1.25 × <span style={{ color: C.maya }}>100/(t + 5)</span>
        </span>
      ),
      color: C.calc,
    },
    {
      label: "Simplify",
      why: "Divide both sides by 100. Then cross-multiply to clear the fractions.",
      math: <span>1/<em>t</em> = 1.25/(<em>t</em> + 5) &nbsp; → &nbsp; <em>t</em> + 5 = 1.25<em>t</em></span>,
      color: C.calc,
    },
    {
      label: "Solve for t",
      why: "Subtract t from both sides to isolate the variable.",
      math: <span>5 = 0.25<em>t</em> &nbsp; → &nbsp; <em style={{ color: C.ok }}>t</em> = 5 / 0.25 = <strong style={{ color: C.ok }}>20</strong></span>,
      conclusion: "Iman ran for 20 seconds.",
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
                  padding: "12px 18px", fontSize: 18, color: C.white, fontFamily: mathFont,
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

/* ───────── Verify: test different times ───────── */
function VerifyChecker() {
  const [imanTime, setImanTime] = useState(20);

  const mayaTime = imanTime + 5;
  const imanSpeed = 100 / imanTime;
  const mayaSpeed = 100 / mayaTime;
  const ratio = imanSpeed / mayaSpeed;
  const isCorrect = imanTime === 20;

  const presets = [15, 18, 20, 22, 25];

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Try each answer option</span>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {presets.map(t => (
            <button key={t} onClick={() => setImanTime(t)} style={{
              flex: 1, padding: "14px 6px", borderRadius: 10, cursor: "pointer",
              border: `2px solid ${imanTime === t ? (t === 20 ? C.ok : C.accent) : C.border}`,
              background: imanTime === t ? (t === 20 ? C.ok + "15" : C.accent + "15") : C.card,
              transition: "all 0.2s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: imanTime === t ? (t === 20 ? C.ok : C.accent) : C.text }}>{t}s</span>
              <span style={{ fontSize: 10, color: C.muted }}>Iman</span>
            </button>
          ))}
        </div>

        <Timeline imanTime={imanTime} mayaTime={mayaTime} showLabels={true} />
      </div>

      {/* Speed check */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Speed check</span>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ background: C.imanBg, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: C.iman, fontWeight: 700, marginBottom: 6 }}>IMAN</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>
              Time: <strong style={{ color: C.iman }}>{imanTime}s</strong><br />
              Speed: 100 / {imanTime} = <strong style={{ color: C.iman }}>{imanSpeed.toFixed(2)} m/s</strong>
            </div>
          </div>
          <div style={{ background: C.mayaBg, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: C.maya, fontWeight: 700, marginBottom: 6 }}>MAYA</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>
              Time: <strong style={{ color: C.maya }}>{mayaTime}s</strong><br />
              Speed: 100 / {mayaTime} = <strong style={{ color: C.maya }}>{mayaSpeed.toFixed(2)} m/s</strong>
            </div>
          </div>
        </div>

        <div style={{
          padding: "12px 16px", borderRadius: 10,
          background: isCorrect ? C.conclBg : C.failBg,
          border: `1px solid ${isCorrect ? C.ok + "44" : C.fail + "44"}`,
          transition: "all 0.3s",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, color: C.text }}>
              Speed ratio: <strong style={{ color: isCorrect ? C.ok : C.fail }}>{imanSpeed.toFixed(2)} / {mayaSpeed.toFixed(2)} = {ratio.toFixed(4)}</strong>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? C.ok : C.fail }}>
              {isCorrect ? "= 1.25 ✓" : `= ${ratio.toFixed(2)} ≠ 1.25`}
            </div>
          </div>
          {isCorrect && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: C.ok, lineHeight: 1.5 }}>
              <strong>Perfect!</strong> Iman's speed is exactly 25% faster than Maya's when Iman runs for 20 seconds and Maya runs for 25 seconds.
            </p>
          )}
        </div>
      </div>
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
  { letter: "A", text: "15 seconds", ok: false, expl: "If Iman runs 15s, Maya runs 20s. Speeds: 100/15 = 6.67 m/s vs 100/20 = 5 m/s. Ratio = 1.33, which is 33% faster, not 25%." },
  { letter: "B", text: "18 seconds", ok: false, expl: "If Iman runs 18s, Maya runs 23s. Speeds: 100/18 = 5.56 m/s vs 100/23 = 4.35 m/s. Ratio = 1.28, which is 28% faster, not 25%." },
  { letter: "C", text: "20 seconds", ok: true, expl: "If Iman runs 20s, Maya runs 25s. Speeds: 100/20 = 5 m/s vs 100/25 = 4 m/s. Ratio = 5/4 = 1.25, which is exactly 25% faster." },
  { letter: "D", text: "22 seconds", ok: false, expl: "If Iman runs 22s, Maya runs 27s. Speeds: 100/22 = 4.55 m/s vs 100/27 = 3.70 m/s. Ratio = 1.23, which is 23% faster, not 25%." },
  { letter: "E", text: "25 seconds", ok: false, expl: "If Iman runs 25s, Maya runs 30s. Speeds: 100/25 = 4 m/s vs 100/30 = 3.33 m/s. Ratio = 1.20, which is 20% faster, not 25%." },
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
            <span style={{ fontSize: 12, color: C.ps }}>Speed, Distance & Time</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 24</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>
                <span style={{ color: C.iman, fontWeight: 600 }}>Iman</span> and <span style={{ color: C.maya, fontWeight: 600 }}>Maya</span> ran a 100 metre race. Iman started <strong style={{ color: C.assum }}>2 seconds after</strong> Maya and finished <strong style={{ color: C.assum }}>3 seconds before</strong> her.
              </p>
              <p style={{ margin: 0 }}>
                Each girl ran at a constant speed, and Iman's speed was <strong style={{ color: C.assum }}>25% faster</strong> than Maya's. For how many seconds did Iman run?
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Timeline</span>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 14px" }}>
                Maya starts first. Iman starts 2 seconds later. Iman finishes 3 seconds before Maya. So Iman's running time is <strong style={{ color: C.white }}>5 seconds shorter</strong> than Maya's.
              </p>
              <Timeline imanTime={18} mayaTime={23} showLabels={true} variableMode={true} />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Key relationships</span>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Both run the same distance", value: "100 metres", col: C.white },
                  { label: "Time difference", value: "Maya's time = Iman's time + 5 seconds", col: C.assum },
                  { label: "Speed relationship", value: "Iman's speed = 1.25 × Maya's speed", col: C.assum },
                  { label: "Speed formula", value: "Speed = Distance / Time = 100 / time", col: C.ps },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.muted, minWidth: 140 }}>{r.label}</span>
                    <span style={{ fontSize: 13, color: r.col, fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>STRATEGY</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Call Iman's time <em>t</em>. Write expressions for both speeds in terms of <em>t</em>, then use the fact that Iman's speed is 1.25 times Maya's to form an equation.
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
                  Try each answer option as Iman's running time. The timeline and speed calculations update live. Only one option gives a speed ratio of exactly 1.25.
                </p>
              </div>
            </div>
            <VerifyChecker />
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "For how many seconds did Iman run?"
              </div>
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