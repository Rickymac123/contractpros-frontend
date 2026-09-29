import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";
export default function Page() { return <Suspense fallback={<p>Loading signup…</p>}><SignupForm initialRole="professional" /></Suspense>; }
