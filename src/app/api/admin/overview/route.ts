import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

/**
 * Admin overview proxy + aggregation.
 *
 * Adds breakdowns:
 * - users_active / users_archived
 * - companies_active / companies_archived
 * - agencies_active / agencies_archived
 * - jobs_active / jobs_archived
 * - talent_active / talent_archived (best-effort depending on model fields)
 */
export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const headers = {
      Cookie: session,
      Accept: "application/json",
    };

    const [usersRes, talentRes, jobsRes, bookingsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/admin/users`, { headers, cache: "no-store" }),
      fetch(`${API_BASE_URL}/admin/talent`, { headers, cache: "no-store" }),
      fetch(`${API_BASE_URL}/admin/jobs`, { headers, cache: "no-store" }),
      fetch(`${API_BASE_URL}/admin/bookings`, { headers, cache: "no-store" }),
    ]);

    if (
      usersRes.status === 401 ||
      talentRes.status === 401 ||
      jobsRes.status === 401 ||
      bookingsRes.status === 401
    ) {
      return NextResponse.json({ detail: "NOT_AUTHORIZED" }, { status: 401 });
    }

    const allOk = usersRes.ok && talentRes.ok && jobsRes.ok && bookingsRes.ok;
    if (!allOk) {
      const pieces: string[] = [];

      const collect = async (label: string, res: Response) => {
        const text = await res.text().catch(() => "");
        pieces.push(
          `${label}:${res.status}:${text.slice(0, 200).replace(/\s+/g, " ")}`,
        );
      };

      await Promise.all([
        collect("users", usersRes),
        collect("talent", talentRes),
        collect("jobs", jobsRes),
        collect("bookings", bookingsRes),
      ]);

      return NextResponse.json(
        { detail: `ADMIN_OVERVIEW_UPSTREAM_ERROR: ${pieces.join(" | ")}` },
        { status: 500 },
      );
    }

    const [usersJson, talentJson, jobsJson, bookingsJson] = await Promise.all([
      usersRes.json(),
      talentRes.json(),
      jobsRes.json(),
      bookingsRes.json(),
    ]);

    const users = Array.isArray(usersJson) ? usersJson : [];
    const talent = Array.isArray(talentJson) ? talentJson : [];
    const jobs = Array.isArray(jobsJson) ? jobsJson : [];
    const bookings = Array.isArray(bookingsJson) ? bookingsJson : [];

    const total_users = users.length;
    const total_talent = talent.length;
    const total_jobs = jobs.length;
    const total_bookings = bookings.length;

    // USERS: archived == is_active === false
    const users_active = users.filter((u: any) => (u?.is_active ?? true) === true).length;
    const users_archived = users.filter((u: any) => (u?.is_active ?? true) === false).length;

    // COMPANIES / AGENCIES also use is_active
    const companies = users.filter((u: any) => u?.role === "company");
    const agencies = users.filter((u: any) => u?.role === "agency");

    const total_companies = companies.length;
    const total_agencies = agencies.length;

    const companies_active = companies.filter((u: any) => (u?.is_active ?? true) === true).length;
    const companies_archived = companies.filter((u: any) => (u?.is_active ?? true) === false).length;

    const agencies_active = agencies.filter((u: any) => (u?.is_active ?? true) === true).length;
    const agencies_archived = agencies.filter((u: any) => (u?.is_active ?? true) === false).length;

    // JOBS: archived == is_archived === true
    const jobs_archived = jobs.filter((j: any) => (j?.is_archived ?? false) === true).length;
    const jobs_active = jobs.filter((j: any) => (j?.is_archived ?? false) === false).length;

    /**
     * TALENT: best-effort.
     * If your Talent model has is_archived, use it.
     * Else if it has is_active, use inverse of is_active as "archived".
     * Else: treat all as active.
     */
    const talent_archived = talent.filter((t: any) => {
      if (typeof t?.is_archived === "boolean") return t.is_archived === true;
      if (typeof t?.is_active === "boolean") return t.is_active === false;
      return false;
    }).length;
    const talent_active = total_talent - talent_archived;

    return NextResponse.json(
      {
        total_users,
        users_active,
        users_archived,

        total_companies,
        companies_active,
        companies_archived,

        total_agencies,
        agencies_active,
        agencies_archived,

        total_talent,
        talent_active,
        talent_archived,

        total_jobs,
        jobs_active,
        jobs_archived,

        total_bookings,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const msg = typeof error?.message === "string" ? error.message : String(error);
    return NextResponse.json(
      { detail: `INTERNAL_ADMIN_OVERVIEW_ERROR: ${msg}` },
      { status: 500 },
    );
  }
}