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

export type SeedTexturePost = {
  authorIndex: number;
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
      {
        body: "Saw three 'first deploy' posts today. That's the feed I want — veterans and day-one builders in the same room.",
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
      {
        body: "To the people posting localhost links this week: that's the whole point of this place. Keep going.",
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
  {
    fullName: "Mia Santos",
    emailLocal: "mia.santos",
    displayName: "Mia Santos",
    bio: "Left retail management six months ago to learn to build. First real project, lots of tabs open, no fake confidence — just showing up and asking the questions.",
    brings: ["feedback"],
    openTo: ["co-founder", "frontend"],
    projects: [
      {
        name: "CornerList",
        oneLiner: "A simple inventory tracker for tiny shops that outgrew spreadsheets.",
        abstractDescription:
          "Built for the kind of store I used to run — low SKU count, high chaos, one person doing everything.",
        stage: "building",
        projectTags: ["frontend", "design"],
        posts: [
          {
            type: "update",
            body: "Left retail six months ago to learn to code. Here's my first real project — still rough, but it's mine.",
          },
          {
            type: "learning",
            body: "Three months in, I finally understand what an API is. Felt silly not knowing. Feels good knowing.",
          },
          {
            type: "stuck",
            body: "Database part works locally. Deploying is a different language entirely. Stuck between 'almost done' and 'nobody can see it yet.'",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Sharing my localhost link for the first time. Terrifying. Here goes anyway — feedback welcome, gentle preferred but honest is fine too.",
      },
      {
        body: "Is it normal to feel like I have no idea what I'm doing? Some days I ship something and feel great. Same hour I can't explain how it works.",
      },
    ],
  },
  {
    fullName: "Alex Kim",
    emailLocal: "alex.kim.hobby",
    displayName: "Alex Kim",
    bio: "Accountant by day. Builds small joyful things on weekends — plant trackers, dice rollers, stuff my friends actually use. Not trying to be a startup.",
    brings: ["feedback"],
    openTo: ["feedback"],
    projects: [
      {
        name: "ThirstyLeaves",
        oneLiner: "Track when your houseplants were last watered.",
        abstractDescription: "One screen, push reminders, no social features, no growth hacks. Just my plants.",
        stage: "shipped",
        projectTags: ["frontend", "design"],
        posts: [
          {
            type: "shipped",
            body: "Built a little app to track my houseplants' watering schedule. My first finished thing ever — ugly icon, works fine.",
          },
          {
            type: "update",
            body: "Three friends asked for it after I demoed at game night. Added a second plant profile. That's the whole roadmap.",
          },
        ],
      },
      {
        name: "RollForSnacks",
        oneLiner: "A dice roller for my D&D group with inside-joke crit messages.",
        abstractDescription: "Weekend toy — animated rolls, custom sound on nat 20, zero monetization plan.",
        stage: "shipped",
        projectTags: ["frontend", "design"],
        posts: [
          {
            type: "shipped",
            body: "Made a dice roller for my D&D group. They roast the UI every session and still use it. Success metric achieved.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Weekend project: a tool that reminds me to call my mum. She approved the feature request in one text.",
      },
      {
        body: "Anyone else build things just because they're fun? No pitch deck, no TAM slide, just vibes and a working button.",
      },
    ],
  },
  {
    fullName: "Sam O'Brien",
    emailLocal: "sam.obrien",
    displayName: "Sam O'Brien",
    bio: "Self-taught, month four. Building a neighborhood events board because the Facebook group drives me nuts. Asks basic questions without apologizing for them.",
    brings: ["feedback"],
    openTo: ["backend", "design"],
    projects: [
      {
        name: "BlockBoard",
        oneLiner: "What's happening on my block this week — yard sales, lost cats, block parties.",
        abstractDescription: "Hyperlocal bulletin board for people who don't want another Facebook group.",
        stage: "building",
        projectTags: ["frontend", "feedback"],
        posts: [
          {
            type: "update",
            body: "Got posts showing on a page. No login yet. Progress is progress.",
          },
          {
            type: "learning",
            body: "TIL 'flexbox' is not a insult — it's how you center things. Took longer than I'd like to admit.",
          },
          {
            type: "need_users",
            body: "Looking for two neighbors willing to try a janky events board before I add auth. Must tolerate rough edges.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Centered a div on the first try today. Small for most people. Feels incredible for me.",
      },
      {
        body: "Shipped my first thing ever. It's rough, it's live, and my neighbor actually used it. That's enough for this week.",
      },
    ],
  },
  {
    fullName: "Renata Flores",
    emailLocal: "renata.flores",
    displayName: "Renata Flores",
    bio: "Marketing background, learning to build the thing instead of only writing about it. Cares about copy, pricing, and whether normal humans understand the button.",
    brings: ["design", "distribution"],
    openTo: ["backend", "feedback"],
    projects: [
      {
        name: "PriceTag",
        oneLiner: "Plain-language pricing page feedback for solo founders.",
        abstractDescription: "Upload your pricing page, get notes on clarity — not aesthetics scores, just 'would I know what to click?'",
        stage: "building",
        projectTags: ["design", "feedback"],
        posts: [
          {
            type: "update",
            body: "First version is literally a form and a checklist I wrote in Notion. Testing whether the questions help before I automate anything.",
          },
          {
            type: "stuck",
            body: "Need someone to explain hosting options like I'm smart but new — Vercel vs Netlify vs 'just put it somewhere.' Less jargon, more 'pick this if...'",
          },
          {
            type: "learning",
            body: "TIL most early pricing pages fail on verbs, not design. 'Get started' tells me nothing. 'Start free trial' tells me plenty.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Hot take from a non-engineer: if your landing page needs a FAQ to explain the product, the page isn't done yet.",
      },
    ],
  },
  {
    fullName: "Greg Walsh",
    emailLocal: "greg.walsh",
    displayName: "Greg Walsh",
    bio: "Built PHP sites in the late 2000s, then life happened. Getting back into it with modern tools — slower than I expected, less embarrassed than I thought I'd be.",
    brings: ["backend", "feedback"],
    openTo: ["frontend", "design"],
    projects: [
      {
        name: "GarageSaleMap",
        oneLiner: "Map of weekend garage sales in my county.",
        abstractDescription: "Nostalgic project — I used to run a forum for this. Rebuilding simpler with things I don't fully understand yet.",
        stage: "building",
        projectTags: ["frontend", "backend"],
        posts: [
          {
            type: "update",
            body: "React is not jQuery. Took me a week to stop fighting that mentally. Making peace with components.",
          },
          {
            type: "learning",
            body: "TIL git branches aren't scary if you name them like temp folders. feature/garage-pins-v1 energy.",
          },
          {
            type: "stuck",
            body: "Map pins work. Mobile layout doesn't. Feels like I'm one CSS breakthrough away and one week away at the same time.",
          },
        ],
      },
    ],
    sharePosts: [
      {
        body: "Returning after years away: the tools changed, the impostor feeling didn't. Nice to find a room where 'I'm rusty' isn't an apology.",
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
  {
    authorIndex: 15,
    title: "First time deploying and I'm completely lost",
    body: "CornerList works on my laptop. That's the whole status.\n\nI don't know where to put it so other people can see it. Vercel? Railway? Something else? Every tutorial assumes a different starting point.\n\nWhere do I even start?",
    status: "being_helped",
    tags: ["frontend", "feedback"],
    helperIndices: [5, 14, 7],
    comments: [
      {
        authorIndex: 7,
        body: "Totally normal. Pick one host (Vercel is fine for Next/React) and follow their 'first deploy' doc end to end — don't optimize yet.",
        markHelpfulByAuthor: true,
      },
      {
        authorIndex: 14,
        body: "I was here last month. Deploying something ugly that works beats waiting until you understand everything. Been there.",
      },
      {
        authorIndex: 5,
        body: "If it's a static-ish frontend: connect repo → set env vars → deploy. Send the repo stack if you want a 10-minute sanity check.",
      },
      {
        authorIndex: 15,
        body: "This helps more than you know. Going to try Vercel tonight and report back like a student.",
      },
    ],
  },
  {
    authorIndex: 18,
    title: "How do I make my site actually go live?",
    body: "PriceTag is a single-page form. Works locally. I understand the words 'DNS' and 'domain' separately but not together.\n\nWhat's the boring checklist from localhost to a URL I can text my friend?",
    status: "being_helped",
    tags: ["design", "frontend"],
    helperIndices: [2, 7],
    comments: [
      {
        authorIndex: 2,
        body: "Boring checklist: deploy to host → get a .vercel.app URL first → buy domain later if you want. Test on the free URL until copy feels right.",
        markHelpfulByAuthor: true,
      },
      {
        authorIndex: 7,
        body: "You don't need DNS on day one. Ship on the default subdomain, share that link, fix copy based on real reactions.",
      },
    ],
  },
  {
    authorIndex: 17,
    title: "My CSS won't center this div and I've tried everything",
    body: "BlockBoard header should be centered. It's left-aligned like it has opinions.\n\nTried margin auto, tried flexbox from a blog post, tried asking ChatGPT which gave me four conflicting answers.\n\nWhat am I missing? Happy to share a screenshot.",
    status: "being_helped",
    tags: ["frontend", "design"],
    helperIndices: [2, 7],
    comments: [
      {
        authorIndex: 2,
        body: "Flex on the parent: display flex, justify-content center, align-items center. Parent needs a defined width or it'll look 'off' in ways that feel mystical.",
        markHelpfulByAuthor: true,
      },
      {
        authorIndex: 7,
        body: "Also check if something else is setting text-align on a wrapper. DevTools → inspect → see what's actually winning. Not dumb — CSS is famously petty.",
      },
      {
        authorIndex: 14,
        body: "The flexbox click moment is real. I celebrated mine like a holiday.",
      },
    ],
  },
  {
    authorIndex: 17,
    title: "Is it normal to feel like I have no idea what I'm doing?",
    body: "Some hours I feel like a builder. Same day I can't explain why my fix worked.\n\nIs this just part of month four or am I missing something everyone else learned in secret?",
    status: "open",
    tags: ["feedback"],
    comments: [
      {
        authorIndex: 6,
        body: "Normal. Twenty years in and I still have days like that. The difference is I trust the cycle now — confusion → question → small win → repeat.",
      },
      {
        authorIndex: 1,
        body: "Secret learning club doesn't exist. Public build logs just make the mess visible. You're doing it right.",
      },
      {
        authorIndex: 13,
        body: "Document the wins when they happen. Future you on a bad day needs proof you weren't always lost.",
      },
    ],
  },
  {
    authorIndex: 16,
    title: "Built a plant tracker — anyone want it?",
    body: "ThirstyLeaves works for me and three friends. Not trying to scale it.\n\nIf you want the link to fork or copy the idea, happy to share. Might be useful if you also kill plants by accident.",
    status: "open",
    tags: ["design", "frontend"],
    comments: [
      {
        authorIndex: 15,
        body: "This is the kind of project I want to see more of. Yes please — my succulents are living on luck.",
      },
      {
        authorIndex: 19,
        body: "Love a useful weekend build. Drop the link when you're ready — no pressure to productize it.",
      },
    ],
  },
  {
    authorIndex: 17,
    title: "How do I add a login without building it all myself?",
    body: "BlockBoard needs accounts before I let strangers post events.\n\nI don't want to write auth from scratch — I've read that's a bad idea. Supabase? Clerk? Something else for a tiny app?\n\nWhat would you pick for 'small and simple'?",
    status: "open",
    tags: ["backend", "frontend"],
    comments: [
      {
        authorIndex: 5,
        body: "Supabase Auth or Clerk both fine at your size. Pick whichever tutorial you'll actually finish — finished beats perfect.",
      },
      {
        authorIndex: 14,
        body: "I used Supabase on my first app. Docs are okay if you follow one path and ignore the advanced tabs for now.",
        markHelpfulByAuthor: true,
      },
    ],
  },
  {
    authorIndex: 19,
    title: "What's the modern equivalent of LAMP stack?",
    body: "Last time I shipped, it was PHP + MySQL + shared hosting.\n\nNow there's Next.js, Supabase, edge functions, twelve package managers. What's a sane default stack for a simple map app in 2026?",
    status: "open",
    tags: ["backend", "frontend"],
    comments: [
      {
        authorIndex: 5,
        body: "Next.js + Supabase + Vercel is the boring friendly default now. LAMP energy, less cPanel.",
      },
      {
        authorIndex: 1,
        body: "Pick boring tools, ship, swap later if you outgrow them. Map app doesn't need microservices theater.",
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
  {
    participantA: 15,
    participantB: 14,
    messages: [
      {
        senderIndex: 15,
        body: "Your deploy comment on my flare got me unstuck. CornerList is on a real URL now — ugly, live, mine.",
      },
      {
        senderIndex: 14,
        body: "That's the whole game. Ugly and live beats perfect and localhost every time.",
      },
    ],
  },
  {
    participantA: 16,
    participantB: 17,
    messages: [
      {
        senderIndex: 16,
        body: "Want to try each other's weekend projects? I'll test BlockBoard if you roast ThirstyLeaves honestly.",
      },
      {
        senderIndex: 17,
        body: "Deal. Fair warning: my events board has one working button and infinite personality.",
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
  [15, 14],
  [16, 15],
  [17, 5],
  [18, 2],
  [19, 1],
  [5, 17],
  [2, 16],
  [7, 15],
  [1, 17],
  [14, 16],
  [19, 15],
];

export const SEED_FOLLOW_ME_INDICES = [0, 1, 2, 4, 6, 8, 11, 14, 15, 16, 17, 18, 19];
export const MY_FOLLOW_SEED_INDICES = [1, 4, 9, 13, 15, 17];

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
  { userIndex: 15, milestone: "first_project", celebrated: false },
  { userIndex: 15, milestone: "first_flare", celebrated: false },
  { userIndex: 16, milestone: "first_ship", celebrated: true },
  { userIndex: 17, milestone: "first_flare", celebrated: true },
  { userIndex: 17, milestone: "first_ship", celebrated: false },
  { userIndex: 18, milestone: "first_project", celebrated: true },
  { userIndex: 19, milestone: "first_project", celebrated: false },
  { userIndex: 14, milestone: "first_help_given", celebrated: true },
  { userIndex: 2, milestone: "first_help_given", celebrated: true },
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
  { owner: 1, projectIndex: 0, postIndex: 0, userIndex: 6, reaction: "keep_going" },
  { owner: 1, projectIndex: 0, postIndex: 0, userIndex: 2, reaction: "respect" },
  { owner: 1, projectIndex: 0, postIndex: 0, userIndex: 14, reaction: "been_there" },
  { owner: 14, projectIndex: 0, postIndex: 0, userIndex: 0, reaction: "keep_going" },
  { owner: 14, projectIndex: 0, postIndex: 0, userIndex: 5, reaction: "respect" },
  { owner: 7, projectIndex: 0, postIndex: 1, userIndex: 2, reaction: "made_me_think" },
  { owner: 7, projectIndex: 0, postIndex: 1, userIndex: 3, reaction: "keep_going" },
  { owner: 0, projectIndex: 0, postIndex: 3, userIndex: 4, reaction: "been_there" },
  { owner: 13, projectIndex: 0, postIndex: 2, userIndex: 1, reaction: "respect" },
  { owner: "my", projectIndex: 1, postIndex: 2, userIndex: 1, reaction: "made_me_think" },
  { owner: "my", projectIndex: 1, postIndex: 2, userIndex: 5, reaction: "been_there" },
  { owner: 17, projectIndex: 0, postIndex: 1, userIndex: 14, reaction: "keep_going" },
  { owner: 17, projectIndex: 0, postIndex: 1, userIndex: 2, reaction: "been_there" },
  { owner: 16, projectIndex: 0, postIndex: 0, userIndex: 15, reaction: "keep_going" },
  { owner: 16, projectIndex: 1, postIndex: 0, userIndex: 17, reaction: "respect" },
  { owner: 15, projectIndex: 0, postIndex: 1, userIndex: 1, reaction: "been_there" },
  { owner: 15, projectIndex: 0, postIndex: 0, userIndex: 6, reaction: "respect" },
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
  { owner: 17, projectIndex: 0, postIndex: 1, markerIndex: 14 },
  { owner: 16, projectIndex: 0, postIndex: 0, markerIndex: 2 },
  { owner: 15, projectIndex: 0, postIndex: 0, markerIndex: 7 },
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
  {
    owner: 17,
    projectIndex: 0,
    postIndex: 2,
    authorIndex: 5,
    body: "For a tiny board, Supabase auth is enough. Happy to point you at the smallest tutorial that worked for me.",
    markHelpfulByPostAuthor: true,
  },
  {
    owner: 15,
    projectIndex: 0,
    postIndex: 2,
    authorIndex: 7,
    body: "Deploy checklist: push to GitHub → import to Vercel → add env vars → share the preview URL. You can refine later.",
    markHelpfulByPostAuthor: true,
  },
];

/** Standalone share posts — human texture for the feed (lessons, opinions, questions, warmth). */
export const SEED_TEXTURE_POSTS: SeedTexturePost[] = [
  {
    authorIndex: 5,
    body: "TIL you can't trust client-side validation for anything that matters. Learned the hard way.",
  },
  {
    authorIndex: 14,
    body: "Spent 3 hours on a bug that was a missing await. Every time.",
  },
  {
    authorIndex: 11,
    body: "TIL informed consent and 'easy to read' are different species. Back to the rewrite.",
  },
  {
    authorIndex: 13,
    body: "Spent a morning on a redirect loop. The typo was in an env var named almost correctly.",
  },
  {
    authorIndex: 0,
    body: "TIL audit logs need UTC timestamps and labels a human can grep. Obvious after you fail the question.",
  },
  {
    authorIndex: 1,
    body: "Hot take: most apps don't need a state management library.",
  },
  {
    authorIndex: 8,
    body: "I think 'move fast and break things' ages badly once you have users who depend on you showing up.",
  },
  {
    authorIndex: 18,
    body: "Hot take from a non-engineer: if your pricing page needs a FAQ to explain the product, the page isn't done yet.",
  },
  {
    authorIndex: 13,
    body: "Unpopular opinion: a README beats a Notion doc nobody opens.",
  },
  {
    authorIndex: 6,
    body: "Most pitch decks would work better as a one-page experiment list. Less theater, more proof.",
  },
  {
    authorIndex: 15,
    body: "How do you all decide when something's done enough to ship?",
  },
  {
    authorIndex: 17,
    body: "What's your move when you've been staring at the same bug for an hour?",
  },
  {
    authorIndex: 16,
    body: "Anyone else build best at 1am or is that just me?",
  },
  {
    authorIndex: 9,
    body: "For people who've run betas: how many check-in emails is too many? Genuinely trying not to annoy people.",
  },
  {
    authorIndex: 3,
    body: "How do you explain technical tradeoffs to a co-founder who isn't technical — without sounding condescending?",
  },
  {
    authorIndex: 19,
    body: "Rusty returners: do you rebuild fundamentals first or learn by shipping and fixing?",
  },
  {
    authorIndex: 15,
    body: "Six months ago I couldn't read a stack trace. Today I fixed one without googling. Small wins.",
  },
  {
    authorIndex: 10,
    body: "Quit my side contract to build full-time. Terrifying and the best thing I've done this year.",
  },
  {
    authorIndex: 19,
    body: "Built PHP sites in 2008. Stepped away. Came back this year. The impostor feeling is real but smaller than I feared.",
  },
  {
    authorIndex: 14,
    body: "First time a stranger used something I built. Not an investor. Not a friend. Just a person. Weirdly emotional.",
  },
  {
    authorIndex: 4,
    body: "Compliance work taught me patience. Startup work taught me impatience. Still negotiating between the two.",
  },
  {
    authorIndex: 2,
    body: "Reminder that the person whose code you admire also has a folder called 'final_final_v2'.",
  },
  {
    authorIndex: 1,
    body: "If you shipped anything this week, even tiny, that counts.",
  },
  {
    authorIndex: 7,
    body: "To everyone who posted a localhost link this month: that took guts. It's also how every shipped thing started.",
  },
  {
    authorIndex: 16,
    body: "You don't need a business model to build something fun on a Sunday. The skill still transfers.",
  },
  {
    authorIndex: 8,
    body: "Asking 'obvious' questions in public is how you stop repeating everyone else's old mistakes.",
  },
  {
    authorIndex: 13,
    body: "Naming things is still the hardest part of this whole job.",
  },
  {
    authorIndex: 12,
    body: "Comments on someone's flare reply made my whole day. Didn't even need to be my flare.",
  },
  {
    authorIndex: 7,
    body: "Every perf audit this month: the hero image is 4MB and named final2.png. Every time.",
  },
  {
    authorIndex: 4,
    body: "Half the 'AI product' pitches I see are workflow tools with a chat box. The box isn't the product.",
  },
  {
    authorIndex: 2,
    body: "I learn faster when I post a dumb question here than when I read another tutorial in silence.",
  },
];

export type TextureCommentPlan = {
  textureIndex: number;
  authorIndex: number;
  body: string;
  markHelpfulByPostAuthor?: boolean;
};

export const SEED_TEXTURE_COMMENT_PLANS: TextureCommentPlan[] = [
  {
    textureIndex: 10,
    authorIndex: 1,
    body: "Ship when a real person can do the job, even ugly. Polish is a second pass.",
    markHelpfulByPostAuthor: true,
  },
  {
    textureIndex: 10,
    authorIndex: 8,
    body: "I set a calendar event called 'good enough demo.' Sounds silly. Works.",
  },
  {
    textureIndex: 10,
    authorIndex: 18,
    body: "Same struggle. My rule now: one user, one flow, then stop touching copy.",
  },
  {
    textureIndex: 11,
    authorIndex: 8,
    body: "Walk. Literally walk. Come back and grep for the last thing you changed.",
    markHelpfulByPostAuthor: true,
  },
  {
    textureIndex: 11,
    authorIndex: 14,
    body: "Rubber duck it out loud. My dog is unhelpful but talking helps.",
  },
  {
    textureIndex: 12,
    authorIndex: 13,
    body: "1am builder checking in. Momentum is real. Sleep debt is also real.",
    markHelpfulByPostAuthor: true,
  },
  {
    textureIndex: 12,
    authorIndex: 7,
    body: "Night shift here for perf fixes. Quiet hours are underrated.",
  },
  {
    textureIndex: 15,
    authorIndex: 19,
    body: "Ship messy, refactor when you understand the domain. Worked for my garage map.",
    markHelpfulByPostAuthor: true,
  },
  {
    textureIndex: 15,
    authorIndex: 1,
    body: "Both. One small shipped thing per week so rust doesn't become fear.",
  },
  {
    textureIndex: 1,
    authorIndex: 15,
    body: "Three hours on a missing await is a rite of passage. Welcome to the club.",
  },
  {
    textureIndex: 1,
    authorIndex: 1,
    body: "Async bugs lie. Check the network tab before the seventh coffee.",
    markHelpfulByPostAuthor: true,
  },
  {
    textureIndex: 23,
    authorIndex: 17,
    body: "Shipped a janky events board. My neighbor used it. Counting that.",
  },
  {
    textureIndex: 22,
    authorIndex: 14,
    body: "Needed this. Almost didn't post my localhost link yesterday.",
    markHelpfulByPostAuthor: true,
  },
  {
    textureIndex: 21,
    authorIndex: 9,
    body: "My beta template folder is literally called final_final_v2. You're not alone.",
  },
  {
    textureIndex: 19,
    authorIndex: 2,
    body: "First stranger user is a milestone. That's real. Congrats.",
    markHelpfulByPostAuthor: true,
  },
  {
    textureIndex: 13,
    authorIndex: 6,
    body: "Two emails max in week one, then ask if they want more. Opt-in beats surprise.",
    markHelpfulByPostAuthor: true,
  },
  {
    textureIndex: 14,
    authorIndex: 5,
    body: "Analogies first, jargon second. I draw boxes on a napkin before I open Figma.",
  },
];

export type TextureReactionPlan = {
  textureIndex: number;
  userIndex: number;
  reaction: PostReactionType;
};

export const SEED_TEXTURE_REACTION_PLANS: TextureReactionPlan[] = [
  { textureIndex: 10, userIndex: 2, reaction: "made_me_think" },
  { textureIndex: 10, userIndex: 14, reaction: "been_there" },
  { textureIndex: 10, userIndex: 18, reaction: "respect" },
  { textureIndex: 11, userIndex: 5, reaction: "been_there" },
  { textureIndex: 11, userIndex: 17, reaction: "been_there" },
  { textureIndex: 12, userIndex: 7, reaction: "made_me_think" },
  { textureIndex: 12, userIndex: 16, reaction: "made_me_think" },
  { textureIndex: 21, userIndex: 15, reaction: "keep_going" },
  { textureIndex: 22, userIndex: 16, reaction: "respect" },
  { textureIndex: 23, userIndex: 14, reaction: "keep_going" },
  { textureIndex: 22, userIndex: 1, reaction: "keep_going" },
  { textureIndex: 16, userIndex: 1, reaction: "respect" },
  { textureIndex: 17, userIndex: 6, reaction: "respect" },
  { textureIndex: 5, userIndex: 13, reaction: "respect" },
  { textureIndex: 6, userIndex: 3, reaction: "respect" },
  { textureIndex: 26, userIndex: 8, reaction: "been_there" },
  { textureIndex: 0, userIndex: 4, reaction: "been_there" },
  { textureIndex: 2, userIndex: 11, reaction: "made_me_think" },
  { textureIndex: 19, userIndex: 8, reaction: "keep_going" },
  { textureIndex: 25, userIndex: 9, reaction: "respect" },
];
