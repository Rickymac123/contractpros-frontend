import {Suspense} from "react"; import ReviewForm from "@/components/auth/ReviewForm";
export default function Page(){return <Suspense fallback={null}><ReviewForm verify={false}/></Suspense>;}
