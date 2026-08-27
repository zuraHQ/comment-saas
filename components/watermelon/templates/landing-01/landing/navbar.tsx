import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu01Icon, Cancel01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";
import LogoIcon from "@/assets/logo-icon";

// Only link to sections that exist; add back as the sections land.
const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
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
          ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm py-3" 
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
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="flex items-center h-10 border border-white/20 text-white font-mono font-bold tracking-widest uppercase px-6 text-xs hover:bg-white/10 transition-colors active:scale-[0.96]">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <button 
            className="text-foreground p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Cancel01Icon className="w-6 h-6" /> : <Menu01Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border/50 shadow-lg p-4 flex flex-col gap-4 animate-fade-in-up">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-3 text-sm text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Link href="/login" className="w-full text-center border border-white/20 text-white font-mono font-bold tracking-widest uppercase px-4 py-4 text-xs hover:bg-white/10 transition-colors active:scale-[0.96] mt-2">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
