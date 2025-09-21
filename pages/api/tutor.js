// pages/api/tutor.js
/**
 * Smart hints for VIRTUALtrig.
 * - Works offline with targeted, step-aware hints.
 * - If OPENAI_API_KEY is present, uses LLM with a rubric.
 */
export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ ok: true });
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { mode = "hint", skill, problem = {}, answer = "", tier = 1 } = req.body || {};
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // 1) If no key, or you prefer reliability: serve offline hint
  if (!OPENAI_API_KEY) {
    const text = generateOfflineHint({ skill, problem, answer, tier });
    return res.status(200).json({ answer: text, offline: true });
  }

  // 2) Otherwise: ask the model, but anchor it with a rubric + examples
  const rubric = buildRubric({ skill, problem, answer, tier });

  const system = [
    "You are a patient trigonometry tutor that gives terse, targeted hints.",
    "Rules:",
    "- Output at most 2 short sentences.",
    "- Prefer a leading question, then a tiny cue. Do not reveal the final numeric answer unless tier >= 3.",
    "- Use the student's notation if valid (π, degrees symbol, etc.).",
    "- Avoid generic advice; be specific to the current step and input.",
  ].join("\n");

  const user = JSON.stringify(
    {
      skill,
      tier,
      problem,
      studentInput: String(answer || ""),
      rubric,
      mode
    },
    null,
    2
  );

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 150,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
          // Few-shot to enforce style
          {
            role: "user",
            content: JSON.stringify({
              skill: "deg-rad",
              tier: 1,
              problem: { title: "Convert 30° to radians", stepIndex: 0, stepPrompt: "Write the conversion formula with 30° plugged in." },
              studentInput: ""
            })
          },
          { role: "assistant", content: "What do you multiply degrees by to get radians? Try writing (30 × π)/180." },
          {
            role: "user",
            content: JSON.stringify({
              skill: "rect-polar",
              tier: 2,
              problem: { title: "Rect → Polar: (3, -4)", stepIndex: 2, stepPrompt: "Normalize θ to [0°, 360°)." },
              studentInput: "-53.1"
            })
          },
          { role: "assistant", content: "Angles must be 0°–360°. What happens if you add 360° to −53.1°?" },
        ],
      }),
    });
    const j = await r.json();
    const text =
      j?.choices?.[0]?.message?.content ||
      generateOfflineHint({ skill, problem, answer, tier });
    return res.status(200).json({ answer: text, online: true });
  } catch (e) {
    console.error(e);
    const text = generateOfflineHint({ skill, problem, answer, tier });
    return res.status(200).json({ answer: text, fallback: true });
  }
}

/* -------------------- OFFLINE HINTS -------------------- */

function generateOfflineHint({ skill, problem, answer, tier }) {
  const step = Number(problem?.stepIndex ?? -1);
  const title = String(problem?.title || "");
  const prompt = String(problem?.stepPrompt || "");
  const ans = String(answer || "").trim();

  // Tiering: 1 = question, 2 = question + cue, 3 = mini-example / near-answer
  const Q = (q, cue) => (tier <= 1 ? q : tier === 2 ? `${q} ${cue}` : `${q} ${cue}`);

  switch (skill) {
    case "deg-rad":
      return hintDegToRad({ step, title, ans, tier });
    case "rad-deg":
      return hintRadToDeg({ step, title, ans, tier });
    case "rect-polar":
      return hintRectToPolar({ step, title, ans, tier });
    case "polar-rect":
      return hintPolarToRect({ step, title, ans, tier });
    case "soh-cah-toa":
      return hintSOHCAHTOA({ step, title, ans, tier });
    case "identities":
      return hintIdentities({ step, title, ans, tier });
    default:
      return "What formula applies to this exact step?";
  }
}

/* ---------- parsers ---------- */
const num = (s) => Number(String(s).replace(/[^\d.\-]/g, ""));
function parseDegFromTitle(t) { const m = t.match(/Convert\s+(-?\d+(?:\.\d+)?)°/i); return m ? Number(m[1]) : null; }
function parsePiFracFromTitle(t) { const m = t.match(/Convert\s+(\d*)π\/(\d+)/i); if (!m) return null; return { n: m[1] ? Number(m[1]) : 1, d: Number(m[2]) }; }
function parseXY(t) { const m = t.match(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/); return m ? { x: Number(m[1]), y: Number(m[2]) } : null; }
function parseRTheta(t) { const r = t.match(/r\s*=\s*(-?\d+(?:\.\d+)?)/i); const th = t.match(/θ\s*=\s*(-?\d+(?:\.\d+)?)°/i); return r && th ? { r: Number(r[1]), deg: Number(th[1]) } : null; }

