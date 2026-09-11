/**
 * One-time repair: sync Profile.reputationScore from Reputation.score
 * and Post.bragScore from BragPoint counts.
 *
 * Run: npx tsx scripts/reconcile-engagement.ts
 */
import { reconcileAllBragScores, reconcileAllReputationScores } from "../src/lib/reputation";

async function main() {
  console.log("Reconciling reputation scores...");
  await reconcileAllReputationScores();
  console.log("Reconciling brag scores...");
  await reconcileAllBragScores();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
