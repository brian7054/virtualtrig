// pages/index.js
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                Trig that finally <span className="underline decoration-sky-300">makes sense</span>
              </h1>
              <p className="mt-4 text-lg text-gray-700">
                Interactive practice that shows each step. Convert angles, master the unit circle,
                and solve right triangles—with instant feedback and built-in hints.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/practice/identities"
                  className="inline-flex items-center rounded-xl bg-black text-white px-5 py-3 hover:bg-gray-900"
                >
                  Start practicing
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center rounded-xl border px-5 py-3 hover:bg-gray-50"
                >
                  Sign in
                </Link>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Students: sign in to save progress. Teachers: set up your class in minutes.
              </p>
            </div>

            {/* Brand card */}
            <div className="relative">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  
                  <Image
                    src="/brand/wordmark.svg"
                    alt="VIRTUALtrig"
                    width={180}
                    height={40}
                    className="h-8 w-auto"
                    priority
                  />
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li>• Bite-size, step-by-step practice</li>
                  <li>• Pi-friendly input (π, π/6, etc.)</li>
                  <li>• Guided hints from the AI Tutor</li>
                </ul>
                <div className="mt-5">
                  <Link
                    href="/practice"
                    className="inline-flex items-center rounded-xl bg-sky-600 text-white px-4 py-2 hover:bg-sky-700"
                  >
                    Explore topics
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="mt-12 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1">Unit circle</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">SOH‒CAH‒TOA</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Radians &amp; degrees</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Polar ↔ Rectangular</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Trig identities</span>
          </div>
        </div>
      </section>

      {/* Topics grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Jump into a topic</h2>
            <Link href="/practice" className="text-sm text-sky-700 hover:underline">
              See all practice
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TopicCard
              title="Degrees → Radians"
              blurb="Convert degrees to exact radian form (π-friendly)."
              href="/practice/deg-rad"
            />
            <TopicCard
              title="Radians → Degrees"
              blurb="Go from π-form to degrees—fast."
              href="/practice/rad-deg"
            />
            <TopicCard
              title="Rect → Polar"
              blurb="Compute r and θ step-by-step."
              href="/practice/rect-polar"
            />
            <TopicCard
              title="Polar → Rect"
              blurb="Use θ in radians to get x, y."
              href="/practice/polar-to-rect"
            />
            <TopicCard
              title="SOH‒CAH‒TOA"
              blurb="Choose the right ratio and solve."
              href="/practice/soh-cah-toa"
            />
            <TopicCard
              title="Trig identities"
              blurb="Rewrite and simplify with checks."
              href="/practice/identities"
            />
          </div>
        </div>
      </section>

      {/* AI Tutor blurb */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Built-in AI Tutor</h2>
              <p className="mt-3 text-gray-700">
                Stuck? Tap <span className="rounded-md border px-1.5 py-0.5 text-sm">Hint</span> for layered help:
                first a nudge, then a worked idea, and finally the key step—never just the answer.
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• Understand definitions, not just memorize.</li>
                <li>• See mistakes caught at each step.</li>
                <li>• Exact answers with π or decimals—your choice.</li>
              </ul>
              <div className="mt-5">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center rounded-xl bg-black text-white px-4 py-2 hover:bg-gray-900"
                >
                  Sign in to save progress
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-600">Example hint</p>
              <div className="mt-2 rounded-xl border bg-sky-50 text-sky-900 p-4">
                <p className="text-sm">
                  For radians → degrees, multiply by <span className="font-mono">180/π</span>.
                  Try canceling π before you multiply to keep numbers small.
                </p>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Hints adapt to your input—use them as scaffolding, then try a fresh problem.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">For teachers</h2>
              <p className="mt-3 text-gray-700">
                Use VIRTUALtrig for warm-ups, stations, or targeted practice. Students get
                instant feedback; you get fewer “where do I start?” questions.
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• Step-by-step prompts to show work</li>
                <li>• Exact answers (π) and decimals accepted</li>
                <li>• Great for precalc and trig units</li>
              </ul>
              <div className="mt-5">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-xl border px-4 py-2 hover:bg-gray-50"
                >
                  Contact us
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-medium">Quick start</h3>
              <ol className="mt-3 list-decimal pl-5 space-y-2 text-gray-700">
                <li>Create a class roster with your students’ emails.</li>
                <li>Point them to <span className="font-mono">/sign-in</span> for passwordless login.</li>
                <li>Share links to specific topics to match your lesson.</li>
              </ol>
              <p className="mt-3 text-sm text-gray-500">
                Already using VIRTUALgebra? Logins work here too when allowed by your school.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} VIRTUALtrig</div>
          <div className="flex items-center gap-4">
            <Link href="/practice" className="hover:underline">Practice</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <a href="mailto:support@virtualtrig.com" className="hover:underline">support@virtualtrig.com</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/** Small presentational card */
function TopicCard({ title, blurb, href }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-white p-5 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{blurb}</p>
        </div>
        <span
          aria-hidden="true"
          className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border group-hover:bg-gray-50"
        >
          →
        </span>
      </div>
    </Link>
  );
}
