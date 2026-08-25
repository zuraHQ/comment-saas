import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Walk the globally-deduped (platform, keyword) jobs. Reply speed is the
// product, so keep this tight; each run skips jobs fetched <10 min ago.
crons.interval("fetch posts for due search jobs", { minutes: 15 }, internal.fetchers.runDueJobs, {});

export default crons;
