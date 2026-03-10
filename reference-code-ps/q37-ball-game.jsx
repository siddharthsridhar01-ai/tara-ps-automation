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
  { id: 1, label: "Setup", title: "Define the Variables" },
  { id: 2, label: "Solve", title: "Find the Values" },
  { id: 3, label: "Verify", title: "Test Each Statement" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

/* ── Shot values ─────────────────────────────── */
const VALS = { chop: 5, creamer: 4, glink: 2, yip: 3 };
const VCOL = { chop: "#ef6b6b", creamer: "#5b8def", glink: "#55efc4", yip: "#f0c75e" };

/* ── Verify: Statement Checker ─────────────────────────────── */
function StatementChecker() {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(new Set());

  const statements = [
    { label: "A", text: "A creamer is worth more points than a chop.",
      check: () => VALS.creamer > VALS.chop,
      explain: `Creamer = ${VALS.creamer}, Chop = ${VALS.chop}. ${VALS.creamer} > ${VALS.chop} is false.` },
    { label: "B", text: "Two chops are worth less than three yips.",
      check: () => 2 * VALS.chop < 3 * VALS.yip,
      explain: `2 chops = ${2*VALS.chop}, 3 yips = ${3*VALS.yip}. ${2*VALS.chop} < ${3*VALS.yip} is false.` },
    { label: "C", text: "A glink is worth 2 points.",
      check: () => VALS.glink === 2,
      explain: `Glink = ${VALS.glink}. This is true.` },
    { label: "D", text: "Three yips are worth more than three creamers.",
      check: () => 3 * VALS.yip > 3 * VALS.creamer,
      explain: `3 yips = ${3*VALS.yip}, 3 creamers = ${3*VALS.creamer}. ${3*VALS.yip} > ${3*VALS.creamer} is false.` },
    { label: "E", text: "A chop is worth 6 points.",
      check: () => VALS.chop === 6,
      explain: `Chop = ${VALS.chop}, not 6. This is false.` },
  ];

  const handleSelect = (idx) => {
    setSelected(idx);
    setChecked(prev => new Set(prev).add(idx));
  };

  const current = selected !== null ? statements[selected] : null;
  const isTrue = current ? current.check() : false;

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Test each statement</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {statements.map((s, idx) => {
            const wasDone = checked.has(idx);
            const result = wasDone ? s.check() : null;
            const isSelected = selected === idx;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} style={{
                padding: "12px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                border: `2px solid ${isSelected ? C.accent : result === true ? C.ok + "66" : result === false ? C.fail + "33" : C.border}`,
                background: isSelected ? C.accent + "15" : result === true ? C.ok + "08" : C.card,
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? C.accent : result === true ? C.ok : result === false ? C.fail : C.muted, flexShrink: 0, width: 20 }}>{s.label}</span>
                <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{s.text}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: result === true ? C.ok : result === false ? C.fail : C.muted + "66", flexShrink: 0 }}>
                  {wasDone ? (result ? "True ✓" : "False ✗") : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {current && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: isTrue ? C.conclBg : C.failBg,
            border: `1px solid ${isTrue ? C.ok + "44" : C.fail + "44"}`,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: isTrue ? C.ok : C.fail, lineHeight: 1.6 }}>
              <strong>{current.label}: </strong>{current.explain}
            </p>
          </div>
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
      label: "Write the relationships",
      why: "Let c = creamer value. Then chop = c + 1 (one more than a creamer) and glink = c/2 (creamer is twice a glink). Let y = yip value.",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span>chop = <em>c</em> + 1</span>
          <span>glink = <em>c</em> / 2</span>
          <span>yip = <em>y</em></span>
        </div>
      ),
      color: C.ps,
    },
    {
      label: "Write my score equation",
      why: "I scored 3 chops + 4 yips + 3 creamers + 4 glinks = 47.",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span>3(<em>c</em>+1) + 4<em>y</em> + 3<em>c</em> + 4(<em>c</em>/2) = 47</span>
          <span>3<em>c</em> + 3 + 4<em>y</em> + 3<em>c</em> + 2<em>c</em> = 47</span>
          <span>8<em>c</em> + 4<em>y</em> = 44</span>
          <span><strong>2<em>c</em> + <em>y</em> = 11</strong></span>
        </div>
      ),
      color: C.calc,
    },
    {
      label: "Write opponent's score equation",
      why: "Opponent scored 5 chops + 3 yips + 3 creamers + 2 glinks = 50.",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span>5(<em>c</em>+1) + 3<em>y</em> + 3<em>c</em> + 2(<em>c</em>/2) = 50</span>
          <span>5<em>c</em> + 5 + 3<em>y</em> + 3<em>c</em> + <em>c</em> = 50</span>
          <span>9<em>c</em> + 3<em>y</em> = 45</span>
          <span><strong>3<em>c</em> + <em>y</em> = 15</strong></span>
        </div>
      ),
      color: C.calc,
    },
    {
      label: "Solve the simultaneous equations",
      why: "Subtract equation (i) from equation (ii) to eliminate y.",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span>(3<em>c</em> + <em>y</em>) − (2<em>c</em> + <em>y</em>) = 15 − 11</span>
          <span><em>c</em> = 4</span>
          <span>Then <em>y</em> = 11 − 2(4) = 3</span>
        </div>
      ),
      color: C.calc,
    },
    {
      label: "Find all four values",
      why: "Substitute c = 4 back into the relationships.",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ color: VCOL.chop }}>Chop = 4 + 1 = <strong>5</strong></span>
          <span style={{ color: VCOL.creamer }}>Creamer = <strong>4</strong></span>
          <span style={{ color: VCOL.yip }}>Yip = <strong>3</strong></span>
          <span style={{ color: VCOL.glink }}>Glink = 4 / 2 = <strong>2</strong></span>
        </div>
      ),
      conclusion: "Now check each statement. Only C (a glink is worth 2 points) is true.",
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
  { letter: "A", text: "A creamer is worth more points than a chop.", ok: false,
    expl: "Creamer = 4, chop = 5. A creamer is worth less, not more." },
  { letter: "B", text: "Two chops are worth less than three yips.", ok: false,
    expl: "Two chops = 10, three yips = 9. Two chops are worth more, not less." },
  { letter: "C", text: "A glink is worth 2 points.", ok: true,
    expl: "Creamer = 4, and a creamer is twice a glink, so glink = 2. This is the only true statement." },
  { letter: "D", text: "Three yips are worth more than three creamers.", ok: false,
    expl: "Three yips = 9, three creamers = 12. Three yips are worth less." },
  { letter: "E", text: "A chop is worth 6 points.", ok: false,
    expl: "Chop = creamer + 1 = 5, not 6." },
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
            <span style={{ fontSize: 12, color: C.ps }}>Simultaneous Equations</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 37</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 37</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>
                In a ball game points are accumulated by different combinations of four winning shots called a <strong style={{ color: VCOL.chop }}>chop</strong>, a <strong style={{ color: VCOL.creamer }}>creamer</strong>, a <strong style={{ color: VCOL.glink }}>glink</strong> and a <strong style={{ color: VCOL.yip }}>yip</strong>. Playing the game for the first time, the only knowledge I have about the scoring system is that a <strong style={{ color: C.white }}>chop is worth one point more than a creamer</strong>, and a <strong style={{ color: C.white }}>creamer is worth twice as many points as a glink</strong>.
              </p>
              <p style={{ margin: "0 0 10px" }}>
                I lose narrowly by <strong style={{ color: C.white }}>47 points to 50</strong>. I scored 3 chops, 4 yips, 3 creamers and 4 glinks. My victorious opponent scored 5 chops, 3 yips, 3 creamers and 2 glinks.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: C.assum }}>Which one of the following statements about the scoring system is the only one that is true?</strong>
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Variables</span>
              <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: "0 0 14px" }}>
                Let <em style={{ fontFamily: mathFont }}>c</em> = the value of a creamer. Express everything in terms of <em style={{ fontFamily: mathFont }}>c</em> and an unknown yip value <em style={{ fontFamily: mathFont }}>y</em>:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { name: "Chop", expr: "c + 1", color: VCOL.chop },
                  { name: "Creamer", expr: "c", color: VCOL.creamer },
                  { name: "Glink", expr: "c / 2", color: VCOL.glink },
                  { name: "Yip", expr: "y", color: VCOL.yip },
                ].map(v => (
                  <div key={v.name} style={{ background: "#1e2030", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: v.color, marginBottom: 4 }}>{v.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: C.text, fontFamily: mathFont }}>{v.expr}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Score breakdown</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.ps, fontWeight: 700, minWidth: 30 }}>Me</span>
                  <span style={{ fontSize: 13, color: C.text }}>3 chops + 4 yips + 3 creamers + 4 glinks = <strong style={{ color: C.white }}>47</strong></span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.assum, fontWeight: 700, minWidth: 30 }}>Opp</span>
                  <span style={{ fontSize: 13, color: C.text }}>5 chops + 3 yips + 3 creamers + 2 glinks = <strong style={{ color: C.white }}>50</strong></span>
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>STRATEGY</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Substitute the expressions into both score equations to get two equations in <em style={{ fontFamily: mathFont }}>c</em> and <em style={{ fontFamily: mathFont }}>y</em>, then solve simultaneously.
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
                  Now that we know all four values, click each statement to check whether it is true or false.
                </p>
              </div>
            </div>

            {/* Show the solved values */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Shot values</span>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                {Object.entries(VALS).map(([name, val]) => (
                  <div key={name} style={{ background: "#1e2030", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: VCOL[name], marginBottom: 4, textTransform: "capitalize" }}>{name}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: mathFont }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <StatementChecker />
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "Which one of the following statements about the scoring system is the only one that is true?"
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
