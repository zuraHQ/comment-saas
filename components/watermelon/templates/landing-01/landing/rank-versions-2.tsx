import {
  FaHackerNews,
  FaLinkedinIn,
  FaRedditAlien,
  FaXTwitter,
} from 'react-icons/fa6';

const POSTS = [
  {
    author: 'u/marta_builds',
    score: 94,
    where: 'Reddit',
    text: 'Looking for a simple invoicing tool for freelancers. Everything I try wants an enterprise plan.',
    Icon: FaRedditAlien,
    color: '#FF4500',
    intent: 'High',
    verdict: 'Asking for a tool like yours, and priced out of the alternatives.',
  },
  {
    author: 'Priya S.',
    score: 91,
    where: 'LinkedIn',
    text: 'Our finance ops still run on three spreadsheets. Open to recommendations.',
    Icon: FaLinkedinIn,
    color: '#0A66C2',
    intent: 'High',
    verdict: 'Describes the exact manual work you replace, and invites suggestions.',
  },
  {
    author: 'tomasz',
    score: 61,
    where: 'Hacker News',
    text: 'Has anyone actually run a CRM out of Notion long term?',
    Icon: FaHackerNews,
    color: '#FF6600',
    intent: 'Medium',
    verdict: 'Adjacent problem. Worth a helpful reply, unlikely to buy today.',
  },
  {
    author: '@buildwithsam',
    score: 12,
    where: 'X/Twitter',
    text: 'just launched v2 today, thanks to everyone who tested it',
    Icon: FaXTwitter,
    color: '#ffffff',
    intent: 'Low',
    verdict: 'Launch announcement. Nothing here to answer.',
  },
];

const BAR: Record<string, string> = {
  High: 'bg-[#A3FF12]',
  Medium: 'bg-[#FFC53D]',
  Low: 'bg-white/20',
};

const CHIP: Record<string, string> = {
  High: 'bg-[#A3FF12] text-[#101010]',
  Medium: 'bg-[#FFC53D] text-[#101010]',
  Low: 'bg-white/10 text-white/40',
};

