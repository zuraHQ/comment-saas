"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Container from "./container";
import Heading from "./heading";

function ago(timestamp: number) {
  const minutes = Math.max(0, (Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.floor(minutes)} minutes ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function LiveData() {
  const stats = useQuery(api.publicStats.landing);

  const tiles = [
    { label: "Posts read", value: stats?.posts },
    { label: "Platforms watched", value: stats?.platforms },
    { label: "Replies sent", value: stats?.replies },
    { label: "Clicks captured", value: stats?.clicks },
  ];

  return (
    <section className="relative w-full py-24">
      <Container className="relative z-10 mx-auto">
        <div className="mb-14 flex flex-col items-center text-center">
          <Heading
            as="h2"
            variant="big"
            className="text-foreground font-sans font-semibold text-balance lg:text-[48px]"
          >
            Running right now
          </Heading>
          <p className="mt-4 font-mono text-xs tracking-widest text-white/40 uppercase">
            {stats?.lastFetchedAt
              ? `Updated ${ago(stats.lastFetchedAt)}`
              : "Our own numbers, live"}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px border border-white/10 bg-white/10 lg:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="bg-[#101010] p-8 text-center">
              <p className="text-3xl font-semibold text-white tabular-nums">
                {tile.value === undefined ? "—" : tile.value.toLocaleString()}
              </p>
              <p className="mt-3 font-mono text-xs tracking-widest text-white/40 uppercase">
                {tile.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
