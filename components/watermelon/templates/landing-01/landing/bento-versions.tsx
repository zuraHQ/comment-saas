"use client";

import { cn } from "@/lib/utils";
import {
  PreviewRank,
  PreviewRead,
  PreviewReply,
  PreviewResults,
  STEPS,
} from "./step-versions";

const PREVIEWS = [PreviewRead, PreviewRank, PreviewReply, PreviewResults];

function Tile({
  step,
  children,
  className,
  wide = false,
}: {
  step: (typeof STEPS)[number];
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-2xl bg-neutral-50 p-8",
        wide && "lg:flex-row lg:items-center lg:gap-10",
        className,
      )}
    >
      <div className={cn(wide && "lg:w-2/5 lg:shrink-0")}>
        <p className="text-xs font-bold tracking-widest text-neutral-400">
          {step.n}
        </p>
        <h3 className="mt-3 text-xl font-semibold text-neutral-900">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          {step.body}
        </p>
      </div>
      <div className={cn("min-w-0", wide && "lg:flex-1")}>{children}</div>
    </div>
  );
}

// G: wide, narrow, narrow, wide
function VariantG() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Tile step={STEPS[0]} className="lg:col-span-2" wide>
        {PREVIEWS[0]()}
      </Tile>
      <Tile step={STEPS[1]}>{PREVIEWS[1]()}</Tile>
      <Tile step={STEPS[2]}>{PREVIEWS[2]()}</Tile>
      <Tile step={STEPS[3]} className="lg:col-span-2" wide>
        {PREVIEWS[3]()}
      </Tile>
    </div>
  );
}

// H: one tall tile carrying the first step, the rest stacked beside it
function VariantH() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Tile step={STEPS[0]} className="lg:col-span-2 lg:row-span-2">
        {PREVIEWS[0]()}
      </Tile>
      <Tile step={STEPS[1]}>{PREVIEWS[1]()}</Tile>
      <Tile step={STEPS[2]}>{PREVIEWS[2]()}</Tile>
      <Tile step={STEPS[3]} className="lg:col-span-3" wide>
        {PREVIEWS[3]()}
      </Tile>
    </div>
  );
}

// I: four equal quarters
function VariantI() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {STEPS.map((step, i) => (
        <Tile key={step.n} step={step}>
          {PREVIEWS[i]()}
        </Tile>
      ))}
    </div>
  );
}

const VARIANTS = [
  {
    key: "A",
    name: "Wide ends",
    note: "First and last steps run full width with the preview beside the copy, the middle two sit half width.",
    Render: VariantG,
  },
  {
    key: "B",
    name: "Hero tile",
    note: "Step one gets a tall tile and the rest fill in around it. Good if the first step is the one that sells.",
    Render: VariantH,
  },
  {
    key: "C",
    name: "Four quarters",
    note: "Equal tiles, no hierarchy. Tightest vertically, and the easiest to scan.",
    Render: VariantI,
  },
];

export default function BentoVersions() {
  return (
    <main className="light-page min-h-screen bg-white px-6 py-16 font-sans">
      <header className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-neutral-900">Bento</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The same four steps packed as tiles rather than stacked rows.
        </p>
      </header>

      {VARIANTS.map(({ key, name, note, Render }) => (
        <section key={key} className="mx-auto mt-24 max-w-5xl">
          <div className="flex items-baseline gap-3">
            <span className="bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white">
              {key}
            </span>
            <h2 className="text-lg font-medium text-neutral-900">{name}</h2>
          </div>
          <p className="mt-2 mb-10 text-sm text-neutral-600">{note}</p>
          <Render />
        </section>
      ))}
    </main>
  );
}