/* ---------- topic-specific offline hint generators ---------- */

function hintDegToRad({ step, title, ans, tier }) {
  const d = parseDegFromTitle(title);
  if (step === 0) {
    if (!/pi|π/i.test(ans)) return "Radians need π. What does degrees get multiplied by to become radians?";
    if (!/180/.test(ans)) return "Where does the 180 in π/180 go?";
    return `Plug it in as (${d}×π)/180.`;
  }
  if (step === 1) {
    if (!/^\s*-?\d+\s*\/\s*\d+\s*$/.test(ans)) return "Write the fraction as n/d, like 1/6.";
    const a = ans.replace(/\s+/g, "");
    return a === simplifyFrac(`${d}/180`) ? "Good—lowest terms found." : Q("Can you reduce the fraction further?",
      `Divide ${d}/180 by their GCD (${gcdInt(d, 180)}).`);
  }
  if (step === 2) {
    if (/180\s*\/\s*(pi|π)/i.test(ans)) return "180/π converts *radians to degrees*. Here you want π/180.";
    return tier >= 3
      ? `Use ${d}/180 of π: ${fmtPiLocal((d * Math.PI) / 180)}.`
      : "Express the result as that reduced fraction of π (e.g., π/6), or give a decimal.";
  }
  return "Multiply degrees by π/180, then simplify.";
}

function hintRadToDeg({ step, title, ans, tier }) {
  const frac = parsePiFracFromTitle(title); // {n,d}
  if (step === 0) {
    if (!/180/i.test(ans)) return "Degrees need 180. What fraction involves 180 here?";
    if (!/pi|π/i.test(ans)) return "Where does π go when converting to degrees?";
    return `Write ((${frac?.n || 1}π/${frac?.d})×180)/π.`;
  }
  if (step === 1) {
    if (!/^-?\d+(\.\d+)?$/.test(ans)) return "Enter a number (one decimal is fine).";
    return "Looks reasonable—does it match your calculator?";
  }
  if (step === 2) {
    return tier >= 3 ? "State the degree measure to one decimal place." : "Give the degrees value (e.g., 150).";
  }
  return "Multiply radians by 180/π, then evaluate.";
}

