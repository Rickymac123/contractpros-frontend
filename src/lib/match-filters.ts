export type SearchableMatch = {
  score: number;
  talent_name?: string | null; talent_profession?: string | null;
  talent_skills?: string | null; talent_bio?: string | null;
  talent_location?: string | null; talent_postcode?: string | null;
  talent_industry?: string | null; talent_experience_level?: string | null;
  talent_ir35_preference?: string | null; talent_rate_type?: string | null;
  talent_day_rate?: number | null; talent_hourly_rate?: number | null;
  talent_cv_url?: string | null;
};
export type MatchFilters = { query: string; location: string; industry: string; experience: string; ir35: string; rateType: string; maxRate: string; minScore: string; cvOnly: boolean };
export const emptyMatchFilters: MatchFilters = {query:'',location:'',industry:'',experience:'',ir35:'',rateType:'day',maxRate:'',minScore:'0',cvOnly:false};
const norm = (value: unknown) => String(value ?? '').trim().toLowerCase();
const ranks: Record<string, number> = {'junior':1,'mid-level':2,'senior':3,'lead':4,'manager':5};
export function filterMatches<T extends SearchableMatch>(items: T[], filters: MatchFilters): T[] {
 return items.filter(item => {
  const query = norm(filters.query).split(/\s+/).filter(Boolean);
  const searchable = norm([item.talent_name,item.talent_profession,item.talent_skills,item.talent_bio,item.talent_location,item.talent_postcode].join(' '));
  if (!query.every(word => searchable.includes(word))) return false;
  if (norm(filters.location) && !norm([item.talent_location,item.talent_postcode].join(' ')).includes(norm(filters.location))) return false;
  if (filters.industry && norm(item.talent_industry) !== norm(filters.industry)) return false;
  if (filters.experience && (ranks[norm(item.talent_experience_level)] ?? 0) < ranks[filters.experience]) return false;
  if (filters.ir35 && ![filters.ir35,'either'].includes(norm(item.talent_ir35_preference))) return false;
  if (filters.cvOnly && !item.talent_cv_url) return false;
  if (item.score < Number(filters.minScore || 0)) return false;
  if (filters.maxRate.trim()) {
   const max = Number(filters.maxRate);
   const rate = filters.rateType === 'hour' ? item.talent_hourly_rate : item.talent_day_rate;
   if (!Number.isFinite(max) || max < 0 || rate == null || !Number.isFinite(rate) || rate > max) return false;
   if (item.talent_rate_type && norm(item.talent_rate_type) !== filters.rateType) return false;
  }
  return true;
 }).sort((a,b) => b.score-a.score || norm(a.talent_name).localeCompare(norm(b.talent_name)));
}
