import React, { useMemo, useState } from "react";

export default function UnitCircleExplorer() {
  const specialAngles = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];

  const [degrees, setDegrees] = useState(45);
  const [useRadians, setUseRadians] = useState(false);
  const [snap, setSnap] = useState(true);
  const [showTriangle, setShowTriangle] = useState(true);

  const clampDegrees = (d) => {
    let x = d % 360;
    if (x < 0) x += 360;
    return x;
  };

  const snappedDegrees = useMemo(() => {
    if (!snap) return degrees;
    let closest = specialAngles[0];
    let minDiff = Infinity;
    for (const a of specialAngles) {
      const diff = Math.abs(clampDegrees(degrees) - a);
      if (diff < minDiff) { minDiff = diff; closest = a; }
    }
    return closest;
  }, [degrees, snap]);

  const d = clampDegrees(snappedDegrees);
  const rad = (d * Math.PI) / 180;

  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const TAN_LIMIT = 1e6;
  const tan = Math.abs(cos) < 1e-10 ? Infinity : sin / cos;

  const quadrant = () => {
    if (d % 90 === 0) return "On an axis";
    if (d > 0 && d < 90) return "QI";
    if (d > 90 && d < 180) return "QII";
    if (d > 180 && d < 270) return "QIII";
    return "QIV";
  };

  const refAngle = () => {
    if (d % 90 === 0) return 0;
    if (d < 90) return d;
    if (d < 180) return 180 - d;
    if (d < 270) return d - 180;
    return 360 - d;
  };

  const exactSin = {0:"0",30:"1/2",45:"√2/2",60:"√3/2",90:"1",120:"√3/2",135:"√2/2",150:"1/2",180:"0",210:"-1/2",225:"-√2/2",240:"-√3/2",270:"-1",300:"-√3/2",315:"-√2/2",330:"-1/2",360:"0"};
  const exactCos = {0:"1",30:"√3/2",45:"√2/2",60:"1/2",90:"0",120:"-1/2",135:"-√2/2",150:"-√3/2",180:"-1",210:"-√3/2",225:"-√2/2",240:"-1/2",270:"0",300:"1/2",315:"√2/2",330:"√3/2",360:"1"};
  const exactTan = {0:"0",30:"√3/3",45:"1",60:"√3",90:"undefined",120:"-√3",135:"-1",150:"-√3/3",180:"0",210:"√3/3",225:"1",240:"√3",270:"undefined",300:"-√3",315:"-1",330:"-√3/3",360:"0"};
  const exactRad = {0:"0",30:"π/6",45:"π/4",60:"π/3",90:"π/2",120:"2π/3",135:"3π/4",150:"5π/6",180:"π",210:"7π/6",225:"5π/4",240:"4π/3",270:"3π/2",300:"5π/3",315:"7π/4",330:"11π/6",360:"2π"};

  const isSpecial = specialAngles.includes(d);
  const fmt = (x, digits=3) => (Math.abs(x) < 1e-12 ? "0" : x.toFixed(digits));

  const width = 380, height = 380;
  const cx = width/2, cy = height/2;
  const r = 140;

  const px = cx + r * Math.cos(rad);
  const py = cy - r * Math.sin(rad);

  const arcPath = (() => {
    const startX = cx + 40, startY = cy;
    const arcR = 40;
    const endX = cx + arcR * Math.cos(rad);
    const endY = cy - arcR * Math.sin(rad);
    const largeArc = d > 180 ? 1 : 0;
    const sweepFlag = 0;
    return `M ${startX} ${startY} A ${arcR} ${arcR} 0 ${largeArc} ${sweepFlag} ${endX} ${endY}`;
  })();

  const onTextChange = (v) => {
    const n = Number(String(v).replace(/[^-\\d.]/g, ""));
    if (!Number.isNaN(n)) setDegrees(n);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Unit Circle Explorer</h1>
        <p className="text-sm text-gray-600 mt-1">
          Explore how angle measure maps to coordinates, signs, and right-triangle relationships on the unit circle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Angle</label>
              <input type="range" min={0} max={360} step={snap ? 15 : 1} value={degrees}
                     onChange={(e) => setDegrees(Number(e.target.value))}
                     className="w-44" aria-label="Angle in degrees" />
              <input type="text"
                     value={useRadians && isSpecial ? exactRad[d] : String(d)}
                     onChange={(e) => onTextChange(e.target.value)}
                     className="w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring"
                     aria-label={useRadians ? "Angle in radians (special angles only)" : "Angle in degrees"} />
              <span className="text-sm text-gray-500">{useRadians ? "(rad)" : "(°)"}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={useRadians} onChange={(e) => setUseRadians(e.target.checked)} />
                Radians
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} />
                Snap to special angles
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showTriangle} onChange={(e) => setShowTriangle(e.target.checked)} />
                Show reference triangle
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <svg width={380} height={380} className="max-w-full">
              <line x1={0} y1={190} x2={380} y2={190} stroke="#e5e7eb" />
              <line x1={190} y1={0} x2={190} y2={380} stroke="#e5e7eb" />
              <circle cx={190} cy={190} r={140} fill="#ffffff" stroke="#111827" strokeWidth={1.5} />
              <path d={arcPath} fill="none" stroke="#6b7280" strokeWidth={2} />
              {showTriangle && (
                <g>
                  <line x1={190} y1={190} x2={px} y2={py} stroke="#2563eb" strokeWidth={2} />
                  <line x1={px} y1={py} x2={px} y2={190} stroke="#93c5fd" strokeWidth={2} />
                  <line x1={px} y1={190} x2={190} y2={190} stroke="#93c5fd" strokeWidth={2} />
                  <polygon points={`${190},${190} ${px},${py} ${px},${190}`} fill="#93c5fd33" />
                </g>
              )}
              <circle cx={px} cy={py} r={5} fill="#111827" />
              <text x={368} y={184} fontSize={10} textAnchor="end" fill="#6b7280">+x</text>
              <text x={196} y={12} fontSize={10} fill="#6b7280">+y</text>
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-5 space-y-4">
          <h2 className="text-lg font-semibold">Values & Structure</h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Angle">
              {useRadians && isSpecial ? exactRad[d] : `${d.toFixed(0)}°`} {useRadians && !isSpecial && `(${fmt(rad)})`}
            </InfoRow>
            <InfoRow label="Quadrant">{quadrant()}</InfoRow>
            <InfoRow label="Reference angle">{refAngle().toFixed(0)}°</InfoRow>
            <InfoRow label="cos θ">{isSpecial ? exactCos[d] : fmt(cos)}</InfoRow>
            <InfoRow label="sin θ">{isSpecial ? exactSin[d] : fmt(sin)}</InfoRow>
            <InfoRow label="tan θ">{isSpecial ? exactTan[d] : Math.abs(tan) > TAN_LIMIT ? "undefined" : fmt(tan)}</InfoRow>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <p>On the unit circle, a point at angle <strong>θ</strong> has coordinates (<strong>cos θ</strong>, <strong>sin θ</strong>). The reference triangle has adjacent |cos θ|, opposite |sin θ|, and hypotenuse 1.</p>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-1">Try this:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Turn off “Snap to special angles” and slide 0°→360°. When does tan θ become undefined?</li>
              <li>Switch to radians and locate π/3. What are cos θ and sin θ there?</li>
              <li>Find all angles with sin θ = 1/2. What pattern do you notice?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="font-mono text-sm md:text-base">{children}</span>
    </div>
  );
}
