"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export const INTENT_FILTERS = ["All", "High", "Medium", "Low"] as const;
export type IntentFilter = (typeof INTENT_FILTERS)[number];

type FeedFilterValue = {
  intentFilter: IntentFilter;
  setIntentFilter: (value: IntentFilter) => void;
};

const FeedFilterContext = createContext<FeedFilterValue | null>(null);

// The feed reads the filter; the topbar sets it.
export function FeedFilterProvider({ children }: { children: ReactNode }) {
  const [intentFilter, setIntentFilter] = useState<IntentFilter>("All");
  return (
    <FeedFilterContext.Provider value={{ intentFilter, setIntentFilter }}>
      {children}
    </FeedFilterContext.Provider>
  );
}

export function useFeedFilter() {
  const ctx = useContext(FeedFilterContext);
  if (!ctx) throw new Error("useFeedFilter must be used within FeedFilterProvider");
  return ctx;
}