/* V1 — score bars. The ranking is the picture: length is the score. */
function ScoreBars() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex flex-col gap-5">
        {POSTS.map((post) => (
          <div key={post.author} className="flex items-center gap-4">
            <post.Icon
              className="size-4 shrink-0"
              style={{ color: post.color }}
            />
            <p className="w-64 shrink-0 truncate text-sm text-white/70">
              {post.text}
            </p>
            <div className="h-2 flex-1 bg-white/5">
              <div
                className={`h-full ${BAR[post.intent]}`}
                style={{ width: `${post.score}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-sm text-white tabular-nums">
              {post.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* V2 — the sieve. Volume in at the top, a handful out at the bottom. */
function Sieve() {
  const stages = [
    { label: 'Posts read today', value: 412, width: 'w-full', tone: 'bg-white/15' },
    { label: 'Mention your problem', value: 38, width: 'w-2/3', tone: 'bg-white/30' },
    { label: 'Worth answering', value: 9, width: 'w-1/4', tone: 'bg-[#A3FF12]' },
  ];
  return (
    <div className="border border-white/10 bg-white/[0.02] p-8">
      <div className="flex flex-col items-center gap-6">
        {stages.map((stage) => (
          <div key={stage.label} className={`${stage.width} flex flex-col items-center`}>
            <div className={`h-10 w-full ${stage.tone}`} />
            <p className="mt-2 font-mono text-[10px] tracking-widest text-white/40 uppercase">
              {stage.value.toLocaleString()} · {stage.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* V3 — lanes. Everything lands in one of three buckets. */
function Lanes() {
  const lanes = [
    { intent: 'High', count: 9, note: 'Answer these today' },
    { intent: 'Medium', count: 29, note: 'Worth a helpful reply' },
    { intent: 'Low', count: 374, note: 'You never see these' },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {lanes.map((lane) => (
        <div
          key={lane.intent}
          className={`border p-6 ${
            lane.intent === 'High'
              ? 'border-[#A3FF12]/40 bg-[#A3FF12]/[0.04]'
              : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <span
            className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${CHIP[lane.intent]}`}
          >
            {lane.intent} intent
          </span>
          <p className="mt-6 text-4xl font-semibold text-white tabular-nums">
            {lane.count}
          </p>
          <p className="mt-2 text-sm text-white/40">{lane.note}</p>
          <div className="mt-6 flex flex-col gap-2">
            {POSTS.filter((post) => post.intent === lane.intent).map((post) => (
              <p
                key={post.author}
                className="truncate border border-white/10 px-3 py-2 text-xs text-white/60"
              >
                {post.text}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* V4 — the dial. One post, one number, one reason. */
function Dial() {
  const post = POSTS[0];
  const circumference = 2 * Math.PI * 52;
  return (
    <div className="flex flex-col items-center gap-8 border border-white/10 bg-white/[0.02] p-8 md:flex-row md:gap-12">
      <div className="relative shrink-0">
        <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
          <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <circle
            cx="60"
            cy="60"
            r="52"
            stroke="#A3FF12"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(post.score / 100) * circumference} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold text-white tabular-nums">
            {post.score}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
            Intent
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <post.Icon className="size-3.5" style={{ color: post.color }} />
          {post.where} · {post.author}
        </div>
        <p className="mt-3 text-lg text-white">{post.text}</p>
        <p className="mt-4 border-l-2 border-[#A3FF12] pl-3 text-sm text-white/60">
          {post.verdict}
        </p>
      </div>
    </div>
  );
}

/* V5 — signal in noise. Every post today as one pixel, the useful ones lit. */
function Noise() {
  const cells = Array.from({ length: 412 }, (_, i) => i % 34 === 7);
  return (
    <div className="border border-white/10 bg-white/[0.02] p-8">
      <div className="flex flex-wrap gap-[3px]">
        {cells.map((lit, i) => (
          <span
            key={i}
            className={`h-2 w-2 ${lit ? 'bg-[#A3FF12]' : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className="mt-6 text-sm text-white/50">
        <span className="font-semibold text-white">412 posts</span> today.{' '}
        <span className="font-semibold text-[#A3FF12]">12</span> are worth your
        time, and each one comes with the reason it made the cut.
      </p>
    </div>
  );
}

const VARIANTS = [
  {
    key: 'V1',
    name: 'Score bars',
    note: 'The ranking is the picture. Bar length is the score, colour is the verdict, and the low one is visibly not worth reading.',
    Render: ScoreBars,
  },
  {
    key: 'V2',
    name: 'The sieve',
    note: 'Volume in, a handful out. Sells the filtering rather than the scoring, and needs no post text at all.',
    Render: Sieve,
  },
  {
    key: 'V3',
    name: 'Lanes',
    note: 'Three buckets with counts. Makes "the rest never reaches your feed" literal, since the Low column is the big one.',
    Render: Lanes,
  },
  {
    key: 'V4',
    name: 'The dial',
    note: 'One post, one number, one reason. Biggest and boldest, but only shows a single example.',
    Render: Dial,
  },
  {
    key: 'V5',
    name: 'Signal in noise',
    note: 'Every post today is one pixel and the useful ones are lit. Most visual of the five, least literal.',
    Render: Noise,
  },
];

export default function RankVersions2() {
  return (
    <div className="dark min-h-svh bg-[#101010] px-6 py-12 font-sans">
      <header className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-white">
          Step 02, more visual
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/50">
          Five takes on "we rank them". All static, no animation.
        </p>
      </header>

      <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-14">
        {VARIANTS.map(({ key, name, note, Render }) => (
          <section key={key}>
            <div className="flex items-baseline gap-3">
              <span className="bg-[#A3FF12] px-2 py-0.5 font-mono text-xs font-bold text-[#101010]">
                {key}
              </span>
              <h2 className="text-lg font-medium text-white">{name}</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-white/50">{note}</p>
            <div className="mt-4">
              <Render />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
