// Hand-curated subreddit catalog: the universe of places worth watching for
// reply marketing. Member counts are approximate and only used for ordering.
// selfPromo: how the sub treats product links in replies —
//   "allowed" | "limited" (helpful replies fine, links risky) | "banned"

export type CatalogCategory = (typeof CATEGORIES)[number]["id"];

export const CATEGORIES = [
  { id: "dev-tools", label: "Dev tools" },
  { id: "ai", label: "AI" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales / CRM" },
  { id: "ecommerce", label: "Ecommerce" },
  { id: "finance", label: "Finance" },
  { id: "design", label: "Design" },
  { id: "productivity", label: "Productivity" },
  { id: "nocode", label: "No-code" },
  { id: "data", label: "Data / Analytics" },
  { id: "security", label: "Security" },
  { id: "hr", label: "HR / Hiring" },
  { id: "education", label: "Education" },
  { id: "health", label: "Health / Fitness" },
] as const;

export type CatalogEntry = {
  name: string; // without r/
  members: number;
  audience: "buyers" | "builders" | "mixed";
  selfPromo: "allowed" | "limited" | "banned";
  tags: string[];
  default?: boolean; // universal starter set, every project gets these
};

export const SUBREDDIT_CATALOG: CatalogEntry[] = [
  // ---- universal starter set: founders and small-business buyers ----
  { name: "saas", members: 190000, audience: "mixed", selfPromo: "limited", tags: [], default: true },
  { name: "entrepreneur", members: 4700000, audience: "buyers", selfPromo: "banned", tags: [], default: true },
  { name: "smallbusiness", members: 2100000, audience: "buyers", selfPromo: "banned", tags: [], default: true },
  { name: "startups", members: 1900000, audience: "mixed", selfPromo: "banned", tags: [], default: true },
  { name: "indiehackers", members: 110000, audience: "builders", selfPromo: "limited", tags: [], default: true },
  { name: "sideproject", members: 260000, audience: "builders", selfPromo: "allowed", tags: [], default: true },
  { name: "microsaas", members: 45000, audience: "builders", selfPromo: "limited", tags: [], default: true },
  { name: "entrepreneurridealong", members: 580000, audience: "builders", selfPromo: "limited", tags: [], default: true },
  { name: "buildinpublic", members: 30000, audience: "builders", selfPromo: "allowed", tags: [], default: true },
  { name: "alphaandbetausers", members: 45000, audience: "builders", selfPromo: "allowed", tags: [], default: true },
  { name: "roastmystartup", members: 55000, audience: "builders", selfPromo: "allowed", tags: [], default: true },
  { name: "growmybusiness", members: 70000, audience: "buyers", selfPromo: "limited", tags: [], default: true },

  // ---- dev tools ----
  { name: "webdev", members: 2800000, audience: "mixed", selfPromo: "limited", tags: ["dev-tools"] },
  { name: "programming", members: 6500000, audience: "mixed", selfPromo: "banned", tags: ["dev-tools"] },
  { name: "devops", members: 700000, audience: "buyers", selfPromo: "limited", tags: ["dev-tools", "security"] },
  { name: "selfhosted", members: 550000, audience: "buyers", selfPromo: "limited", tags: ["dev-tools"] },
  { name: "opensource", members: 300000, audience: "mixed", selfPromo: "allowed", tags: ["dev-tools"] },
  { name: "reactjs", members: 900000, audience: "mixed", selfPromo: "limited", tags: ["dev-tools"] },
  { name: "node", members: 350000, audience: "mixed", selfPromo: "limited", tags: ["dev-tools"] },
  { name: "python", members: 1400000, audience: "mixed", selfPromo: "limited", tags: ["dev-tools", "data"] },
  { name: "rust", members: 350000, audience: "mixed", selfPromo: "limited", tags: ["dev-tools"] },
  { name: "experienceddevs", members: 350000, audience: "buyers", selfPromo: "banned", tags: ["dev-tools"] },
  { name: "softwarearchitecture", members: 120000, audience: "buyers", selfPromo: "limited", tags: ["dev-tools"] },

  // ---- ai ----
  { name: "artificial", members: 1100000, audience: "mixed", selfPromo: "limited", tags: ["ai"] },
  { name: "machinelearning", members: 3000000, audience: "mixed", selfPromo: "banned", tags: ["ai", "data"] },
  { name: "localllama", members: 500000, audience: "mixed", selfPromo: "limited", tags: ["ai"] },
  { name: "chatgpt", members: 9000000, audience: "buyers", selfPromo: "limited", tags: ["ai"] },
  { name: "aiagents", members: 120000, audience: "builders", selfPromo: "limited", tags: ["ai"] },
  { name: "openai", members: 2300000, audience: "mixed", selfPromo: "limited", tags: ["ai"] },
  { name: "singularity", members: 3600000, audience: "mixed", selfPromo: "banned", tags: ["ai"] },

  // ---- marketing ----
  { name: "marketing", members: 1900000, audience: "buyers", selfPromo: "banned", tags: ["marketing"] },
  { name: "digital_marketing", members: 400000, audience: "buyers", selfPromo: "limited", tags: ["marketing"] },
  { name: "seo", members: 350000, audience: "buyers", selfPromo: "limited", tags: ["marketing"] },
  { name: "content_marketing", members: 120000, audience: "buyers", selfPromo: "limited", tags: ["marketing"] },
  { name: "emailmarketing", members: 80000, audience: "buyers", selfPromo: "limited", tags: ["marketing"] },
  { name: "ppc", members: 180000, audience: "buyers", selfPromo: "limited", tags: ["marketing"] },
  { name: "socialmedia", members: 1800000, audience: "buyers", selfPromo: "banned", tags: ["marketing"] },
  { name: "advertising", members: 250000, audience: "buyers", selfPromo: "banned", tags: ["marketing"] },

  // ---- sales / crm ----
  { name: "sales", members: 450000, audience: "buyers", selfPromo: "banned", tags: ["sales"] },
  { name: "salesforce", members: 200000, audience: "buyers", selfPromo: "limited", tags: ["sales"] },
  { name: "crm", members: 20000, audience: "buyers", selfPromo: "limited", tags: ["sales"] },
  { name: "techsales", members: 120000, audience: "buyers", selfPromo: "banned", tags: ["sales"] },
  { name: "coldemail", members: 25000, audience: "buyers", selfPromo: "limited", tags: ["sales", "marketing"] },

  // ---- ecommerce ----
  { name: "ecommerce", members: 600000, audience: "buyers", selfPromo: "banned", tags: ["ecommerce"] },
  { name: "shopify", members: 450000, audience: "buyers", selfPromo: "limited", tags: ["ecommerce"] },
  { name: "dropship", members: 950000, audience: "buyers", selfPromo: "banned", tags: ["ecommerce"] },
  { name: "amazonfba", members: 1000000, audience: "buyers", selfPromo: "banned", tags: ["ecommerce"] },
  { name: "etsy", members: 500000, audience: "buyers", selfPromo: "limited", tags: ["ecommerce"] },

  // ---- finance ----
  { name: "accounting", members: 800000, audience: "buyers", selfPromo: "banned", tags: ["finance"] },
  { name: "bookkeeping", members: 90000, audience: "buyers", selfPromo: "limited", tags: ["finance"] },
  { name: "personalfinance", members: 20000000, audience: "buyers", selfPromo: "banned", tags: ["finance"] },
  { name: "fintech", members: 100000, audience: "mixed", selfPromo: "limited", tags: ["finance"] },
  { name: "tax", members: 400000, audience: "buyers", selfPromo: "banned", tags: ["finance"] },

  // ---- design ----
  { name: "web_design", members: 900000, audience: "mixed", selfPromo: "limited", tags: ["design"] },
  { name: "userexperience", members: 250000, audience: "buyers", selfPromo: "limited", tags: ["design"] },
  { name: "uxdesign", members: 250000, audience: "buyers", selfPromo: "limited", tags: ["design"] },
  { name: "graphic_design", members: 4500000, audience: "mixed", selfPromo: "banned", tags: ["design"] },
  { name: "figma", members: 150000, audience: "buyers", selfPromo: "limited", tags: ["design"] },

  // ---- productivity ----
  { name: "productivity", members: 3000000, audience: "buyers", selfPromo: "banned", tags: ["productivity"] },
  { name: "notion", members: 500000, audience: "buyers", selfPromo: "limited", tags: ["productivity", "nocode"] },
  { name: "obsidianmd", members: 250000, audience: "buyers", selfPromo: "limited", tags: ["productivity"] },
  { name: "projectmanagement", members: 200000, audience: "buyers", selfPromo: "limited", tags: ["productivity"] },
  { name: "remotework", members: 300000, audience: "buyers", selfPromo: "limited", tags: ["productivity", "hr"] },

  // ---- no-code ----
  { name: "nocode", members: 120000, audience: "mixed", selfPromo: "limited", tags: ["nocode"] },
  { name: "bubble", members: 40000, audience: "mixed", selfPromo: "limited", tags: ["nocode"] },
  { name: "airtable", members: 50000, audience: "buyers", selfPromo: "limited", tags: ["nocode", "productivity"] },
  { name: "zapier", members: 30000, audience: "buyers", selfPromo: "limited", tags: ["nocode", "productivity"] },

  // ---- data / analytics ----
  { name: "dataengineering", members: 300000, audience: "buyers", selfPromo: "limited", tags: ["data"] },
  { name: "datascience", members: 1800000, audience: "mixed", selfPromo: "banned", tags: ["data", "ai"] },
  { name: "analytics", members: 100000, audience: "buyers", selfPromo: "limited", tags: ["data", "marketing"] },
  { name: "businessintelligence", members: 200000, audience: "buyers", selfPromo: "limited", tags: ["data"] },

  // ---- security ----
  { name: "cybersecurity", members: 1200000, audience: "buyers", selfPromo: "banned", tags: ["security"] },
  { name: "netsec", members: 500000, audience: "buyers", selfPromo: "banned", tags: ["security"] },
  { name: "sysadmin", members: 1000000, audience: "buyers", selfPromo: "limited", tags: ["security", "dev-tools"] },
  { name: "msp", members: 200000, audience: "buyers", selfPromo: "limited", tags: ["security"] },

  // ---- hr / hiring ----
  { name: "humanresources", members: 400000, audience: "buyers", selfPromo: "banned", tags: ["hr"] },
  { name: "recruitinghell", members: 900000, audience: "mixed", selfPromo: "banned", tags: ["hr"] },
  { name: "recruiting", members: 100000, audience: "buyers", selfPromo: "limited", tags: ["hr"] },
  { name: "freelance", members: 500000, audience: "buyers", selfPromo: "banned", tags: ["hr", "finance"] },

  // ---- education ----
  { name: "teachers", members: 1000000, audience: "buyers", selfPromo: "banned", tags: ["education"] },
  { name: "edtech", members: 30000, audience: "mixed", selfPromo: "limited", tags: ["education"] },
  { name: "onlinecoaching", members: 20000, audience: "buyers", selfPromo: "limited", tags: ["education", "health"] },

  // ---- health / fitness ----
  { name: "fitness", members: 12000000, audience: "buyers", selfPromo: "banned", tags: ["health"] },
  { name: "personaltraining", members: 100000, audience: "buyers", selfPromo: "limited", tags: ["health"] },
  { name: "therapists", members: 100000, audience: "buyers", selfPromo: "banned", tags: ["health"] },
];

// defaults + everything tagged with a picked category, biggest first.
export function suggestCommunities(categories: string[], cap = 18): string[] {
  return SUBREDDIT_CATALOG
    .filter(
      (entry) =>
        entry.default || entry.tags.some((tag) => categories.includes(tag)),
    )
    .sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0) || b.members - a.members)
    .slice(0, cap)
    .map((entry) => entry.name);
}
