export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">VIRTUALtrig</h1>
        <p className="text-gray-600 mt-2">
          Trig that finally makes sense — interactive unit circle, graph transformers, and bite-size practice.
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/explore" className="px-4 py-2 rounded-xl bg-black text-white">Try the Unit Circle</a>
          <a href="/teachers" className="px-4 py-2 rounded-xl border">For Teachers</a>
        </div>

        {/* Tailwind check */}
        <p className="mt-6 p-4 rounded-xl bg-gray-900 text-white">
          If this box is dark with white text, Tailwind is working ✅
        </p>
      </section>
    </main>
  );
}
