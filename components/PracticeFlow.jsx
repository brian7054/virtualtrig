// components/PracticeFlow.jsx
import { useMemo, useRef, useState } from "react";

/** ---------- helpers ---------- */
const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;
const clampDeg = (d) => ((d % 360) + 360) % 360;
const approx = (a, b, tol = 1e-3) => Math.abs(a - b) <= tol;

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const simplify = (n, d) => {
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
};

const parsePiExpr = (text) => {
  // accepts "π/6", "pi/6", "3π/4", "3*pi/4", numeric radians, etc.
  const t = String(text).trim().toLowerCase().replaceAll("π", "pi");
  if (/^[+-]?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  const safe = t.replaceAll("pi", "Math.PI");
  try {
    if (!/^[0-9+\-*/(). a-zA-Z]*$/.test(safe)) return NaN;
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${safe})`)();
    return typeof val === "number" && Number.isFinite(val) ? val : NaN;
  } catch {
    return NaN;
  }
};

const fmtPi = (rad) => {
  const k = rad / Math.PI;
  for (let den = 1; den <= 12; den++) {
    const num = Math.round(k * den);
    if (Math.abs(num / den - k) < 1e-6) {
      const [n, d] = simplify(num, den);
      if (n === 0) return "0";
      if (d === 1) return `${n === 1 ? "" : n}π`;
      return `${n === 1 ? "" : n}π/${d}`;
    }
  }
  return rad.toFixed(3);
};

/** ---------- AI hint fetcher (tiered) ---------- */
async function getHint({ kind, title, stepIndex, stepPrompt, studentInput, tier }) {
  try {
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "hint",
        skill: kind,
        problem: { title, stepIndex, stepPrompt },
        answer: studentInput,
        tier: Math.max(1, Math.min(3, tier || 1)), // 1..3
      }),
    });
    const json = await res.json().catch(() => ({}));
    return json?.answer || "(no hint)";
  } catch {
    return "(AI tutor unavailable)";
  }
}

/** ---------- Step UI (with MathPad + AI Hint) ---------- */
function Step({
  idx,
  total,
  prompt,
  placeholder,
  onCheck,
  value,
  setValue,
  ok,
  feedback,
  onHint,
}) {
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const inputRef = useRef(null);

  function insertAtCursor(text, move = 0) {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + text + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length + move;
      el.setSelectionRange(pos, pos);
    });
  }

  const buttons = [
    { label: "π", insert: "π" },
    { label: "π/6", insert: "π/6" },
    { label: "π/4", insert: "π/4" },
    { label: "π/3", insert: "π/3" },
    { label: "π/2", insert: "π/2" },
    { label: "°", insert: "°" },
    { label: "( )", insert: "()", move: -1 },
    { label: "/", insert: "/" },
    { label: "^", insert: "^" }, // for identities (e.g., sin(x)^2)
  ];

  async function handleHint() {
    if (!onHint) return;
    setLoading(true);
    setHint("");
    const nextTier = Math.min(3, hintsUsed + 1);
    try {
      const text = await onHint(value, nextTier);
      setHint(text || "(no hint)");
      setHintsUsed(nextTier);
    } catch {
      setHint("(AI tutor unavailable)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 mb-1">
          Step {idx + 1} of {total}
        </div>
        {onHint && (
          <button
            onClick={handleHint}
            className="text-sm underline underline-offset-2"
            type="button"
            disabled={loading}
          >
            {loading ? "Hint…" : "Hint"}
          </button>
        )}
      </div>

      <div className="font-medium">{prompt}</div>

      <div className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder={placeholder || "Type here"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          onClick={onCheck}
          className="px-4 py-2 rounded-xl bg-black text-white"
        >
          Check
        </button>
      </div>

      {/* MathPad */}
      <div className="mt-2 flex flex-wrap gap-2">
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => insertAtCursor(b.insert, b.move || 0)}
            className="px-2.5 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
            aria-label={`Insert ${b.label}`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {ok != null && (
        <div
          className={`mt-3 rounded-lg p-3 text-sm ${
            ok
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-amber-50 text-amber-900 border border-amber-200"
          }`}
        >
          {feedback}
        </div>
      )}

      {hint && (
        <div className="mt-3 rounded-lg p-3 text-sm bg-sky-50 text-sky-900 border border-sky-200">
          {hint}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Tip: You can also type <span className="font-mono">pi</span> instead of
        π — the checker understands both.
      </div>
    </div>
  );
}

/** ================= Flows ================== */
/** A: Degrees → Radians */
function useFlowDegToRad() {
  const deg = useMemo(
    () =>
      [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330][
        Math.floor(Math.random() * 12)
      ],
    []
  );
  const radExact = toRad(deg);

  const [v1, s1] = useState("");
  const [ok1, k1] = useState(null);
  const [fb1, f1] = useState("");
  const [v2, s2] = useState("");
  const [ok2, k2] = useState(null);
  const [fb2, f2] = useState("");
  const [v3, s3] = useState("");
  const [ok3, k3] = useState(null);
  const [fb3, f3] = useState("");

  const title = `Convert ${deg}° to radians`;

  const check1 = () => {
    const t = v1.replace(/\s+/g, "").toLowerCase();
    const ok = /pi|π/.test(t) && /180/.test(t) && t.includes(String(deg));
    k1(ok);
    f1(ok ? "Good: θ(rad)=θ(deg)×π/180." : "Hint: multiply degrees by π/180.");
  };
  const check2 = () => {
    const m = v2.replace(/\s+/g, "").match(/^(-?\d+)\/(\d+)$/);
    if (!m) {
      k2(false);
      f2("Enter a fraction like n/d (e.g., 1/6).");
      return;
    }
    const [n, d] = simplify(parseInt(m[1], 10), parseInt(m[2], 10));
    const tgt = simplify(deg, 180);
    const ok = n === tgt[0] && d === tgt[1];
    k2(ok);
    f2(ok ? `${deg}/180 → ${n}/${d}.` : `Reduce ${deg}/180.`);
  };
  const check3 = () => {
    const val = parsePiExpr(v3.trim());
    if (Number.isNaN(val)) {
      k3(false);
      f3("Use π-form (like nπ/d) or a decimal.");
      return;
    }
    const ok = approx(val, radExact, 5e-3);
    k3(ok);
    f3(
      ok
        ? `Correct: ${fmtPi(radExact)} rad (≈ ${radExact.toFixed(3)}).`
        : `Exact: ${fmtPi(radExact)} rad.`
    );
  };

  const steps = [
    {
      prompt: `Write the conversion formula with ${deg}° plugged in.`,
      placeholder: `(degrees × π)/180`,
      value: v1,
      setValue: s1,
      onCheck: check1,
      ok: ok1,
      feedback: fb1,
    },
    {
      prompt: `Reduce the fraction ${deg}/180 to lowest terms.`,
      placeholder: `n/d (e.g., 1/6)`,
      value: v2,
      setValue: s2,
      onCheck: check2,
      ok: ok2,
      feedback: fb2,
    },
    {
      prompt: `Write the final answer in π-form (or decimal).`,
      placeholder: `e.g., π/6 or 0.524`,
      value: v3,
      setValue: s3,
      onCheck: check3,
      ok: ok3,
      feedback: fb3,
    },
  ];

  return {
    kind: "deg-rad",
    title,
    steps,
    summary: `Answer: ${fmtPi(radExact)} rad (≈ ${radExact.toFixed(3)})`,
  };
}

/** B: Radians → Degrees */
function useFlowRadToDeg() {
  const specials = [
    [1, 6],
    [1, 4],
    [1, 3],
    [2, 3],
    [3, 4],
    [5, 6],
    [1, 2],
    [3, 2],
    [5, 4],
    [7, 6],
    [11, 6],
  ];
  const [n, d] = useMemo(
    () => specials[Math.floor(Math.random() * specials.length)],
    []
  );
  const radExact = (n / d) * Math.PI;
  const degExact = toDeg(radExact);

  const [v1, s1] = useState("");
  const [ok1, k1] = useState(null);
  const [fb1, f1] = useState("");
  const [v2, s2] = useState("");
  const [ok2, k2] = useState(null);
  const [fb2, f2] = useState("");
  const [v3, s3] = useState("");
  const [ok3, k3] = useState(null);
  const [fb3, f3] = useState("");

  const title = `Convert ${n === 1 ? "" : n}π/${d} to degrees`;

  const check1 = () => {
    const t = v1.replace(/\s+/g, "").toLowerCase();
    const ok = /180/.test(t) && /pi|π/.test(t);
    k1(ok);
    f1(ok ? "Good: θ(deg)=θ(rad)×180/π." : "Hint: multiply radians by 180/π.");
  };
  const check2 = () => {
    const num = Number(v2);
    if (!Number.isFinite(num)) {
      k2(false);
      f2("Enter a number (one decimal okay).");
      return;
    }
    const ok = approx(num, degExact, 0.5);
    k2(ok);
    f2(
      ok
        ? `Looks good.`
        : `Compute ((${n === 1 ? "" : n}π/${d})×(180/π)).`
    );
  };
  const check3 = () => {
    const num = Number(v3);
    if (!Number.isFinite(num)) {
      k3(false);
      f3("Enter degrees as a number.");
      return;
    }
    const ok = Math.abs(num - degExact) <= 0.5;
    k3(ok);
    f3(ok ? `Answer: ${degExact.toFixed(1)}°.` : `Aim for ≈ ${degExact.toFixed(1)}°.`);
  };

  const steps = [
    {
      prompt: `Write the conversion formula with ${n === 1 ? "" : n}π/${d} plugged in.`,
      placeholder: `(radians × 180)/π`,
      value: v1,
      setValue: s1,
      onCheck: check1,
      ok: ok1,
      feedback: fb1,
    },
    {
      prompt: `Compute the numeric value (one decimal ok).`,
      placeholder: `e.g., 150.0`,
      value: v2,
      setValue: s2,
      onCheck: check2,
      ok: ok2,
      feedback: fb2,
    },
    {
      prompt: `State the final answer in degrees.`,
      placeholder: `degrees`,
      value: v3,
      setValue: s3,
      onCheck: check3,
      ok: ok3,
      feedback: fb3,
    },
  ];

  return { kind: "rad-deg", title, steps, summary: `Answer: ${degExact.toFixed(1)}°` };
}

/** C: Rect → Polar */
function useFlowRectToPolar() {
  const [x, y] = useMemo(() => {
    let a = 0, b = 0;
    while (a === 0 && b === 0) {
      a = Math.floor(Math.random() * 13) - 6;
      b = Math.floor(Math.random() * 13) - 6;
    }
    return [a, b];
  }, []);
  const rTrue = Math.hypot(x, y);
  const rawDeg = toDeg(Math.atan2(y, x));
  const thetaTrue = clampDeg(rawDeg);

  const [v1, s1] = useState("");
  const [ok1, k1] = useState(null);
  const [fb1, f1] = useState("");
  const [v2, s2] = useState("");
  const [ok2, k2] = useState(null);
  const [fb2, f2] = useState("");
  const [v3, s3] = useState("");
  const [ok3, k3] = useState(null);
  const [fb3, f3] = useState("");

  const title = `Rect → Polar: (${x}, ${y})`;
  const check1 = () => {
    const n = Number(v1);
    const ok = Number.isFinite(n) && approx(n, rTrue, 0.25);
    k1(ok);
    f1(ok ? `r ≈ ${rTrue.toFixed(3)}` : `Use r=√(x²+y²).`);
  };
  const check2 = () => {
    const n = Number(v2);
    if (!Number.isFinite(n)) {
      k2(false);
      f2("Degrees are fine; angle can be negative.");
      return;
    }
    const ok = approx(n, rawDeg, 2);
    k2(ok);
    f2(ok ? `θ_raw looks close.` : `Use θ_raw=atan2(y,x).`);
  };
  const check3 = () => {
    const n = Number(v3);
    if (!Number.isFinite(n)) {
      k3(false);
      f3("Enter 0–360.");
      return;
    }
    const ok = approx(clampDeg(n), thetaTrue, 2);
    k3(ok);
    f3(ok ? `Normalized angle looks right.` : `Add 360 if negative; mod 360 if ≥360.`);
  };

  const steps = [
    {
      prompt: `Compute r = √(x²+y²).`,
      placeholder: `e.g., 5`,
      value: v1,
      setValue: s1,
      onCheck: check1,
      ok: ok1,
      feedback: fb1,
    },
    {
      prompt: `Compute raw angle θ_raw = atan2(y, x) in degrees.`,
      placeholder: `degrees (can be negative)`,
      value: v2,
      setValue: s2,
      onCheck: check2,
      ok: ok2,
      feedback: fb2,
    },
    {
      prompt: `Normalize θ to [0°, 360°).`,
      placeholder: `0 to 360`,
      value: v3,
      setValue: s3,
      onCheck: check3,
      ok: ok3,
      feedback: fb3,
    },
  ];

  return {
    kind: "rect-polar",
    title,
    steps,
    summary: `Answer: r ≈ ${rTrue.toFixed(3)}, θ ≈ ${thetaTrue.toFixed(1)}°`,
  };
}

/** D: Polar → Rect */
function useFlowPolarToRect() {
  const r = useMemo(() => 1 + Math.floor(Math.random() * 10), []);
  const deg = useMemo(() => 15 * Math.floor(Math.random() * (360 / 15)), []);
  const xTrue = r * Math.cos(toRad(deg));
  const yTrue = r * Math.sin(toRad(deg));

  const [v1, s1] = useState("");
  const [ok1, k1] = useState(null);
  const [fb1, f1] = useState("");
  const [v2, s2] = useState("");
  const [ok2, k2] = useState(null);
  const [fb2, f2] = useState("");
  const [v3, s3] = useState("");
  const [ok3, k3] = useState(null);
  const [fb3, f3] = useState("");

  const title = `Polar → Rect: r=${r}, θ=${deg}°`;
  const check1 = () => {
    const val = parsePiExpr(v1.trim());
    if (Number.isNaN(val)) {
      k1(false);
      f1("Convert θ to radians (π-form or decimal).");
      return;
    }
    const ok = approx(val, toRad(deg), 5e-3);
    k1(ok);
    f1(ok ? `θ in radians looks right.` : `Multiply degrees by π/180.`);
  };
  const check2 = () => {
    const n = Number(v2);
    const ok = Number.isFinite(n) && approx(n, xTrue, 0.25);
    k2(ok);
    f2(ok ? `x is close.` : `Use x = r cos θ (θ in radians).`);
  };
  const check3 = () => {
    const n = Number(v3);
    const ok = Number.isFinite(n) && approx(n, yTrue, 0.25);
    k3(ok);
    f3(ok ? `y is close.` : `Use y = r sin θ (θ in radians).`);
  };

  const steps = [
    {
      prompt: `Convert θ to radians.`,
      placeholder: `e.g., θ × π/180`,
      value: v1,
      setValue: s1,
      onCheck: check1,
      ok: ok1,
      feedback: fb1,
    },
    {
      prompt: `Compute x = r cos θ.`,
      placeholder: `x value`,
      value: v2,
      setValue: s2,
      onCheck: check2,
      ok: ok2,
      feedback: fb2,
    },
    {
      prompt: `Compute y = r sin θ.`,
      placeholder: `y value`,
      value: v3,
      setValue: s3,
      onCheck: check3,
      ok: ok3,
      feedback: fb3,
    },
  ];

  return {
    kind: "polar-rect",
    title,
    steps,
    summary: `Answer: (x, y) ≈ (${xTrue.toFixed(3)}, ${yTrue.toFixed(3)})`,
  };
}

/** E: Right triangles (SOH-CAH-TOA) */
function useFlowRightTriangle() {
  const variant = useMemo(
    () => ["TOA-side", "SOH-side", "TOA-angle"][Math.floor(Math.random() * 3)],
    []
  );
  const theta = useMemo(() => 15 * (2 + Math.floor(Math.random() * 4)) + 5, []); // ~35–80°
  const adj = useMemo(() => 3 + Math.floor(Math.random() * 10), []);
  const hyp = useMemo(() => 5 + Math.floor(Math.random() * 10), []);
  const oppFromAdj = Math.tan(toRad(theta)) * adj;
  const oppFromHyp = Math.sin(toRad(theta)) * hyp;

  const mk = (title, steps, summary) => ({
    kind: "soh-cah-toa",
    title,
    steps,
    summary,
  });

  if (variant === "TOA-side") {
    const [v1, s1] = useState("");
    const [ok1, k1] = useState(null);
    const [fb1, f1] = useState("");
    const [v2, s2] = useState("");
    const [ok2, k2] = useState(null);
    const [fb2, f2] = useState("");
    const [v3, s3] = useState("");
    const [ok3, k3] = useState(null);
    const [fb3, f3] = useState("");

    const title = `Right triangle: adj=${adj}, θ=${theta}°. Find opp.`;
    const check1 = () => {
      const t = v1.trim().toUpperCase();
      const ok = t === "TOA";
      k1(ok);
      f1(ok ? "tanθ = opp/adj." : "Opp & Adj → TOA.");
    };
    const check2 = () => {
      const n = Number(v2);
      if (!Number.isFinite(n)) {
        k2(false);
        f2("Enter the value of tan(θ).");
        return;
      }
      const target = Math.tan(toRad(theta));
      const ok = approx(n, target, 0.05);
      k2(ok);
      f2(ok ? `tan(θ) looks reasonable.` : `Compute tan(${theta}°).`);
    };
    const check3 = () => {
      const n = Number(v3);
      if (!Number.isFinite(n)) {
        k3(false);
        f3("Enter a number.");
        return;
      }
      const target = oppFromAdj;
      const ok = approx(n, target, 0.5);
      k3(ok);
      f3(ok ? `opp is close.` : `opp = adj × tanθ.`);
    };

    return mk(
      title,
      [
        {
          prompt: "Which ratio applies? (SOH/CAH/TOA)",
          placeholder: "Type SOH, CAH, or TOA",
          value: v1,
          setValue: s1,
          onCheck: check1,
          ok: ok1,
          feedback: fb1,
        },
        {
          prompt: `Compute tan(${theta}°).`,
          placeholder: "e.g., 0.700",
          value: v2,
          setValue: s2,
          onCheck: check2,
          ok: ok2,
          feedback: fb2,
        },
        {
          prompt: `Solve for opp.`,
          placeholder: `numeric value`,
          value: v3,
          setValue: s3,
          onCheck: check3,
          ok: ok3,
          feedback: fb3,
        },
      ],
      `opp ≈ ${oppFromAdj.toFixed(2)} (adj=${adj}, θ=${theta}°)`
    );
  }

  if (variant === "SOH-side") {
    const [v1, s1] = useState("");
    const [ok1, k1] = useState(null);
    const [fb1, f1] = useState("");
    const [v2, s2] = useState("");
    const [ok2, k2] = useState(null);
    const [fb2, f2] = useState("");
    const [v3, s3] = useState("");
    const [ok3, k3] = useState(null);
    const [fb3, f3] = useState("");

    const title = `Right triangle: hyp=${hyp}, θ=${theta}°. Find opp.`;
    const check1 = () => {
      const t = v1.trim().toUpperCase();
      const ok = t === "SOH";
      k1(ok);
      f1(ok ? "sinθ = opp/hyp." : "Opp & Hyp → SOH.");
    };
    const check2 = () => {
      const n = Number(v2);
      if (!Number.isFinite(n)) {
        k2(false);
        f2("Enter the value of sin(θ).");
        return;
      }
      const target = Math.sin(toRad(theta));
      const ok = approx(n, target, 0.05);
      k2(ok);
      f2(ok ? `sin(θ) looks reasonable.` : `Compute sin(${theta}°).`);
    };
    const check3 = () => {
      const n = Number(v3);
      if (!Number.isFinite(n)) {
        k3(false);
        f3("Enter a number.");
        return;
      }
      const target = oppFromHyp;
      const ok = approx(n, target, 0.5);
      k3(ok);
      f3(ok ? `opp is close.` : `opp = hyp × sinθ.`);
    };

    return mk(
      title,
      [
        {
          prompt: "Which ratio applies? (SOH/CAH/TOA)",
          placeholder: "Type SOH, CAH, or TOA",
          value: v1,
          setValue: s1,
          onCheck: check1,
          ok: ok1,
          feedback: fb1,
        },
        {
          prompt: `Compute sin(${theta}°).`,
          placeholder: "e.g., 0.866",
          value: v2,
          setValue: s2,
          onCheck: check2,
          ok: ok2,
          feedback: fb2,
        },
        {
          prompt: `Solve for opp.`,
          placeholder: `numeric value`,
          value: v3,
          setValue: s3,
          onCheck: check3,
          ok: ok3,
          feedback: fb3,
        },
      ],
      `opp ≈ ${oppFromHyp.toFixed(2)} (hyp=${hyp}, θ=${theta}°)`
    );
  }

  // Variant: find angle from opp & adj
  const opp = Math.round(Math.tan(toRad(theta)) * adj);
  const [v1, s1] = useState("");
  const [ok1, k1] = useState(null);
  const [fb1, f1] = useState("");
  const [v2, s2] = useState("");
  const [ok2, k2] = useState(null);
  const [fb2, f2] = useState("");
  const [v3, s3] = useState("");
  const [ok3, k3] = useState(null);
  const [fb3, f3] = useState("");

  const title = `Right triangle: opp=${opp}, adj=${adj}. Find θ.`;
  const check1 = () => {
    const t = v1.trim().toUpperCase();
    const ok = t === "TOA";
    k1(ok);
    f1(ok ? "tanθ = opp/adj." : "Opp & Adj → TOA.");
  };
  const check2 = () => {
    const n = Number(v2);
    if (!Number.isFinite(n)) {
      k2(false);
      f2("Enter opp/adj as a decimal.");
      return;
    }
    const target = opp / adj;
    const ok = approx(n, target, 0.05);
    k2(ok);
    f2(ok ? `opp/adj looks right.` : `Compute opp/adj.`);
  };
  const check3 = () => {
    const n = Number(v3);
    if (!Number.isFinite(n)) {
      k3(false);
      f3("Enter the angle in degrees.");
      return;
    }
    const target = toDeg(Math.atan2(opp, adj));
    const ok = Math.abs(n - target) <= 1;
    k3(ok);
    f3(ok ? `θ is about right.` : `θ = tan⁻¹(opp/adj).`);
  };

  return {
    kind: "soh-cah-toa",
    title,
    steps: [
      {
        prompt: "Which ratio applies? (SOH/CAH/TOA)",
        placeholder: "Type SOH, CAH, or TOA",
        value: v1,
        setValue: s1,
        onCheck: check1,
        ok: ok1,
        feedback: fb1,
      },
      {
        prompt: `Compute opp/adj.`,
        placeholder: "decimal (e.g., 0.75)",
        value: v2,
        setValue: s2,
        onCheck: check2,
        ok: ok2,
        feedback: fb2,
      },
      {
        prompt: `Compute θ = tan⁻¹(opp/adj) in degrees.`,
        placeholder: `angle in degrees`,
        value: v3,
        setValue: s3,
        onCheck: check3,
        ok: ok3,
        feedback: fb3,
      },
    ],
    summary: `θ ≈ ${toDeg(Math.atan2(opp, adj)).toFixed(1)}° (opp=${opp}, adj=${adj})`,
  };
}

/** F: Trig Identities (rewrite/simplify) */
function useFlowIdentities() {
  const problems = [
    { prompt: "Simplify 1 - cos(x)^2", target: "sin(x)^2", family: "pythagorean" },
    { prompt: "Rewrite tan(x) using sin and cos", target: "sin(x)/cos(x)", family: "quotient" },
    { prompt: "Simplify 1 + tan(x)^2", target: "sec(x)^2", family: "pythagorean" },
    { prompt: "Simplify sin(x) * cot(x)", target: "cos(x)", family: "quotient" },
  ];
  const p = useMemo(
    () => problems[Math.floor(Math.random() * problems.length)],
    []
  );
  const [v1, s1] = useState("");
  const [ok1, k1] = useState(null);
  const [fb1, f1] = useState("");
  const [v2, s2] = useState("");
  const [ok2, k2] = useState(null);
  const [fb2, f2] = useState("");

  const title = `Identities — ${p.prompt}`;
  const check1 = () => {
    const t = v1.trim().toLowerCase();
    const ok =
      (p.family === "pythagorean" && /pyth/i.test(t)) ||
      (p.family === "quotient" && /quot/i.test(t)) ||
      (p.family === "reciprocal" && /recip/i.test(t));
    k1(ok);
    f1(
      ok
        ? "Right family."
        : p.family === "pythagorean"
        ? "Hint: sin^2 + cos^2 = 1."
        : p.family === "quotient"
        ? "Hint: tan=sin/cos; cot=cos/sin."
        : "Hint: sec=1/cos; csc=1/sin."
    );
  };
  const check2 = () => {
    const ok = equivalentExpr(v2, p.target);
    k2(ok);
    f2(ok ? `Correct: ${p.target}` : "Try again. Use sin(x)^2, cos(x), tan(x).");
  };

  return {
    kind: "identities",
    title,
    steps: [
      {
        prompt: "Which identity family applies? (pythagorean / quotient / reciprocal)",
        placeholder: "type the family (e.g., pythagorean)",
        value: v1,
        setValue: s1,
        onCheck: check1,
        ok: ok1,
        feedback: fb1,
      },
      {
        prompt: "Write the simplified form.",
        placeholder: "e.g., sin(x)^2 or sin(x)/cos(x)",
        value: v2,
        setValue: s2,
        onCheck: check2,
        ok: ok2,
        feedback: fb2,
      },
    ],
    summary: `Answer: ${p.target}`,
  };
}

// Tiny equivalence checker (numeric sampling)
function equivalentExpr(aExpr, bExpr) {
  const norm = (s) =>
    String(s)
      .toLowerCase()
      .replaceAll("^", "**")
      .replace(/\bsec\(/g, "(1/Math.cos(")
      .replace(/\bcsc\(/g, "(1/Math.sin(")
      .replace(/\bcot\(/g, "(1/Math.tan(")
      .replace(/\bsin\(/g, "Math.sin(")
      .replace(/\bcos\(/g, "Math.cos(")
      .replace(/\btan\(/g, "Math.tan(")
      .replaceAll("π", "Math.PI");

  const safe = (s) =>
    /^[0-9+\-*/(). xMathsincoatdpieqr]*$/i.test(s.replace(/\s+/g, ""))
      ? s
      : null;

  const A = safe(norm(aExpr));
  const B = safe(norm(bExpr));
  if (!A || !B) return false;

  const xs = [0.3, 0.7, 1.2, 2.1, -0.8];
  try {
    for (const x of xs) {
      // eslint-disable-next-line no-new-func
      const va = Function("Math", "x", `"use strict";return(${A});`)(Math, x);
      const vb = Function("Math", "x", `"use strict";return(${B});`)(Math, x);
      if (!(Number.isFinite(va) && Number.isFinite(vb)) || !approx(va, vb, 1e-3)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** ---------- Main exported component ---------- */
export default function PracticeFlow({ kind }) {
  const flow = (() => {
    if (kind === "deg-rad") return useFlowDegToRad();
    if (kind === "rad-deg") return useFlowRadToDeg();
    if (kind === "rect-polar") return useFlowRectToPolar();
    if (kind === "polar-rect") return useFlowPolarToRect();
    if (kind === "soh-cah-toa") return useFlowRightTriangle();
    if (kind === "identities") return useFlowIdentities();
    return { kind, title: "Coming soon", steps: [], summary: "" };
  })();

  const [stepIdx, setStepIdx] = useState(0);
  const total = flow.steps.length;

  async function hintFor(step, tier = 1) {
    return getHint({
      kind: flow.kind,
      title: flow.title,
      stepIndex: stepIdx,
      stepPrompt: step.prompt,
      studentInput: step.value,
      tier,
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">{flow.title}</h1>
        <button
          className="px-3 py-2 rounded-xl border"
          onClick={() => {
            setStepIdx(0);
            if (typeof window !== "undefined") window.location.reload();
          }}
        >
          New problem
        </button>
      </div>

      {total === 0 ? (
        <div className="rounded-xl border p-4 bg-white">
          This topic will be added shortly.
        </div>
      ) : (
        <>
          <Step
            idx={stepIdx}
            total={total}
            {...flow.steps[stepIdx]}
            onHint={(_, tier) => hintFor(flow.steps[stepIdx], tier)}
            onCheck={() => flow.steps[stepIdx].onCheck()}
          />
          <div className="mt-4 flex items-center justify-between">
            <button
              className="px-3 py-2 rounded-xl border"
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
            >
              Back
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-black text-white"
              onClick={() => setStepIdx((i) => Math.min(total - 1, i + 1))}
              disabled={stepIdx === total - 1}
            >
              Next
            </button>
          </div>
          {stepIdx === total - 1 && (
            <div className="mt-4 rounded-xl border p-4 bg-green-50 border-green-200 text-green-900">
              {flow.summary}
            </div>
          )}
        </>
      )}

      <div className="mt-6 text-sm text-gray-600">
        Tip: Green = correct; use the Hint for a nudge. “New problem” regenerates
        numbers.
      </div>
    </div>
  );
}
