"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventChangeArg } from "@fullcalendar/core";
import rrulePlugin from "@fullcalendar/rrule";
import { RRule } from "rrule";

type AvailabilityEvent = {
  id: number;
  start_at: string; // "YYYY-MM-DDTHH:mm:ss"
  end_at: string;
  status: "busy" | "available" | string;
  title?: string | null;
  notes?: string | null;
  series_id?: string | null;
  rrule?: string | null;
  exdates?: string | null;
};

type RepeatType = "none" | "daily" | "weekly" | "custom";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIsoLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:00`;
}

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

function defaultStartEndNow(): { start: Date; end: Date } {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return { start, end };
}

function isoToDateInput(iso: string) {
  return iso?.slice(0, 10) ?? "";
}

function isoToTimeInput(iso: string) {
  return iso?.slice(11, 16) ?? "";
}

function combineDateTime(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
}

function toRruleUntil(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59));
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T235959Z`;
}

function rruleUntilToDateInput(until: string) {
  const raw = until.replace("Z", "");
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  if (!y || !m || !d) return "";
  return `${y}-${m}-${d}`;
}

function parseRrule(rrule: string | null | undefined): { repeatType: RepeatType; interval: number; until: string } {
  if (!rrule) return { repeatType: "none", interval: 1, until: "" };

  const normalized = rrule.startsWith("RRULE:") ? rrule.slice(6) : rrule;

  const parts = normalized.split(";").reduce<Record<string, string>>((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) acc[k.toUpperCase()] = v;
    return acc;
  }, {});

  const freq = (parts["FREQ"] || "").toUpperCase();
  const interval = Math.max(1, Number(parts["INTERVAL"] || 1));
  const until = parts["UNTIL"] ? rruleUntilToDateInput(parts["UNTIL"]) : "";

  let repeatType: RepeatType = "none";
  if (freq === "DAILY") repeatType = "daily";
  if (freq === "WEEKLY") repeatType = "weekly";
  if (freq === "DAILY" && interval > 1) repeatType = "custom";

  return { repeatType, interval, until };
}

