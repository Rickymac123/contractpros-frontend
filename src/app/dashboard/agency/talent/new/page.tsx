"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const talentSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),

    profession: z.string().min(2, "Profession is required"),
    location: z.string().optional().or(z.literal("")).nullable(),
    postcode: z.string().min(2, "Postcode is required"),
    work_radius_miles: z.coerce.number().nonnegative("Work radius must be positive").nullable().optional(),

    ir35_preference: z.enum(["inside", "outside", "either"]).optional().nullable(),

    engineering_discipline: z
      .enum(["mechanical", "electrical", "multiskilled"])
      .optional()
      .nullable(),

    industry: z.enum(["food", "pharma", "fmcg", "manufacturing"]).optional().nullable(),

    rate_type: z.enum(["day", "hour"]).optional().nullable(),
    day_rate: z.coerce.number()
      .nonnegative("Day rate must be positive")
      .optional()
      .nullable(),
    hourly_rate: z.coerce.number()
      .nonnegative("Hourly rate must be positive")
      .optional()
      .nullable(),

    avatar_url: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
    bio: z.string().optional().or(z.literal("")).nullable(),
  })
  .superRefine((val, ctx) => {
    // If Engineering, require engineering_discipline
    if (val.profession?.toLowerCase() === "engineering" && !val.engineering_discipline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["engineering_discipline"],
        message: "Engineering discipline is required for Engineering profession",
      });
    }

    // Rate type rules
    if (val.rate_type === "day" && (val.day_rate == null || Number.isNaN(val.day_rate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["day_rate"],
        message: "Day rate is required when rate type is Day",
      });
    }
    if (val.rate_type === "hour" && (val.hourly_rate == null || Number.isNaN(val.hourly_rate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hourly_rate"],
        message: "Hourly rate is required when rate type is Hour",
      });
    }
  });

type TalentFormValues = z.infer<typeof talentSchema>;

