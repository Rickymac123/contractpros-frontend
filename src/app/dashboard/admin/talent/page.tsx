import { Suspense } from "react";
import TalentClient from "./TalentClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TalentClient />
    </Suspense>
  );
}
