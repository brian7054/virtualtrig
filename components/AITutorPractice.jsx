import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * VIRTUALtrig — AI Tutor & Practice Panel (Pages Router friendly)
 * ---------------------------------------------------------------
 * Drop this file in `components/AITutorPractice.jsx` and render it from `pages/practice.js`.
 *
 * Features in this MVP:
 *  - Skill picker: Degree↔Radian, Polar→Rect/Rect→Polar, SOH-CAH-TOA (right triangles)
 *  - Problem generator with seeded randomness
 *  - Local autograder (no AI needed) for the first two skills and right-triangle basics
 *  - AI Tutor sidebar for hints/feedback if `/api/tutor` is configured; degrades gracefully if not
 *  - Attempt log + lightweight misconceptions tags
 *
 * Notes:
 *  - Uses Tailwind for styling
 *  - Tolerance-based grading for numeric answers; exact/π-form accepted for some cases
 *  - Radian parsing supports forms like `pi/6`, `π/6`, `3*pi/4`, `3π/4`
 */

export default function AITutorPractice() {
  const skills = [
    { id: "deg-rad", label: "Convert Degrees ↔ Radians" },
    { id: "polar-rect", label: "Convert Polar ↔ Rectangular" },
    { id: "soh-cah-toa", label: "SOH-CAH-TOA (Right Triangles)" },
    { id: "identities", label: "Trig Identities (AI-assisted)" },
  ];

  const [skill, setSkill] = useState(skills[0].id);
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null); // {correct:boolean, message:string}
  const [loadingHint, setLoadingHint] = useState(false);
  const [chat, setChat] = useState([]); // {role:"user"|"assistant", content:string}[]
  const [tutorReady, setTutorReady] = useState(false);
  const [attempts, setAttempts] = useState([]); // logs

  // Check if the tutor API is wired up
  useEffect(() => {
    let mounted = true;
    fetch("/api/contact-status")
      .then((r) => r.ok ? r.json() : { ready: false })
      .then(() => fetch("/api/tutor?ping=1"))
      .then((r) => (mounted ? setTutorReady(r.ok) : null))
      .catch(() => mounted && setTutorReady(false));
    return () => (mounted = false);
  }, []);

  // Utilities
  const rand = useMemo(() => mulberry32(1234567), []); // deterministic but can be swapped
  const toDegrees = (rad) => (rad * 180) / Math.PI;
  const toRadians = (deg) => (deg * Math.PI) / 180;

  const parseRadian = (s) => {
    // Accept numeric (e.g., 0.524), symbolic like pi/6, 3*pi/4, 3π/4, π/2, etc.
    if (typeof s !== "string") return Number.NaN;
    const t = s.trim().toLowerCase().replaceAll("π", "pi");
    // If numeric
    if (/^[+-]?[0-9]*\.?[0-9]+$/.test(t)) return parseFloat(t);
    // Replace pi with Math.PI and eval safe arithmetic
    const safe = t.replaceAll("pi", "(Math.PI)");
    try {
      // Only allow digits, operators, parentheses, spaces, and 'Math.PI'
      if (!/^[-+*/(). 0-9a-zA-Z]*$/.test(safe)) return Number.NaN;
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${safe})`)();
      return typeof val === "number" && Number.isFinite(val) ? val : Number.NaN;
    } catch {
      return Number.NaN;
    }
  };

  const fmtPi = (rad) => {
    const k = rad / Math.PI;
    const frac = toNiceFraction(k);
    if (!frac) return rad.toFixed(3);
    const [num, den] = frac;
    if (num === 0) return "0";
    if (den === 1 && num === 1) return "π";
    if (den === 1) return `${num}π`;
    if (num === 1) return `π/${den}`;
    return `${num}π/${den}`;
  };

  // Problem generators
  function newProblem(id) {
    if (id === "deg-rad") return genDegRad();
    if (id === "polar-rect") return genPolarRect();
    if (id === "soh-cah-toa") return genSOHCAHTOA();
    if (id === "identities") return genIdentity();
    return null;
  }

  function genDegRad() {
    const specials = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
    const isSpecial = rand() < 0.6;
    const deg = isSpecial ? specials[Math.floor(rand() * specials.length)] : Math.floor(rand() * 360);
    const direction = rand() < 0.5 ? "deg→rad" : "rad→deg";
    const rad = toRadians(deg);
    return { type: "deg-rad", direction, deg, rad };
  }

  function genPolarRect() {
    // r in [1, 10], θ a multiple of 15°
    const r = 1 + Math.floor(rand() * 10);
    const theta = 15 * Math.floor(rand() * (360 / 15));
    const x = r * Math.cos(toRadians(theta));
    const y = r * Math.sin(toRadians(theta));
    const direction = rand() < 0.5 ? "polar→rect" : "rect→polar";
    return { type: "polar-rect", direction, r, theta, x, y };
  }

  function genSOHCAHTOA() {
    // Opp/Adj integers 3..12, ask for missing side or angle
    const opp = 3 + Math.floor(rand() * 10);
    const adj = 3 + Math.floor(rand() * 10);
    const hyp = Math.sqrt(opp * opp + adj * adj);
    const ask = ["opp", "adj", "hyp", "angleA", "angleB"][Math.floor(rand() * 5)];
    return { type: "soh-cah-toa", opp, adj, hyp, ask };
  }

  function genIdentity() {
    const prompts = [
      "Prove that sin^2(x) + cos^2(x) = 1.",
      "Simplify (1 - cos(2x)) / (2sin(x)).",
      "Rewrite tan(x) in terms of sin(x) and cos(x).",
      "Verify that 1 + tan^2(x) = sec^2(x).",
    ];
    return { type: "identities", task: prompts[Math.floor(rand() * prompts.length)] };
  }

  // Graders
  function gradeDegRad(p, ansRaw) {
    if (p.direction === "deg→rad") {
      const val = parseRadian(ansRaw);
      if (Number.isNaN(val)) return { correct: false, message: "Enter radians (e.g., π/6 or 0.524)." };
      const ok = approx(val, p.rad);
      return ok
        ? { correct: true, message: `Correct: ${fmtPi(p.rad)} rad` }
        : { correct: false, message: `Not yet. Hint: multiply degrees by π/180. Exact: ${fmtPi(p.rad)}.` };
    } else {
      // rad→deg; accept numeric degrees
      const num = Number(String(ansRaw).replace(/[^-\d.]/g, ""));
      if (Number.isNaN(num)) return { correct: false, message: "Enter degrees as a number (e.g., 150)." };
      const deg = toDegrees(p.rad);
      const ok = Math.abs(num - deg) <= 0.5; // half-degree tolerance
      return ok
        ? { correct: true, message: `Correct: ${deg.toFixed(1)}°` }
        : { correct: false, message: `Not yet. Hint: multiply radians by 180/π. Answer: ${deg.toFixed(1)}°.` };
    }
  }

  function gradePolarRect(p, ansRaw) {
    if (p.direction === "polar→rect") {
      // Expect x,y in form like "x=..., y=..." or "(x,y)"
      const { x, y } = parseXY(ansRaw);
      if (x == null || y == null) return { correct: false, message: "Enter as x,y (e.g., 2.5, -4)." };
      const ok = approx(x, p.x) && approx(y, p.y);
      return ok
        ? { correct: true, message: `Correct: (${p.x.toFixed(3)}, ${p.y.toFixed(3)})` }
        : { correct: false, message: `Not yet. x = r cos θ, y = r sin θ. Target: (${p.x.toFixed(3)}, ${p.y.toFixed(3)}).` };
    } else {
      // rect→polar; expect r,θ degrees (θ in [0,360))
      const parsed = parseRTheta(ansRaw);
      if (!parsed) return { correct: false, message: "Enter r,θ° (e.g., r=5, θ=210)." };
      const { r, theta } = parsed;
      const rTrue = Math.hypot(p.x, p.y);
      let thetaTrue = toDegrees(Math.atan2(p.y, p.x));
      if (thetaTrue < 0) thetaTrue += 360;
      const ok = Math.abs(r - rTrue) <= 0.25 && angleClose(theta, thetaTrue, 2);
      return ok
        ? { correct: true, message: `Correct: r=${rTrue.toFixed(3)}, θ=${thetaTrue.toFixed(1)}°` }
        : { correct: false, message: `Not yet. r=√(x²+y²), θ=atan2(y,x). Target: r=${rTrue.toFixed(3)}, θ=${thetaTrue.toFixed(1)}°.` };
    }
  }

  function gradeSOHCAHTOA(p, ansRaw) {
    // Accept one value: opp, adj, hyp, or angle (deg)
    const v = Number(String(ansRaw).replace(/[^-\d.]/g, ""));
    if (Number.isNaN(v)) return { correct: false, message: "Enter a number (degrees for angles)." };

    if (p.ask === "hyp") {
      const ok = Math.abs(v - p.hyp) <= 0.25;
      return ok ? { correct: true, message: `Correct: hyp ≈ ${p.hyp.toFixed(3)}` } : { correct: false, message: `Use c = √(a²+b²).` };
    }
    if (p.ask === "opp") {
      // need an angle? Keep simple: ask opp given adj & angleA (constructed)
      const angleA = toDegrees(Math.atan2(p.opp, p.adj));
      const target = Math.tan(toRadians(angleA)) * p.adj;
      const ok = Math.abs(v - target) <= 0.5;
      return ok ? { correct: true, message: `Correct: opp ≈ ${target.toFixed(2)}` } : { correct: false, message: `Use tan(θ)=opp/adj.` };
    }
    if (p.ask === "adj") {
      const angleA = toDegrees(Math.atan2(p.opp, p.adj));
      const target = p.opp / Math.tan(toRadians(angleA));
      const ok = Math.abs(v - target) <= 0.5;
      return ok ? { correct: true, message: `Correct: adj ≈ ${target.toFixed(2)}` } : { correct: false, message: `Use tan(θ)=opp/adj.` };
    }
    if (p.ask === "angleA" || p.ask === "angleB") {
      const angleA = toDegrees(Math.atan2(p.opp, p.adj));
      const angleB = 90 - angleA;
      const target = p.ask === "angleA" ? angleA : angleB;
      const ok = Math.abs(v - target) <= 1.0;
      return ok ? { correct: true, message: `Correct: ${target.toFixed(1)}°` } : { correct: false, message: `Use tan⁻¹(opp/adj).` };
    }
    return { correct: false, message: "Unsupported query." };
  }

  // Render helpers
  const problemText = (p) => {
    if (!p) return "Click New Problem.";
    if (p.type === "deg-rad") {
      return p.direction === "deg→rad"
        ? `Convert ${p.deg}° to radians.`
        : `Convert ${fmtPi(p.rad)} rad to degrees.`;
    }
    if (p.type === "polar-rect") {
      return p.direction === "polar→rect"
        ? `Given r=${p.r}, θ=${p.theta}°, find (x, y).`
        : `Given (x, y)=(${p.x.toFixed(2)}, ${p.y.toFixed(2)}), find r and θ (degrees).`;
    }
    if (p.type === "soh-cah-toa") {
      const angleA = toDegrees(Math.atan2(p.opp, p.adj)).toFixed(1);
      const desc = `Right triangle with opp=${p.opp}, adj=${p.adj} (hyp≈${p.hyp.toFixed(2)}).`;
      if (p.ask === "hyp") return `${desc} Find the hypotenuse.`;
      if (p.ask === "opp") return `${desc} Given angle θ≈${angleA}°, find opp.`;
      if (p.ask === "adj") return `${desc} Given angle θ≈${angleA}°, find adj.`;
      if (p.ask === "angleA") return `${desc} Find θ at the adjacent/opp corner.`;
      if (p.ask === "angleB") return `${desc} Find the other acute angle.`;
    }
    if (p.type === "identities") return p.task + " Show steps.";
    return "";
  };

  function onNewProblem() {
    const p = newProblem(skill);
    setProblem(p);
    setAnswer("");
    setResult(null);
  }

  function onCheck() {
    if (!problem) return;
    let r;
    if (problem.type === "deg-rad") r = gradeDegRad(problem, answer);
    else if (problem.type === "polar-rect") r = gradePolarRect(problem, answer);
    else if (problem.type === "soh-cah-toa") r = gradeSOHCAHTOA(problem, answer);
    else r = { correct: false, message: "Use the AI tutor for this one." };

    setResult(r);
    const tag = tagMisconception(problem, r, answer);
    setAttempts((prev) => [{ ts: Date.now(), skill, correct: r.correct, tag }, ...prev]);
  }

  async function onHint() {
    if (!problem) return;
    setLoadingHint(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill,
          problem,
          answer,
          mode: "hint",
        }),
      });
      if (!res.ok) throw new Error("tutor unavailable");
      const data = await res.json();
      const content = data.answer || "(No response)";
      setChat((c) => [...c, { role: "assistant", content }]);
    } catch (e) {
      setChat((c) => [
        ...c,
        { role: "assistant", content: "AI tutor isn’t configured yet. Try the built‑in hint: Focus on the definition and draw a quick diagram." },
      ]);
    } finally {
      setLoadingHint(false);
    }
  }

  const userMsgRef = useRef(null);
  async function onAsk(e) {
    e.preventDefault();
    const content = userMsgRef.current?.value?.trim();
    if (!content) return;
    setChat((c) => [...c, { role: "user", content }]);
    userMsgRef.current.value = "";
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, problem, userMessage: content, mode: "chat" }),
      });
      const data = res.ok ? await res.json() : { answer: "(AI tutor unavailable)" };
      setChat((c) => [...c, { role: "assistant", content: data.answer }]);
    } catch {
      setChat((c) => [...c, { role: "assistant", content: "(AI tutor unavailable)" }]);
    }
  }

  // Initial problem
  useEffect(() => {
    onNewProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
      {/* Left: Problem & Answer */}
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-sm">Skill</label>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} className="border rounded-lg px-3 py-2">
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <button onClick={onNewProblem} className="ml-auto px-3 py-2 rounded-lg border hover:bg-gray-50">New problem</button>
        </div>

        <div className="rounded-xl border p-4 bg-gray-50">
          <div className="text-sm text-gray-600">Problem</div>
          <div className="text-lg font-medium mt-1">{problemText(problem)}</div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-600 mb-1">Your answer</label>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder={placeholderFor(problem)}
          />
          <div className="mt-3 flex items-center gap-3">
            <button onClick={onCheck} className="px-4 py-2 rounded-xl bg-black text-white">Check</button>
            <button onClick={onHint} disabled={loadingHint} className="px-4 py-2 rounded-xl border">
              {loadingHint ? "Thinking…" : "Hint"}
            </button>
            {!tutorReady && (
              <span className="text-xs text-gray-500">AI tutor not connected (local grading still works).</span>
            )}
          </div>
          {result && (
            <div className={`mt-3 rounded-xl border p-3 ${result.correct ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
              <div className="font-medium">{result.correct ? "Correct" : "Keep going"}</div>
              <div className="text-sm text-gray-700">{result.message}</div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Attempts (recent)</h3>
          <ul className="text-sm space-y-1">
            {attempts.slice(0, 6).map((a, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${a.correct ? "bg-green-500" : "bg-amber-500"}`} />
                <span className="text-gray-600">{new Date(a.ts).toLocaleTimeString()}</span>
                <span className="text-gray-900">{a.skill}</span>
                {a.tag && <span className="ml-auto text-xs text-gray-500">{a.tag}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: AI Tutor Chat */}
      <div className="bg-white rounded-2xl shadow p-5 h-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">AI Tutor</h2>
          <span className={`text-xs ${tutorReady ? "text-green-600" : "text-gray-400"}`}>{tutorReady ? "Connected" : "Offline"}</span>
        </div>
        <div className="h-[360px] overflow-auto border rounded-xl p-3 bg-gray-50">
          {chat.length === 0 ? (
            <p className="text-sm text-gray-600">Ask for a hint or type a question. The tutor will use the current problem and your answer as context.</p>
          ) : (
            <ul className="space-y-2">
              {chat.map((m, i) => (
                <li key={i} className={`${m.role === "user" ? "text-gray-900" : "text-gray-700"}`}>
                  <span className="text-xs uppercase tracking-wide text-gray-500">{m.role}</span>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form onSubmit={onAsk} className="mt-3 flex gap-2">
          <input ref={userMsgRef} className="flex-1 border rounded-xl px-3 py-2" placeholder="Ask the tutor…" />
          <button className="px-4 py-2 rounded-xl bg-black text-white">Send</button>
        </form>
      </div>
    </div>
  );
}

// ----------------------- helpers -----------------------
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function approx(a, b, tol = 1e-2) { return Math.abs(a - b) <= tol; }

function toNiceFraction(x, maxDen = 12, eps = 1e-6) {
  // Find a small-denominator fraction close to x
  for (let den = 1; den <= maxDen; den++) {
    const num = Math.round(x * den);
    if (Math.abs(num / den - x) < eps) {
      const g = gcd(Math.abs(num), den);
      return [num / g, den / g];
    }
  }
  return null;
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function parseXY(s) {
  if (typeof s !== "string") return {};
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!m) return {};
  return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
}

function parseRTheta(s) {
  if (typeof s !== "string") return null;
  const rMatch = s.match(/r\s*=\s*(-?\d+(?:\.\d+)?)/i);
  const tMatch = s.match(/[θt]h?e?t?a?\s*=\s*(-?\d+(?:\.\d+)?)/i);
  if (!rMatch || !tMatch) return null;
  return { r: parseFloat(rMatch[1]), theta: parseFloat(tMatch[1]) };
}

function angleClose(a, b, tolDeg = 2) {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d <= tolDeg;
}

function placeholderFor(p) {
  if (!p) return "";
  if (p.type === "deg-rad") return p.direction === "deg→rad" ? "e.g., π/6 or 0.524" : "e.g., 150";
  if (p.type === "polar-rect") return p.direction === "polar→rect" ? "x, y  (e.g., 2.5, -4)" : "r=..., θ=...  (deg)";
  if (p.type === "soh-cah-toa") return "Enter a single number (side or angle)";
  if (p.type === "identities") return "Type a step or ask for a hint";
  return "";
}

function tagMisconception(problem, r, ans) {
  if (!problem || !r || r.correct) return "";
  if (problem.type === "deg-rad") {
    if (problem.direction === "deg→rad" && /180/.test(ans)) return "used 180/π instead of π/180";
    if (problem.direction === "rad→deg" && /π\s*\//.test(ans)) return "used π/180 instead of 180/π";
  }
  if (problem.type === "polar-rect") {
    if (/sin/i.test(ans) && /x\s*=/.test(ans)) return "swapped sin/cos for x,y";
  }
  if (problem.type === "soh-cah-toa") {
    if (/tan/i.test(ans) && /hyp/i.test(ans)) return "used tan with hypotenuse";
  }
  return "";
}
