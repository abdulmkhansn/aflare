import type { PostStructuredFields } from "../lib/posts/structured-fields";
import type { MilestoneType } from "../lib/milestones/types";
import type { PostReactionType } from "../lib/reactions/types";

import { SEED_PLACEHOLDER_IMAGES } from "./seed-avatars";

export type ProjectStage = "idea" | "building" | "shipped" | "parked";
export type PostType = "update" | "shipped" | "learning" | "stuck" | "need_users" | "parked";
export type FlareStatus = "open" | "being_helped" | "resolved";

export type SeedBuildPost = {
  type: PostType;
  body: string;
  structuredFields?: PostStructuredFields | null;
};

export type SeedProject = {
  name: string;
  oneLiner: string;
  abstractDescription: string;
  stage: ProjectStage;
  projectTags: string[];
  posts: SeedBuildPost[];
};

export type SeedSharePost = {
  body: string;
  structuredFields?: PostStructuredFields | null;
};

export type SeedBuilder = {
  fullName: string;
  emailLocal: string;
  displayName: string;
  bio: string;
  brings: string[];
  openTo: string[];
  projects: SeedProject[];
  sharePosts: SeedSharePost[];
};

export type SeedArticle = {
  authorIndex: number;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl?: string | null;
};

export type SeedFlareComment = {
  authorIndex: number;
  body: string;
  markHelpfulByAuthor?: boolean;
};

export type SeedFlare = {
  authorIndex: number;
  title?: string;
  body: string;
  status: FlareStatus;
  tags: string[];
  tried?: string | null;
  ruledOut?: string | null;
  currentStatus?: string | null;
  resolutionNote?: string | null;
  structuredFields?: PostStructuredFields | null;
  helperIndices?: number[];
  comments?: SeedFlareComment[];
};

export type SeedConversation = {
  participantA: number;
  participantB: number;
  messages: { senderIndex: number; body: string }[];
};

export type SeedMilestone = {
  userIndex: number;
  milestone: MilestoneType;
  celebrated?: boolean;
};

export type MyProjectSpec = {
  name: string;
  oneLiner: string;
  abstractDescription: string;
  stage: ProjectStage;
  projectTags: string[];
  posts: SeedBuildPost[];
};

export const SEED_EMAIL_DOMAIN = "demo.kindling.local";

