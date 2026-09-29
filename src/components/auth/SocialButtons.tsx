"use client";
import { useEffect, useState } from "react";
import styles from "./auth.module.css";

export default function SocialButtons({ role }: { role?: string }) {
  const [providers, setProviders] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { let active = true;
    fetch("/api/social/providers").then(r => r.ok ? r.json() : { providers: [] })
      .then(data => { if (active) setProviders(Array.isArray(data.providers) ? data.providers : []); })
      .catch(() => {}).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);
  return <div>
    <div className={styles.socials}>
      {([['google','Google'],['apple','Apple'],['facebook','Facebook']] as const).map(([id,label]) => <button key={id} type="button" disabled={!providers.includes(id)} aria-label={`Continue with ${label}`} onClick={() => { window.location.href = `/api/social/${id}/start${role ? `?role=${role}` : ""}`; }}>{label}</button>)}
    </div>
    {loaded && providers.length < 3 && <p className={styles.socialNote}>Unavailable options are still being connected. You can continue with email below.</p>}
    <div className={styles.divider}>or continue with email</div>
  </div>;
}
