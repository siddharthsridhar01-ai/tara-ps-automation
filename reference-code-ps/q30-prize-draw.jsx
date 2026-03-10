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
  d1: "#55efc4", d2: "#74b9ff", d3: "#fd79a8",
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";

const stepsMeta = [
  { id: 0, label: "Read", title: "Read the Question" },
  { id: 1, label: "Setup", title: "Break Down the Problem" },
  { id: 2, label: "Solve", title: "Find All Combinations" },
  { id: 3, label: "Verify", title: "List Every Winning Ticket" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

const factorSets = [
  { digits: [1, 1, 8], perms: ["118", "181", "811"], count: 3 },
  { digits: [1, 2, 4], perms: ["124", "142", "214", "241", "412", "421"], count: 6 },
  { digits: [2, 2, 2], perms: ["222"], count: 1 },
];

const allWinners = factorSets.flatMap(f => f.perms);

/* ───────── Ticket Display ───────── */
function Ticket({ number, highlight, small }) {
  const digits = number.split("");
  const cols = [C.d1, C.d2, C.d3];
  return (
    <div style={{
      display: "inline-flex", gap: 2, padding: small ? "4px 6px" : "6px 8px",
      borderRadius: 8, background: highlight ? C.conclBg : "#1e2030",
      border: `1px solid ${highlight ? C.ok + "44" : C.border}`,
      transition: "all 0.3s",
    }}>
      {digits.map((d, i) => (
        <span key={i} style={{
          width: small ? 22 : 28, height: small ? 22 : 28, borderRadius: 5,
          background: cols[i] + "18", border: `1px solid ${cols[i]}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: small ? 13 : 16, fontWeight: 700, color: cols[i],
        }}>{d}</span>
      ))}
    </div>
  );
}

/* ───────── Algebra Walkthrough ───────── */
function AlgebraWalkthrough() {
  const [revealed, setRevealed] = useState(0);

  const steps = [
    {
      label: "Find digit sets that multiply to 8",
      why: "We need three single digits (1-9, no zeros since 0 makes any product 0) whose product is 8. Since 8 = 2³, we can factorise it systematically.",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>1 × 1 × 8 = 8</span>
          <span>1 × 2 × 4 = 8</span>
          <span>2 × 2 × 2 = 8</span>
        </div>
      ),
      after: "These are the only three ways. No other combination of digits 1-9 gives a product of 8.",
      color: C.ps,
    },
    {
      label: "Count permutations for {1, 1, 8}",
      why: "Two digits are the same (both 1s), so we divide by 2! to avoid double-counting.",
      math: <span>3! / 2! = 3 arrangements: <strong>118, 181, 811</strong></span>,
      color: C.d1,
    },
    {
      label: "Count permutations for {1, 2, 4}",
      why: "All three digits are different, so we get the full 3! permutations.",
      math: <span>3! = 6 arrangements: <strong>124, 142, 214, 241, 412, 421</strong></span>,
      color: C.d2,
    },
    {
      label: "Count permutations for {2, 2, 2}",
      why: "All three digits are the same, so there is only one arrangement.",
      math: <span>1 arrangement: <strong>222</strong></span>,
      color: C.d3,
    },
    {
      label: "Add them up",
      why: "The total number of major prize tickets is the sum across all three digit sets.",
      math: <span>3 + 6 + 1 = <strong style={{ color: C.ok }}>10</strong></span>,
      conclusion: "There are 10 tickets that win a major prize. The answer is C.",
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
                {s.after && (
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{s.after}</p>
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

/* ───────── Ticket Checker (Verify step) ───────── */
function TicketChecker() {
  const [digits, setDigits] = useState([null, null, null]);
  const [history, setHistory] = useState([]);

  const setDigit = (pos, val) => {
    setDigits(prev => { const n = [...prev]; n[pos] = val; return n; });
  };

  const allSet = digits.every(d => d !== null);
  const product = allSet ? digits[0] * digits[1] * digits[2] : null;
  const isWinner = product === 8;
  const isMinor = product === 12;
  const ticketStr = allSet ? digits.join("") : null;

  const handleCheck = () => {
    if (!allSet) return;
    const entry = { ticket: ticketStr, product, isWinner, isMinor };
    if (!history.find(h => h.ticket === ticketStr)) {
      setHistory(prev => [entry, ...prev]);
    }
  };

  const handleClear = () => {
    setDigits([null, null, null]);
  };

  const cols = [C.d1, C.d2, C.d3];
  const winnersFound = history.filter(h => h.isWinner).length;

  return (
    <div>
      {/* Digit picker */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Build a ticket</span>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
          {[0, 1, 2].map(pos => (
            <div key={pos}>
              <div style={{ fontSize: 11, fontWeight: 700, color: cols[pos], marginBottom: 6, textAlign: "center" }}>Digit {pos + 1}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => (
                  <button key={v} onClick={() => setDigit(pos, v)} style={{
                    padding: "8px 2px", borderRadius: 6, cursor: "pointer",
                    border: `1.5px solid ${digits[pos] === v ? cols[pos] : C.border}`,
                    background: digits[pos] === v ? cols[pos] + "18" : "transparent",
                    color: digits[pos] === v ? cols[pos] : C.muted,
                    fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                  }}>{v}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Preview and check */}
        {allSet && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <Ticket number={ticketStr} highlight={isWinner} />
            <span style={{ fontSize: 14, color: C.muted }}>
              {digits[0]} × {digits[1]} × {digits[2]} = <strong style={{ color: isWinner ? C.ok : isMinor ? C.assum : C.text }}>{product}</strong>
            </span>
            {product === 0 && <span style={{ fontSize: 12, color: C.muted }}>( any digit is 0 )</span>}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCheck} disabled={!allSet} style={{
            flex: 1, padding: "11px 16px", borderRadius: 10, border: "none",
            background: allSet ? `linear-gradient(135deg, ${C.accent}, ${C.accentLight})` : C.border,
            color: allSet ? C.white : C.muted, fontSize: 13, fontWeight: 600, cursor: allSet ? "pointer" : "not-allowed",
          }}>Check ticket</button>
          <button onClick={handleClear} style={{
            padding: "11px 16px", borderRadius: 10, cursor: "pointer",
            border: `1px solid ${C.border}`, background: "transparent",
            color: C.muted, fontSize: 13, fontWeight: 600,
          }}>Clear</button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Tickets tested</span>
            <span style={{ fontSize: 12, color: C.ok, fontWeight: 600 }}>
              {winnersFound} major prize{winnersFound !== 1 ? "s" : ""} found (of 10)
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.map(h => (
              <div key={h.ticket} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 14px", borderRadius: 8,
                background: h.isWinner ? C.conclBg : h.isMinor ? C.assumBg : "#1e2030",
                border: `1px solid ${h.isWinner ? C.ok + "44" : h.isMinor ? C.assum + "44" : C.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Ticket number={h.ticket} highlight={h.isWinner} small={true} />
                  <span style={{ fontSize: 12, color: C.muted }}>
                    product = {h.product}
                  </span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: h.isWinner ? C.ok : h.isMinor ? C.assum : C.muted,
                }}>
                  {h.isWinner ? "Major prize ✓" : h.isMinor ? "Minor prize" : "No prize"}
                </span>
              </div>
            ))}
          </div>

          {winnersFound === 10 && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: C.conclBg, border: `1px solid ${C.ok}44` }}>
              <p style={{ margin: 0, fontSize: 13, color: C.ok, lineHeight: 1.6 }}>
                <strong>Perfect!</strong> You have found all 10 major prize tickets.
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
  { letter: "A", text: "7", ok: false, expl: "This would only be correct if you missed some permutations. There are 3 + 6 + 1 = 10 winning tickets, not 7." },
  { letter: "B", text: "9", ok: false, expl: "This might come from forgetting one arrangement. All three digit sets give 3 + 6 + 1 = 10." },
  { letter: "C", text: "10", ok: true, expl: "Three digit sets multiply to 8: {1,1,8} gives 3 tickets, {1,2,4} gives 6 tickets, {2,2,2} gives 1 ticket. Total: 3 + 6 + 1 = 10." },
  { letter: "D", text: "13", ok: false, expl: "This overcounts. You may have counted some arrangements twice or included an invalid digit set." },
  { letter: "E", text: "14", ok: false, expl: "This overcounts. Check that you are not treating {1,1,8} as having 6 permutations (it only has 3, since the two 1s are identical)." },
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
            <span style={{ fontSize: 12, color: C.ps }}>Combinatorics</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 30</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 30</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>
                In a prize draw, tickets are printed with 3-digit numbers from 001 to 999. Contestants pay to take a ticket at random. A major prize is awarded for all tickets where the product of the 3 digits on the ticket drawn is 8 and a minor prize is awarded when the product is 12. For example 143 wins a minor prize because 1 × 4 × 3 = 12.
              </p>
              <p style={{ margin: 0 }}>
                What is the <strong style={{ color: C.assum }}>maximum number of major prizes</strong> which could be won?
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
                Find every 3-digit ticket where the product of its three digits equals 8. This is a two-part problem:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: 13, color: C.text }}>Find all sets of three digits (1-9) that multiply to 8</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>2</span>
                  <span style={{ fontSize: 13, color: C.text }}>Count the number of different arrangements of each set</span>
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.calcBg, border: `1px solid ${C.calc}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.calc, fontWeight: 700, whiteSpace: "nowrap" }}>KEY POINT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  No digit can be 0, because any number multiplied by 0 gives 0, not 8. So every digit must be between 1 and 9. Also note that 8 = 2³, so the only prime factor involved is 2.
                </p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>EXAMPLE</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>
                    The ticket <strong>124</strong> wins because 1 × 2 × 4 = 8. But so does <strong>421</strong>, since the same digits in a different order still give the same product.
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Ticket number="124" highlight={true} />
                    <Ticket number="421" highlight={true} />
                  </div>
                </div>
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
                  A major prize is won when the product of the three digits equals <strong style={{ color: C.ok }}>8</strong>. Build any 3-digit ticket below to check its digit product. See how many of the 10 major prize winners you can find.
                </p>
              </div>
            </div>
            <TicketChecker />
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "What is the maximum number of major prizes which could be won?"
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>All 10 winning tickets</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {allWinners.map(t => <Ticket key={t} number={t} highlight={true} small={true} />)}
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