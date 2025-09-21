import dynamic from "next/dynamic";
const PracticeFlow = dynamic(() => import("../../components/PracticeFlow"), { ssr: false });


export default function DegRad() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <PracticeFlow kind="deg-rad" />
      </div>
    </main>
  );
}
