import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3a",
  accent: "#6c5ce7", accentLight: "#a29bfe",
  concl: "#55efc4", conclBg: "rgba(85,239,196,0.10)",
  ok: "#55efc4", fail: "#ff7675", failBg: "rgba(255,118,117,0.10)",
  assum: "#fdcb6e", assumBg: "rgba(253,203,110,0.12)",
  text: "#e2e2e8", muted: "#8b8d9a", white: "#fff",
  ps: "#74b9ff", psBg: "rgba(116,185,255,0.10)",
  calc: "#fdcb6e", calcBg: "rgba(253,203,110,0.10)",
};

const mathFont = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";
const UNPAINTED = 0x2a2d3a;
const RED = 0xff7675;
const GREEN = 0x55efc4;
const BLUE = 0x74b9ff;
const GOLD = 0xfdcb6e;

function getColors(x, y, z) {
  const c = new Set();
  if (y === 0 || y === 4) c.add("red");
  if (z === 0 || z === 4) c.add("green");
  if (x === 0 || x === 4) c.add("blue");
  return c;
}
function colorKey(colors) { const a = [...colors].sort(); return a.length === 0 ? "none" : a.join("+"); }
function isTarget(x, y, z) { const c = getColors(x, y, z); return c.has("green") && c.has("blue") && !c.has("red"); }

const stepsMeta = [
  { id: 0, label: "Read", title: "Read the Question" },
  { id: 1, label: "Setup", title: "Explore the Cube" },
  { id: 2, label: "Solve", title: "Work Through the Logic" },
  { id: 3, label: "Verify", title: "See the 12 Cubes" },
  { id: 4, label: "Answer", title: "Confirm the Answer" },
];

/* ───────── Three.js Cube ───────── */
function ThreeCube({ highlight }) {
  const mountRef = useRef(null);
  const animRef = useRef(null);
  const cubesRef = useRef([]);
  const groupRef = useRef(null);
  const cameraRef = useRef(null);
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: -0.45, y: 0.6 });
  const highlightRef = useRef(highlight);
  const timeRef = useRef(0);

  highlightRef.current = highlight;

  const init = useCallback(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.bg);
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    camera.position.set(14, 11, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.75);
    dir.position.set(8, 12, 10);
    scene.add(dir);

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const gap = 0.06;
    const cubeSize = 0.88;
    const cubes = [];

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        for (let z = 0; z < 5; z++) {
          const colors = getColors(x, y, z);
          const key = colorKey(colors);
          const target = isTarget(x, y, z);

          const geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
          const baseMats = [
            x === 4 ? BLUE : UNPAINTED,
            x === 0 ? BLUE : UNPAINTED,
            y === 4 ? RED : UNPAINTED,
            y === 0 ? RED : UNPAINTED,
            z === 4 ? GREEN : UNPAINTED,
            z === 0 ? GREEN : UNPAINTED,
          ];

          const materials = baseMats.map(c => new THREE.MeshPhongMaterial({
            color: c, transparent: true, opacity: 0.92,
          }));

          const mesh = new THREE.Mesh(geo, materials);
          const basePos = new THREE.Vector3((x - 2) * (1 + gap), (y - 2) * (1 + gap), (z - 2) * (1 + gap));
          mesh.position.copy(basePos);
          mesh.userData = { basePos: basePos.clone(), target, baseMats };
          group.add(mesh);
          cubes.push(mesh);
        }
      }
    }
    cubesRef.current = cubes;

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.03;
      group.rotation.x = rotation.current.x;
      group.rotation.y = rotation.current.y;

      const targetDist = 16;
      const curDist = camera.position.length();
      const newDist = curDist + (targetDist - curDist) * 0.03;
      camera.position.normalize().multiplyScalar(newDist);
      camera.lookAt(0, 0, 0);

      const hl = highlightRef.current;
      const goldAmount = 0.5 + 0.5 * Math.sin(timeRef.current * 2.5);

      cubes.forEach(mesh => {
        const { target, baseMats } = mesh.userData;

        if (hl && target) {
          mesh.material.forEach((m, i) => {
            const realColor = new THREE.Color(baseMats[i]);
            const goldColor = new THREE.Color(GOLD);
            const blended = realColor.clone().lerp(goldColor, goldAmount);
            m.color.copy(blended);
            m.opacity += (0.95 - m.opacity) * 0.1;
            m.emissive = goldColor.clone();
            m.emissiveIntensity = 0.08 * goldAmount;
          });
        } else if (hl && !target) {
          mesh.material.forEach((m, i) => {
            m.color.setHex(baseMats[i]);
            m.opacity += (0.06 - m.opacity) * 0.05;
            m.emissive = new THREE.Color(0x000000);
            m.emissiveIntensity = 0;
          });
        } else {
          mesh.material.forEach((m, i) => {
            m.color.setHex(baseMats[i]);
            m.opacity += (0.92 - m.opacity) * 0.05;
            m.emissive = new THREE.Color(0x000000);
            m.emissiveIntensity = 0;
          });
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const el = renderer.domElement;
    const onDown = (e) => { isDragging.current = true; const pt = e.touches ? e.touches[0] : e; prevMouse.current = { x: pt.clientX, y: pt.clientY }; };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const pt = e.touches ? e.touches[0] : e;
      rotation.current.y += (pt.clientX - prevMouse.current.x) * 0.007;
      rotation.current.x += (pt.clientY - prevMouse.current.y) * 0.007;
      rotation.current.x = Math.max(-1.2, Math.min(1.2, rotation.current.x));
      prevMouse.current = { x: pt.clientX, y: pt.clientY };
    };
    const onUp = () => { isDragging.current = false; };
    el.addEventListener("mousedown", onDown); el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseup", onUp); el.addEventListener("mouseleave", onUp);
    el.addEventListener("touchstart", onDown, { passive: true }); el.addEventListener("touchmove", onMove, { passive: true }); el.addEventListener("touchend", onUp);

    return () => {
      cancelAnimationFrame(animRef.current);
      ["mousedown","mousemove","mouseup","mouseleave","touchstart","touchmove","touchend"].forEach(e => el.removeEventListener(e, onDown));
      renderer.dispose();
      if (mountRef.current && el.parentNode === mountRef.current) mountRef.current.removeChild(el);
    };
  }, []);

  useEffect(() => { const cleanup = init(); return cleanup; }, [init]);
  return <div ref={mountRef} style={{ width: "100%", height: 420, borderRadius: 12, overflow: "hidden", cursor: "grab" }} />;
}

