import "dotenv/config";
import { runListingImageVariantBackfillBatch } from "../src/lib/kasifind/listing-image-backfill";

const args = process.argv.slice(2);
let limit = 50;
let afterPath: string | null = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--limit" && args[i + 1]) limit = Number(args[++i]);
  if (args[i] === "--after" && args[i + 1]) afterPath = args[++i] ?? null;
}

const result = await runListingImageVariantBackfillBatch({
  limit: Number.isFinite(limit) ? limit : 50,
  afterPath,
});

console.log(JSON.stringify(result, null, 2));
process.exit(result.errors > 0 && result.processed === 0 ? 1 : 0);