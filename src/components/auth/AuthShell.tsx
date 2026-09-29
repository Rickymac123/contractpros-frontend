import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./auth.module.css";

export default function AuthShell({ children }: { children: ReactNode }) {
  return <main className={styles.shell}>
    <aside className={styles.story}>
      <Link href="/" className={styles.brand}><Image src="/company-logo-new.png" alt="ContractPros UK" width={160} height={105} className={styles.logo} priority /></Link>
      <div className={styles.storyBody}>
        <p className={styles.eyebrow}>GOOD PEOPLE. GREAT POSSIBILITIES.</p>
        <h1>Your next chapter<br />starts with a<br /><em>connection.</em></h1>
        <p>A place for professionals, companies and agencies to find the right fit and get to work.</p>
        <div className={styles.steps}>
          <div><span>01</span><p><strong>Make yourself known</strong>Build a profile that reflects what you do.</p></div>
          <div><span>02</span><p><strong>Find your fit</strong>Explore opportunities or discover talent.</p></div>
          <div><span>03</span><p><strong>Take the next step</strong>Discuss the work and agree an engagement.</p></div>
        </div>
      </div>
      <p className={styles.storyFooter}>Built around people. Made for possibility.</p>
    </aside>
    <section className={styles.formSide}><div className={styles.formWrap}>{children}</div></section>
  </main>;
}
