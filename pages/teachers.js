export default function Teachers() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">For Teachers</h1>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Warm-ups: use <a className="underline" href="/explore">Unit Circle</a> to predict signs/values by quadrant.</li>
          <li>Practice: assign <a className="underline" href="/practice">Practice</a> for deg↔rad, polar↔rect, SOH-CAH-TOA.</li>
          <li>AI coach: students can request hints; answers come after a couple of nudges.</li>
          <li>Support: send questions via <a className="underline" href="/support">Support</a>.</li>
        </ul>
      </div>
    </main>
  );
}
