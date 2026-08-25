import Container from './container';
import Heading from './heading';
import SubHeading from './subheading';
import { motion, type Variants, AnimatePresence } from 'motion/react';
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaBluesky,
  FaGithub,
  FaHackerNews,
  FaLinkedinIn,
  FaQuora,
  FaRedditAlien,
  FaThreads,
  FaXTwitter,
} from 'react-icons/fa6';

const PLATFORMS = [
  { name: 'Reddit', Icon: FaRedditAlien, bg: '#FF4500', color: '#FF4500', iconColor: '#ffffff' },
  { name: 'X/Twitter', Icon: FaXTwitter, bg: '#ffffff', color: '#ffffff', iconColor: '#000000' },
  { name: 'LinkedIn', Icon: FaLinkedinIn, bg: '#0A66C2', color: '#0A66C2', iconColor: '#ffffff' },
  { name: 'HN', Icon: FaHackerNews, bg: '#FF6600', color: '#FF6600', iconColor: '#ffffff' },
  { name: 'Threads', Icon: FaThreads, bg: '#ffffff', color: '#ffffff', iconColor: '#000000' },
  { name: 'Bluesky', Icon: FaBluesky, bg: '#0085FF', color: '#0085FF', iconColor: '#ffffff' },
  { name: 'GitHub', Icon: FaGithub, bg: '#ffffff', color: '#ffffff', iconColor: '#000000' },
  { name: 'Quora', Icon: FaQuora, bg: '#B92B27', color: '#B92B27', iconColor: '#ffffff' },
] as const;

export default function Hero() {
  const router = useRouter();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % PLATFORMS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const platform = PLATFORMS[wordIndex];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const glowVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
    },
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col justify-center overflow-x-hidden pt-16 pb-32 font-mono">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[24px_24px]" />

      {/* Ambient Glow behind heading */}
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-[-60%] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(163,255,18,0.06) 0%, rgba(163,255,18,0.02) 40%, transparent 70%)',
        }}
        variants={glowVariants}
        initial={false}
        animate="visible"
      />

      {/* Decorative Technical Borders */}
      <div className="absolute top-24 right-0 left-0 hidden h-px bg-white/5 lg:block" />
      <div className="absolute right-0 bottom-24 left-0 hidden h-px bg-white/5 lg:block" />
      <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-white/5 md:left-16 lg:block" />
      <div className="absolute top-0 right-8 bottom-0 hidden w-px bg-white/5 md:right-16 lg:block" />

      {/* Crosshairs at intersections */}
      <div className="absolute top-24 left-8 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 md:left-16 lg:block">
        <div className="bg-primary/50 absolute top-1/2 right-0 left-0 h-px" />
        <div className="bg-primary/50 absolute top-0 bottom-0 left-1/2 w-px" />
      </div>
      <div className="absolute top-24 right-8 hidden h-4 w-4 translate-x-1/2 -translate-y-1/2 md:right-16 lg:block">
        <div className="absolute top-1/2 right-0 left-0 h-px bg-white/20" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
      </div>
      <div className="absolute bottom-24 left-8 hidden h-4 w-4 -translate-x-1/2 translate-y-1/2 md:left-16 lg:block">
        <div className="absolute top-1/2 right-0 left-0 h-px bg-white/20" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
      </div>
      <div className="absolute right-8 bottom-24 hidden h-4 w-4 translate-x-1/2 translate-y-1/2 md:right-16 lg:block">
        <div className="absolute top-1/2 right-0 left-0 h-px bg-white/20" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
      </div>

      {/* Abstract Background Concentric Circles (Left Edge) */}
      <div className="pointer-events-none absolute top-1/2 left-0 flex h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/5 opacity-30">
        <div className="flex h-[600px] w-[600px] items-center justify-center rounded-full border border-dashed border-white/10">
          <div className="flex h-[400px] w-[400px] items-center justify-center rounded-full border border-white/5">
            <div className="h-[200px] w-[200px] rounded-full border border-dashed border-white/5" />
          </div>
        </div>
      </div>

      <Container className="relative z-10 flex flex-1 flex-col justify-center">
        {/* Center-aligned Hero Content */}
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
          variants={containerVariants}
          initial={false}
          animate="visible"
        >
          {/* Main Heading — 2 lines */}
          <motion.div variants={itemVariants}>
            <Heading
              as="h1"
              variant="big"
              className="text-foreground mb-2 font-sans leading-[0.95]"
            >
              Your next customers
            </Heading>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Heading
              as="h1"
              variant="big"
              className="mb-8 font-sans leading-[0.95]"
            >
              <span className="text-foreground">are asking on </span>
              <span className="relative inline-block align-baseline">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={platform.name}
                    className="inline-flex max-w-full items-center gap-[0.25em] whitespace-nowrap align-baseline"
                    style={{ color: platform.color }}
                    initial={{ y: 12, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{
                      y: -12,
                      opacity: 0,
                      filter: 'blur(4px)',
                      transition: { duration: 0.15, ease: 'easeIn' },
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <span
                      className="inline-flex h-[0.85em] w-[0.85em] shrink-0 items-center justify-center"
                      style={{ backgroundColor: platform.bg }}
                    >
                      <platform.Icon
                        className="h-[0.6em] w-[0.6em]"
                        style={{ color: platform.iconColor }}
                      />
                    </span>
                    {platform.name}
                  </motion.span>
                </AnimatePresence>
              </span>
            </Heading>
          </motion.div>

          {/* Subheading */}
          <motion.div variants={itemVariants}>
            <SubHeading variant="big" className="mb-12 max-w-2xl text-pretty">
              From direct asks to loosely related threads, we surface the
              posts where your product fits, so you can reply first and turn
              them into customers.
            </SubHeading>
          </motion.div>

          {/* Email capture CTA */}
          <motion.div variants={itemVariants} className="w-full max-w-xl">
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                router.push('/login');
              }}
            >
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="h-12 flex-1 border border-white/10 bg-white/5 px-5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-primary/60"
              />
              <button
                type="submit"
                className="h-12 shrink-0 bg-primary px-8 text-xs font-bold tracking-widest text-background uppercase transition-all hover:bg-primary/90 active:scale-[0.97]"
              >
                Get Started
              </button>
            </form>
            <p className="mt-3 text-center text-[10px] tracking-widest text-white/40 uppercase">
              Free while in beta. No credit card required
            </p>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-white/40 uppercase">
              <span className="h-px w-8 bg-white/10" />
              <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full" />
              Live data
              <span className="h-px w-8 bg-white/10" />
            </div>
            <motion.div
              className="flex flex-wrap justify-center items-center gap-4 sm:gap-6"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  },
                },
              }}
            >
              {[
                { value: '128,402', label: 'posts found' },
                { value: '12,847', label: 'leads found' },
                { value: '3,215', label: 'replies posted' },
              ].map(
                (stat) => (
                  <motion.div
                    key={stat.label}
                    variants={{
                      hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
                      visible: {
                        opacity: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                    className="border border-white/5 bg-white/2 px-4 py-2 text-xs font-bold tracking-wider text-white/60 uppercase"
                  >
                    <span className="text-primary mr-1.5">{stat.value}</span>
                    {stat.label}
                  </motion.div>
                ),
              )}
            </motion.div>
          </motion.div>
        </motion.div>

      </Container>
    </section>
  );
}
