"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type BookingRequestItem = {
  id: number;
  company_id: number;
  talent_id: number;
  jobpost_id?: number | null;
  application_id?: number | null;

  status: string;

  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;

  site_name: string;
  site_address: string;
  contact_name: string;
  contact_phone: string;

  notes?: string | null;
  decline_reason?: string | null;

  requested_at: string;
  expires_at: string;
  responded_at?: string | null;
};

function extractDetail(text: string, status: number) {
  if (!text) return `STATUS ${status}: EMPTY`;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "detail" in parsed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = (parsed as any).detail;
      return typeof d === "string" ? d : JSON.stringify(d);
    }
  } catch {}
  return `STATUS ${status}: ${text}`;
}

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB");
}

function fmtTime(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 5);
}

function getTimeRemaining(expiresAt?: string | null) {
  if (!expiresAt) return { label: "No expiry", expired: false };

  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return { label: "Invalid expiry", expired: false };

  const now = Date.now();
  const diff = expiry - now;

  if (diff <= 0) return { label: "Expired", expired: true };

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return { label: `${days}d ${hours}h remaining`, expired: false };
  if (hours > 0) return { label: `${hours}h ${minutes}m remaining`, expired: false };
  return { label: `${minutes}m remaining`, expired: false };
}

export default function ProfessionalBookingRequestsPage() {
  const [items, setItems] = useState<BookingRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actingId, setActingId] = useState<number | null>(null);
  const [decliningId, setDecliningId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const load = async (opts?: { silent?: boolean }) => {
    try {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const res = await fetch("/api/professional/booking-requests", {
        cache: "no-store",
      });

      const text = await res.text();

      if (!res.ok) {
        setItems([]);
        setError(extractDetail(text, res.status));
        return;
      }

      const parsed = text ? JSON.parse(text) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch (e: any) {
      setItems([]);
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_LOAD_BOOKING_REQUESTS");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const pending = items.filter((i) => i.status?.toLowerCase() === "pending").length;
    const accepted = items.filter((i) => i.status?.toLowerCase() === "accepted").length;
    const declined = items.filter((i) => i.status?.toLowerCase() === "declined").length;
    const expired = items.filter((i) => i.status?.toLowerCase() === "expired").length;
    return { pending, accepted, declined, expired };
  }, [items]);

  const acceptRequest = async (requestId: number) => {
    try {
      setActingId(requestId);
      setError(null);

      const res = await fetch(`/api/professional/booking-requests/${requestId}/accept`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      const text = await res.text();

      if (!res.ok) {
        setError(extractDetail(text, res.status));
        return;
      }

      await load({ silent: true });
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_ACCEPT_BOOKING_REQUEST");
    } finally {
      setActingId(null);
    }
  };

  const declineRequest = async (requestId: number) => {
    try {
      setActingId(requestId);
      setError(null);

      if (!declineReason.trim()) {
        setError("DECLINE_REASON_REQUIRED");
        return;
      }

      const res = await fetch(`/api/professional/booking-requests/${requestId}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          decline_reason: declineReason.trim(),
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(extractDetail(text, res.status));
        return;
      }

      setDecliningId(null);
      setDeclineReason("");
      await load({ silent: true });
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_DECLINE_BOOKING_REQUEST");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Booking requests</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review incoming booking requests and respond before they expire.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/professional"
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
          >
            ← Back
          </Link>

          <button
            type="button"
            onClick={() => load({ silent: true })}
            disabled={loading || refreshing}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Pending" value={counts.pending} />
          <StatCard label="Accepted" value={counts.accepted} />
          <StatCard label="Declined" value={counts.declined} />
          <StatCard label="Expired" value={counts.expired} />
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading booking requests...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          No booking requests received yet.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => {
            const status = (item.status || "unknown").toLowerCase();
            const remaining = getTimeRemaining(item.expires_at);
            const isPending = status === "pending";
            const isActing = actingId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_30px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                <div className="border-b border-neutral-800/70 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-neutral-200">
                      Request #{item.id}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Requested: {fmtDateTime(item.requested_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={item.status} />
                    <TimeRemainingPill label={remaining.label} expired={remaining.expired} />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoBox
                      label="Dates"
                      value={`${fmtDate(item.start_date)} → ${fmtDate(item.end_date)}`}
                    />
                    <InfoBox
                      label="Times"
                      value={`${fmtTime(item.start_time)} → ${fmtTime(item.end_time)}`}
                    />
                    <InfoBox label="Site" value={item.site_name || "—"} />
                    <InfoBox label="Contact" value={item.contact_name || "—"} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <LargeInfoBox label="Site address" value={item.site_address || "—"} />
                    <LargeInfoBox
                      label="Contact phone"
                      value={status === "accepted" ? item.contact_phone || "—" : "Visible after acceptance"}
                    />
                  </div>

                  <LargeInfoBox
                    label="Additional information"
                    value={item.notes?.trim() ? item.notes : "No additional information provided."}
                  />

                  {item.decline_reason?.trim() && (
                    <LargeInfoBox label="Decline reason" value={item.decline_reason} />
                  )}

                  {item.jobpost_id != null || item.application_id != null ? (
                    <div className="text-xs text-neutral-500">
                      {item.jobpost_id != null ? `Job #${item.jobpost_id}` : ""}
                      {item.jobpost_id != null && item.application_id != null ? " • " : ""}
                      {item.application_id != null ? `Application #${item.application_id}` : ""}
                    </div>
                  ) : null}

                  {isPending && !remaining.expired && (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => acceptRequest(item.id)}
                          className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 px-4 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-900/40 disabled:opacity-60"
                        >
                          {isActing ? "Processing..." : "Accept request"}
                        </button>

                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => {
                            setDecliningId(item.id);
                            setDeclineReason("");
                          }}
                          className="rounded-xl border border-red-500/50 bg-red-950/30 px-4 py-2 text-xs font-medium text-red-100 transition hover:bg-red-900/40 disabled:opacity-60"
                        >
                          Decline request
                        </button>
                      </div>

                      {decliningId === item.id && (
                        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4">
                          <div className="text-xs font-medium text-red-200">Reason for declining</div>
                          <textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            rows={4}
                            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-white outline-none focus:border-red-400"
                            placeholder="Enter the reason for declining this booking request..."
                          />
                          <div className="mt-3 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDecliningId(null);
                                setDeclineReason("");
                              }}
                              className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              disabled={isActing || !declineReason.trim()}
                              onClick={() => declineRequest(item.id)}
                              className="rounded-xl border border-red-500/50 bg-red-950/30 px-4 py-2 text-xs font-medium text-red-100 transition hover:bg-red-900/40 disabled:opacity-60"
                            >
                              {isActing ? "Processing..." : "Confirm decline"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isPending && remaining.expired && (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-neutral-400">
                      This booking request has expired and can no longer be responded to.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-5">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-purple-300">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-neutral-200">{value}</p>
    </div>
  );
}

function LargeInfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-200">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const s = (status || "unknown").toLowerCase();

  const cls =
    s === "pending"
      ? "border-purple-500/60 bg-purple-950/40 text-purple-100"
      : s === "accepted"
        ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-100"
        : s === "declined"
          ? "border-red-500/60 bg-red-950/40 text-red-100"
          : s === "expired"
            ? "border-neutral-600/70 bg-neutral-900/70 text-neutral-100"
            : "border-neutral-600/70 bg-neutral-900/70 text-neutral-100";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${cls}`}>
      {s}
    </span>
  );
}

function TimeRemainingPill({ label, expired }: { label: string; expired: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${
        expired
          ? "border-red-500/40 bg-red-950/20 text-red-200"
          : "border-amber-500/40 bg-amber-950/20 text-amber-200"
      }`}
    >
      {label}
    </span>
  );
}