import { requireAuth } from "../../lib/requireAuth";

import dynamic from "next/dynamic";
const PracticeFlow = dynamic(() => import("../../components/PracticeFlow"), { ssr: false });

export default function RadDeg() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <PracticeFlow kind="rad-deg" />
      </div>
    </main>
  );
}
export const getServerSideProps = requireAuth();