export const SEED_BUILDERS: SeedBuilder[] = [
  {
    fullName: "Amara Okafor",
    emailLocal: "amara.okafor",
    displayName: "Amara Okafor",
    bio: "Former clinic ops lead, first time shipping software. Building handoff tools for small practices — learning in public and not pretending I know every acronym yet.",
    brings: ["healthcare", "regulatory expertise"],
    openTo: ["co-founder", "feedback"],
    projects: [
      {
        name: "ChartRelay",
        oneLiner: "Handoff notes that actually reach the next clinician.",
        abstractDescription:
          "A lightweight referral layer for independent clinics. Not an EHR replacement — just the packet that falls through the cracks today.",
        stage: "building",
        projectTags: ["healthcare", "backend"],
        posts: [
          {
            type: "update",
            body: "Mapped our first three clinic workflows end to end. The fax step is still the worst part — and yes, fax is still real in 2026.",
          },
          {
            type: "stuck",
            body: "HIPAA review is slower than the code. Need someone who has shipped in healthcare and knows what auditors actually ask for, not what the checklist template says.",
          },
          {
            type: "learning",
            body: "TIL some clinics still share patient packets over shared inboxes because the EHR export is worse than the risk. That explains a lot.",
          },
          {
            type: "shipped",
            body: "Read-only import path works for one pilot clinic. Four-week trial starts Monday if nothing catches fire over the weekend.",
            structuredFields: { image_url: SEED_PLACEHOLDER_IMAGES.dashboard },
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Hot take: most 'healthcare AI' pitches would be solved faster with a better PDF export. I say this as someone building healthcare AI.",
      },
    ],
  },
  {
    fullName: "Marcus Chen",
    emailLocal: "marcus.chen",
    displayName: "Marcus Chen",
    bio: "Ex-payments engineer, third product. I know how to ship — still learning how to explain money movement to humans who aren't engineers.",
    brings: ["backend", "fintech"],
    openTo: ["distribution", "feedback"],
    projects: [
      {
        name: "LedgerLane",
        oneLiner: "One view of incoming client payments across Stripe, Wise, and bank feeds.",
        abstractDescription: "Read-only aggregation for solo operators who invoice in more than one currency.",
        stage: "shipped",
        projectTags: ["fintech", "backend"],
        posts: [
          {
            type: "shipped",
            body: "Public beta is live. Connects Stripe and Wise today. Bank CSV import is manual but usable — accountants asked for CSV before charts, every time.",
          },
          {
            type: "update",
            body: "First paying user this week. They wanted a CSV export for their accountant more than any dashboard widget. Noted.",
          },
          {
            type: "need_users",
            body: "Looking for five freelancers paid in two or more currencies who will try the beta for two weeks and tell me what's confusing.",
          },
          {
            type: "learning",
            body: "TIL Wise webhooks are reliable but their sandbox docs lag production by a version. Lost an afternoon to that.",
          },
        ],
      },
      {
        name: "RateWatch",
        oneLiner: "FX spread alerts for small agencies billing internationally.",
        abstractDescription: "Slack ping when your effective rate moves enough to matter on a fixed bid.",
        stage: "idea",
        projectTags: ["fintech", "backend"],
        posts: [
          {
            type: "update",
            body: "Sketched the alert thresholds with two agency owners. Both care about EUR/USD only. Good — scope stays small.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Win: a user exported their first month of payouts without opening Excel once. Small thing, but I'll take it.",
        structuredFields: {
          link_url: "https://stripe.com/docs/connect",
          link_label: "Stripe Connect docs — still the bible",
        },
      },
    ],
  },
  {
    fullName: "Priya Sharma",
    emailLocal: "priya.sharma",
    displayName: "Priya Sharma",
    bio: "Product designer who prefers working directly with founders on early UI. I translate messy ideas into something a builder can ship without a 40-page spec.",
    brings: ["design", "frontend"],
    openTo: ["co-founder", "feedback"],
    projects: [
      {
        name: "FirstScreen",
        oneLiner: "A one-week design sprint for pre-seed teams with a real prototype at the end.",
        abstractDescription: "Fixed scope: audit, flows, clickable prototype, handoff doc. No slide decks masquerading as deliverables.",
        stage: "shipped",
        projectTags: ["design", "feedback"],
        posts: [
          {
            type: "shipped",
            body: "Sprint site and intake form are live. Two slots per month — keeping it small so quality doesn't slip.",
          },
          {
            type: "update",
            body: "First sprint client wanted fewer screens, not more polish. Cut two flows and they shipped two weeks faster. Lesson learned.",
          },
          {
            type: "stuck",
            body: "Need a steady referral channel beyond my own network. Open to partnering with a dev shop that lacks design capacity.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "TIL founders respond better to before/after flow maps than to high-fidelity mockups on day one. Counterintuitive if you love pixels like I do.",
        structuredFields: { image_url: SEED_PLACEHOLDER_IMAGES.wireframe },
      },
      {
        body: "Question for builders: what's the smallest UI decision that blocked you last week? Trying to collect real examples for a post.",
      },
    ],
  },
  {
    fullName: "James Whitfield",
    emailLocal: "james.whitfield",
    displayName: "James Whitfield",
    bio: "Grew two niche newsletters to six-figure ARR. Now testing playbooks for physical product launches — same hustle, different spreadsheet.",
    brings: ["distribution"],
    openTo: ["capital", "feedback"],
    projects: [
      {
        name: "ShelfPush",
        oneLiner: "Launch checklist and outreach CRM for small CPG brands.",
        abstractDescription: "Tracks retail targets, sample shipments, and follow-ups for founders doing their own distribution.",
        stage: "building",
        projectTags: ["distribution", "feedback"],
        posts: [
          {
            type: "update",
            body: "Built the outreach tracker. Still entering retail contacts by hand from public buyer lists — automation comes after I understand the messy middle.",
          },
          {
            type: "stuck",
            body: "Retail buyer data is messy and expensive. Need intros to someone who has sold into regional grocers before, not a data vendor pitch.",
          },
          {
            type: "need_users",
            body: "Looking for one CPG founder preparing a first retail pitch in the next 60 days to run the checklist with me. I'll work for feedback.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Frustration of the week: three 'partnership' emails that were just affiliate pitches in a trench coat. Filtering is a full-time job.",
      },
    ],
  },
  {
    fullName: "Elena Vasquez",
    emailLocal: "elena.vasquez",
    displayName: "Elena Vasquez",
    bio: "Compliance consultant for EU fintech startups. I write down what founders miss before audit week — plain language, no scare tactics.",
    brings: ["regulatory expertise", "security review"],
    openTo: ["feedback", "co-founder"],
    projects: [
      {
        name: "AuditReady",
        oneLiner: "Plain-language control checklists for early fintech teams.",
        abstractDescription: "Not legal advice. Tasks that map common auditor questions to things a ten-person team can actually do.",
        stage: "building",
        projectTags: ["regulatory expertise", "fintech"],
        posts: [
          {
            type: "update",
            body: "Drafted the first checklist for companies taking deposits in the EU. Still validating with two advisors who've seen real audits.",
          },
          {
            type: "stuck",
            body: "Need a backend engineer who has wired audit logs properly and can review my event retention section. Happy to trade compliance review for code review.",
          },
          {
            type: "learning",
            body: "TIL most seed-stage teams confuse policy documents with controls that are actually tested. The gap is always logging.",
          },
        ],
      },
    ],
    sharePosts: [],
  },
  {
    fullName: "David Kim",
    emailLocal: "david.kim",
    displayName: "David Kim",
    bio: "Full-stack engineer between jobs. Building dev tools and open to co-founding something with distribution — tired of pretty repos with zero users.",
    brings: ["backend", "frontend"],
    openTo: ["co-founder", "distribution"],
    projects: [
      {
        name: "DiffGarden",
        oneLiner: "Visual diffs for config repos that non-engineers can approve.",
        abstractDescription: "Git-based review for YAML and JSON with human-readable summaries. Terraform first because that audience complains loudly.",
        stage: "idea",
        projectTags: ["backend", "frontend"],
        posts: [
          {
            type: "update",
            body: "Sketched the diff viewer. Testing on Terraform plans first — the parser is fun, the approval UX is not.",
          },
          {
            type: "stuck",
            body: "Need a front-end partner who cares about dense admin UIs. I can ship the parser but the review flow needs someone who loves tables.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Sharing a cool tool: been using mise-en-place for pinning runtime versions across side projects. Finally stopped the 'works on my machine' loop.",
        structuredFields: {
          link_url: "https://mise.jdx.dev/",
          link_label: "mise — dev env tool worth a look",
        },
      },
    ],
  },
  {
    fullName: "Fatima Al-Rashid",
    emailLocal: "fatima.alrashid",
    displayName: "Fatima Al-Rashid",
    bio: "Angel investor and former CFO. Publishing how I evaluate pre-revenue SaaS without pretending I can see the future.",
    brings: ["capital", "feedback"],
    openTo: ["fintech", "healthcare"],
    projects: [
      {
        name: "TermSheet Notes",
        oneLiner: "Public memos on how I pass or proceed on early SaaS deals.",
        abstractDescription: "Anonymous deal writeups with the actual questions I ask on a first call. No hype, no 'AI will change everything' opener.",
        stage: "shipped",
        projectTags: ["capital", "feedback"],
        posts: [
          {
            type: "shipped",
            body: "Published the first twelve memos. Free for now while I figure out cadence — quality over growth hacking.",
          },
          {
            type: "need_users",
            body: "Looking for three B2B founders raising a small pre-seed who'll let me publish a redacted version of my notes. You keep veto power.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "The best first calls end with one clear experiment, not a product tour. I wish more founders led with that.",
      },
    ],
  },
  {
    fullName: "Tomoko Sato",
    emailLocal: "tomoko.sato",
    displayName: "Tomoko Sato",
    bio: "Frontend engineer obsessed with performance and accessibility on marketing sites that still need to convert. Slow pages are a trust problem.",
    brings: ["frontend"],
    openTo: ["distribution", "feedback"],
    projects: [
      {
        name: "Lighthouse Lane",
        oneLiner: "Weekly performance and a11y reports for marketing sites on Webflow and Framer.",
        abstractDescription: "Automated checks plus a short human note on what to fix first. No 200-item PDFs.",
        stage: "building",
        projectTags: ["frontend", "design"],
        posts: [
          {
            type: "update",
            body: "Crawler works on Framer sites now. Webflow still needs custom handling for their asset URLs — almost there.",
          },
          {
            type: "shipped",
            body: "Sent the first batch of reports to four beta sites. Two fixed their LCP before the second report landed. That's the whole pitch.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "TIL you can lazy-load hero images and still fail LCP because the font swap steals the show. Fonts are performance now.",
        structuredFields: {
          video_embed_url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        },
      },
    ],
  },
  {
    fullName: "Rafael Mendes",
    emailLocal: "rafael.mendes",
    displayName: "Rafael Mendes",
    bio: "Security reviewer for startups that can't afford full-time AppSec yet. I explain exploit paths in plain language — CVSS scores come second.",
    brings: ["security review"],
    openTo: ["fintech", "healthcare"],
    projects: [
      {
        name: "ScopeReview",
        oneLiner: "Fixed-price security review for seed-stage web apps.",
        abstractDescription: "One week: threat model, dependency check, prioritized fix list. No fear-mongering upsells.",
        stage: "shipped",
        projectTags: ["security review", "backend"],
        posts: [
          {
            type: "shipped",
            body: "Booking page is live. First three slots filled from founder referrals — the only channel that works at this price point.",
          },
          {
            type: "update",
            body: "Most common finding this month: session cookies missing Secure on staging domains that mirror prod. Easy fix, easy miss.",
          },
        ],
      },
    ],
    sharePosts: [],
  },
  {
    fullName: "Sophie Laurent",
    emailLocal: "sophie.laurent",
    displayName: "Sophie Laurent",
    bio: "Community operator who runs beta cohorts for hardware and software. First product — learning Postgres in public and asking dumb questions without shame.",
    brings: ["feedback", "design"],
    openTo: ["co-founder", "backend"],
    projects: [
      {
        name: "BetaHost",
        oneLiner: "Structured beta cohorts with templates for intake, updates, and exit surveys.",
        abstractDescription: "A lightweight hub for founders running their first twenty-user beta without a custom Notion maze.",
        stage: "building",
        projectTags: ["feedback", "distribution"],
        posts: [
          {
            type: "update",
            body: "Cohort template is done. Working on email reminders that don't feel like spam — harder than the database schema, somehow.",
          },
          {
            type: "stuck",
            body: "Need a backend co-builder for auth and billing. I can run programs and write copy. I cannot Postgres under pressure yet.",
          },
          {
            type: "learning",
            body: "TIL beta users stay longer when you tell them exactly how many messages to expect per week. Obvious in hindsight.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Day-one builder confession: I shipped a landing page before I understood webhooks. It worked anyway. Don't wait for permission.",
      },
    ],
  },
  {
    fullName: "Omar Hassan",
    emailLocal: "omar.hassan",
    displayName: "Omar Hassan",
    bio: "Payments PM building clearer remittance status for diaspora families. Regulatory copy is the current boss fight.",
    brings: ["fintech", "distribution"],
    openTo: ["backend", "regulatory expertise"],
    projects: [
      {
        name: "TransferTrail",
        oneLiner: "Track international transfers across apps your family actually uses.",
        abstractDescription: "Read-only status when money leaves one app and lands in another days later. No moving money — just clarity.",
        stage: "building",
        projectTags: ["fintech", "frontend"],
        posts: [
          {
            type: "update",
            body: "Connected two providers in sandbox. Real user testing blocked on compliance signoff for the landing page copy.",
          },
          {
            type: "stuck",
            body: "Regulatory wording for the waitlist is holding everything up. Need someone who has shipped consumer fintech in the UK and lived to tell.",
          },
        ],
      },
    ],
    sharePosts: [],
  },
  {
    fullName: "Nina Kowalski",
    emailLocal: "nina.kowalski",
    displayName: "Nina Kowalski",
    bio: "Clinical researcher turned founder. Building consent workflows patients can actually read — academic background, startup learning curve.",
    brings: ["healthcare", "regulatory expertise"],
    openTo: ["backend", "capital"],
    projects: [
      {
        name: "PlainConsent",
        oneLiner: "Readable consent flows for clinical studies under 500 participants.",
        abstractDescription: "Plain-language templates plus audit trail. Built for small research teams, not hospital IT procurement.",
        stage: "idea",
        projectTags: ["healthcare", "regulatory expertise"],
        posts: [
          {
            type: "update",
            body: "Interviewed six study coordinators. All of them keep a personal spreadsheet of who signed what. That's the real competitor.",
          },
          {
            type: "learning",
            body: "TIL patients sign faster when the summary fits on one phone screen, even if the legal doc is longer. Design constraint unlocked.",
          },
        ],
      },
    ],
    sharePosts: [],
  },
  {
    fullName: "Caleb Brooks",
    emailLocal: "caleb.brooks",
    displayName: "Caleb Brooks",
    bio: "Field sales rep testing tools for brands that sell through independent retailers. Knows the buyer, learning the build.",
    brings: ["distribution"],
    openTo: ["co-founder", "capital"],
    projects: [
      {
        name: "RouteBox",
        oneLiner: "Visit notes and re-order prompts for reps covering independent stores.",
        abstractDescription: "Mobile-first logbook that exports to whatever spreadsheet the brand already uses.",
        stage: "parked",
        projectTags: ["distribution", "backend"],
        posts: [
          {
            type: "update",
            body: "Built the visit log MVP. Reps liked it but brands wanted Salesforce integration before a pilot. Classic.",
          },
          {
            type: "parked",
            body: "Pausing after two pilots stalled on integration asks we can't fund yet. Code stays open if a brand wants a narrow rollout.",
          },
        ],
      },
    ],
    sharePosts: [],
  },
  {
    fullName: "Yuki Tanaka",
    emailLocal: "yuki.tanaka",
    displayName: "Yuki Tanaka",
    bio: "Engineer and writer. Exploring tools that help small teams document decisions without another wiki no one reads.",
    brings: ["backend", "feedback"],
    openTo: ["co-founder", "design"],
    projects: [
      {
        name: "DecisionLog",
        oneLiner: "A short log of why you chose X over Y, attached to the repo.",
        abstractDescription: "Markdown files with a consistent template, rendered in the app and searchable by tag.",
        stage: "building",
        projectTags: ["backend", "frontend"],
        posts: [
          {
            type: "update",
            body: "CLI scaffolds a decision file and links it from the README. App view is still rough — file list energy.",
          },
          {
            type: "stuck",
            body: "Need design help making the timeline view scannable. Right now it reads like a directory listing from 2009.",
          },
          {
            type: "shipped",
            body: "Open sourced the template after our team used it for three architecture calls. Small win.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Teams write better decisions when the template asks for rejected options, not only the winner. Stealing that for everything now.",
      },
    ],
  },
  {
    fullName: "Jordan Reeves",
    emailLocal: "jordan.reeves",
    displayName: "Jordan Reeves",
    bio: "Retail manager learning to build with AI tools. Shipping a staff-scheduling side project for my old store — first real app, lots of questions, zero impostor syndrome left to lose.",
    brings: ["feedback"],
    openTo: ["co-founder", "backend"],
    projects: [
      {
        name: "ShiftKind",
        oneLiner: "Swap shifts without the group chat chaos.",
        abstractDescription: "Simple board for hourly teams to post coverage needs. Built with Cursor after a decade of spreadsheet pain.",
        stage: "building",
        projectTags: ["frontend", "design"],
        posts: [
          {
            type: "update",
            body: "Auth works. First time I understood JWT flow without pretending. Took notes like a student — because I am one.",
            structuredFields: { image_url: SEED_PLACEHOLDER_IMAGES.terminal },
          },
          {
            type: "learning",
            body: "TIL RLS means the database enforces permissions, not your React code. Mind blown. Also broke prod once. Fixed it.",
          },
          {
            type: "need_users",
            body: "Looking for two shift managers at small retail or food spots to try this for a week. I'll sit on a call and fix whatever breaks.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Shipped my first localhost link to this community yesterday. Nobody laughed. Might do it again.",
        structuredFields: {
          video_embed_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        },
      },
    ],
  },
];

export const SEED_ARTICLES: SeedArticle[] = [
  {
    authorIndex: 7,
    title: "Fix LCP without rewriting your marketing site",
    excerpt:
      "A short checklist for Framer and Webflow sites that score fine locally but fail in the field.",
    coverImageUrl: SEED_PLACEHOLDER_IMAGES.articleCover,
    body: `<p>Most marketing sites fail LCP for boring reasons: hero images without dimensions, font swaps that block text, third-party scripts loaded synchronously in the head.</p>
<p>Start with one real URL on real mobile networks, not Lighthouse in dev mode. Fix the largest element first — usually the hero, occasionally a carousel nobody asked for.</p>
<p>Lazy loading isn't free. If the hero is the LCP element, it should not lazy load. This trips up teams copying blog patterns onto landing pages.</p>
<p>Ship one fix per deploy. You'll learn faster and avoid the week-long perf branch that never merges.</p>`,
  },
  {
    authorIndex: 6,
    title: "What I ask on a first founder call",
    excerpt: "Twelve questions before I look at a deck. Most decks arrive too early anyway.",
    body: `<p>I don't need a polished pitch on call one. I need to know what experiment you'd run if I wired you money tomorrow and what would prove you wrong.</p>
<p>Good signs: specific customer, specific pain, honest gaps in the team, a default channel that isn't "we'll go viral."</p>
<p>Yellow flags: TAM slides with no wedge, "AI" as the product, no mention of what they've tried that failed.</p>
<p>This isn't a rubric to game. It's how I stay useful instead of performative.</p>`,
  },
  {
    authorIndex: 13,
    title: "My first month building with AI tools",
    excerpt: "Notes from someone who didn't write production code until this year.",
    body: `<p>I kept a log of every thing I didn't understand and asked in public. That was the whole strategy.</p>
<p>AI tools got me to a working UI fast. They did not replace reading error messages or learning why auth is hard.</p>
<p>The best help I got here was someone linking a doc and saying "this section, step four." Not a lecture — a path.</p>
<p>If you're early: ship something small, name what you're stuck on, accept that localhost links are a valid milestone.</p>`,
  },
];

export const SEED_FLARES: SeedFlare[] = [
  {
    authorIndex: 14,
    title: "Supabase RLS blocking my own test user",
    body: "Building ShiftKind with Supabase. Login works, but inserts on shifts fail with RLS unless I disable policies.\n\nWhat I'm trying: staff can only read/write shifts for stores they're assigned to.\n\nWhat's happening: even the store owner account gets blocked on insert.",
    status: "open",
    tags: ["backend", "security review"],
    comments: [
      {
        authorIndex: 5,
        body: "Check whether your insert policy uses auth.uid() against a join table that isn't populated yet for the owner. Common on first seed.",
      },
      {
        authorIndex: 8,
        body: "Paste the policy if you can — happy to spot-check. Usually it's a missing WITH CHECK vs USING mismatch.",
      },
    ],
  },
  {
    authorIndex: 0,
    title: "HL7 export timing out on large packets",
    body: "ChartRelay import chokes on packets over ~40 pages from one EHR. Timeout at 30s.\n\nTried bumping serverless timeout — helps sometimes, not reliably.\n\nWhat's happening: smaller clinics are fine; one mid-size pilot is stuck.",
    status: "being_helped",
    tags: ["backend", "healthcare"],
    tried: "Increased function timeout to 60s.\nTried streaming parse — partial refactor on a branch.",
    ruledOut: "Client-side parse — browser memory dies on these files.",
    currentStatus: "Considering background job + polling UI. Worried about complexity for a pilot.",
    helperIndices: [4, 5],
    comments: [
      {
        authorIndex: 4,
        body: "We split similar imports into queue jobs with a status row the UI polls every few seconds. Simpler than websockets for a pilot.",
        markHelpfulByAuthor: true,
      },
      {
        authorIndex: 0,
        body: "That's the direction I'm leaning. Did you store partial progress on failure or restart from zero?",
      },
      {
        authorIndex: 4,
        body: "Checkpoint every N records. Restart picks up from last checkpoint — saved us on flaky hospital VPNs.",
      },
    ],
  },
  {
    authorIndex: 9,
    title: "Webhook idempotency for beta invite emails",
    body: "BetaHost sends invite emails from a Stripe webhook on checkout. Seeing duplicate sends when Stripe retries.\n\nWhat I tried: unique constraint on invite token.\n\nWhat's happening: email still fires twice before the constraint trips.",
    status: "being_helped",
    tags: ["backend", "fintech"],
    tried: "Unique constraint on invite token.\nLogging event IDs to console.",
    currentStatus: "Need a pattern that survives retries without over-engineering.",
    helperIndices: [1, 5],
    comments: [
      {
        authorIndex: 1,
        body: "Store processed Stripe event IDs in a table with a unique index. Return 200 if already processed — standard pattern.",
        markHelpfulByAuthor: true,
      },
    ],
  },
  {
    authorIndex: 10,
    title: "FCA wording for remittance waitlist",
    body: "Lawyer review says my TransferTrail waitlist copy implies we move money. We don't — read-only status only.\n\nStuck on phrasing that satisfies compliance without sounding like a bank wrote it.",
    status: "open",
    tags: ["regulatory expertise", "design"],
    comments: [
      {
        authorIndex: 4,
        body: "Lead with what you don't do in the first sentence. 'We don't hold or move funds' before any feature list.",
      },
    ],
  },
  {
    authorIndex: 5,
    title: "Terraform plan diff too noisy for reviewers",
    body: "DiffGarden highlights every attribute change. Non-engineer reviewers glaze over.\n\nNeed heuristics for 'material change' vs noise. Anyone solved this without ML theater?",
    status: "open",
    tags: ["backend", "frontend"],
    structuredFields: { image_url: SEED_PLACEHOLDER_IMAGES.sketch },
  },
  {
    authorIndex: 11,
    title: "Immutable audit log on a budget",
    body: "PlainConsent needs tamper-evident logs for small studies. Enterprise solutions are priced for hospitals.\n\nWhat's happening: evaluating append-only tables vs external log service.",
    status: "open",
    tags: ["backend", "healthcare"],
  },
  {
    authorIndex: 2,
    title: "Framer embed breaking lazy-loaded gallery",
    body: "Client site — LCP fixed but gallery thumbs blank until hard refresh. Only on Framer embed path.\n\nRuled out CDN cache. Suspecting hydration order.",
    status: "resolved",
    tags: ["frontend", "design"],
    tried: "Disabled lazy load on first six thumbs.\nMoved script tag lower in embed.",
    ruledOut: "Image CDN — direct URLs load fine.",
    currentStatus: "Fixed by setting explicit width/height on thumb container.",
    resolutionNote:
      "Explicit dimensions on the thumb wrapper fixed Framer hydration fighting the lazy loader. Documented in my LCP article for anyone else hitting this.",
    comments: [
      {
        authorIndex: 7,
        body: "Framer embeds need dimensions on containers, not just images. Glad you got it — worth adding to your article.",
        markHelpfulByAuthor: true,
      },
    ],
  },
  {
    authorIndex: 1,
    title: "Wise webhook signature in Edge runtime",
    body: "LedgerLane webhook verifier fails on Vercel Edge but passes locally. Suspect subtle body encoding difference.",
    status: "resolved",
    tags: ["backend", "fintech"],
    tried: "Raw body read.\nSwitched to Node runtime route — works.",
    resolutionNote:
      "Moved webhook to Node runtime for raw body access. Edge is fine for plenty — just not this verifier without more work.",
    comments: [
      {
        authorIndex: 8,
        body: "Node runtime for webhooks is the boring correct answer. Document which routes need it so Future You doesn't retry Edge for sport.",
        markHelpfulByAuthor: true,
      },
    ],
  },
];

export const SEED_CONVERSATIONS: SeedConversation[] = [
  {
    participantA: 0,
    participantB: 4,
    messages: [
      {
        senderIndex: 0,
        body: "Thanks for the queue job tip on the HL7 flare — starting a branch tonight. Mind if I ping you if the checkpoint schema feels wrong?",
      },
      {
        senderIndex: 4,
        body: "Ping anytime. Happy to look at a schema sketch before you migrate prod.",
      },
      {
        senderIndex: 0,
        body: "Perfect. I'll post a screenshot in the thread once I have something embarrassing to show.",
      },
    ],
  },
  {
    participantA: 14,
    participantB: 5,
    messages: [
      {
        senderIndex: 14,
        body: "Your RLS comment on my flare saved me an hour. Policy was checking store_id on insert but owner row used a different join path.",
      },
      {
        senderIndex: 5,
        body: "Glad it helped. First RLS wall is always the weirdest one.",
      },
    ],
  },
  {
    participantA: 2,
    participantB: 7,
    messages: [
      {
        senderIndex: 2,
        body: "Want to cross-link your LCP article from my sprint handoff template? Fits the perf section nicely.",
      },
      {
        senderIndex: 7,
        body: "Yes please — I'll add a note about Framer thumbs at the bottom too.",
      },
    ],
  },
];

export const SEED_EXTRA_FOLLOWS: [number, number][] = [
  [0, 4],
  [1, 7],
  [2, 9],
  [3, 12],
  [5, 10],
  [6, 1],
  [8, 4],
  [11, 0],
  [13, 2],
  [14, 5],
  [14, 0],
  [4, 14],
  [7, 2],
];

export const SEED_FOLLOW_ME_INDICES = [0, 1, 2, 4, 6, 8, 11, 14];
export const MY_FOLLOW_SEED_INDICES = [1, 4, 9, 13];

export const SEED_MILESTONES: SeedMilestone[] = [
  { userIndex: 1, milestone: "first_ship", celebrated: true },
  { userIndex: 1, milestone: "first_project", celebrated: true },
  { userIndex: 14, milestone: "first_flare", celebrated: false },
  { userIndex: 14, milestone: "first_project", celebrated: true },
  { userIndex: 5, milestone: "first_help_given", celebrated: true },
  { userIndex: 4, milestone: "first_help_given", celebrated: true },
  { userIndex: 8, milestone: "first_help_given", celebrated: false },
  { userIndex: 7, milestone: "first_ship", celebrated: true },
  { userIndex: 9, milestone: "first_flare", celebrated: true },
  { userIndex: 2, milestone: "first_flare_reply", celebrated: false },
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
      {
        type: "shipped",
        body: "Launched about a month ago at snovai.io. Chrome extension sidebar that connects read-only to your ServiceNow instance.",
      },
      {
        type: "update",
        body: "In distribution now. Reaching out directly to 1,000+ LinkedIn connections. Early traction: 25+ trial users and 7 paid conversions at $149/month.",
      },
      {
        type: "need_users",
        body: "Openly looking for a partner or investor to help with resourcing and getting this in front of more ServiceNow teams. Not a pitch deck conversation — I want someone who knows enterprise buyers.",
      },
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
      {
        type: "shipped",
        body: "Auth is done with three login providers. Login stays separate from verification on purpose.",
      },
      {
        type: "stuck",
        body: "Working through the feed so it is never empty for a brand-new user. Balancing tag match, follows, and a fallback that still feels intentional.",
      },
      {
        type: "learning",
        body: "TIL reputation here is trigger-driven. Helpful marks insert rows and the database updates helpful_count and reputation_score. The app never computes it.",
      },
    ],
  },
  {
    name: "AI Tool Navigator",
    oneLiner: "A browser sidebar that started as quick-launch between ChatGPT, Claude, and Copilot and grew toward a per-task AI routing hub.",
    abstractDescription:
      "Routes you to the right AI tool per task with token estimation, and explored capturing context across tools.",
    stage: "parked",
    projectTags: ["frontend", "design"],
    posts: [
      {
        type: "update",
        body: "Early version was quick switching between AI tools from a sidebar. Useful, but not enough to keep people opening it daily.",
      },
      {
        type: "stuck",
        body: "Hit a wall reading browser-level data from Claude and ChatGPT inside an extension. Every approach felt brittle or out of policy.",
      },
      {
        type: "parked",
        body: "Considered a bring-your-own-API-key path to pull context from git commits and planning tools, but that sat outside my depth. Parking it for now.",
      },
    ],
  },
];

export type ReactionPlan = {
  owner: number | "my";
  projectIndex: number;
  postIndex: number;
  userIndex: number;
  reaction: PostReactionType;
};

export const SEED_REACTION_PLANS: ReactionPlan[] = [
  { owner: 1, projectIndex: 0, postIndex: 0, userIndex: 6, reaction: "shipped" },
  { owner: 1, projectIndex: 0, postIndex: 0, userIndex: 2, reaction: "respect" },
  { owner: 1, projectIndex: 0, postIndex: 0, userIndex: 14, reaction: "been_there" },
  { owner: 14, projectIndex: 0, postIndex: 0, userIndex: 0, reaction: "shipped" },
  { owner: 14, projectIndex: 0, postIndex: 0, userIndex: 5, reaction: "respect" },
  { owner: 7, projectIndex: 0, postIndex: 1, userIndex: 2, reaction: "curious" },
  { owner: 7, projectIndex: 0, postIndex: 1, userIndex: 3, reaction: "shipped" },
  { owner: 0, projectIndex: 0, postIndex: 3, userIndex: 4, reaction: "been_there" },
  { owner: 13, projectIndex: 0, postIndex: 2, userIndex: 1, reaction: "respect" },
  { owner: "my", projectIndex: 1, postIndex: 2, userIndex: 1, reaction: "curious" },
  { owner: "my", projectIndex: 1, postIndex: 2, userIndex: 5, reaction: "been_there" },
];

export type HelpfulPostPlan = {
  owner: number | "my";
  projectIndex: number;
  postIndex: number;
  markerIndex: number | "my";
};

export const SEED_HELPFUL_POST_PLANS: HelpfulPostPlan[] = [
  { owner: 1, projectIndex: 0, postIndex: 1, markerIndex: 6 },
  { owner: 14, projectIndex: 0, postIndex: 1, markerIndex: 5 },
  { owner: 0, projectIndex: 0, postIndex: 1, markerIndex: 4 },
  { owner: "my", projectIndex: 1, postIndex: 2, markerIndex: 1 },
];

export type CommentPlan = {
  owner: number | "my";
  projectIndex: number;
  postIndex: number;
  authorIndex: number | "my";
  body: string;
  markHelpfulByPostAuthor?: boolean;
};

export const SEED_COMMENT_PLANS: CommentPlan[] = [
  {
    owner: 0,
    projectIndex: 0,
    postIndex: 1,
    authorIndex: 4,
    body: "We documented controls before code on our last healthcare pilot. Happy to share the template if it helps.",
    markHelpfulByPostAuthor: true,
  },
  {
    owner: 1,
    projectIndex: 0,
    postIndex: 2,
    authorIndex: 3,
    body: "I know two freelancers paid in EUR and USD who might try this. Want an intro?",
    markHelpfulByPostAuthor: true,
  },
  {
    owner: 14,
    projectIndex: 0,
    postIndex: 2,
    authorIndex: 5,
    body: "Happy to pair on RLS for an hour if you want a second set of eyes on policies.",
    markHelpfulByPostAuthor: true,
  },
  {
    owner: "my",
    projectIndex: 0,
    postIndex: 2,
    authorIndex: 6,
    body: "Enterprise buyers usually want the read-only story first. Lead with that in outreach.",
  },
  {
    owner: "my",
    projectIndex: 1,
    postIndex: 1,
    authorIndex: 2,
    body: "We used a small global recent list as fallback on a beta community. Kept new users from bouncing.",
    markHelpfulByPostAuthor: true,
  },
  {
    owner: 9,
    projectIndex: 0,
    postIndex: 1,
    authorIndex: 5,
    body: "I can help wire auth if you want a short pairing session on Supabase RLS.",
  },
];
