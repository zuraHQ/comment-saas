"use client";

import Navbar from './landing/navbar';
import Hero from './landing/hero';
// Real pipeline numbers, parked until they are worth showing off.
// import LiveData from './landing/live-data';
import ManualVs from './landing/manual-vs';
import Cta from './landing/cta';
import Faq from './landing/faq';
import Pricing from './landing/pricing';
import Stats from './landing/stats';
import Footer from './landing/footer';

export default function Landing01Demo() {
  return (
    // Landing renders entirely in Inter: the template's hardcoded font-mono
    // classes resolve to Inter via this scoped variable remap.
    <main
      className="min-h-screen overflow-x-hidden bg-white font-sans"
      style={{ "--font-geist-mono": "var(--font-inter)" } as React.CSSProperties}
    >
      <Navbar />
      <Hero />
      <Stats />
      <ManualVs />
      {/* <LiveData /> */}
      <Pricing />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}