export default function NewTalentPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof talentSchema>>({
    resolver: zodResolver(talentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      profession: "Engineering",
      location: "",
      postcode: "",
      work_radius_miles: 50,
      ir35_preference: "outside",
      engineering_discipline: "multiskilled",
      industry: "food",
      rate_type: "day",
      day_rate: 0,
      hourly_rate: null,
      avatar_url: "",
      bio: "",
    },
  });

  const profession = useWatch({ control, name: "profession" });
  const rateType = useWatch({ control, name: "rate_type" });

  const onSubmit = async (values: z.input<typeof talentSchema>) => {
    const payload = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      profession: values.profession,
      location: values.location?.trim() ? values.location.trim() : null,
      postcode: values.postcode.trim(),
      work_radius_miles: values.work_radius_miles ?? null,

      ir35_preference: values.ir35_preference ?? null,
      engineering_discipline:
        values.profession?.toLowerCase() === "engineering" ? values.engineering_discipline ?? null : null,
      industry: values.industry ?? null,

      rate_type: values.rate_type ?? null,
      day_rate: values.rate_type === "day" ? values.day_rate ?? null : null,
      hourly_rate: values.rate_type === "hour" ? values.hourly_rate ?? null : null,

      avatar_url: values.avatar_url?.trim() ? values.avatar_url.trim() : null,
      bio: values.bio?.trim() ? values.bio.trim() : null,
    };

    try {
      const res = await fetch("/api/agency/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        let detail: unknown = text;
        try {
          const parsed = text ? JSON.parse(text) : null;
          if (parsed && typeof parsed === "object" && "detail" in parsed) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            detail = (parsed as any).detail ?? detail;
          }
        } catch {}
        console.error("Create talent failed:", res.status, text);
        alert(typeof detail === "string" ? detail : "Failed to create talent");
        return;
      }

      router.push("/dashboard/agency/talent");
    } catch (err: any) {
      console.error("Create talent error:", err);
      alert(typeof err?.message === "string" ? err.message : "Failed to create talent");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Add talent</h1>
        <p className="mt-1 text-sm text-neutral-400">Create a new talent profile for this agency.</p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
        <div className="border-b border-neutral-800/80 bg-gradient-to-r from-purple-900/30 via-neutral-900 to-neutral-950 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300/80">Talent profile</p>
          <p className="mt-1 text-xs text-neutral-400">Add details carefully — agencies live and die by data quality.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* First name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                First name
              </label>
              <input
                type="text"
                {...register("first_name")}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
              {errors.first_name && <p className="text-xs text-red-300">{errors.first_name.message}</p>}
            </div>

            {/* Last name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Last name
              </label>
              <input
                type="text"
                {...register("last_name")}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
              {errors.last_name && <p className="text-xs text-red-300">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Profession */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Profession
              </label>
              <select
                {...register("profession")}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Quality">Quality</option>
                <option value="Technical">Technical</option>
                <option value="Manufacturing">Manufacturing</option>
              </select>
              {errors.profession && <p className="text-xs text-red-300">{errors.profession.message}</p>}
            </div>

            {/* Engineering discipline (conditional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Engineering discipline
              </label>
              <select
                {...register("engineering_discipline")}
                disabled={(profession || "").toLowerCase() !== "engineering"}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition disabled:opacity-60 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="multiskilled">Multiskilled</option>
                <option value="mechanical">Mechanical</option>
                <option value="electrical">Electrical</option>
              </select>
              {errors.engineering_discipline && (
                <p className="text-xs text-red-300">{errors.engineering_discipline.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Postcode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Postcode (base)
              </label>
              <input
                type="text"
                {...register("postcode")}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
              {errors.postcode && <p className="text-xs text-red-300">{errors.postcode.message}</p>}
            </div>

            {/* Work radius */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Work radius (miles)
              </label>
              <input
                type="number"
                step="1"
                {...register("work_radius_miles", { valueAsNumber: true })}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
              {errors.work_radius_miles && (
                <p className="text-xs text-red-300">{errors.work_radius_miles.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Location (optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Location (optional)
              </label>
              <input
                type="text"
                {...register("location")}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
              {errors.location && <p className="text-xs text-red-300">{errors.location.message}</p>}
            </div>

            {/* IR35 preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                IR35 preference
              </label>
              <select
                {...register("ir35_preference")}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="outside">Outside</option>
                <option value="inside">Inside</option>
                <option value="either">Either</option>
              </select>
              {errors.ir35_preference && (
                <p className="text-xs text-red-300">{errors.ir35_preference.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Industry */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Industry
              </label>
              <select
                {...register("industry")}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="food">Food</option>
                <option value="pharma">Pharma</option>
                <option value="fmcg">FMCG</option>
                <option value="manufacturing">Manufacturing</option>
              </select>
              {errors.industry && <p className="text-xs text-red-300">{errors.industry.message}</p>}
            </div>

            {/* Rate type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Rate type
              </label>
              <select
                {...register("rate_type")}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="day">Day rate</option>
                <option value="hour">Hourly rate</option>
              </select>
              {errors.rate_type && <p className="text-xs text-red-300">{errors.rate_type.message}</p>}
            </div>
          </div>

          {/* Rate value (conditional) */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Day rate (£)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={rateType !== "day"}
                {...register("day_rate", { valueAsNumber: true })}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition disabled:opacity-60 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
              {errors.day_rate && <p className="text-xs text-red-300">{errors.day_rate.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Hourly rate (£)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={rateType !== "hour"}
                {...register("hourly_rate", { valueAsNumber: true })}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition disabled:opacity-60 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
              {errors.hourly_rate && <p className="text-xs text-red-300">{errors.hourly_rate.message}</p>}
            </div>
          </div>

          {/* Avatar URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Avatar URL (optional)
            </label>
            <input
              type="text"
              placeholder="https://example.com/avatar.jpg"
              {...register("avatar_url")}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
            />
            {errors.avatar_url && <p className="text-xs text-red-300">{errors.avatar_url.message}</p>}
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Bio (optional)
            </label>
            <textarea
              rows={5}
              {...register("bio")}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
            />
            {errors.bio && <p className="text-xs text-red-300">{errors.bio.message}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/agency/talent")}
              className="rounded-xl border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 shadow-[0_0_25px_rgba(168,85,247,0.35)] transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "Save talent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}