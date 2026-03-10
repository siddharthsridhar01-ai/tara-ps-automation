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
  cat: "#f0c75e", catBg: "rgba(240,199,94,0.12)",
  mouse: "#a29bfe", mouseBg: "rgba(162,155,254,0.12)",
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";

const stepsMeta = [
  { id: 0, label: "Read", title: "Read the Question" },
  { id: 1, label: "Setup", title: "Understand the Rules" },
  { id: 2, label: "Solve", title: "Deduce Card Identities" },
  { id: 3, label: "Verify", title: "Check Each Option" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

/* ── Game log data ─────────────────────────────── */
const GAME_LOG = [
  { player: "me", cards: [2, 13], result: "cat and mouse pair", point: true },
  { player: "sister", cards: [7, 16], result: "cards replaced", point: false },
  { player: "me", cards: [5, 11], result: "cat and mouse pair", point: true },
  { player: "sister", cards: [10, 12], result: "cards replaced", point: false },
  { player: "me", cards: [3, 8], result: "two mice; cards replaced", point: false },
  { player: "sister", cards: [7, 14], result: "cat and mouse pair", point: true },
  { player: "me", cards: [1, 15], result: "cat and mouse pair", point: true },
  { player: "sister", cards: [8, 10], result: "cat and mouse pair", point: true },
];

// Card states: "cat", "mouse", "unknown", "pair" (one of each but unknown which)
// "same" (both same type but unknown which)
const KNOWN = {
  3: "mouse", 8: "mouse", 10: "cat", 12: "cat",
};

/* ── Card component ─────────────────────────────── */
function Card({ num, status, small, highlight }) {
  const isCat = status === "cat";
  const isMouse = status === "mouse";
  const isKnown = isCat || isMouse;
  const sz = small ? 36 : 44;
  const bgCol = highlight ? (isCat ? C.catBg : isMouse ? C.mouseBg : C.accent + "15") :
    isKnown ? (isCat ? C.cat + "12" : C.mouse + "12") : "#1e2030";
  const borderCol = highlight ? (isCat ? C.cat : isMouse ? C.mouse : C.accent) :
    isKnown ? (isCat ? C.cat + "55" : C.mouse + "55") : C.border;

  return (
    <div style={{
      width: sz, height: sz * 1.3, borderRadius: 6,
      background: bgCol, border: `1.5px solid ${borderCol}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 2, transition: "all 0.3s",
    }}>
      {isKnown && <span style={{ fontSize: small ? 12 : 16 }}>{isCat ? "🐱" : "🐭"}</span>}
      <span style={{ fontSize: small ? 9 : 11, fontWeight: 700, color: isKnown ? (isCat ? C.cat : C.mouse) : C.muted }}>{num}</span>
    </div>
  );
}

/* ── 4×4 Card Grid ─────────────────────────────── */
function CardGrid({ showKnown, highlightCards }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, maxWidth: 220, margin: "0 auto" }}>
      {Array.from({ length: 16 }, (_, i) => i + 1).map(num => {
        const status = showKnown && KNOWN[num] ? KNOWN[num] : null;
        const hl = highlightCards && highlightCards.includes(num);
        return <Card key={num} num={num} status={status} highlight={hl} />;
      })}
    </div>
  );
}

/* ── Game Log Table ─────────────────────────────── */
function GameLogTable({ revealUpTo }) {
  const max = revealUpTo !== undefined ? revealUpTo : GAME_LOG.length;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Turn", "Player", "Cards", "Result", ""].map(h => (
              <th key={h} style={{ padding: "8px 8px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GAME_LOG.slice(0, max).map((turn, i) => (
            <tr key={i} style={{ animation: i === max - 1 && revealUpTo !== undefined ? "fadeSlideIn 0.3s ease-out" : "none" }}>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}22`, color: C.muted, fontSize: 12 }}>{i + 1}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}22`, color: turn.player === "me" ? C.ps : C.assum, fontWeight: 600 }}>{turn.player}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}22`, color: C.text, fontFamily: mathFont }}>{turn.cards[0]} & {turn.cards[1]}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}22`, color: turn.point ? C.ok : C.muted }}>{turn.result}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}22`, color: turn.point ? C.ok : C.muted, fontWeight: 600 }}>{turn.point ? "1 pt" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

/* ── Solve: Deduction Walkthrough ─────────────────────────────── */
function DeductionWalkthrough() {
  const [revealed, setRevealed] = useState(0);

  const steps = [
    {
      label: "Turn 5 reveals two mice",
      why: "I pick cards 3 & 8 and get \"two mice; cards replaced\". This is the only turn where the exact types are stated.",
      math: <span>Card 3 = <strong style={{ color: C.mouse }}>mouse</strong>, Card 8 = <strong style={{ color: C.mouse }}>mouse</strong></span>,
      color: C.mouse,
    },
    {
      label: "Turn 8 reveals card 10",
      why: "Sister picks cards 8 & 10 and gets a cat and mouse pair. Since we know card 8 is a mouse, card 10 must be the cat.",
      math: <span>Card 8 = mouse, so Card 10 = <strong style={{ color: C.cat }}>cat</strong></span>,
      color: C.cat,
    },
    {
      label: "Turn 4 reveals card 12",
      why: "Sister picked cards 10 & 12 and had to replace them (both same type). Since card 10 is a cat, card 12 must also be a cat.",
      math: <span>Card 10 = cat, same type → Card 12 = <strong style={{ color: C.cat }}>cat</strong></span>,
      color: C.cat,
    },
    {
      label: "Find the guaranteed pair",
      why: "Card 3 is definitely a mouse. Card 12 is definitely a cat. Picking cards 3 & 12 is guaranteed to be a cat and mouse pair.",
      math: <span>Card 3 (<strong style={{ color: C.mouse }}>mouse</strong>) + Card 12 (<strong style={{ color: C.cat }}>cat</strong>) = guaranteed pair</span>,
      conclusion: "The answer is D: cards 3 & 12.",
      color: C.ok,
    },
  ];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 16 }}>Step-by-step deduction</span>

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