/* ───────── Algebra Solve ───────── */
function AlgebraSolve() {
  const [revealed, setRevealed] = useState(0);
  const steps = [
    { label: "Which cubes have a green face?", why: "A small cube has a green painted face only if it sits on the front (z=4) or back (z=0) surface of the big cube.", color: C.ok },
    { label: "Which also have a blue face?", why: "Blue faces are on the left (x=0) and right (x=4). A cube with both green and blue sits on an edge where these surfaces meet. There are 4 such vertical edges: front-left, front-right, back-left, back-right. Each has 5 small cubes.",
      math: <span>4 edges × 5 cubes = 20 candidates</span>, color: C.ps },
    { label: "Remove cubes with a red face", why: "Red faces are top (y=4) and bottom (y=0). On each vertical edge, the topmost and bottommost cubes touch a red face. Remove those.",
      math: <span>4 edges × 2 excluded = 8 removed</span>, color: "#ff7675" },
    { label: "Count what remains", why: "5 cubes per edge minus 2 red-touching = 3 qualifying per edge.",
      math: <span>4 × 3 = <strong style={{ color: C.ok }}>12</strong></span>,
      conclusion: "12 small cubes have green + blue but no red. The answer is C.", color: C.ok },
  ];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 16 }}>Step-by-step solution</span>
      {steps.map((s, i) => {
        if (i > revealed) return null;
        return (
          <div key={i} style={{ marginBottom: 20, animation: "fadeSlideIn 0.4s ease-out" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: s.color + "22", border: `2px solid ${s.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: s.color }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{s.why}</p>
                {s.math && <div style={{ background: "#1e2030", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 18px", fontSize: 17, color: C.white, fontFamily: mathFont, textAlign: "center", letterSpacing: 0.5, lineHeight: 1.8 }}>{s.math}</div>}
                {s.conclusion && <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: C.conclBg, border: `1px solid ${C.ok}44`, fontSize: 13.5, color: C.ok, fontWeight: 600, lineHeight: 1.5 }}>{s.conclusion}</div>}
              </div>
            </div>
            {i < revealed && i < steps.length - 1 && <div style={{ marginLeft: 14, width: 2, height: 12, background: C.border }} />}
          </div>
        );
      })}
      {revealed < steps.length - 1 && (
        <button onClick={() => setRevealed(p => p + 1)} style={{ marginTop: 4, padding: "11px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginLeft: 42, boxShadow: "0 4px 16px rgba(108,92,231,0.25)" }}>Reveal next step →</button>
      )}
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

/* ───────── Main App ───────── */
export default function App() {
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [optAnim, setOptAnim] = useState([false, false, false, false, false]);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (step === 4) { [0,1,2,3,4].forEach(i => { setTimeout(() => setOptAnim(p => { const n=[...p]; n[i]=true; return n; }), i*100); }); }
    else { setOptAnim([false,false,false,false,false]); setExpanded(null); }
  }, [step]);

  useEffect(() => {
    if (step !== 3) { setHighlight(false); }
  }, [step]);

  const opts = [
    { letter: "A", text: "6", ok: false, expl: "This would be correct with only 2 qualifying edges or 2 cubes per edge. There are 4 edges with 3 each." },
    { letter: "B", text: "8", ok: false, expl: "All 4 vertical green-blue edges contribute, not just 2." },
    { letter: "C", text: "12", ok: true, expl: "4 vertical edges where green meets blue, each with 5 cubes. Remove top and bottom (red). 4 × 3 = 12." },
    { letter: "D", text: "16", ok: false, expl: "This counts 4 per edge, forgetting to exclude the red-touching cubes at top and bottom." },
    { letter: "E", text: "24", ok: false, expl: "Only 4 of the 12 edges are where green and blue meet. This counts too many edges." },
  ];
  const lastStep = stepsMeta.length - 1;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Gill Sans', 'Trebuchet MS', Calibri, sans-serif", letterSpacing: 0.2, padding: "24px 16px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.white, letterSpacing: 1 }}>TARA</span>
            <span style={{ fontSize: 12, color: C.muted }}>Problem Solving</span>
            <span style={{ fontSize: 12, color: C.muted }}>·</span>
            <span style={{ fontSize: 12, color: C.ps }}>Spatial Reasoning</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", fontStyle: "italic", letterSpacing: 0.5 }}>Interactive Walkthrough</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>TSA 2022 · Question 32</p>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {stepsMeta.map(s => (
            <button key={s.id} onClick={() => setStep(s.id)} style={{ flex: 1, minWidth: 0, background: step === s.id ? C.accent : step > s.id ? "rgba(108,92,231,0.15)" : "#1e2030", border: `1px solid ${step === s.id ? C.accent : step > s.id ? C.accent+"44" : C.border}`, borderRadius: 10, padding: "10px 4px", cursor: "pointer", transition: "all 0.3s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: step === s.id ? C.white : step > s.id ? C.accentLight : C.muted, lineHeight: 1 }}>{s.id+1}</span>
              <span style={{ fontSize: 10, fontWeight: step === s.id ? 700 : 500, color: step === s.id ? C.white : step > s.id ? C.accentLight : C.muted, whiteSpace: "nowrap" }}>{s.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ background: C.accent, borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.white }}>{step+1}</span>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.white, margin: 0 }}>{stepsMeta[step].title}</h2>
        </div>

        {/* Step 0: Read */}
        {step === 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question 32</span>
            <div style={{ fontSize: 15.5, lineHeight: 2, color: C.text }}>
              <p style={{ margin: "0 0 10px" }}>I have a wooden cube with edges that are 5 cm long. I paint it in the following way:</p>
              <div style={{ paddingLeft: 16, margin: "0 0 10px" }}>
                <p style={{ margin: "2px 0" }}>• one pair of opposite faces is <strong style={{ color: "#ff7675" }}>red</strong></p>
                <p style={{ margin: "2px 0" }}>• one pair of opposite faces is <strong style={{ color: "#55efc4" }}>green</strong></p>
                <p style={{ margin: "2px 0" }}>• one pair of opposite faces is <strong style={{ color: "#74b9ff" }}>blue</strong></p>
              </div>
              <p style={{ margin: "0 0 10px" }}>Now I cut the cube into small cubes, each of whose edges are 1 cm long.</p>
              <p style={{ margin: 0 }}>How many of the small cubes have one <strong style={{ color: "#55efc4" }}>green</strong> face, one <strong style={{ color: "#74b9ff" }}>blue</strong> face, but <strong style={{ color: "#ff7675" }}>no red</strong> face?</p>
            </div>
          </div>
        )}

        {/* Step 1: Setup */}
        {step === 1 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Drag to rotate</span>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, margin: "0 0 14px" }}>
              The 5×5×5 cube is painted <strong style={{ color: "#ff7675" }}>red</strong> (top/bottom), <strong style={{ color: "#55efc4" }}>green</strong> (front/back), <strong style={{ color: "#74b9ff" }}>blue</strong> (left/right). Internal faces are dark grey. Think about where green and blue surfaces meet.
            </p>
            <ThreeCube highlight={false} />
          </div>
        )}

        {/* Step 2: Solve */}
        {step === 2 && <AlgebraSolve />}

        {/* Step 3: Verify */}
        {step === 3 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: C.psBg, border: `1px solid ${C.ps}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.ps, fontWeight: 700, whiteSpace: "nowrap" }}>TRY IT</span>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  We found <strong style={{ color: C.ok }}>12 cubes</strong> with <strong style={{ color: "#55efc4" }}>green</strong> + <strong style={{ color: "#74b9ff" }}>blue</strong> faces but <strong style={{ color: "#ff7675" }}>no red</strong>. Highlight them on the model and drag to rotate to find all 12.
                </p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <ThreeCube highlight={highlight} />

              <button onClick={() => setHighlight(!highlight)} style={{
                width: "100%", marginTop: 14, padding: "12px 16px", borderRadius: 10, border: "none",
                background: highlight ? `linear-gradient(135deg, ${C.assum}, #e17055)` : `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
                color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer",
                boxShadow: highlight ? "none" : "0 4px 16px rgba(108,92,231,0.25)",
              }}>
                {highlight ? "Reset view" : "Highlight the 12 qualifying cubes"}
              </button>
            </div>

            {highlight && (
              <div style={{ background: C.card, border: `1px solid ${C.assum}44`, borderRadius: 14, padding: "16px 24px", marginBottom: 18 }}>
                <p style={{ margin: 0, fontSize: 13.5, color: C.assum, lineHeight: 1.6 }}>
                  <strong>12 cubes</strong> highlighted across 4 vertical edges, 3 per edge. The top and bottom cubes on each edge are excluded because they touch a red face.
                </p>
              </div>
            )}
          </>
        )}

        {/* Step 4: Answer */}
        {step === 4 && (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 14 }}>Question</span>
              <div style={{ background: "#252839", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.white, lineHeight: 1.6, fontStyle: "italic" }}>
                "How many of the small cubes have one green face, one blue face, but no red face?"
              </div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 24px", marginBottom: 14 }}>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}><strong style={{ color: C.assum }}>Click each option</strong> to see the reasoning:</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {opts.map((o, i) => (
                <div key={o.letter} onClick={() => setExpanded(p => p === o.letter ? null : o.letter)} style={{
                  background: C.card, border: `1px solid ${expanded === o.letter ? (o.ok ? C.ok+"66" : C.fail+"66") : C.border}`,
                  borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "all 0.3s",
                  opacity: optAnim[i] ? 1 : 0, transform: optAnim[i] ? "translateY(0)" : "translateY(12px)",
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ background: expanded === o.letter ? (o.ok ? C.ok : C.fail) : C.accent, borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.white, flexShrink: 0 }}>{expanded === o.letter ? (o.ok ? "✓" : "✗") : o.letter}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{o.text}</p>
                      {expanded === o.letter && (
                        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, fontSize: 13, lineHeight: 1.6,
                          background: o.ok ? C.conclBg : C.failBg, color: o.ok ? C.ok : C.fail,
                          borderLeft: `3px solid ${o.ok ? C.ok : C.fail}` }}>
                          {o.ok ? <span style={{ fontWeight: 700 }}>CORRECT: </span> : <span style={{ fontWeight: 700 }}>INCORRECT: </span>}{o.expl}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 12, paddingBottom: 32 }}>
          <button onClick={() => setStep(Math.max(0, step-1))} disabled={step === 0} style={{ flex: 1, padding: "13px 20px", borderRadius: 10, border: `1px solid ${C.border}`, background: step === 0 ? C.card : "#1e2030", color: step === 0 ? C.muted : C.text, fontSize: 14, fontWeight: 600, cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.4 : 1 }}>← Previous</button>
          {step < lastStep ? (
            <button onClick={() => setStep(step+1)} style={{ flex: 1, padding: "13px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, color: C.white, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next →</button>
          ) : (
            <button onClick={() => {}} style={{ flex: 1, padding: "13px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.ok}, #2ecc71)`, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>✓ Back to Question Review</button>
          )}
        </div>
      </div>
    </div>
  );
}
