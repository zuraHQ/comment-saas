import Container from "./container";
import Heading from "./heading";
import SubHeading from "./subheading";
import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [site, setSite] = useState("");

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
    <section className="relative flex min-h-screen w-full flex-col justify-center overflow-x-hidden pt-48 pb-20 font-mono">
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
              className="text-foreground mb-2 font-sans font-semibold leading-[0.95] lg:text-[64px]"
            >
              We read the internet
            </Heading>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Heading
              as="h1"
              variant="big"
              className="mb-8 font-sans font-semibold leading-[0.95] lg:text-[64px]"
            >
              <span className="text-foreground">You get customers</span>
            </Heading>
          </motion.div>

          {/* Subheading */}
          <motion.div variants={itemVariants}>
            <SubHeading variant="big" className="mb-12 max-w-2xl text-pretty">
              We find the perfect conversations to mention your product, and
              draft suggested replies.
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
                const url = /^https?:\/\//i.test(value)
                  ? value
                  : `https://${value}`;
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