function hintRectToPolar({ step, title, ans, tier }) {
  const xy = parseXY(title);
  if (step === 0) {
    return Q("How do you get r from x and y?",
      `Use r = √(x² + y²). With x=${xy?.x}, y=${xy?.y}, compute √(${xy?.x}²+${xy?.y}²).`);
  }
  if (step === 1) {
    if (/atan\(/i.test(ans)) return "Use atan2(y, x), not atan(y/x), to get the correct quadrant.";
    return Q("Which function gives the angle with the correct quadrant?",
      "Compute θ_raw = atan2(y, x) in degrees; negative is OK here.");
  }
  if (step === 2) {
    if (/^-/.test(ans)) return "Add 360° to negative angles to land in [0°, 360°).";
    return "If θ is negative, add 360°. If ≥360°, subtract 360°.";
  }
  return "Find r, then θ_raw = atan2(y,x), then normalize θ.";
}

function hintPolarToRect({ step, title, ans, tier }) {
  const rt = parseRTheta(title);
  if (step === 0) {
    if (!/pi|π|rad/i.test(ans)) return "Convert θ to radians first: multiply degrees by π/180.";
    return `Compute θ(rad) = ${rt?.deg} × π/180.`;
  }
  if (step === 1) return "Use x = r cosθ. Keep θ in radians if your calculator expects radian mode.";
  if (step === 2) return "Use y = r sinθ. Check your mode (radians vs degrees).";
  return "Convert θ to radians, then x=r cosθ, y=r sinθ.";
}

function hintSOHCAHTOA({ step, title, ans, tier }) {
  if (step === 0) {
    return Q("Which sides are involved (opp/adj/hyp)?",
      "Pick SOH (opp/hyp), CAH (adj/hyp), or TOA (opp/adj).");
  }
  if (step === 1) return "Compute the single trig ratio first (like tanθ or sinθ).";
  if (step === 2) return "Isolate the unknown: e.g., opp = adj·tanθ or θ = tan⁻¹(opp/adj).";
  return "Choose ratio → compute trig value → solve.";
}

function hintIdentities({ step, title, ans, tier }) {
  if (step === 0) {
    if (/pyth/i.test(ans)) return "Yes—use sin²x + cos²x = 1.";
    if (/quot/i.test(ans)) return "Yes—use tanx = sinx/cosx or cotx = cosx/sinx.";
    if (/recip/i.test(ans)) return "Yes—use secx = 1/cosx, cscx = 1/sinx.";
    return "Is it Pythagorean (sin²+cos²=1), quotient (tan=sin/cos), or reciprocal (sec=1/cos)?";
  }
  if (step === 1) {
    if (/1\s*\+\s*tan/i.test(title)) return "Replace 1+tan²x with sec²x.";
    if (/1\s*-\s*cos/i.test(title)) return "Replace 1−cos²x with sin²x.";
    if (/tan\(x\)/i.test(title)) return "Write tanx as sinx/cosx.";
    if (/cot/i.test(title)) return "cotx = cosx/sinx; simplify.";
    return "Rewrite using the identity family you named.";
  }
  return "Name the family, then rewrite to the simplified form.";
}

/* ---------- small helpers ---------- */
function gcdInt(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
function simplifyFrac(text) {
  const m = String(text).match(/(-?\d+)\s*\/\s*(\d+)/);
  if (!m) return text;
  const n = Number(m[1]), d = Number(m[2]);
  const g = gcdInt(n, d); return `${n / g}/${d / g}`;
}
function fmtPiLocal(rad) {
  // quick π formatter for offline tier 3
  const k = rad / Math.PI;
  for (let den = 1; den <= 12; den++) {
    const num = Math.round(k * den);
    if (Math.abs(num / den - k) < 1e-6) {
      if (num === 0) return "0";
      if (den === 1) return `${num === 1 ? "" : num}π`;
      return `${num === 1 ? "" : num}π/${den}`;
    }
  }
  return rad.toFixed(3);
}

/* ---------- rubric sent to the LLM ---------- */
function buildRubric({ skill, problem, answer, tier }) {
  const step = Number(problem?.stepIndex ?? -1);
  const title = String(problem?.title || "");
  const ans = String(answer || "").trim();

  const items = [];

  if (skill === "deg-rad") {
    if (step === 0) items.push("Ask what to multiply degrees by to get radians (π/180). If missing π or 180, point that out.");
    if (step === 1) items.push("Guide to reduce deg/180; mention GCD if they gave a non-reduced fraction.");
    if (step === 2) items.push("If they used 180/π, say that's rad→deg. Otherwise ask to express as fraction of π or decimal.");
  }

  if (skill === "rad-deg") {
    if (step === 0) items.push("Ask what to multiply radians by (180/π).");
    if (step === 1) items.push("Prompt to evaluate numerically; 1 decimal is OK.");
    if (step === 2) items.push("Ask them to state the degree number; avoid giving it unless tier≥3.");
  }

  if (skill === "rect-polar") {
    if (step === 0) items.push("r = √(x²+y²).");
    if (step === 1) items.push("θ_raw = atan2(y, x) in degrees; negative OK.");
    if (step === 2) items.push("Normalize to [0°, 360°). Add 360 if negative.");
  }

  if (skill === "polar-rect") {
    if (step === 0) items.push("Convert θ to radians via ×π/180.");
    if (step === 1) items.push("x = r cosθ (use radians in calc).");
    if (step === 2) items.push("y = r sinθ.");
  }

  if (skill === "soh-cah-toa") {
    if (step === 0) items.push("Identify which sides are known/needed → SOH/CAH/TOA.");
    if (step === 1) items.push("Compute the trig ratio value.");
    if (step === 2) items.push("Isolate unknown; θ uses inverse trig.");
  }

  if (skill === "identities") {
    if (step === 0) items.push("Choose identity family: Pythagorean, Quotient, or Reciprocal.");
    if (step === 1) items.push("Apply the rewrite (e.g., 1−cos²x = sin²x; tanx = sinx/cosx).");
  }

  // Misconception hooks from their input
  if (/180\s*\/\s*(pi|π)/i.test(ans) && skill === "deg-rad")
    items.push("They are using 180/π when they should use π/180.");
  if (/atan\(/i.test(ans) && skill === "rect-polar" && step === 1)
    items.push("Remind to use atan2(y,x) instead of atan(y/x) for correct quadrant.");
  if (/deg|°/i.test(ans) && (skill === "polar-rect" || (skill === "rect-polar" && step === 1)))
    items.push("Check calculator angle mode; clarify when to use degrees vs radians.");

  return { items, tier, title, step };
}
