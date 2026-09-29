import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";
export const metadata = { title: "Create your account" };
export default function Page() { return <Suspense fallback={<p>Loading signup…</p>}><SignupForm /></Suspense>; }