/* ── Verify: Option Checker ─────────────────────────────── */
function OptionChecker() {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(new Set());

  const options = [
    { label: "3 & 4", cards: [3, 4], guaranteed: false, reason: "Card 3 is a known mouse, but card 4's identity is unknown. This pair might be two mice." },
    { label: "3 & 6", cards: [3, 6], guaranteed: false, reason: "Card 3 is a known mouse, but card 6's identity is unknown. This pair might be two mice." },
    { label: "3 & 9", cards: [3, 9], guaranteed: false, reason: "Card 3 is a known mouse, but card 9's identity is unknown. This pair might be two mice." },
    { label: "3 & 12", cards: [3, 12], guaranteed: true, reason: "Card 3 is a known mouse, card 12 is a known cat. This is guaranteed to be a cat and mouse pair." },
    { label: "3 & 16", cards: [3, 16], guaranteed: false, reason: "Card 3 is a known mouse, but card 16's identity is unknown. We know 7 & 16 were the same type (turn 2), and 7 & 14 were a pair (turn 6), but we cannot determine if 16 is a cat or mouse." },
  ];

  const handleSelect = (idx) => {
    setSelected(idx);
    setChecked(prev => new Set(prev).add(idx));
  };

  const current = selected !== null ? options[selected] : null;

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Select a pair to check</span>
        <div style={{ display: "flex", gap: 8 }}>
          {options.map((opt, idx) => {
            const isSelected = selected === idx;
            const wasDone = checked.has(idx);
            const isOk = opt.guaranteed && wasDone;
            const isBad = !opt.guaranteed && wasDone;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} style={{
                flex: 1, padding: "12px 4px", borderRadius: 10, cursor: "pointer",
                border: `2px solid ${isSelected ? C.accent : isOk ? C.ok + "66" : isBad ? C.fail + "33" : C.border}`,
                background: isSelected ? C.accent + "15" : isOk ? C.ok + "08" : C.card,
                transition: "all 0.2s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? C.accent : isOk ? C.ok : C.text }}>{opt.label}</span>
                <span style={{ fontSize: 10, color: isOk ? C.ok : isBad ? C.fail : C.muted + "66", fontWeight: 600 }}>
                  {wasDone ? (opt.guaranteed ? "Guaranteed ✓" : "Not certain") : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {current && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Cards {current.label}</span>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 14, justifyContent: "center" }}>
            {current.cards.map(num => (
              <Card key={num} num={num} status={KNOWN[num] || null} highlight={true} small={false} />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {current.cards.map(num => (
              <div key={num} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.muted, minWidth: 60 }}>Card {num}</span>
                <span style={{ fontSize: 13, color: KNOWN[num] ? (KNOWN[num] === "cat" ? C.cat : C.mouse) : C.muted, fontWeight: 600 }}>
                  {KNOWN[num] ? (KNOWN[num] === "cat" ? "🐱 Cat (known)" : "🐭 Mouse (known)") : "❓ Unknown"}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: current.guaranteed ? C.conclBg : C.failBg,
            border: `1px solid ${current.guaranteed ? C.ok + "44" : C.fail + "44"}`,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: current.guaranteed ? C.ok : C.fail, lineHeight: 1.6 }}>
              {current.guaranteed ? <strong>Guaranteed pair. </strong> : <strong>Not certain. </strong>}
              {current.reason}
            </p>
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
  { letter: "A", text: "3 & 4", ok: false, expl: "Card 3 is a known mouse, but card 4 has never been picked up. Its identity is unknown, so this pair is not guaranteed." },
  { letter: "B", text: "3 & 6", ok: false, expl: "Card 3 is a known mouse, but card 6 has never been picked up. Its identity is unknown." },
  { letter: "C", text: "3 & 9", ok: false, expl: "Card 3 is a known mouse, but card 9 has never been picked up. Its identity is unknown." },
  { letter: "D", text: "3 & 12", ok: true, expl: "Card 3 is a known mouse (from turn 5). Card 12 is a known cat (turn 4 showed 10 & 12 are the same type; turn 8 proved 10 is a cat). This is the only guaranteed cat and mouse pair." },
  { letter: "E", text: "3 & 16", ok: false, expl: "Card 3 is a known mouse. Card 16 was in a same-type pair with card 7 (turn 2), but we cannot determine whether they were both cats or both mice." },
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
            <span style={{ fontSize: 12, color: C.ps }}>Logical Deduction</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 44</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 44</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>
                In <em>Cat and Mouse</em>, a game for two players, 16 cards are shuffled and then placed face down on a table as shown below:
              </p>
            </div>

            <CardGrid showKnown={false} />

            <div style={{ fontSize: 12, color: C.muted, textAlign: "center", margin: "8px 0 14px" }}>[The numbers below the cards are for identification purposes.]</div>

            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>
                Cats are pictured on 8 of the cards and mice on the other 8. Both players pick up two cards at each turn, taking care not to show the cards to the other player. If the two cards are a cat and a mouse, the player <strong style={{ color: C.white }}>keeps the cards</strong> and scores a point, but does not reveal which was the cat and which was the mouse. If, however, the two cards are both cats or both mice, the player must put the cards back in the same places.
              </p>
              <p style={{ margin: "0 0 10px" }}>
                My sister and I are currently playing a game, and I am leading by <strong style={{ color: C.white }}>3 points to 2</strong>. The game has progressed so far as follows:
              </p>
            </div>

            <GameLogTable />

            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text, marginTop: 14 }}>
              <p style={{ margin: "0 0 6px" }}>
                It is my turn again and I know for certain that the two cards I am going to pick up will be a cat and mouse pair.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: C.assum }}>Which two cards am I going to pick up?</strong>
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
                Find two cards where we know for certain one is a cat and one is a mouse. To do this, we need to work through the game log and deduce which cards' identities we can determine.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: 13, color: C.text }}>Find cards whose type (cat/mouse) is directly stated</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>2</span>
                  <span style={{ fontSize: 13, color: C.text }}>Chain deductions using "same type" and "cat and mouse pair" results</span>
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>STRATEGY</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Most turns only tell you the pair is one cat + one mouse, without saying which is which. The key breakthrough is turn 5, where "two mice" is stated explicitly. From there, chain logic through other turns that share a card with known identity.
                </p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.calcBg, border: `1px solid ${C.calc}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.calc, fontWeight: 700, whiteSpace: "nowrap" }}>KEY POINT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  "Cards replaced" means both cards are the same type (both cats or both mice), but you do not know which. "Cat and mouse pair" means one of each, but you do not know which card is which. Only "two mice" or "two cats" gives you definite identities.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Solve */}
        {step === 2 && <DeductionWalkthrough />}

        {/* Step 3: Verify */}
        {step === 3 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>TRY IT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Click each option pair to see whether both card identities are known. Only a pair with one confirmed cat and one confirmed mouse is guaranteed.
                </p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Known cards</span>
              <CardGrid showKnown={true} />
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12, fontSize: 11, color: C.muted }}>
                <span><span style={{ color: C.cat }}>🐱</span> Known cat</span>
                <span><span style={{ color: C.mouse }}>🐭</span> Known mouse</span>
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
                "Which two cards am I going to pick up?"
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Deduction chain</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 13, color: C.text, lineHeight: 2 }}>
                <span>Turn 5: cards 3 & 8 =</span> <span style={{ color: C.mouse, fontWeight: 600 }}>both mice</span>
                <span style={{ color: C.muted }}>→</span>
                <span>Turn 8: 8 (mouse) & 10 =</span> <span style={{ color: C.cat, fontWeight: 600 }}>10 is cat</span>
                <span style={{ color: C.muted }}>→</span>
                <span>Turn 4: 10 (cat) & 12 same type =</span> <span style={{ color: C.cat, fontWeight: 600 }}>12 is cat</span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
                <Card num={3} status="mouse" highlight={true} />
                <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: C.ok }}>+</div>
                <Card num={12} status="cat" highlight={true} />
                <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: C.ok, fontWeight: 700 }}>= guaranteed pair</div>
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
