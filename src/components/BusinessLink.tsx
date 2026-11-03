import Link from "next/link";
export default function BusinessLink({id}:{id?:number|string|null}) {return id ? <Link className="inline-flex rounded-lg px-2 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50 underline underline-offset-4" href={`/businesses/${id}`}>View business profile →</Link> : null;}
