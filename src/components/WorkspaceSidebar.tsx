"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {LayoutDashboard,BriefcaseBusiness,CalendarDays,Users,FileText,Archive,UserRound,ShieldCheck,Menu,X} from "lucide-react";
const menus:Record<string,[string,string,typeof LayoutDashboard][]>= {
 company:[["","Overview",LayoutDashboard],["/profile","Business profile",BriefcaseBusiness],["/jobs","Jobs",BriefcaseBusiness],["/booking-requests","Booking requests",CalendarDays],["/jobs/archived","Archived jobs",Archive]],
 professional:[["","Overview",LayoutDashboard],["/applications","Applications",FileText],["/booking-requests","Booking requests",CalendarDays],["/profile","My profile",UserRound],["/preview","Public profile",Users],["/availability","Availability",CalendarDays]],
 agency:[["","Overview",LayoutDashboard],["/profile","Business profile",BriefcaseBusiness],["/talent","Talent",Users],["/applications","Applications",FileText],["/booking-requests","Booking requests",CalendarDays]],
 admin:[["","Overview",LayoutDashboard],["/users","Users",Users],["/jobs","Jobs",BriefcaseBusiness],["/talent","Talent",Users],["/qualifications","Qualifications",ShieldCheck],["/bookings","Bookings",CalendarDays],["/payment-terms","Payment terms",BriefcaseBusiness]]
};
export default function WorkspaceSidebar({role,email}:{role:string;email:string}){
 const path=usePathname(),[open,setOpen]=useState(false);const base=`/dashboard/${role}`;
 const menuButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!open)return;
  const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);menuButton.current?.focus();}};
  document.addEventListener("keydown",closeOnEscape);
  return ()=>document.removeEventListener("keydown",closeOnEscape);
 },[open]);
 const items=menus[role]||menus.professional;
 const matches=items.filter(([suffix])=>suffix?path.startsWith(base+suffix):path===base).sort((a,b)=>b[0].length-a[0].length);const active=matches[0]?.[0];
 return <><button ref={menuButton} className="cp-menu-toggle" aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} aria-controls="workspace-navigation" onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>} Menu</button>{open&&<button className="cp-menu-backdrop" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}<aside id="workspace-navigation" className={`cp-sidebar ${open?"is-open":""}`}><Link href={base} className="cp-brand" onClick={()=>setOpen(false)}><img src="/contractpros-logo-transparent.png" alt="ContractPros UK" width="160" height="112"/><strong>ContractPros</strong><span>Your recruitment workspace</span></Link><p className="cp-nav-label">{role} workspace</p><nav aria-label="Workspace navigation">{items.map(([suffix,label,Icon])=><Link key={suffix} href={base+suffix} aria-current={active===suffix?"page":undefined} onClick={()=>setOpen(false)}><Icon size={17}/>{label}</Link>)}{["professional","agency"].includes(role)&&<Link href="/dashboard/marketplace/jobs" onClick={()=>setOpen(false)}><BriefcaseBusiness size={17}/>Browse jobs</Link>}{["company","agency"].includes(role)&&<Link href="/dashboard/billing" aria-current={path==="/dashboard/billing"?"page":undefined} onClick={()=>setOpen(false)}><FileText size={17}/>Plans and billing</Link>}</nav><div className="cp-sidebar-account"><span>{email}</span><small>{role} account</small><Link href="/privacy">Privacy</Link> · <Link href="mailto:info@contractpros.co.uk">Support</Link></div></aside></>;
}
