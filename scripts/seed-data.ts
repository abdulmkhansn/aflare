export type ProjectStage = "idea" | "building" | "shipped" | "parked";
export type PostType = "update" | "shipped" | "learning" | "stuck" | "need_users" | "parked";

export type SeedPost = { type: PostType; body: string };

export type SeedBuilder = {
  fullName: string;
  emailLocal: string;
  displayName: string;
  bio: string;
  avatarIndex: number;
  project: {
    name: string;
    oneLiner: string;
    abstractDescription: string;
    stage: ProjectStage;
  };
  projectTags: string[];
  brings: string[];
  openTo: string[];
  posts: SeedPost[];
};

export type CreatedBuilder = {
  id: string;
  displayName: string;
  projectId: string;
  postIds: string[];
};

export type CreatedPost = {
  id: string;
  authorId: string;
  type: PostType;
};

export type CommentSpec = {
  postId: string;
  authorId: string;
  body: string;
};

export type MyProjectSpec = {
  name: string;
  oneLiner: string;
  abstractDescription: string;
  stage: ProjectStage;
  projectTags: string[];
  posts: SeedPost[];
};

export const SEED_BUILDERS: SeedBuilder[] = [
  {
    fullName: "Amara Okafor",
    emailLocal: "amara.okafor",
    displayName: "Amara Okafor",
    bio: "Former clinic ops lead. Building tools that cut admin work for small healthcare practices.",
    avatarIndex: 11,
    project: {
      name: "ChartRelay",
      oneLiner: "Handoff notes that actually reach the next clinician.",
      abstractDescription:
        "A lightweight referral and handoff layer for independent clinics. No EHR replacement.",
      stage: "building",
    },
    projectTags: ["healthcare", "backend"],
    brings: ["healthcare", "regulatory expertise"],
    openTo: ["co-founder", "feedback"],
    posts: [
      { type: "update", body: "Mapped our first three clinic workflows end to end. The fax step is still the worst part." },
      { type: "stuck", body: "HIPAA review is slower than the code. Need someone who has shipped in healthcare and knows what auditors actually ask for." },
      { type: "learning", body: "TIL some clinics still share patient packets over shared inboxes because the EHR export is worse than the risk." },
      { type: "update", body: "Pilot clinic agreed to a four-week trial if we handle read-only imports only. Keeping scope tight." },
    ],
  },
  {
    fullName: "Marcus Chen",
    emailLocal: "marcus.chen",
    displayName: "Marcus Chen",
    bio: "Ex-payments engineer. Working on clearer money movement for freelancers paid across borders.",
    avatarIndex: 22,
    project: {
      name: "LedgerLane",
      oneLiner: "One view of incoming client payments across Stripe, Wise, and bank feeds.",
      abstractDescription: "Read-only aggregation for solo operators who invoice in more than one currency.",
      stage: "shipped",
    },
    projectTags: ["fintech", "backend"],
    brings: ["backend", "fintech"],
    openTo: ["distribution", "feedback"],
    posts: [
      { type: "shipped", body: "Public beta is live. Connects Stripe and Wise today. Bank CSV import is manual but usable." },
      { type: "update", body: "First paying user this week. They wanted a CSV export for their accountant more than any chart." },
      { type: "need_users", body: "Looking for five freelancers who get paid in two or more currencies and will try the beta for two weeks." },
      { type: "learning", body: "TIL Wise webhooks are reliable but their sandbox docs lag production by a version." },
    ],
  },
  {
    fullName: "Priya Sharma",
    emailLocal: "priya.sharma",
    displayName: "Priya Sharma",
    bio: "Product designer who prefers working directly with founders on early UI, not slide decks.",
    avatarIndex: 5,
    project: {
      name: "FirstScreen",
      oneLiner: "A one-week design sprint for pre-seed teams with a real prototype at the end.",
      abstractDescription: "Fixed-scope sprint: audit, flows, clickable prototype, and a handoff doc builders can ship from.",
      stage: "shipped",
    },
    projectTags: ["design", "feedback"],
    brings: ["design", "frontend"],
    openTo: ["co-founder", "feedback"],
    posts: [
      { type: "shipped", body: "Finished sprint site and intake form. Booking opens next week for two slots per month." },
      { type: "update", body: "First sprint client wanted fewer screens, not more polish. Cut two flows and they shipped faster." },
      { type: "stuck", body: "Need a steady referral channel beyond my own network. Open to partnering with a dev shop that lacks design capacity." },
      { type: "learning", body: "TIL founders respond better to before/after flow maps than to high-fidelity mockups on day one." },
    ],
  },
  {
    fullName: "James Whitfield",
    emailLocal: "james.whitfield",
    displayName: "James Whitfield",
    bio: "Grew two niche newsletters to six-figure ARR. Testing playbooks for physical product launches.",
    avatarIndex: 33,
    project: {
      name: "ShelfPush",
      oneLiner: "Launch checklist and outreach CRM for small CPG brands.",
      abstractDescription: "Tracks retail targets, sample shipments, and follow-ups for founders doing their own distribution.",
      stage: "building",
    },
    projectTags: ["distribution", "feedback"],
    brings: ["distribution"],
    openTo: ["capital", "feedback"],
    posts: [
      { type: "update", body: "Built the outreach tracker. Still entering retail contacts by hand from public buyer lists." },
      { type: "stuck", body: "Retail buyer data is messy and expensive. Need intros to someone who has sold into regional grocers before." },
      { type: "update", body: "Two brand founders agreed to share their launch spreadsheets so I can match the fields they actually use." },
      { type: "need_users", body: "Looking for one CPG founder preparing a first retail pitch in the next 60 days to run the checklist with me." },
    ],
  },
  {
    fullName: "Elena Vasquez",
    emailLocal: "elena.vasquez",
    displayName: "Elena Vasquez",
    bio: "Compliance consultant for fintech startups in the EU. Writing down what founders miss before audit week.",
    avatarIndex: 47,
    project: {
      name: "AuditReady",
      oneLiner: "Plain-language control checklists for early fintech teams.",
      abstractDescription: "Not legal advice. Structured tasks that map common auditor questions to things a small team can actually do.",
      stage: "building",
    },
    projectTags: ["regulatory expertise", "fintech"],
    brings: ["regulatory expertise", "security review"],
    openTo: ["feedback", "co-founder"],
    posts: [
      { type: "update", body: "Drafted the first checklist for companies taking deposits in the EU. Still validating with two advisors." },
      { type: "stuck", body: "Need a backend engineer who has wired audit logs properly and can review my event retention section." },
      { type: "learning", body: "TIL most seed-stage teams confuse policy documents with controls that are actually tested." },
      { type: "update", body: "Shared a redacted sample with three founders. All three asked for the same section on vendor reviews." },
    ],
  },
  {
    fullName: "David Kim",
    emailLocal: "david.kim",
    displayName: "David Kim",
    bio: "Full-stack engineer between jobs. Building dev tools and open to co-founding something with distribution.",
    avatarIndex: 15,
    project: {
      name: "DiffGarden",
      oneLiner: "Visual diffs for config repos that non-engineers can approve.",
      abstractDescription: "Git-based review for YAML and JSON config with human-readable summaries.",
      stage: "idea",
    },
    projectTags: ["backend", "frontend"],
    brings: ["backend", "frontend"],
    openTo: ["co-founder", "distribution"],
    posts: [
      { type: "update", body: "Sketched the diff viewer. Testing on Terraform plans first because the audience complains loudly." },
      { type: "stuck", body: "Need a front-end partner who cares about dense admin UIs. I can ship the parser but the review flow needs work." },
      { type: "learning", body: "TIL most teams still approve infra changes in Slack threads with screenshots." },
    ],
  },
  {
    fullName: "Fatima Al-Rashid",
    emailLocal: "fatima.alrashid",
    displayName: "Fatima Al-Rashid",
    bio: "Angel investor and former CFO. Publishing how she evaluates pre-revenue SaaS without pretending certainty.",
    avatarIndex: 28,
    project: {
      name: "TermSheet Notes",
      oneLiner: "Public memos on how I pass or proceed on early SaaS deals.",
      abstractDescription: "Anonymous deal writeups with the actual questions I ask on a first call.",
      stage: "shipped",
    },
    projectTags: ["capital", "feedback"],
    brings: ["capital", "feedback"],
    openTo: ["fintech", "healthcare"],
    posts: [
      { type: "shipped", body: "Published the first twelve memos. Subscription is free for now while I figure out cadence." },
      { type: "update", body: "Founders keep asking for my checklist on cohort retention slides. Added a template this week." },
      { type: "need_users", body: "Looking for three B2B founders raising a small pre-seed who will let me publish a redacted version of my notes." },
      { type: "learning", body: "TIL the best first calls end with one clear experiment, not a product tour." },
    ],
  },
  {
    fullName: "Tomoko Sato",
    emailLocal: "tomoko.sato",
    displayName: "Tomoko Sato",
    bio: "Frontend engineer focused on performance and accessibility on marketing sites that still need to convert.",
    avatarIndex: 9,
    project: {
      name: "Lighthouse Lane",
      oneLiner: "Weekly performance and a11y reports for marketing sites on Webflow and Framer.",
      abstractDescription: "Automated checks plus a short human note on what to fix first.",
      stage: "building",
    },
    projectTags: ["frontend", "design"],
    brings: ["frontend"],
    openTo: ["distribution", "feedback"],
    posts: [
      { type: "update", body: "Crawler works on Framer sites now. Webflow still needs custom handling for their asset URLs." },
      { type: "stuck", body: "Need help pricing this. Teams want reports but hesitate on another subscription." },
      { type: "shipped", body: "Sent the first batch of reports to four beta sites. Two fixed their LCP before the second report." },
    ],
  },
  {
    fullName: "Rafael Mendes",
    emailLocal: "rafael.mendes",
    displayName: "Rafael Mendes",
    bio: "Security reviewer for startups that cannot afford a full-time AppSec hire yet.",
    avatarIndex: 52,
    project: {
      name: "ScopeReview",
      oneLiner: "Fixed-price security review for seed-stage web apps.",
      abstractDescription: "One-week engagement: threat model, dependency check, and a prioritized fix list.",
      stage: "shipped",
    },
    projectTags: ["security review", "backend"],
    brings: ["security review"],
    openTo: ["fintech", "healthcare"],
    posts: [
      { type: "shipped", body: "Booking page is live. First three slots filled from founder referrals." },
      { type: "update", body: "Most common finding this month: session cookies missing Secure on staging domains that mirror prod." },
      { type: "need_users", body: "Looking for one team shipping a B2B beta in the next month who wants a review at cost in exchange for a public case study." },
      { type: "learning", body: "TIL founders fix faster when you show the exploit path in plain language, not CVSS scores alone." },
    ],
  },
  {
    fullName: "Sophie Laurent",
    emailLocal: "sophie.laurent",
    displayName: "Sophie Laurent",
    bio: "Community operator who has run feedback programs for hardware and software betas.",
    avatarIndex: 38,
    project: {
      name: "BetaHost",
      oneLiner: "Structured beta cohorts with templates for intake, updates, and exit surveys.",
      abstractDescription: "A lightweight hub for founders running their first twenty-user beta without a custom Notion maze.",
      stage: "building",
    },
    projectTags: ["feedback", "distribution"],
    brings: ["feedback", "design"],
    openTo: ["co-founder", "backend"],
    posts: [
      { type: "update", body: "Cohort template is done. Working on email reminders that do not feel like spam." },
      { type: "stuck", body: "Need a backend co-builder for auth and billing. I can run programs and write copy, not Postgres." },
      { type: "update", body: "Ran a manual cohort for another founder's app. Three of their bugs came from users I recruited." },
      { type: "learning", body: "TIL beta users stay longer when you tell them exactly how many messages to expect per week." },
    ],
  },
  {
    fullName: "Omar Hassan",
    emailLocal: "omar.hassan",
    displayName: "Omar Hassan",
    bio: "Payments product manager building clearer remittance status for diaspora families.",
    avatarIndex: 19,
    project: {
      name: "TransferTrail",
      oneLiner: "Track international transfers across apps your family actually uses.",
      abstractDescription: "Read-only status view when money leaves one app and lands in another days later.",
      stage: "building",
    },
    projectTags: ["fintech", "frontend"],
    brings: ["fintech", "distribution"],
    openTo: ["backend", "regulatory expertise"],
    posts: [
      { type: "update", body: "Connected two providers in sandbox. Real user testing blocked on compliance signoff." },
      { type: "stuck", body: "Regulatory wording for the landing page is holding up the waitlist. Need someone who has shipped consumer fintech in the UK." },
      { type: "need_users", body: "Looking for ten people who send money abroad monthly and will walk through screenshots without a live account." },
    ],
  },
  {
    fullName: "Nina Kowalski",
    emailLocal: "nina.kowalski",
    displayName: "Nina Kowalski",
    bio: "Clinical researcher turned founder. Building consent workflows that patients can actually read.",
    avatarIndex: 44,
    project: {
      name: "PlainConsent",
      oneLiner: "Readable consent flows for clinical studies under 500 participants.",
      abstractDescription: "Plain-language templates plus audit trail. Built for small research teams, not hospital IT.",
      stage: "idea",
    },
    projectTags: ["healthcare", "regulatory expertise"],
    brings: ["healthcare", "regulatory expertise"],
    openTo: ["backend", "capital"],
    posts: [
      { type: "update", body: "Interviewed six study coordinators. All of them keep a personal spreadsheet of who signed what." },
      { type: "stuck", body: "Need a backend engineer who can implement immutable audit logs without overbuilding for enterprise." },
      { type: "learning", body: "TIL patients sign faster when the summary fits on one phone screen, even if the legal doc is longer." },
    ],
  },
  {
    fullName: "Caleb Brooks",
    emailLocal: "caleb.brooks",
    displayName: "Caleb Brooks",
    bio: "Field sales rep testing tools for brands that sell through independent retailers.",
    avatarIndex: 60,
    project: {
      name: "RouteBox",
      oneLiner: "Visit notes and re-order prompts for reps covering independent stores.",
      abstractDescription: "Mobile-first logbook that exports to whatever spreadsheet the brand already uses.",
      stage: "parked",
    },
    projectTags: ["distribution", "backend"],
    brings: ["distribution"],
    openTo: ["co-founder", "capital"],
    posts: [
      { type: "update", body: "Built the visit log MVP. Reps liked it but brands wanted Salesforce integration before pilot." },
      { type: "parked", body: "Pausing after two pilots stalled on integration asks we cannot fund yet. Keeping the codebase in case a brand sponsors a narrow rollout." },
      { type: "learning", body: "TIL independent reps will use a simple tool, but the brand buyer still drives the purchase." },
    ],
  },
  {
    fullName: "Yuki Tanaka",
    emailLocal: "yuki.tanaka",
    displayName: "Yuki Tanaka",
    bio: "Engineer and writer. Exploring tools that help small teams document decisions without another wiki.",
    avatarIndex: 3,
    project: {
      name: "DecisionLog",
      oneLiner: "A short log of why you chose X over Y, attached to the repo.",
      abstractDescription: "Markdown files with a consistent template, rendered in the app and searchable by tag.",
      stage: "building",
    },
    projectTags: ["backend", "frontend"],
    brings: ["backend", "feedback"],
    openTo: ["co-founder", "design"],
    posts: [
      { type: "update", body: "CLI scaffolds a decision file and links it from the README. App view is still rough." },
      { type: "stuck", body: "Need design help making the timeline view scannable. Right now it reads like a file list." },
      { type: "shipped", body: "Open sourced the template after our team used it for three architecture calls." },
      { type: "learning", body: "TIL teams write better decisions when the template asks for rejected options, not only the winner." },
    ],
  },
];

