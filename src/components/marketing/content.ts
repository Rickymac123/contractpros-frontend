export const audiences = {
 companies: {
  role: 'company', name: 'Companies', video: 'company', eyebrow: 'People / Projects / Progress',
  headline: 'Find your next professional.', strap: 'A wider network. A clearer decision.',
  intro: 'Bring your next project to a wider market of contract professionals. See the skills, qualifications and availability behind a profile, then keep bookings and weekly timesheets together.',
  tags: ['Search professionals', 'Transparent profiles', 'Timesheet approval'],
  summary: ['Find the expertise', 'Review the evidence', 'Keep the work moving'],
  features: [
   ['Reach beyond your usual network', 'Put your opportunities in front of independent professionals and agencies. Give your business a profile and show candidates who they could be working with.'],
   ['Turn requirements into a useful shortlist', 'Search against your job’s profession, discipline, skills and qualifications. Refine results by experience, industry, rate and IR35 preference. Recorded availability helps exclude conflicting bookings.'],
   ['See the person behind the profile', 'Review experience, rates, CVs, qualifications and reviews in one place. Verification labels distinguish checked evidence from information that has not been verified.'],
   ['Discuss the right working area', 'See a professional’s preferred work radius and location alongside their profile. Confirm travel arrangements before agreeing the booking.'],
   ['Keep booking decisions connected', 'Review applications, send booking requests and track responses. The job, business and professional stay connected throughout the process.'],
   ['Approve the work, week by week', 'Review submitted timesheets in a clear weekly table. Request corrections with a reason or approve the recorded hours, retaining the history alongside the booking.'],
   ['Keep IR35 guidance with the engagement', 'Record working-practice answers against each booking and attach an HMRC CEST result privately. Guidance and revision history support your review; they do not issue a formal tax determination.'],
   ['Build a record of completed work', 'Leave a review after a completed ContractPros booking to help other businesses assess future engagements.']
  ],
  steps: ['Create your business profile', 'Post a job and review professionals', 'Agree a booking and approve weekly timesheets'],
  cta: 'Create your company account',
 },
 professionals: {
  role: 'professional', name: 'Professionals', video: 'professional', eyebrow: 'Expertise / Availability / Opportunity',
  headline: 'Your expertise. A wider opportunity.', strap: 'Be seen for what you bring.',
  intro: 'Open another route to your next contract. Put your experience in front of more UK businesses, show when and where you want to work, and manage the engagement through to weekly timesheets.',
  tags: ['Professional profile', 'Availability calendar', 'Weekly timesheets'],
  summary: ['Show your expertise', 'Set your availability', 'Find your next opportunity'],
  features: [
   ['Take your experience to a wider market', 'Explore opportunities beyond your existing contacts. A complete profile gives businesses a clearer view of your skills, sector experience and preferred type of work.'],
   ['Build a profile with substance', 'Bring your CV, skills, qualifications, rates and experience together. A profile-completeness indicator helps you see what still needs attention.'],
   ['Make availability visible', 'Keep your calendar up to date so companies can see your recorded availability. Accepted bookings remain connected to the calendar, helping avoid conflicting work.'],
   ['Show where you want to work', 'Set your base postcode and preferred work radius in miles. Make your travel preferences visible before discussing a role.'],
   ['Let evidence support your reputation', 'Display qualifications and reviews with clear verification status. You can collect up to two external reviews; reviews from completed ContractPros bookings remain separate.'],
   ['Choose the opportunities that fit', 'Browse jobs, submit applications and review booking requests. See the business behind a job and decide whether the engagement suits you.'],
   ['Spend less time chasing timesheets', 'Record work in a weekly table, submit it for approval and respond to correction requests. Keep the submitted and approved work attached to its booking.'],
   ['Keep engagement evidence together', 'Use booking-linked IR35 guidance and private CEST attachments to support discussions about working arrangements. It is guidance only, not a formal status decision.']
  ],
  steps: ['Build your professional profile', 'Add availability and working preferences', 'Apply, accept suitable work and submit timesheets'],
  cta: 'Create your professional profile',
 },
 agencies: {
  role: 'agency', name: 'Agencies', video: 'agency', eyebrow: 'Talent / Reach / Relationships',
  headline: 'Your people. A wider client network.', strap: 'Another route to your next client.',
  intro: 'Introduce your represented professionals to more UK businesses. Present their expertise clearly, put suitable people forward and keep applications, bookings and timesheets in one workspace.',
  tags: ['Talent roster', 'Client opportunities', 'Connected bookings'],
  summary: ['Present your people', 'Reach more businesses', 'Manage the next step'],
  features: [
   ['Extend your reach', 'Explore opportunities beyond your existing client network. ContractPros gives your agency another channel for introducing suitable professionals to businesses with contract requirements.'],
   ['Keep your roster ready', 'Create and maintain profiles for the professionals you represent. Record your authority to represent them and that they have received the privacy notice.'],
   ['Present expertise clearly', 'Bring together skills, sector experience, qualifications, CVs, rates and working preferences, with clear verification labels rather than blanket claims of verification.'],
   ['Put suitable people forward', 'Explore jobs and submit applications for your represented professionals. Keep track of each application and the business behind the opportunity.'],
   ['Keep working preferences visible', 'Record each professional’s location and preferred work radius. Review the job’s dates and travel requirements before proposing a booking.'],
   ['Manage booking responses', 'Review the details of incoming requests and manage the response from your agency workspace. Keep the professional, client and engagement connected.'],
   ['Keep timesheets connected to the work', 'Submit weekly work records for represented professionals, respond to corrections and track client approval without losing the booking context.'],
   ['Retain engagement guidance and evidence', 'Record booking-linked IR35 guidance and attach CEST PDFs privately. Revision history keeps earlier answers available; the tool does not replace a formal status determination.']
  ],
  steps: ['Set up your agency account', 'Add represented professionals and explore jobs', 'Manage applications, bookings and weekly timesheets'],
  cta: 'Create your agency account',
 }
} as const;
export type Audience = keyof typeof audiences;
