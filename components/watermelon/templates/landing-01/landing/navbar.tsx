import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu01Icon, Cancel01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";
import LogoIcon from "@/assets/logo-icon";
import GetStartedDialog from "./get-started-dialog";

// Only link to sections that exist; add back as the sections land.
const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

// `minimal` drops the section links, for pages that have no sections to jump
// to; `action` replaces the Sign in button.
export default function Navbar({
  minimal = false,
  action,
}: {
  minimal?: boolean;
  action?: React.ReactNode;
} = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-neutral-200 py-3" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container relative mx-auto px-4 md:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
             <LogoIcon className="w-full h-full text-primary" />
          </div>
          <span className="font-mono font-bold text-sm tracking-widest uppercase">Watermelon UI</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          {(minimal ? [] : NAV_LINKS).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {action ?? (
            <GetStartedDialog
              trigger={
                <button className="flex h-10 cursor-pointer items-center rounded-md bg-brand px-6 text-xs font-bold tracking-widest text-white uppercase shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] transition-colors hover:bg-brand/90">
                  Sign in
                </button>
              }
            />
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-4">
          {minimal ? action : null}
          <button
            hidden={minimal} 
            className="text-foreground p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Cancel01Icon className="w-6 h-6" /> : <Menu01Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-200 shadow-lg p-4 flex flex-col gap-4 animate-fade-in-up">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-3 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <GetStartedDialog
            trigger={
              <button className="mt-2 w-full cursor-pointer rounded-md bg-brand px-4 py-4 text-center text-xs font-bold tracking-widest text-white uppercase shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.18)] transition-colors hover:bg-brand/90">
                Sign in
              </button>
            }
          />
        </div>
      )}
    </header>
  );
}