export const MY_PROJECTS: MyProjectSpec[] = [
  {
    name: "SnovAI",
    oneLiner: "A ServiceNow intelligence platform that lives as a Chrome sidebar.",
    abstractDescription:
      "Connects to your ServiceNow instance as a read-only account and gives intelligence on top of it.",
    stage: "shipped",
    projectTags: ["backend", "fintech"],
    posts: [
      { type: "shipped", body: "Launched about a month ago at snovai.io. Chrome extension sidebar that connects read-only to your ServiceNow instance." },
      { type: "update", body: "In distribution now. Reaching out directly to 1,000+ LinkedIn connections. Early traction: 25+ trial users and 7 paid conversions at $149/month." },
      { type: "need_users", body: "Openly looking for a partner or investor to help with resourcing and getting this in front of more ServiceNow teams. Not a pitch deck conversation. I want someone who knows enterprise buyers." },
    ],
  },
  {
    name: "Kindling",
    oneLiner: "A place for people building in the open to keep a public build log and find help.",
    abstractDescription:
      "Social-graph plus feed app on Next.js and Supabase, with verification that proves you build without exposing code.",
    stage: "building",
    projectTags: ["frontend", "backend", "co-founder"],
    posts: [
      { type: "shipped", body: "Auth is done with three login providers. Login stays separate from verification on purpose." },
      { type: "stuck", body: "Working through the feed so it is never empty for a brand-new user. Balancing tag match, follows, and a fallback that still feels intentional." },
      { type: "learning", body: "TIL reputation here is trigger-driven. Helpful marks insert rows and the database updates helpful_count and reputation_score. The app never computes it." },
    ],
  },
  {
    name: "AI Tool Navigator",
    oneLiner: "A browser sidebar that started as quick-launch between ChatGPT, Claude, and Copilot and grew toward a per-task AI routing hub.",
    abstractDescription: "Routes you to the right AI tool per task with token estimation, and explored capturing context across tools.",
    stage: "parked",
    projectTags: ["frontend", "design"],
    posts: [
      { type: "update", body: "Early version was quick switching between AI tools from a sidebar. Useful, but not enough to keep people opening it daily." },
      { type: "stuck", body: "Hit a wall reading browser-level data from Claude and ChatGPT inside an extension. Every approach felt brittle or out of policy." },
      { type: "parked", body: "Considered a bring-your-own-API-key path to pull context from git commits and planning tools, but that sat outside my depth. Parking it for now." },
      { type: "learning", body: "TIL the tab-switcher context memory idea is still worth keeping. It could apply outside AI tools if I revisit this later." },
    ],
  },
  {
    name: "Influencer-brand collab platform",
    oneLiner: "Connecting brands that need influencers with influencers.",
    abstractDescription: "Two-sided marketplace idea for sponsored content matchmaking.",
    stage: "parked",
    projectTags: ["distribution", "capital"],
    posts: [
      { type: "stuck", body: "Market looks crowded. Found several platforms doing nearly the same matching workflow." },
      { type: "parked", body: "Parking it until I find a niche that is not just another generic marketplace. Open question is whether a vertical focus is enough." },
    ],
  },
];
