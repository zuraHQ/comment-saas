import { Play } from "lucide-react";
import React from "react";

export interface Hero32Props {
  logoText?: string;
  navItems?: string[];
  loginText?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryActionText?: string;
  loginHref?: string;
  below?: React.ReactNode;
  showNav?: boolean;
  navHrefs?: string[];
  action?: React.ReactNode;
}

export default function Hero32({
  logoText = "Haven",
  navItems = ["Home", "Usecases", "Pricing", "Contact"],
  loginText = "Login",
  title = (
    <>
      Your Haven for <br />
      <span className="italic">Seamless</span> AI Solutions
    </>
  ),
  subtitle = (
    <>
      Confidential, professional help tailored to your unique needs,{" "}
      <br className="hidden md:block" />
      available on your schedule.
    </>
  ),
  primaryActionText = "Book a demo",
  loginHref = "#",
  below,
  showNav = true,
  navHrefs,
  action,
}: Hero32Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans antialiased">
      <div className="relative z-10 flex min-h-screen flex-col pt-6">
        {showNav ? (
          <div className="fixed inset-x-0 top-4 z-50 px-4">
            {/* Nav — single spring drop */}
            <nav
              className="mx-auto flex w-fit items-center gap-8 rounded-full border border-border bg-background/90 px-2 py-2 backdrop-blur-md"
            >
              <div className="pl-4 text-base font-bold tracking-tight text-foreground 2xl:text-lg">
                {logoText}
              </div>
              <div className="hidden items-center gap-6 px-4 md:flex">
                {navItems.map((item, i) => (
                  <a
                    key={item}
                    href={navHrefs?.[i] ?? "#"}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground 2xl:text-lg"
                  >
                    {item}
                  </a>
                ))}
              </div>
              <a
                href={loginHref}
                className="rounded-full border border-border px-6 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted 2xl:text-lg"
              >
                {loginText}
              </a>
            </nav>
          </div>
        ) : null}

        {/* Hero Main Content — each element independently animated */}
        <div className="flex flex-1 items-start justify-center px-6 pt-40 pb-24">
          <div className="flex w-full max-w-4xl flex-col items-center text-center 2xl:max-w-6xl">
            {/* Title: majestic slow rise */}
            <h1
              className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-[64px] lg:leading-[0.95]"
              style={{ textWrap: "balance" }}
            >
              {title}
            </h1>

            {/* Subtitle: lighter, quicker */}
            <p
              className="mt-6 max-w-2xl text-base leading-relaxed font-normal text-muted-foreground md:text-lg"
              style={{ textWrap: "pretty" }}
            >
              {subtitle}
            </p>

            {/* CTA: scales into place */}
            <div
              className="mt-8 flex w-full items-center justify-center gap-4"
            >
              {action ?? (
                <>
                  <button className="flex min-h-12 items-center rounded-full bg-background/20 px-8 text-sm font-medium text-white shadow-[inset_2px_2px_0_-0.5px_rgba(255,255,255,0.1),inset_-2px_-2px_0_-0.5px_rgba(255,255,255,0.1)] backdrop-blur-sm transition-transform hover:bg-background/30 active:scale-[0.96] 2xl:text-lg">
                    {primaryActionText}
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-sky-400 shadow-lg transition-transform hover:scale-105 active:scale-[0.96]">
                    <Play className="h-5 w-5 fill-current" />
                  </button>
                </>
              )}
            </div>

            {below ? (
              <div
                className="mt-16 w-full"
              >
                {below}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
