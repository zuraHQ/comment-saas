import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Walk the globally-deduped (platform, keyword) jobs. Reply speed is the
// product, so keep this tight; each run skips jobs fetched <10 min ago.
crons.interval("fetch posts for due search jobs", { minutes: 15 }, internal.fetchers.runDueJobs, {});

// Retry anything the immediate scoring pass missed (API errors, model
// omissions). No-op when everything is scored.
crons.interval("score unscored matches", { minutes: 5 }, internal.intentMarker.scoreDue, {});

export default crons;
