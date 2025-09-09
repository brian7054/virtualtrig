import dynamic from "next/dynamic";
const AITutorPractice = dynamic(() => import("../components/AITutorPractice"), { ssr: false });

export default function Practice() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">Practice</h1>
        <AITutorPractice />
      </div>
    </main>
  );
}
