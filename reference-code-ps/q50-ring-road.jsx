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
  { id: 1, label: "Setup", title: "Find the Segment Distances" },
  { id: 2, label: "Solve", title: "Check Each Sign" },
  { id: 3, label: "Verify", title: "Locate the Error" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

/* ── Towns clockwise and sign data ─────────────────────────────── */
const TOWNS = ["Portville", "Queensgate", "Radcliffe", "Southtown", "Tunborough"];
const TCOL = ["#ef6b6b", "#5b8def", "#c084fc", "#f0c75e", "#55efc4"];

// Signs positioned clockwise: sign 1 between Portville & Queensgate, etc.
// Each sign lists distances clockwise to each town
const SIGNS = [
  { label: "sign 1", between: ["Portville", "Queensgate"],
    dists: { Queensgate: 10, Radcliffe: 32, Southtown: 49, Tunborough: 64, Portville: 88 } },
  { label: "sign 2", between: ["Queensgate", "Radcliffe"],
    dists: { Radcliffe: 17, Southtown: 34, Tunborough: 49, Portville: 73, Queensgate: 92 } },
  { label: "sign 3", between: ["Radcliffe", "Southtown"],
    dists: { Southtown: 4, Tunborough: 19, Portville: 43, Queensgate: 62, Radcliffe: 84 } },
  { label: "sign 4", between: ["Southtown", "Tunborough"],
    dists: { Tunborough: 9, Portville: 31, Queensgate: 52, Radcliffe: 74, Southtown: 91 } },
  { label: "sign 5", between: ["Tunborough", "Portville"],
    dists: { Portville: 13, Queensgate: 32, Radcliffe: 54, Southtown: 71, Tunborough: 86 } },
];

// Segment distances (clockwise between consecutive towns)
// We can derive these from any correct sign.
// Using sign 1: Queensgate=10, Radcliffe=32, Southtown=49, Tunborough=64, Portville=88
// So: sign1→Q=10, Q→R=32-10=22, R→S=49-32=17, S→T=64-49=15, T→P=88-64=24, P→sign1=ring-88? No, ring total.
// Actually ring total = distance from sign back to itself = total. sign1→P=88, but sign1 is between P and Q.
// So P→sign1 + sign1→Q = P→Q segment. sign1→Q=10, sign1→P(clockwise)=88.
// Ring total = 88 + 10 = 98? No — sign1→P clockwise = 88 means going CW past Q,R,S,T to P = 88.
// So ring = sign1→P(cw) + P→sign1(cw) ... but sign1 is between P and Q.
// Actually the ring total = the sum if you go all the way around = sign's distance to the furthest town + that town back to sign.
// From sign 1: going CW, last entry is Portville=88. Then from Portville back to sign 1 is some small distance.
// Ring = 88 + (Portville→sign1 going CW). But sign1 is just after Portville going CW.
// So Portville→sign1 = ring - 88. And sign1→Queensgate = 10. So Portville→Queensgate = (ring-88) + 10.
//
// Let's use differences between consecutive signs to get segments.
// sign1→Q=10, sign2→R=17. sign1→R=32.
// Distance from sign1 to sign2 (clockwise) = sign1→Q + Q→sign2.
// sign1→R = sign1→sign2 + sign2→R, so sign1→sign2 = 32-17 = 15. But sign1→Q = 10, so Q→sign2 = 15-10 = 5.
//
// Let me just find all between-town distances from sign 1 (assuming correct):
// sign1→Q = 10, sign1→R = 32 → Q→R = 22
// sign1→R = 32, sign1→S = 49 → R→S = 17
// sign1→S = 49, sign1→T = 64 → S→T = 15
// sign1→T = 64, sign1→P = 88 → T→P = 24
// Ring total from sign1: last is P=88 clockwise. Ring = P back to sign1 + 88.
// If we knew ring total... let's check with sign 5.
// sign5→P = 13, sign5→Q = 32 → P→Q = 32-13 = 19
// sign5→Q = 32, sign5→R = 54 → Q→R = 22 ✓
// sign5→R = 54, sign5→S = 71 → R→S = 17 ✓
// sign5→S = 71, sign5→T = 86 → S→T = 15 ✓
// sign5→T = 86 (going CW all the way around past P,Q,R,S). Ring = 86 + T→sign5.
// sign5 is between T and P. sign5→P = 13. So T→sign5 + sign5→P = T→P = 24.
// T→sign5 = 24 - 13 = 11. Ring = 86 + 11 = 97? Hmm.
// Check: sign1→P=88. P→sign1 = ? sign1 is between P and Q. P→sign1 + sign1→Q = P→Q = 19. sign1→Q=10. P→sign1=9.
// Ring = 88 + 9 = 97. ✓
//
// Now check sign 4: sign4→T=9, sign4→P=31 → T→P = 31-9 = 22. But we got T→P = 24 from signs 1 and 5. ERROR! 22 ≠ 24.
// sign4→P=31, sign4→Q=52 → P→Q = 52-31 = 21. But we got P→Q = 19. ERROR! 21 ≠ 19.
// Hmm, multiple errors? Or is the whole sign shifted?
// sign4→Q=52, sign4→R=74 → Q→R = 22 ✓
// sign4→R=74, sign4→S=91 → R→S = 17 ✓
// So sign 4's Q→R and R→S are correct, but T→P and P→Q are wrong.
// Actually: sign4→T=9, then T→P should be 24, so sign4→P should be 9+24=33. But sign 4 says 31. Off by 2.
// And 31+19=50 but sign4 says Q=52. 33+19=52 ✓! So if sign4→P were 33, then Q=52 works.
// So the error is sign4→Portville = 31, should be 33. That single error cascades.
// Actually wait — let me recheck. The differences within sign 4:
// T=9, P=31: diff=22 (should be T→P=24, so wrong)
// P=31, Q=52: diff=21 (should be P→Q=19, so wrong)
// Q=52, R=74: diff=22 ✓
// R=74, S=91: diff=17 ✓
// So sign4→P=31 is wrong (should be 33). That makes T→P=22 instead of 24, and P→Q=21 instead of 19.
// The error is the Portville distance on sign 4.

const SEGMENTS = { PQ: 19, QR: 22, RS: 17, ST: 15, TP: 24 }; // correct between-town distances
const RING = 97;
const ERROR_SIGN = 3; // index (sign 4)
const ERROR_TOWN = "Portville";
const ERROR_SHOWN = 31;
const ERROR_CORRECT = 33;

// Check function: for a given sign, compute expected distances and find mismatches
function checkSign(signIdx) {
  const sign = SIGNS[signIdx];
  const results = [];
  const dArr = TOWNS.map(t => ({ town: t, shown: sign.dists[t] }));
  // Sort by shown distance (clockwise order from sign)
  dArr.sort((a, b) => a.shown - b.shown);

  // Check consecutive differences against known segment distances
  for (let i = 0; i < dArr.length - 1; i++) {
    const from = dArr[i].town;
    const to = dArr[i + 1].town;
    const diff = dArr[i + 1].shown - dArr[i].shown;
    const segKey = getSegKey(from, to);
    const expected = segKey ? SEGMENTS[segKey] : null;
    results.push({ from, to, diff, expected, ok: expected !== null && diff === expected });
  }
  return { dArr, results };
}

function getSegKey(a, b) {
  const pairs = [["Portville","Queensgate","PQ"],["Queensgate","Radcliffe","QR"],["Radcliffe","Southtown","RS"],["Southtown","Tunborough","ST"],["Tunborough","Portville","TP"]];
  for (const [t1, t2, key] of pairs) {
    if ((a === t1 && b === t2) || (a === t2 && b === t1)) return key;
  }
  return null;
}

/* ── Ring Road Diagram ─────────────────────────────── */
function RingDiagram({ highlightSign, highlightTowns }) {
  const cx = 220, cy = 170, rx = 120, ry = 110;
  // Towns positioned clockwise from top
  const townAngles = [-90, -18, 54, 126, 198]; // degrees, roughly matching the paper layout
  const toRad = (d) => d * Math.PI / 180;
  const townPos = townAngles.map(a => ({
    x: cx + rx * Math.cos(toRad(a)),
    y: cy + ry * Math.sin(toRad(a)),
  }));
  // Signs between towns
  const signAngles = [-54, 18, 90, 162, 234];
  const signPos = signAngles.map(a => ({
    x: cx + (rx + 2) * Math.cos(toRad(a)),
    y: cy + (ry + 2) * Math.sin(toRad(a)),
  }));

  // Label positions pushed well outside the ring with correct anchoring
  const labelConfig = [
    { dx: 0, dy: -20, anchor: "middle" },    // Portville (top)
    { dx: 18, dy: -8, anchor: "start" },      // Queensgate (right)
    { dx: 18, dy: 14, anchor: "start" },      // Radcliffe (bottom-right)
    { dx: 0, dy: 24, anchor: "middle" },       // Southtown (bottom)
    { dx: -18, dy: -8, anchor: "end" },        // Tunborough (left)
  ];

  return (
    <svg viewBox="0 0 440 340" style={{ width: "100%", maxWidth: 460, display: "block", margin: "0 auto" }}>
      {/* Ring road */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.muted} strokeWidth={3} opacity={0.3} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.border} strokeWidth={8} opacity={0.15} />

      {/* Towns */}
      {TOWNS.map((t, i) => {
        const isHL = highlightTowns && highlightTowns.includes(t);
        const lc = labelConfig[i];
        return (
          <g key={t}>
            <circle cx={townPos[i].x} cy={townPos[i].y} r={6} fill={isHL ? TCOL[i] : C.muted} stroke={isHL ? C.white : "none"} strokeWidth={isHL ? 2 : 0} />
            <text x={townPos[i].x + lc.dx} y={townPos[i].y + lc.dy}
              fill={isHL ? TCOL[i] : C.text} fontSize={12} fontWeight={isHL ? 700 : 500}
              textAnchor={lc.anchor} fontFamily="'Gill Sans', sans-serif">{t}</text>
          </g>
        );
      })}

      {/* Signs */}
      {SIGNS.map((s, i) => {
        const isHL = highlightSign === i;
        return (
          <g key={i}>
            <rect x={signPos[i].x - 8} y={signPos[i].y - 8} width={16} height={16} rx={3}
              fill={isHL ? C.accent : C.card} stroke={isHL ? C.accentLight : C.border} strokeWidth={1.5} />
            <line x1={signPos[i].x - 4} y1={signPos[i].y - 3} x2={signPos[i].x + 4} y2={signPos[i].y + 3}
              stroke={isHL ? C.accentLight : C.muted} strokeWidth={2} />
            <line x1={signPos[i].x + 4} y1={signPos[i].y - 3} x2={signPos[i].x - 4} y2={signPos[i].y + 3}
              stroke={isHL ? C.accentLight : C.muted} strokeWidth={2} />
            <text x={signPos[i].x} y={signPos[i].y - 14}
              fill={isHL ? C.accentLight : C.muted} fontSize={9} fontWeight={600}
              textAnchor="middle" fontFamily="'Gill Sans', sans-serif">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Sign Table ─────────────────────────────── */
function SignTable({ signIdx, highlightError }) {
  const sign = SIGNS[signIdx];
  const ordered = TOWNS.map(t => ({ town: t, dist: sign.dists[t] })).sort((a, b) => a.dist - b.dist);
  const isError = signIdx === ERROR_SIGN;
  return (
    <div style={{ background: "#1e2030", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.accentLight, marginBottom: 8, textAlign: "center" }}>{sign.label}</div>
      {ordered.map(({ town, dist }) => {
        const ti = TOWNS.indexOf(town);
        const isErr = highlightError && isError && town === ERROR_TOWN;
        return (
          <div key={town} style={{ display: "flex", justifyContent: "space-between", padding: "3px 6px", borderRadius: 4, background: isErr ? C.failBg : "transparent" }}>
            <span style={{ fontSize: 12, color: isErr ? C.fail : TCOL[ti], fontWeight: 600 }}>{town}</span>
            <span style={{ fontSize: 12, color: isErr ? C.fail : C.text, fontWeight: 600, fontFamily: mathFont }}>{dist}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Solve: Algebra Walkthrough ─────────────────────────────── */
function AlgebraWalkthrough() {
  const [revealed, setRevealed] = useState(0);

  const steps = [
    {
      label: "Find between-town distances",
      why: "Pick any sign and subtract consecutive distances to find the gap between adjacent towns. Using sign 1:",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Q→R = 32 − 10 = 22 km</span>
          <span>R→S = 49 − 32 = 17 km</span>
          <span>S→T = 64 − 49 = 15 km</span>
          <span>T→P = 88 − 64 = 24 km</span>
        </div>
      ),
      after: "We can also get P→Q from sign 5: 32 − 13 = 19 km. These five segments should be consistent across all signs.",
      color: C.ps,
    },
    {
      label: "Verify with sign 5",
      why: "Cross-check the same segments using a different sign:",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>P→Q = 32 − 13 = 19 ✓</span>
          <span>Q→R = 54 − 32 = 22 ✓</span>
          <span>R→S = 71 − 54 = 17 ✓</span>
          <span>S→T = 86 − 71 = 15 ✓</span>
        </div>
      ),
      after: "Signs 1 and 5 agree on all segments. These are the correct between-town distances.",
      color: C.calc,
    },
    {
      label: "Check sign 4",
      why: "Now check sign 4's consecutive differences:",
      math: (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>T→P = 31 − 9 = <strong style={{ color: C.fail }}>22</strong> &nbsp; (should be 24) ✗</span>
          <span>P→Q = 52 − 31 = <strong style={{ color: C.fail }}>21</strong> &nbsp; (should be 19) ✗</span>
          <span>Q→R = 74 − 52 = 22 ✓</span>
          <span>R→S = 91 − 74 = 17 ✓</span>
        </div>
      ),
      color: C.fail,
    },
    {
      label: "Identify the error",
      why: "T→P and P→Q are both wrong, but Q→R and R→S are fine. The error sits at the boundary: the Portville distance on sign 4.",
      math: <span>Sign 4 shows Portville = <strong style={{ color: C.fail }}>31</strong>, should be <strong style={{ color: C.ok }}>33</strong></span>,
      conclusion: "Sign 4 contains the error. The answer is D.",
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

/* ── Verify: Sign Checker ─────────────────────────────── */
function SignChecker() {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(new Set());

  const handleSelect = (idx) => {
    setSelected(idx);
    setChecked(prev => new Set(prev).add(idx));
  };

  const current = selected !== null ? checkSign(selected) : null;
  const hasError = selected === ERROR_SIGN;

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Select a sign to check</span>
        <div style={{ display: "flex", gap: 8 }}>
          {SIGNS.map((s, idx) => {
            const isSelected = selected === idx;
            const wasDone = checked.has(idx);
            const isErr = idx === ERROR_SIGN && wasDone;
            const wasOk = wasDone && idx !== ERROR_SIGN;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} style={{
                flex: 1, padding: "12px 4px", borderRadius: 10, cursor: "pointer",
                border: `2px solid ${isSelected ? C.accent : isErr ? C.fail + "66" : wasOk ? C.ok + "44" : C.border}`,
                background: isSelected ? C.accent + "15" : isErr ? C.fail + "08" : C.card,
                transition: "all 0.2s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? C.accent : isErr ? C.fail : C.text }}>{s.label}</span>
                <span style={{ fontSize: 10, color: isErr ? C.fail : wasOk ? C.ok : C.muted + "66", fontWeight: 600 }}>
                  {wasDone ? (isErr ? "Error ✗" : "OK ✓") : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {current && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{SIGNS[selected].label}</span>
            <span style={{ fontSize: 12, color: C.muted }}>between {SIGNS[selected].between[0]} and {SIGNS[selected].between[1]}</span>
          </div>

          {/* Sign table */}
          <div style={{ marginBottom: 14, maxWidth: 200 }}>
            <SignTable signIdx={selected} highlightError={true} />
          </div>

          {/* Consecutive difference checks */}
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Consecutive differences</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {current.results.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>
                  {r.from} → {r.to}
                </span>
                <span style={{ fontSize: 13, fontFamily: mathFont, color: r.ok ? C.ok : C.fail, fontWeight: 600 }}>
                  {r.diff}
                </span>
                <span style={{ fontSize: 12, color: C.muted }}>
                  (expected {r.expected})
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.ok ? C.ok : C.fail }}>
                  {r.ok ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 12, padding: "10px 14px", borderRadius: 8,
            background: hasError ? C.failBg : C.conclBg,
            border: `1px solid ${hasError ? C.fail + "44" : C.ok + "44"}`,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: hasError ? C.fail : C.ok, lineHeight: 1.6 }}>
              {hasError ? (
                <><strong>Error found.</strong> The Portville distance is shown as 31 but should be 33. This makes T→P read as 22 instead of 24, and P→Q as 21 instead of 19.</>
              ) : (
                <><strong>No errors.</strong> All consecutive differences match the expected between-town distances.</>
              )}
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
  { letter: "A", text: "sign 1", ok: false, expl: "All consecutive differences from sign 1 match the expected between-town distances. No error." },
  { letter: "B", text: "sign 2", ok: false, expl: "All consecutive differences from sign 2 match. Radcliffe→Southtown = 34 − 17 = 17 ✓, etc." },
  { letter: "C", text: "sign 3", ok: false, expl: "All consecutive differences from sign 3 match. Southtown→Tunborough = 19 − 4 = 15 ✓, etc." },
  { letter: "D", text: "sign 4", ok: true, expl: "Sign 4 shows Portville as 31 km, but it should be 33 km. This makes Tunborough→Portville appear as 22 instead of 24, and Portville→Queensgate as 21 instead of 19." },
  { letter: "E", text: "sign 5", ok: false, expl: "All consecutive differences from sign 5 match. Portville→Queensgate = 32 − 13 = 19 ✓, etc." },
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
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 50</p>
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
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 50</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>
                There are five towns at various positions along a major ring road that encircles a city. Traffic travelling clockwise around the ring road is provided with information in the form of five 'distance' signs at various points along the road as shown.
              </p>
            </div>

            <RingDiagram />

            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text, marginTop: 10 }}>
              <p style={{ margin: "0 0 14px" }}>The signs display the following information (all distances in km):</p>
            </div>

            {/* All 5 sign tables */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[0, 1, 2].map(i => <SignTable key={i} signIdx={i} highlightError={false} />)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: "66%", marginBottom: 14 }}>
              {[3, 4].map(i => <SignTable key={i} signIdx={i} highlightError={false} />)}
            </div>

            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 6px" }}>One of the signs contains an error in one of the distances indicated.</p>
              <p style={{ margin: 0 }}><strong style={{ color: C.assum }}>Which one of the signs contains the error?</strong></p>
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>What we need</span>
              <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: "0 0 14px" }}>
                If all signs are correct, the distance between any two adjacent towns should be the same no matter which sign you read it from. We can find these between-town distances by subtracting consecutive entries on any sign, then check whether every sign agrees.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: 13, color: C.text }}>Use one sign to find all five between-town distances</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#1e2030", border: `1px solid ${C.border}` }}>
                  <span style={{ background: C.ps + "22", border: `1px solid ${C.ps}`, borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.ps, flexShrink: 0 }}>2</span>
                  <span style={{ fontSize: 13, color: C.text }}>Check each other sign's consecutive differences against these</span>
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>STRATEGY</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  On a ring road, each sign lists towns in clockwise order by distance. The difference between consecutive entries gives the distance between adjacent towns. This should be constant across all signs.
                </p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Expected between-town distances</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { seg: "P → Q", dist: 19 },
                  { seg: "Q → R", dist: 22 },
                  { seg: "R → S", dist: 17 },
                  { seg: "S → T", dist: 15 },
                  { seg: "T → P", dist: 24 },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#1e2030", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{s.seg}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.assum, fontFamily: mathFont }}>{s.dist} km</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.muted, margin: "10px 0 0" }}>Ring total: 19 + 22 + 17 + 15 + 24 = 97 km</p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.calcBg, border: `1px solid ${C.calc}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.calc, fontWeight: 700, whiteSpace: "nowrap" }}>KEY POINT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  A single wrong distance on one sign will produce two bad consecutive differences (one on each side of the error), while the rest will be fine. This pattern makes it easy to pinpoint which entry is wrong.
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
                  Click each sign to check its consecutive differences against the expected between-town distances. Only one sign has mismatches.
                </p>
              </div>
            </div>
            <SignChecker />
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "Which one of the signs contains the error?"
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>The error</span>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ maxWidth: 180 }}>
                  <SignTable signIdx={3} highlightError={true} />
                </div>
                <div style={{ flex: 1, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
                  <p style={{ margin: "0 0 8px" }}>Sign 4 lists <strong style={{ color: C.fail }}>Portville as 31 km</strong>.</p>
                  <p style={{ margin: "0 0 8px" }}>The correct distance should be <strong style={{ color: C.ok }}>33 km</strong>.</p>
                  <p style={{ margin: 0, color: C.muted }}>This is off by 2 km, making the T→P and P→Q segments read incorrectly.</p>
                </div>
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
