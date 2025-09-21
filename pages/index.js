// pages/practice/index.js
import Head from "next/head";
import Link from "next/link";

const topics = [
  { id: "deg-rad",    title: "Degrees → Radians",       blurb: "Multiply by π/180",                          href: "/practice/deg-rad" },
  { id: "rad-deg",    title: "Radians → Degrees",       blurb: "Multiply by 180/π",                          href: "/practice/rad-deg" },
  { id: "polar-rect", title: "Polar → Rectangular",     blurb: "x = r cosθ, y = r sinθ",                     href: "/practice/polar-to-rect" },
  { id: "rect-polar", title: "Rectangular → Polar",     blurb: "r = √(x²+y²), θ = atan2(y,x)",               href: "/practice/polar-rect" },
  { id: "soh-cah-toa",title: "Solve Right Triangles",   blurb: "Pick the ratio, compute, solve",             href: "/practice/soh-cah-toa" },
  { id: "identities", title: "Trig Identities",         blurb: "Rewrite & simplify; auto-check equivalence", href: "/practice/identities" },
];

export default function PracticeHome() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <Head>
        <title>Practice — VIRTUALtrig</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Practice Topics</h1>
          <p className="text-gray-600 mt-1">
            Choose a topic. Each problem is broken into small steps with instant feedback and optional AI hints.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="group block rounded-2xl border p-5 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              aria-label={`Start practicing ${t.title}`}
            >
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">{t.title}</h2>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-700">
                  Start
                  <svg className="ml-1" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
              <p className="text-gray-600 mt-1">{t.blurb}</p>
              <div className="mt-3 text-sm text-gray-500">Step-by-step • Fill-in-the-blank • Hints</div>
            </Link>
          ))}
        </div>

        <section className="mt-8 text-sm text-gray-600">
          <p>
            Tip: On each step, press <span className="font-medium">Hint</span> for a gentle nudge. Use{" "}
            <span className="font-mono">New problem</span> to regenerate numbers.
          </p>
        </section>
      </div>
    </main>
  );
}
