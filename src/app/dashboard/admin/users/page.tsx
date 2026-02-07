import { Suspense } from "react";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UsersClient />
    </Suspense>
  );
}