export default function ProfessionalAvailabilityPage() {
  const [items, setItems] = useState<AvailabilityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [fTitle, setFTitle] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fStatus, setFStatus] = useState<"busy" | "available">("busy");

  const [fStartDate, setFStartDate] = useState("");
  const [fStartTime, setFStartTime] = useState("");
  const [fEndDate, setFEndDate] = useState("");
  const [fEndTime, setFEndTime] = useState("");

  // Recurrence state
  const [repeatType, setRepeatType] = useState<RepeatType>("none");
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatUntil, setRepeatUntil] = useState(""); // YYYY-MM-DD

  const events = useMemo(() => {
    return items.map((a) => {
      const title = (a.title ?? (a.status === "busy" ? "Busy" : "Available")) as string;

      const startMs = new Date(a.start_at).getTime();
      const endMs = new Date(a.end_at).getTime();
      const durationMs = Math.max(0, endMs - startMs);

      // Non-recurring event
      if (!a.rrule) {
        return {
          id: String(a.id),
          title,
          start: a.start_at,
          end: a.end_at,
          extendedProps: {
            notes: a.notes ?? "",
            status: a.status ?? "busy",
          },
          classNames: ["cp-event", a.status === "busy" ? "cp-event-busy" : "cp-event-available"],
        };
      }

      // Recurring event (RRULE expansion via @fullcalendar/rrule)
      const rruleStr = a.rrule.startsWith("RRULE:") ? a.rrule.slice(6) : a.rrule;
      const opts = RRule.parseString(rruleStr);

      return {
        id: String(a.id),
        title,
        rrule: {
          ...opts,
          dtstart: new Date(a.start_at),
        },
        duration: durationMs,
        extendedProps: {
          notes: a.notes ?? "",
          status: a.status ?? "busy",
        },
        classNames: ["cp-event", a.status === "busy" ? "cp-event-busy" : "cp-event-available"],
      };
    });
  }, [items]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  function resetRecurrence() {
    setRepeatType("none");
    setRepeatInterval(1);
    setRepeatUntil("");
  }

  function buildRrule(): string | null {
    if (repeatType === "none") return null;

    const parts: string[] = [];

    if (repeatType === "daily") {
      parts.push("FREQ=DAILY");
      parts.push(`INTERVAL=${Math.max(1, repeatInterval)}`);
    }

    if (repeatType === "custom") {
      parts.push("FREQ=DAILY");
      parts.push(`INTERVAL=${Math.max(1, repeatInterval)}`);
    }

    if (repeatType === "weekly") {
      parts.push("FREQ=WEEKLY");
      parts.push(`INTERVAL=${Math.max(1, repeatInterval)}`);
    }

    if (repeatUntil) {
      parts.push(`UNTIL=${toRruleUntil(repeatUntil)}`);
    }

    return parts.join(";");
  }

  const openCreateModal = (seed?: { start: Date; end: Date }) => {
    const { start, end } = seed ?? defaultStartEndNow();
    setModalMode("create");
    setEditingId(null);

    setFTitle("Blocked");
    setFNotes("");
    setFStatus("busy");

    setFStartDate(`${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`);
    setFStartTime(`${pad(start.getHours())}:${pad(start.getMinutes())}`);
    setFEndDate(`${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`);
    setFEndTime(`${pad(end.getHours())}:${pad(end.getMinutes())}`);

    resetRecurrence();
    setModalOpen(true);
  };

  const openEditModal = (ev: AvailabilityEvent) => {
    setModalMode("edit");
    setEditingId(ev.id);

    setFTitle(ev.title ?? "");
    setFNotes(ev.notes ?? "");
    setFStatus((ev.status === "available" ? "available" : "busy") as any);

    setFStartDate(isoToDateInput(ev.start_at));
    setFStartTime(isoToTimeInput(ev.start_at));
    setFEndDate(isoToDateInput(ev.end_at));
    setFEndTime(isoToTimeInput(ev.end_at));

    const parsed = parseRrule(ev.rrule);
    setRepeatType(parsed.repeatType);
    setRepeatInterval(parsed.interval);
    setRepeatUntil(parsed.until);

    setModalOpen(true);
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      const res = await fetch("/api/professional/availability", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        setItems([]);
        setError(extractDetail(text, res.status));
        return;
      }

      const data = text ? JSON.parse(text) : [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setItems([]);
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_LOAD");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createFromSelect = async (arg: DateSelectArg) => {
    openCreateModal({ start: arg.start, end: arg.end });
  };

  const saveModal = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      if (!fStartDate || !fStartTime || !fEndDate || !fEndTime) {
        setError("START_AND_END_REQUIRED");
        return;
      }

      const start = combineDateTime(fStartDate, fStartTime);
      const end = combineDateTime(fEndDate, fEndTime);

      if (!(start instanceof Date) || isNaN(start.getTime())) {
        setError("START_INVALID");
        return;
      }
      if (!(end instanceof Date) || isNaN(end.getTime())) {
        setError("END_INVALID");
        return;
      }
      if (end <= start) {
        setError("END_MUST_BE_AFTER_START");
        return;
      }

      const payload = {
        start_at: toIsoLocal(start),
        end_at: toIsoLocal(end),
        status: fStatus,
        title: fTitle.trim() || null,
        notes: fNotes.trim() || null,
        rrule: buildRrule(),
      };

      if (modalMode === "create") {
        const res = await fetch("/api/professional/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();

        if (!res.ok) {
          setError(extractDetail(text, res.status));
          return;
        }

        const created = text ? (JSON.parse(text) as AvailabilityEvent) : null;
        if (!created?.id) {
          setError("CREATE_SUCCEEDED_BUT_NO_ID");
          return;
        }

        setItems((prev) => [created, ...prev]);
        setInfo("Saved");
        closeModal();
        return;
      }

      if (!editingId) {
        setError("NO_EVENT_SELECTED");
        return;
      }

      const res = await fetch(`/api/professional/availability/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();

      if (!res.ok) {
        setError(extractDetail(text, res.status));
        return;
      }

      const updated = text ? (JSON.parse(text) as AvailabilityEvent) : null;
      if (updated?.id) {
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        await load();
      }

      setInfo("Updated");
      closeModal();
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_SAVE");
    } finally {
      setSaving(false);
    }
  };

  const deleteEditing = async () => {
    if (!editingId) return;

    const ok = confirm("Delete this event?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch(`/api/professional/availability/${editingId}`, { method: "DELETE" });

      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        setError(extractDetail(text, res.status));
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== editingId));
      setInfo("Deleted");
      closeModal();
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_DELETE");
    } finally {
      setSaving(false);
    }
  };

  const handleEventChange = async (change: EventChangeArg) => {
    const id = change.event.id;
    if (!id) return;

    setError(null);
    setInfo(null);

    const start = change.event.start;
    const end = change.event.end;

    if (!start || !end) {
      change.revert();
      return;
    }

    try {
      const payload = { start_at: toIsoLocal(start), end_at: toIsoLocal(end) };

      const res = await fetch(`/api/professional/availability/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        change.revert();
        setError(extractDetail(text, res.status));
        return;
      }

      const updated = text ? (JSON.parse(text) as AvailabilityEvent) : null;
      if (updated?.id) {
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        await load();
      }

      setInfo("Updated");
    } catch (e: any) {
      change.revert();
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_UPDATE");
    }
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const id = Number(clickInfo.event.id);
    if (!id || Number.isNaN(id)) return;

    const found = items.find((x) => x.id === id);
    if (!found) {
      await load();
      return;
    }

    openEditModal(found);
  };

  const busy = loading || saving;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Availability</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Select a time range to block it out. Drag/resize blocks to adjust. Click a block to edit or delete.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openCreateModal()}
            disabled={busy}
            className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
          >
            Add event
          </button>

          <button
            type="button"
            onClick={load}
            disabled={busy}
            className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading…
        </div>
      )}

      {!loading && info && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          {info}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!loading && (
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_40px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-200">Calendar</h2>
            {saving && <span className="text-xs text-neutral-400">Saving…</span>}
          </div>

          <div className="p-3 md:p-4">
            <div className="cp-calendar">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin, rrulePlugin]}
                initialView="dayGridMonth"
                height="auto"
                contentHeight="auto"
                expandRows
                editable
                selectable
                selectMirror
                dayMaxEvents
                nowIndicator
                firstDay={1}
                slotMinTime="05:00:00"
                slotMaxTime="23:00:00"
                allDaySlot={false}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                buttonText={{
                  today: "Today",
                  dayGridMonth: "Month",
                  timeGridWeek: "Week",
                  timeGridDay: "Day",
                }}
                events={events as any}
                select={createFromSelect}
                eventChange={handleEventChange}
                eventClick={handleEventClick}
              />
            </div>

            <style jsx>{`
              /* Base */
              .cp-calendar :global(.fc) {
                color: #e5e7eb;
                font-size: 12px;
              }

              /* Toolbar */
              .cp-calendar :global(.fc .fc-toolbar-title) {
                font-size: 14px;
                font-weight: 600;
                color: #f5f3ff;
              }
              .cp-calendar :global(.fc .fc-button) {
                border-radius: 12px;
                border: 1px solid rgba(147, 51, 234, 0.35);
                background: rgba(88, 28, 135, 0.25);
                color: #f5f3ff;
                padding: 8px 10px;
                font-size: 12px;
              }
              .cp-calendar :global(.fc .fc-button:hover) {
                border-color: rgba(168, 85, 247, 0.6);
                background: rgba(126, 34, 206, 0.28);
              }
              .cp-calendar :global(.fc .fc-button:disabled) {
                opacity: 0.55;
              }

              /* Grid borders + background */
              .cp-calendar :global(.fc-theme-standard .fc-scrollgrid) {
                border-color: rgba(38, 38, 38, 0.8);
                background: rgba(10, 10, 10, 0.25);
              }
              .cp-calendar :global(.fc-theme-standard td),
              .cp-calendar :global(.fc-theme-standard th) {
                border-color: rgba(38, 38, 38, 0.8);
              }

              /* Month view cells */
              .cp-calendar :global(.fc .fc-daygrid-day-frame) {
                background: rgba(0, 0, 0, 0.18);
              }
              .cp-calendar :global(.fc .fc-daygrid-day:hover .fc-daygrid-day-frame) {
                background: rgba(147, 51, 234, 0.08);
              }

              /* Day numbers */
              .cp-calendar :global(.fc .fc-daygrid-day-number) {
                color: #cbd5e1;
                font-weight: 600;
                padding: 8px;
              }

              /* Today highlight */
              .cp-calendar :global(.fc .fc-day-today) {
                background: rgba(147, 51, 234, 0.10) !important;
              }
              .cp-calendar :global(.fc .fc-day-today .fc-daygrid-day-number) {
                color: #f5f3ff;
              }

              /* Header row */
              .cp-calendar :global(.fc .fc-col-header-cell-cushion) {
                padding: 10px 8px;
                color: #a3a3a3;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                font-size: 10px;
              }

              /* TimeGrid */
              .cp-calendar :global(.fc .fc-timegrid-slot) {
                height: 38px;
              }
              .cp-calendar :global(.fc .fc-timegrid-axis-cushion) {
                color: #737373;
                font-size: 11px;
              }
              .cp-calendar :global(.fc .fc-timegrid-divider) {
                border-color: rgba(38, 38, 38, 0.8);
              }

              /* Events */
              .cp-calendar :global(.cp-event) {
                border-radius: 14px;
                border: 1px solid rgba(82, 82, 91, 0.6);
                padding: 6px 8px;
                cursor: pointer;
              }
              .cp-calendar :global(.cp-event-busy) {
                background: rgba(147, 51, 234, 0.35);
                border-color: rgba(168, 85, 247, 0.6);
              }
              .cp-calendar :global(.cp-event-available) {
                background: rgba(16, 185, 129, 0.18);
                border-color: rgba(16, 185, 129, 0.35);
              }

              /* Event text contrast */
              .cp-calendar :global(.fc .fc-event-title),
              .cp-calendar :global(.fc .fc-event-time) {
                color: #f5f3ff;
                font-weight: 600;
              }
              .cp-calendar :global(.fc .fc-event) {
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => {
              if (!saving) closeModal();
            }}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-950/95 shadow-[0_0_60px_rgba(0,0,0,0.75)]">
            <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {modalMode === "create" ? "Add event" : "Edit event"}
                </h3>
                <p className="mt-1 text-xs text-neutral-400">
                  {modalMode === "create" ? "Create a busy/available block." : "Modify or delete this block."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeModal()}
                disabled={saving}
                className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900 disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Start date">
                  <input
                    type="date"
                    value={fStartDate}
                    onChange={(e) => setFStartDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  />
                </Field>
                <Field label="Start time">
                  <input
                    type="time"
                    value={fStartTime}
                    onChange={(e) => setFStartTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  />
                </Field>
                <Field label="End date">
                  <input
                    type="date"
                    value={fEndDate}
                    onChange={(e) => setFEndDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  />
                </Field>
                <Field label="End time">
                  <input
                    type="time"
                    value={fEndTime}
                    onChange={(e) => setFEndTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Status">
                  <select
                    value={fStatus}
                    onChange={(e) => setFStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                  >
                    <option value="busy">Busy</option>
                    <option value="available">Available</option>
                  </select>
                </Field>

                <Field label="Title (optional)">
                  <input
                    value={fTitle}
                    onChange={(e) => setFTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="e.g. Blocked - Site work"
                  />
                </Field>
              </div>

              <Field label="Notes (optional)">
                <textarea
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. Day shift"
                />
              </Field>

              {/* Recurrence */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 space-y-3">
                <div className="text-xs font-medium text-neutral-300">Repeat</div>

                <select
                  value={repeatType}
                  onChange={(e) => {
                    const v = e.target.value as RepeatType;
                    setRepeatType(v);
                    if (v === "none") {
                      setRepeatInterval(1);
                      setRepeatUntil("");
                    } else if (repeatInterval < 1) {
                      setRepeatInterval(1);
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom (every X days)</option>
                </select>

                {repeatType !== "none" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Interval">
                      <input
                        type="number"
                        min={1}
                        value={repeatInterval}
                        onChange={(e) => setRepeatInterval(Math.max(1, Number(e.target.value || 1)))}
                        className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                      />
                    </Field>

                    <Field label="End date (optional)">
                      <input
                        type="date"
                        value={repeatUntil}
                        onChange={(e) => setRepeatUntil(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                      />
                    </Field>
                  </div>
                )}

                
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="text-xs text-neutral-500">{modalMode === "edit" ? `Event ID: ${editingId}` : null}</div>

                <div className="flex items-center gap-2">
                  {modalMode === "edit" && (
                    <button
                      type="button"
                      onClick={deleteEditing}
                      disabled={saving}
                      className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-2 text-xs font-medium text-red-100 hover:bg-red-950/45 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={saveModal}
                    disabled={saving}
                    className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : modalMode === "create" ? "Create" : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-neutral-300">{label}</div>
      {children}
    </div>
  );
}