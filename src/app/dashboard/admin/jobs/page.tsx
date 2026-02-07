import { Suspense } from "react";
import JobsClient from "./JobsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JobsClient />
    </Suspense>
  );
}
