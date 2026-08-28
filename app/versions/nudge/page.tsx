import {
  Architects_Daughter,
  Caveat,
  Gloria_Hallelujah,
  Just_Another_Hand,
  Kalam,
  Nothing_You_Could_Do,
  Patrick_Hand,
  Reenie_Beanie,
  Shadows_Into_Light,
} from "next/font/google";

const shadows = Shadows_Into_Light({ weight: "400", subsets: ["latin"] });
const kalam = Kalam({ weight: "400", subsets: ["latin"] });
const patrick = Patrick_Hand({ weight: "400", subsets: ["latin"] });
const architects = Architects_Daughter({ weight: "400", subsets: ["latin"] });
const reenie = Reenie_Beanie({ weight: "400", subsets: ["latin"] });
const justAnother = Just_Another_Hand({ weight: "400", subsets: ["latin"] });
const nothing = Nothing_You_Could_Do({ weight: "400", subsets: ["latin"] });
const gloria = Gloria_Hallelujah({ weight: "400", subsets: ["latin"] });
const caveat = Caveat({ subsets: ["latin"] });

const fonts = [
  { name: "Shadows Into Light (current)", font: shadows, size: "text-2xl" },
  { name: "Kalam", font: kalam, size: "text-xl" },
  { name: "Patrick Hand", font: patrick, size: "text-xl" },
  { name: "Architects Daughter", font: architects, size: "text-lg" },
  { name: "Reenie Beanie", font: reenie, size: "text-3xl" },
  { name: "Just Another Hand", font: justAnother, size: "text-3xl" },
  { name: "Nothing You Could Do", font: nothing, size: "text-lg" },
  { name: "Gloria Hallelujah", font: gloria, size: "text-base" },
  { name: "Caveat", font: caveat, size: "text-2xl" },
];

// Each arrow is drawn to finish at the bottom right of its box, so it can be
// parked to the left of the input and land on it.
const arrows = [
  {
    name: "A. long sweep from the left",
    box: "h-16 w-28",
    view: "0 0 112 64",
    d: ["M4 8c22 0 44 12 62 40", "M70 52l-14-3", "M70 52l-3-14"],
  },
  {
    name: "B. shallow diagonal",
    box: "h-14 w-28",
    view: "0 0 112 56",
    d: ["M4 6c30 6 54 20 66 38", "M74 48l-14-1", "M74 48l-4-13"],
  },
  {
    name: "C. hook, comes back on itself",
    box: "h-20 w-28",
    view: "0 0 112 80",
    d: ["M6 10c34-8 58 6 54 30 -3 16-22 18-24 6 -2-12 14-20 34-14", "M74 34l-12 5", "M74 34l-9-9"],
  },
  {
    name: "D. steep drop",
    box: "h-24 w-20",
    view: "0 0 80 96",
    d: ["M14 6c6 30 20 56 44 76", "M62 86l-14-4", "M62 86l-2-14"],
  },
  {
    name: "E. wobbly, drawn by hand",
    box: "h-16 w-28",
    view: "0 0 112 64",
    d: ["M4 12c18-6 30 2 36 12 6 10 18 20 38 26", "M82 52l-14-2", "M82 52l-5-13"],
  },
];

function FakeInput() {
  return (
    <div className="flex w-full max-w-md gap-3">
      <div className="h-12 flex-1 rounded-md border border-neutral-300 bg-neutral-100 px-5 text-sm leading-[3rem] text-neutral-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
        yoursaas.com
      </div>
      <div className="bg-brand flex h-12 shrink-0 items-center rounded-md px-8 text-sm font-medium text-white">
        Find customers
      </div>
    </div>
  );
}

export default function NudgeVersions() {
  const current = fonts[0];

  return (
    <main className="min-h-screen bg-white px-10 py-16 font-sans">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Note and arrow
      </h1>
      <p className="mt-2 max-w-xl text-sm text-neutral-600">
        Fonts first, then arrow shapes. Tell me a letter and a font name.
      </p>

      <h2 className="mt-14 text-sm font-bold tracking-wider text-neutral-500 uppercase">
        Fonts
      </h2>
      <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-3">
        {fonts.map((f) => (
          <div key={f.name}>
            <p className="text-xs text-neutral-400">{f.name}</p>
            <p className={`text-brand mt-2 -rotate-3 ${f.size} ${f.font.className}`}>
              drop your saas here
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-20 text-sm font-bold tracking-wider text-neutral-500 uppercase">
        Arrows, in place
      </h2>
      <div className="mt-8 flex flex-col gap-16">
        {arrows.map((a) => (
          <div key={a.name}>
            <p className="mb-6 text-xs text-neutral-400">{a.name}</p>
            <div className="relative pt-24 pl-64">
              <span className="pointer-events-none absolute top-0 left-0 flex flex-col items-start">
                <span
                  className={`text-brand -rotate-6 ${current.size} ${current.font.className}`}
                >
                  drop your saas here
                </span>
                <svg
                  viewBox={a.view}
                  className={`text-brand ml-6 ${a.box}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {a.d.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </svg>
              </span>
              <FakeInput />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
