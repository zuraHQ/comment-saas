"use client";

import Navbar from './landing/navbar';
import Hero from './landing/hero';
import Stats from './landing/stats';
import Features from './landing/features';
import AnimatedBento from './landing/animated-bento';
import ComponentsBento from './landing/component-bento';
import TemplateBento from './landing/template-bento';
import Testimonial from './landing/testimonial';
import Footer from './landing/footer';

export default function Landing01Demo() {
  return (
    // Landing keeps its original all-mono look: remap the sans font to mono within this tree only.
    <main
      className="dark min-h-screen overflow-x-hidden bg-[#101010] font-mono"
      style={{ "--font-inter": "var(--font-geist-mono)" } as React.CSSProperties}
    >
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <AnimatedBento />
      <ComponentsBento />
      <TemplateBento />
      <Testimonial />
      <Footer />
    </main>
  );
}
