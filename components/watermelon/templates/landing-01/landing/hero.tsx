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
  FaYoutube,
} from 'react-icons/fa6';

const PLATFORMS = [
  { name: 'Reddit', Icon: FaRedditAlien, bg: '#FF4500', color: '#FF4500', iconColor: '#ffffff' },
  { name: 'X/Twitter', Icon: FaXTwitter, bg: '#ffffff', color: '#ffffff', iconColor: '#000000' },
  { name: 'LinkedIn', Icon: FaLinkedinIn, bg: '#0A66C2', color: '#0A66C2', iconColor: '#ffffff' },
  { name: 'HN', Icon: FaHackerNews, bg: '#FF6600', color: '#FF6600', iconColor: '#ffffff' },
  { name: 'YouTube', Icon: FaYoutube, bg: '#FF0000', color: '#FF0000', iconColor: '#ffffff' },
  { name: 'Threads', Icon: FaThreads, bg: '#ffffff', color: '#ffffff', iconColor: '#000000' },
  { name: 'Bluesky', Icon: FaBluesky, bg: '#0085FF', color: '#0085FF', iconColor: '#ffffff' },
  { name: 'GitHub', Icon: FaGithub, bg: '#ffffff', color: '#ffffff', iconColor: '#000000' },
  { name: 'Quora', Icon: FaQuora, bg: '#B92B27', color: '#B92B27', iconColor: '#ffffff' },
] as const;

export default function Hero() {
  const router = useRouter();
  const [wordIndex, setWordIndex] = useState(0);
  const [site, setSite] = useState('');

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


  return (
    <section className="relative flex min-h-screen w-full flex-col justify-center overflow-x-hidden pt-48 pb-48 font-mono">
      {/* Decorative Technical Borders */}
      <div className="absolute top-[80px] right-0 left-0 hidden h-px bg-white/5 lg:block" />
      <div className="absolute right-0 bottom-24 left-0 hidden h-px bg-white/5 lg:block" />
      <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-white/5 md:left-16 lg:block" />
      <div className="absolute top-0 right-8 bottom-0 hidden w-px bg-white/5 md:right-16 lg:block" />

      {/* Crosshairs at intersections */}
      <div className="absolute top-[80px] left-8 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 md:left-16 lg:block">
        <div className="absolute top-1/2 right-0 left-0 h-px bg-white/20" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
      </div>
      <div className="absolute top-[80px] right-8 hidden h-4 w-4 translate-x-1/2 -translate-y-1/2 md:right-16 lg:block">
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
              className="text-foreground mb-2 font-sans font-semibold leading-[0.95]"
            >
              Find people already
            </Heading>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Heading
              as="h1"
              variant="big"
              className="mb-8 font-sans font-semibold leading-[0.95]"
            >
              <span className="text-foreground">looking for you</span>
            </Heading>
          </motion.div>

          {/* Subheading */}
          <motion.div variants={itemVariants}>
            <SubHeading variant="big" className="mb-12 max-w-2xl text-pretty">
              We find the posts on{' '}
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
              </span>{' '}
              where people ask for a product like yours. Reply first, and win
              the customer.
            </SubHeading>
          </motion.div>

          {/* Site capture CTA: we read the site to learn what the product does */}
          <motion.div variants={itemVariants} className="w-full max-w-xl">
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                const value = site.trim();
                if (!value) return;
                const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
                router.push(`/login?site=${encodeURIComponent(url)}`);
              }}
            >
              <input
                type="text"
                required
                value={site}
                onChange={(e) => setSite(e.target.value)}
                inputMode="url"
                autoComplete="url"
                placeholder="yoursaas.com"
                className="h-12 flex-1 border border-white/10 bg-white/5 px-5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-primary/60"
              />
              <button
                type="submit"
                className="h-12 shrink-0 bg-primary px-8 text-xs font-bold tracking-widest text-background uppercase transition-all hover:bg-primary/90 active:scale-[0.97]"
              >
                Find customers
              </button>
            </form>
          </motion.div>

          {/* Demo container */}
          <motion.div
            variants={itemVariants}
            className="relative mt-16 w-[min(72rem,calc(100vw-2rem))] shrink-0 border border-white/10 bg-black/40 text-left backdrop-blur-md"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 h-2 w-2 border-t border-l border-white/40" />
            <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/40" />
            <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/40" />
            <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-white/40" />

            {/* Window bar */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
              <span className="h-2 w-2 bg-[#FF5F57]" />
              <span className="h-2 w-2 bg-[#FEBC2E]" />
              <span className="h-2 w-2 bg-[#28C840]" />
            </div>

            {/* Video demo drops in here */}
            <div className="flex aspect-video w-full items-center justify-center">
              <span className="font-mono text-xs tracking-widest text-white/30 uppercase">
                [ Demo ]
              </span>
            </div>
          </motion.div>


        </motion.div>

      </Container>
    </section>
  );
}
