import UnitCircleExplorer from "../components/UnitCircleExplorer";

export default function Explore() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">Unit Circle Explorer</h1>
        <UnitCircleExplorer />
      </div>
    </main>
  );
}
